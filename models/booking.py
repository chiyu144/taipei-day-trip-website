from datetime import datetime, timezone
from flask import Blueprint, request, abort, jsonify
from flask.views import MethodView
from utils.check_user_state import check_user_state
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg
from utils.input_validation import date_validation

bp_m_booking = Blueprint('m_booking', __name__)

# 取得行程
# 可存多筆 Booking 資料，但 1 個景點只能 Booking 1 次，重複 Booking 相同景點會覆蓋為最新的那次
@with_cnx(need_commit = False)
def query_booking(cursor, member_id):
  query_sql = '''
    SELECT attractions.id, attractions.name, attractions.address,
    booking.image, booking.date, booking.time, booking.price
    FROM booking INNER JOIN attractions ON attractions.id = booking.attraction_id
    WHERE member_id LIKE %s
    ORDER BY updated_time DESC
  '''
  cursor.execute(query_sql, (member_id, ))
  columns = [col[0] for col in cursor.description]
  bookings = cursor.fetchall()
  output = []
  for booking in bookings:
    booking_dct = {}
    attraction_dct = dict(zip((columns[0], columns[1], columns[2], columns[3]), (booking[0], booking[1], booking[2], booking[3])))
    booking_dct['attraction'] = attraction_dct
    booking_dct['date'] = booking[4]
    booking_dct['time'] = booking[5]
    booking_dct['price'] = booking[6]
    output.append(booking_dct)
  return output

# 預定行程
@with_cnx(need_commit = True)
def booking_schedule(cursor, member_id, attraction_id, date, time, price):
  cursor.execute('SELECT count(attraction_id) FROM booking WHERE member_id = %s AND attraction_id = %s', (member_id, attraction_id))
  if int(cursor.fetchone()[0]) > 0:
    updated_time = datetime.now(timezone.utc).astimezone().isoformat()
    update_sql = 'UPDATE booking SET date = %s, time = %s, price = %s, updated_time = %s WHERE member_id = %s AND attraction_id = %s'
    update_value = (date, time, price, updated_time, member_id, attraction_id)
    cursor.execute(update_sql, update_value)
  else:
    cursor.execute('SELECT img_url FROM attractions_imgs WHERE attraction_id = %s LIMIT 0, 1', (attraction_id,))
    image = cursor.fetchone()
    insert_sql = 'INSERT INTO booking (member_id, attraction_id, image, date, time, price) VALUES (%s, %s, %s, %s, %s, %s)'
    insert_value = (member_id, attraction_id, image[0], date, time, price)
    cursor.execute(insert_sql, insert_value)

# 刪除行程
@with_cnx(need_commit= True)
def booking_cancel(cursor, member_id, attraction_id):
  cursor.execute('DELETE FROM booking WHERE member_id = %s AND attraction_id = %s', (member_id, attraction_id))

class Api_Booking(MethodView): 
  def get(self):
    # api: 取得 Booking 列表
    try:
      jwt_cookie = request.cookies.get('jwt')
      user_state = check_user_state(jwt_cookie)
      if user_state['error']:
        raise PermissionError('取得行程資訊失敗，已登出，請重新登入')
      else:
        booking = query_booking(user_state['result']['sub'])
        if booking:
          return jsonify({ 'data': booking })
        else: return jsonify({ 'data': [] })
    except PermissionError as e:
      abort(403, description = abort_msg(e))

  def post(self):
    # api: 新增 1 筆 Booking
    try:
      jwt_cookie = request.cookies.get('jwt')
      user_state = check_user_state(jwt_cookie)
      attraction_id = request.get_json()['attractionId']
      date = request.get_json()['date']
      time = request.get_json()['time']
      price = request.get_json()['price']
      if user_state['error']:
        raise PermissionError('預定行程失敗，已登出，請重新登入')
      elif not all((attraction_id, date, time, price)):
        raise TypeError('預定行程失敗，欄位皆不得為空')
      elif not date_validation(date):
        raise ValueError('預定行程失敗，日期格式錯誤')
      else:
        booking_schedule(user_state['result']['sub'], attraction_id, date, time, price)
        return jsonify({ 'ok': True })
    except (ValueError, TypeError) as e:
      abort(400, description = abort_msg(e))
    except PermissionError as e:
      abort(403, description = abort_msg(e))
    except Exception as e:
      abort(500, description = abort_msg(e))

  def delete(self):
    # api: 刪除 1 筆 Booking
    try:
      jwt_cookie = request.cookies.get('jwt')
      user_state = check_user_state(jwt_cookie)
      if user_state['error']:
        raise PermissionError('取得行程資訊失敗，已登出，請重新登入')
      else:
        attraction_id = request.args.get('id', type = int)
        booking_cancel(user_state['result']['sub'], attraction_id)
        return jsonify({ 'ok': True })
    except Exception as e:
      abort(500, description = abort_msg(e))

bp_m_booking.add_url_rule('/booking', view_func=Api_Booking.as_view('api_booking'))