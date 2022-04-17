from flask import Blueprint, abort, jsonify
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg

bp_m_order_detail = Blueprint('m_order_detail', __name__)

# API 訂單 → 根據 1 筆訂單編號，取得該筆訂單資料

@with_cnx(need_commit = False)
def query_order_detail(cursor, order_id):
  query_sql_order = '''
    SELECT id, order_status, price, contact_email, contact_name, contact_phone 
    FROM `orders` WHERE id = %s
  '''
  cursor.execute(query_sql_order, (order_id, ))
  order_data = cursor.fetchone()
  query_sql_detail = '''
    SELECT attraction_id, attraction_name, attraction_address, attraction_image, booking_date, booking_time
    FROM `order_details` WHERE order_id = %s
  '''
  cursor.execute(query_sql_detail, (order_id, ))
  order_detail_data = cursor.fetchall()
  order_detail_list = []

  for value in order_detail_data:
    format_data = {
      'attraction': {
        'id': value[0],
        'name': value[1],
        'address': value[2],
        'image': value[3]
      },
      'date': value[4],
      'time': value[5]
    }
    order_detail_list.append(format_data)

  res = {
    'number': order_data[0],
    'status': order_data[1],
    'price': order_data[2],
    'trip': order_detail_list,
    'contact': {
      'email': order_data[3],
      'name': order_data[4],
      'phone': order_data[5]
    }
  }
  return res

@bp_m_order_detail.route('/order/<number>', methods=['GET'])
def api_order_detail(number):
  try:
    result = query_order_detail(number)
    return jsonify({'data': [result] })
  except TypeError as e:
    abort(400, description=abort_msg(e, 'Order number is incorrect.'))
  except Exception as e:
    abort(500, description=abort_msg(e))