from datetime import datetime, timedelta, timezone
import re
import jwt
from flask import current_app, Blueprint, request, abort, jsonify, make_response
from flask.views import MethodView
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg
from utils.check_user_state import check_user_state
from utils.input_validation import email_validation, password_validation, name_validation

bp_m_user = Blueprint('m_user', __name__)

# 檢查 email 是否重複


@with_cnx(need_commit=False)
def exist_email(cursor, new_user_email):
  cursor.execute('SELECT count(email) FROM member WHERE email = %s', (new_user_email, ))
  return True if int(cursor.fetchone()[0]) > 0 else False

# 會員註冊


@with_cnx(need_commit=True)
def signup_user(cursor, new_user_name, new_user_email, new_user_password):
  cursor.execute('INSERT INTO member (name, email, password) VALUES (%s, %s, %s)',
                 (new_user_name, new_user_email, new_user_password))

# 會員登入


@with_cnx(need_commit=False)
def query_user(cursor, user_email, user_password):
  cursor.execute('SELECT id, name FROM member WHERE email = %s AND password = %s', (user_email, user_password))
  member = cursor.fetchone()
  return member


class Api_User(MethodView):
  def get(self):
    # api: 檢查會員登入狀態
    try:
      jwt_cookie = request.cookies.get('jwt')
      user_state = check_user_state(jwt_cookie)
      if user_state['error'] == 'expired':
        return jsonify({'isLogin': False, 'data': 'expired'})
      elif user_state['error'] == 'none':
        return jsonify({'isLogin': False, 'data': None})
      else:
        return jsonify({'isLogin': True, 'data': user_state['result']})
    except Exception as e:
      abort(500, description=abort_msg(e))

  def post(self):
    # api: 會員註冊
    try:
      new_user_name = request.get_json()['name']
      new_user_email = request.get_json()['email']
      new_user_password = request.get_json()['password']
      if all((new_user_name, new_user_email, new_user_password)):
        if exist_email(new_user_email):
          raise ValueError('註冊失敗，您的 Email 已被註冊')
        if not email_validation(new_user_email):
          raise TypeError('註冊失敗，Email 格式不正確')
        if not password_validation(new_user_password):
          raise TypeError('註冊失敗，密碼須由 8 - 16 個英數字及至少 1 個特殊符號組成')
        if not name_validation(new_user_name):
          raise TypeError('註冊失敗，請輸入中文真實姓名')
        else:
          signup_user(new_user_name, new_user_email, new_user_password)
          return jsonify({'ok': True})
      else:
        raise TypeError('註冊失敗，欄位皆不得為空')
    except (ValueError, TypeError) as e:
      abort(400, description=abort_msg(e))
    except Exception as e:
      abort(500, description=abort_msg(e))

  def patch(self):
    # api: 會員登入
    try:
      user_email = request.get_json()['email']
      user_password = request.get_json()['password']
      if all((user_email, user_password)):
        valid_user = query_user(user_email, user_password)
        if not email_validation(user_email):
          raise TypeError('登入失敗，Email 格式不正確')
        elif not password_validation(user_password):
          raise TypeError('登入失敗，密碼須由 8 - 16 個英數字及至少 1 個特殊符號組成')
        elif not valid_user:
          raise ValueError('登入失敗，帳號或密碼錯誤')
        else:
          jwt_payload = {
              'sub': valid_user[0],
              'sub_name': valid_user[1],
              'sub_email': user_email,
              'exp': datetime.utcnow() + timedelta(minutes=30)
          }
          jwt_token = jwt.encode(
              jwt_payload, current_app.config['JWT_SECRET_KEY'], algorithm=current_app.config['JWT_ALG'])
          res = make_response(jsonify({'ok': True}))
          res.set_cookie('jwt', value=jwt_token, samesite='Strict', httponly=True)
          return res
      else:
        raise TypeError('登入失敗，帳號或密碼皆不得為空')
    except (ValueError, TypeError) as e:
      abort(400, description=abort_msg(e))
    except Exception as e:
      abort(500, description=abort_msg(e))

  def delete(self):
    # api: 會員登出
    res = make_response(jsonify({'ok': True}))
    res.delete_cookie('jwt', path='/', samesite='Strict', httponly=True)
    return res


bp_m_user.add_url_rule('/user', view_func=Api_User.as_view('api_user'))
