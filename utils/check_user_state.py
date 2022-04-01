import jwt
from flask import current_app

def check_user_state(jwt_cookie):
  if (jwt_cookie):
    try:
      user_state = jwt.decode(jwt_cookie, current_app.config['JWT_SECRET_KEY'], algorithms = current_app.config['JWT_ALG'])
      user_state.pop('exp')
      return {'error': False, 'result': user_state }
    except jwt.ExpiredSignatureError as e:
      return {'error': 'expired', 'message': f'{e}'}
  return {'error': 'none'}