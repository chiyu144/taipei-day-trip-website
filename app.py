from flask import Flask, current_app, render_template, jsonify
import configparser
from mysql.connector import Error, pooling

from models.attractions import bp_m_attractions
from models.attraction_spot import bp_m_attraction_spot
from models.user import bp_m_user
from models.booking import bp_m_booking
from models.orders import bp_m_orders
from models.order_detail import bp_m_order_detail

config = configparser.ConfigParser()
config.read('config.ini')

def create_db_pool():
  return pooling.MySQLConnectionPool(
      pool_name=config['Mysql']['pool_name'],
      pool_size=int(config['Mysql']['pool_size']),
      host=config['Mysql']['host'],
      port=int(config['Mysql']['port']),
      user=config['Mysql']['user'],
      password=config['Mysql']['password'],
      database=config['Mysql']['database'],
      auth_plugin='mysql_native_password'
  )

def db_cnx():
  try:
    cnx = current_app.db_pool.get_connection()
    if cnx.is_connected():
      return cnx
  except Error as e:
    print('MySql Connection Pool error: ', e)

app = Flask(__name__)
with app.app_context():
  current_app.db_pool = create_db_pool()
  current_app.db_cnx = db_cnx

app.config['ENV'] = config['App']['env']
app.config['JSON_AS_ASCII'] = config['App'].getboolean('json_as_ascii')
app.config['TEMPLATES_AUTO_RELOAD'] = config['App'].getboolean('templates_auto_reload')
app.config['JWT_ALG'] = config['JWT']['alg']
app.config['JWT_SECRET_KEY'] = config['JWT']['secret_key']
app.config['TAPPAY_APP_ID'] = config['TapPay']['app_id']
app.config['TAPPAY_APP_KEY'] = config['TapPay']['app_key']
app.config['TAPPAY_PARTNER_KEY'] = config['TapPay']['partner_key']
app.config['TAPPAY_MERCHANT_ID'] = config['TapPay']['merchant_id']
app.jinja_env.globals.update(tappayAppId = app.config['TAPPAY_APP_ID'])
app.jinja_env.globals.update(tappayAppKey = app.config['TAPPAY_APP_KEY'])

# Pages
@app.route('/')
def index():
  return render_template('index.html')
@app.route('/attraction/<id>')
def attraction(id):
  return render_template('attraction.html')
@app.route('/booking')
def booking():
  return render_template('booking.html')
@app.route('/thankyou')
def thankyou():
  return render_template('thankyou.html')

# API error handler
@app.errorhandler(500)
def internal_server_error(e):
  return jsonify({ 'error': True, 'message': str(e.description) }), 500

@app.errorhandler(400)
def bad_request_error(e):
  return jsonify({ 'error': True, 'message': str(e.description) }), 400

@app.errorhandler(403)
def access_denied_error(e):
  return jsonify({ 'error': True, 'message': str(e.description) }), 403

app.register_blueprint(bp_m_attractions, url_prefix = '/api')
app.register_blueprint(bp_m_attraction_spot, url_prefix = '/api')
app.register_blueprint(bp_m_user, url_prefix = '/api')
app.register_blueprint(bp_m_booking, url_prefix = '/api')
app.register_blueprint(bp_m_orders, url_prefix = '/api')
app.register_blueprint(bp_m_order_detail, url_prefix = '/api')

if __name__ == '__main__':
    app.run(host='127.0.0.1' if app.config['ENV'] == 'development' else '0.0.0.0', port=3000, debug=True if app.config['ENV'] == 'development' else False)
