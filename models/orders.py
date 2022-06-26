import requests
import uuid
from datetime import datetime
from flask import current_app, Blueprint, request, abort, jsonify, make_response
from flask.views import MethodView
from utils.check_user_state import check_user_state
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg
from utils.input_validation import email_validation, phone_validation, name_validation

bp_m_orders = Blueprint('m_orders', __name__)


def order_via_tappay(prime, order_number, order_detail):
  api_url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
  headers = {
      'Content-Type': 'application/json',
      'x-api-key': current_app.config['TAPPAY_PARTNER_KEY']
  }
  count_trip = len(order_detail['trip'])
  post_body = {
      'prime': prime,
      'partner_key': current_app.config['TAPPAY_PARTNER_KEY'],
      'merchant_id': current_app.config['TAPPAY_MERCHANT_ID'],
      'order_number': order_number,
      'details': f'[Test] 台北一日遊 - {count_trip} 筆行程',
      'amount': order_detail['price'],
      'cardholder': {
          'phone_number': order_detail['contact']['phone'],
          'name': order_detail['contact']['name'],
          'email': order_detail['contact']['email']
      },
      'remember': False
  }
  res = requests.post(api_url, headers=headers, json=post_body)
  return res.json()


def order_detail(order_number, order_detail):
  values = []
  for row in order_detail:
    values.append((order_number, row['attraction']['id'], row['attraction']['name'],
                  row['attraction']['address'], row['attraction']['image'], row['date'], row['time']))
  return values


@with_cnx(need_commit=True)
def insert_order_and_detail(cursor, order_number, member_id, order):
  insert_sql_order = '''
    INSERT INTO `orders` (id, member_id, price, contact_name, contact_email, contact_phone)
    VALUES (%s, %s, %s, %s, %s, %s)
  '''
  insert_value_order = (order_number, member_id, order['price'], order['contact']
                        ['name'], order['contact']['email'], order['contact']['phone'])
  insert_sql_detail = '''
    INSERT INTO order_details (order_id, attraction_id, attraction_name, attraction_address, attraction_image, booking_date, booking_time)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
  '''
  insert_value_detail = order_detail(order_number, order['trip'])
  cursor.execute(insert_sql_order, insert_value_order)
  cursor.executemany(insert_sql_detail, insert_value_detail)
  cursor.execute('DELETE FROM booking WHERE booking.member_id = %s', (member_id, ))


@with_cnx(need_commit=True)
def update_order_status(cursor, order_status, order_id, rec_trade_id):
  cursor.execute('UPDATE `orders` SET order_status = %s, rec_trade_id = %s WHERE id = %s',
                 (order_status, rec_trade_id, order_id))


class Api_Orders(MethodView):
  def get(self):
    # api: 取得訂單列表 (之後更新)
    pass

  def post(self):
    # api: 新增 1 筆訂單
    try:
      jwt_cookie = request.cookies.get('jwt')
      user_state = check_user_state(jwt_cookie)
      prime = request.get_json()['prime']
      order = request.get_json()['order']
      if user_state['error']:
        raise PermissionError('訂單建立失敗，已登出，請重新登入')
      elif not all((prime, order)):
        raise TypeError('訂單建立失敗，無 prime 或訂單資訊')
      elif not all((order['contact'], order['price'], order['trip'])):
        raise TypeError('訂單建立失敗，無價錢、景點、買家資訊')
      elif not all((order['contact']['name'], order['contact']['email'], order['contact']['phone'])):
        raise TypeError('訂單建立失敗，無買家姓名、email、電話')
      elif not email_validation(order['contact']['email']) or not phone_validation(order['contact']['phone']) or not name_validation(order['contact']['name']):
        raise TypeError('訂單建立失敗，買家資訊格式錯誤')
      else:
        order_number = f'{uuid.uuid4().hex}{datetime.now().strftime("%Y%m%d%H%M%S")}'
        insert_order_and_detail(order_number, user_state['result']['sub'], order)
        tappay_res = order_via_tappay(prime, order_number, order)
        res = {
            'number': tappay_res['order_number'],
            'payment': {'status': 0, 'message': '訂單建立成功，付款成功'}
        }
        if tappay_res['status'] == 0:
          update_order_status(0, order_number, tappay_res['rec_trade_id'])
          return jsonify({'data': res})
        else:
          res['payment']['status'] = 1
          res['payment']['message'] = '訂單建立成功，但尚未付款'
          return jsonify({'data': res})
    except (TypeError, ValueError) as e:
      abort(400, description=abort_msg(e))
    except PermissionError as e:
      abort(403, description=abort_msg(e))
    except Exception as e:
      abort(500, description=abort_msg(e))


bp_m_orders.add_url_rule('/orders', view_func=Api_Orders.as_view('api_orders'))
