from datetime import datetime, timedelta
import re, jwt
from flask import current_app, Blueprint, request, abort, jsonify, make_response
from flask.views import MethodView
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg

bp_m_user = Blueprint('m_user', __name__)

# 檢查 email 是否重複
@with_cnx(need_commit = False)
def exist_email(cursor, new_user_email):
  cursor.execute('SELECT count(email) FROM member WHERE email = %s', (new_user_email, ))
  return True if int(cursor.fetchone()[0]) > 0 else False

# 檢查 email 格式是否正確
def invalid_email(new_user_email):
  email_format: str = r"(^[a-zA-Z0-9'_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
  email= f'{new_user_email}'
  return False if re.match(email_format, email, re.IGNORECASE) else True

# 會員註冊
@with_cnx(need_commit = True)
def signup_user(cursor, new_user_name, new_user_email, new_user_password):
  cursor.execute('INSERT INTO member (name, email, password) VALUES (%s, %s, %s)', (new_user_name, new_user_email, new_user_password))

# 會員登入
@with_cnx(need_commit= False)
def query_user(cursor, user_email, user_password):
  cursor.execute('SELECT id, name FROM member WHERE email = %s AND password = %s', (user_email, user_password))
  return cursor.fetchone()

class Api_User(MethodView): 
  def get(self):
    # api: 檢查會員登入狀態
    jwt_cookie = request.cookies.get('jwt')
    try:
      user_state = jwt.decode(jwt_cookie, current_app.config['JWT_SECRET_KEY'], algorithms = current_app.config['JWT_ALG'])
      user_state.pop('exp')
      return jsonify({ 'data': user_state })
    except jwt.ExpiredSignatureError as e:
      print(e)
      return jsonify({ 'data': None })

  def post(self):
    # api: 會員註冊
    try:
      new_user_name = request.get_json()['name']
      new_user_email = request.get_json()['email']
      new_user_password = request.get_json()['password']
      if new_user_name and new_user_email and new_user_password:
        if exist_email(new_user_email):
          raise ValueError('註冊失敗，您的 Email 已被註冊')
        if invalid_email(new_user_email):
          raise TypeError('註冊失敗，Email 格式不正確')
        else:
          signup_user(new_user_name, new_user_email, new_user_password)
          return jsonify({'ok': True})
      else:
        raise TypeError('註冊失敗，欄位皆不得為空')
    except (ValueError, TypeError) as e:
      abort(400, description = abort_msg(e))
    except Exception as e:
      abort(500, description = abort_msg(e))

  def patch(self):
    # api: 會員登入
    try:
      user_email = request.get_json()['email']
      user_password = request.get_json()['password']
      if user_email and user_password:
        valid_user = query_user(user_email, user_password)
        if valid_user:
          jwt_payload = {
            'sub': valid_user[0],
            'sub_name': valid_user[1],
            'sub_email': user_email,
            'exp': datetime.utcnow() + timedelta(minutes = 5)
          }
          jwt_token = jwt.encode(jwt_payload, current_app.config['JWT_SECRET_KEY'], algorithm = current_app.config['JWT_ALG'])
          res = make_response(jsonify({ 'ok': True }))
          res.set_cookie('jwt', value = jwt_token, secure = True, httponly = True, samesite = 'Strict')
          return res
        else:
          raise ValueError('登入失敗，帳號或密碼錯誤')
      else:
        raise TypeError('登入失敗，帳號或密碼皆不得為空')
    except (ValueError, TypeError) as e:
      abort(400, description = abort_msg(e))
    except Exception as e:
      abort(500, description = abort_msg(e))

  def delete(self):
    # api: 會員登出
    res = make_response(jsonify({ 'ok': True }))
    res.delete_cookie('jwt', path = '/', secure = True, httponly = True, samesite = 'Strict')
    return res

bp_m_user.add_url_rule('/user', view_func=Api_User.as_view('api_user'))