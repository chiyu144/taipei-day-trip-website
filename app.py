from flask import Flask, current_app, request, render_template, abort, jsonify
import configparser, math
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

app = Flask(__name__)
with app.app_context():
  current_app.db_pool = create_db_pool()
  current_app.db_cnx = db_cnx

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

# APIs
@app.errorhandler(500)
def internal_server_error(e):
  return jsonify(error=str(e)), 500

@with_cnx(need_commit = False)
def query_attractions(cursor, cols, page, keyword):
  page_unit = 12
  start_index = 0 if page == 0 else page * page_unit
  keyword_sql = f"where name like '%{keyword}%'" if keyword else ""
  query_sql = f"select {', '.join(map(lambda col: 'attractions.' + col, cols[0:-1]))}, group_concat(attractions_imgs.img_url) as {cols[-1]} " + \
              f"from attractions_imgs " + \
              f"inner join attractions on attractions.id = attractions_imgs.attraction_id {keyword_sql} " + \
              f"group by attraction_id " + \
              f"limit {start_index}, {page_unit};"
  cursor.execute(query_sql)
  print(query_sql)
  attractions = cursor.fetchall()
  return attractions

@app.route("/api/attractions", methods=["GET"])
def api_attractions():
  page = request.args.get('page', type=int)
  keyword = request.args.get('keyword')
  if page is None:
    abort(500, description="parameter page <'int'> is required.")
  else:
    cols = ["id", "name", "category", "description", "address", "transport", "mrt", "latitude", "longitude", "images"]
    values = query_attractions(cols, page, keyword)
    result = [dict(zip(cols, value)) for value in values]
    for index, row in enumerate(result):
      result[index]["images"] = row["images"].split(",")
    return jsonify({"nextPage": page + 1, "data": result})

if __name__ == "__main__":
  app.run(port=3000, debug=True)
