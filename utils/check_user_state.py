import jwt
from flask import current_app
from utils.with_cnx import with_cnx

@with_cnx(need_commit = False)
def count_booking(cursor, member_id):
  cursor.execute('SELECT count(*) FROM booking WHERE member_id = %s', (member_id, ))
  result = cursor.fetchone()[0]
  return result

def check_user_state(jwt_cookie):
  if (jwt_cookie):
    try:
      user_state = jwt.decode(jwt_cookie, current_app.config['JWT_SECRET_KEY'], algorithms = current_app.config['JWT_ALG'])
      user_state.pop('exp')
      user_state['booking_num'] = count_booking(user_state['sub'])
      return {'error': False, 'result': user_state }
    except jwt.ExpiredSignatureError as e:
      return {'error': 'expired', 'message': f'{e}'}
  return {'error': 'none'}