from flask import Flask, current_app, render_template, jsonify
import configparser
from mysql.connector import Error, pooling

from models.attractions import bp_m_attractions
from models.attraction_spot import bp_m_attraction_spot

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
      database=config['Mysql']['database']
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
  return jsonify({'error': True, 'message': str(e)}), 500

@app.errorhandler(400)
def not_found_error(e):
  return jsonify({'error': True, 'message': str(e)}), 400

app.register_blueprint(bp_m_attractions, url_prefix = '/api')
app.register_blueprint(bp_m_attraction_spot, url_prefix = '/api')

if __name__ == '__main__':
  app.run(host='127.0.0.1' if app.config['ENV'] == 'development' else '0.0.0.0', port=3000, debug=True if app.config['ENV'] == 'development' else False)
