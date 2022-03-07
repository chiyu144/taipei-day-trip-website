from flask import Blueprint, abort, jsonify
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg

bp_m_attraction_id = Blueprint('m_attraction_id', __name__)

# API 旅遊景點 → 根據景點編號取得景點資料

@with_cnx(need_commit = False)
def query_attraction_id(cursor, attraction_id):
  query_sql = """
    select attractions.id, attractions.name, attractions.category, attractions.description, attractions.address, 
    attractions.transport, attractions.mrt, attractions.latitude, attractions.longitude, group_concat(attractions_imgs.img_url) as images 
    from attractions_imgs inner join attractions on attractions.id = attractions_imgs.attraction_id 
    where attraction_id = %s
    group by attraction_id
    """
  cursor.execute(query_sql, (attraction_id, ))
  attraction = cursor.fetchone()
  return attraction

@bp_m_attraction_id.route("/attraction/<int:attraction_id>", methods=["GET"])
def api_attraction_id(attraction_id):
  try:
    cols = ["id", "name", "category", "description", "address", "transport", "mrt", "latitude", "longitude", "images"]
    value = query_attraction_id(attraction_id)
    result = dict(zip(cols, value))
    result["images"] = result["images"].split(",")
    return jsonify({"data": result})
  except Exception as e:
    if value is None:
      abort(400, description="Parameter attraction id is incorrect.")
    else:
      abort(500, description=abort_msg(e))