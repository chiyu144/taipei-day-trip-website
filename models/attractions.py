from flask import Blueprint, request, abort, jsonify
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg

bp_m_attractions = Blueprint('m_attractions', __name__)

# API 旅遊景點 → 取得景點資料列表

@with_cnx(need_commit = False)
def query_attractions(cursor, page_unit, page, keyword):
  start_index = 0 if page == 0 else page * page_unit
  if keyword:
    cursor.execute("""
      select attractions.id, attractions.name, attractions.category, attractions.description, attractions.address, 
      attractions.transport, attractions.mrt, attractions.latitude, attractions.longitude, group_concat(attractions_imgs.img_url) as images 
      from attractions_imgs inner join attractions on attractions.id = attractions_imgs.attraction_id 
      where name like %s
      group by attraction_id limit %s, %s
      """, ("%"+keyword+"%", start_index, page_unit))
  else:
    cursor.execute("""
      select attractions.id, attractions.name, attractions.category, attractions.description, attractions.address, 
      attractions.transport, attractions.mrt, attractions.latitude, attractions.longitude, group_concat(attractions_imgs.img_url) as images 
      from attractions_imgs inner join attractions on attractions.id = attractions_imgs.attraction_id 
      group by attraction_id limit %s, %s
      """, (start_index, page_unit))
  attractions = cursor.fetchall()
  return attractions

@bp_m_attractions.route("/attractions", methods=["GET"])
def api_attractions():
  try:
    page_unit = 12
    page = request.args.get('page', type=int)
    keyword = request.args.get('keyword')
    if page is None:
      abort(400, description="Parameter page <'int'> is required.")
    else:
      cols = ["id", "name", "category", "description", "address", "transport", "mrt", "latitude", "longitude", "images"]
      values = query_attractions(page_unit, page, keyword)
      result = [dict(zip(cols, value)) for value in values]
      for index, row in enumerate(result):
        result[index]["images"] = row["images"].split(",")
      next_page = None if len(result) < page_unit else page + 1
      return jsonify({"nextPage": next_page, "data": result})
  except Exception as e:
    abort(500, description=abort_msg(e))