from flask import Flask, current_app, request, render_template, abort, jsonify
import configparser, traceback, sys
from mysql.connector import Error, pooling
from utils.with_cnx import with_cnx

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

def abort_msg(e):
  error_class = e.__class__.__name__
  detail = e.args[0]
  cl, exc, tb = sys.exc_info() # 錯誤完整資訊 Call Stack
  last_callstack = traceback.extract_tb(tb)[-1] # 最後一行錯誤訊息
  file_name = last_callstack[0]
  line_num = last_callstack[1]
  func_name = last_callstack[2]
  return f"Exception raise in file: {file_name}, line {line_num}, in {func_name}: [{error_class}] {detail}."

app = Flask(__name__)
with app.app_context():
  current_app.db_pool = create_db_pool()
  current_app.db_cnx = db_cnx
  current_app.abort_msg = abort_msg

app.config['ENV'] = config['App']['env']
app.config['JSON_AS_ASCII'] = config['App'].getboolean('json_as_ascii')
app.config["TEMPLATES_AUTO_RELOAD"] = config['App'].getboolean('templates_auto_reload')

# Pages
@app.route("/")
def index():
  return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
  return render_template("attraction.html")
@app.route("/booking")
def booking():
  return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
  return render_template("thankyou.html")

# API error handler
@app.errorhandler(500)
def internal_server_error(e):
  return jsonify({"error": True, "message": str(e)}), 500

@app.errorhandler(400)
def not_found_error(e):
  return jsonify({"error": True, "message": str(e)}), 400

# API 旅遊景點 → 取得景點資料列表
@with_cnx(need_commit = False)
def query_attractions(cursor, page_unit, cols, page, keyword):
  start_index = 0 if page == 0 else page * page_unit
  keyword_sql = f"where name like '%{keyword}%'" if keyword else ""
  query_sql = f"select {', '.join(map(lambda col: 'attractions.' + col, cols[0:-1]))}, group_concat(attractions_imgs.img_url) as {cols[-1]} " + \
              f"from attractions_imgs " + \
              f"inner join attractions on attractions.id = attractions_imgs.attraction_id {keyword_sql} " + \
              f"group by attraction_id " + \
              f"limit {start_index}, {page_unit};"
  cursor.execute(query_sql)
  attractions = cursor.fetchall()
  return attractions

@app.route("/api/attractions", methods=["GET"])
def api_attractions():
  try:
    page_unit = 12
    page = request.args.get('page', type=int)
    keyword = request.args.get('keyword')
    if page is None:
      abort(400, description="Parameter page <'int'> is required.")
    else:
      cols = ["id", "name", "category", "description", "address", "transport", "mrt", "latitude", "longitude", "images"]
      values = query_attractions(page_unit, cols, page, keyword)
      result = [dict(zip(cols, value)) for value in values]
      for index, row in enumerate(result):
        result[index]["images"] = row["images"].split(",")
      next_page = None if len(result) < page_unit else page + 1
      return jsonify({"nextPage": next_page, "data": result})
  except Exception as e:
    abort(500, description=abort_msg(e))

# API 旅遊景點 → 根據景點編號取得景點資料
@with_cnx(need_commit = False)
def query_attraction_id(cursor, cols, attraction_id):
  query_sql = f"select {', '.join(map(lambda col: 'attractions.' + col, cols[0:-1]))}, group_concat(attractions_imgs.img_url) as {cols[-1]} " + \
              f"from attractions_imgs " + \
              f"inner join attractions on attractions.id = attractions_imgs.attraction_id where attraction_id = {attraction_id} " + \
              f"group by attraction_id "
  cursor.execute(query_sql)
  attraction_id = cursor.fetchone()
  return attraction_id

@app.route("/api/attraction/<int:attraction_id>", methods=["GET"])
def api_attraction_id(attraction_id):
  try:
    cols = ["id", "name", "category", "description", "address", "transport", "mrt", "latitude", "longitude", "images"]
    value = query_attraction_id(cols, attraction_id)
    result = dict(zip(cols, value))
    result["images"] = result["images"].split(",")
    return jsonify({"data": result})
  except Exception as e:
    if value is None:
      abort(400, description="Parameter attraction id is incorrect.")
    else:
      abort(500, description=abort_msg(e))

if __name__ == "__main__":
  app.run(host="127.0.0.1" if app.config['ENV'] == "development" else "15.152.57.246", port=3000, debug=True if app.config['ENV'] == "development" else False)
