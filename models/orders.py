import requests
from flask import current_app, Blueprint, request, abort, jsonify, make_response
from flask.views import MethodView
from utils.check_user_state import check_user_state
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg
from utils.input_validation import email_validation, phone_validation, name_validation

bp_m_orders = Blueprint('m_orders', __name__)

def order_via_tappay(prime, order):
  api_url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
  headers = {
    'Content-Type': 'application/json',
    'x-api-key': current_app.config['TAPPAY_PARTNER_KEY']
  }
  count_trip = len(order['trip'])
  post_body = {
    'prime': prime,
    'partner_key': current_app.config['TAPPAY_PARTNER_KEY'],
    'merchant_id': current_app.config['TAPPAY_MERCHANT_ID'],
    'details': f'[Test] 台北一日遊 - {count_trip} 筆行程',
    'amount': order['price'],
    'cardholder': {
      'phone_number': order['contact']['phone'],
      'name': order['contact']['name'],
      'email': order['contact']['email']
    },
    'remember': False
  }
  res = requests.post(api_url, headers = headers, json = post_body)
  return res.json()

@with_cnx(need_commit = True)
def insert_orders(cursor, data):
  return 'OK'
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
        tappay_res = order_via_tappay(prime, order)

        print('tappay_res', tappay_res, type(tappay_res))
        return jsonify({ 'ok': True })
    except TypeError as e:
      abort(400, description = abort_msg(e))
    except PermissionError as e:
      abort(403, description = abort_msg(e))
    except Exception as e:
      abort(500, description = abort_msg(e))


bp_m_orders.add_url_rule('/orders', view_func=Api_Orders.as_view('api_orders'))