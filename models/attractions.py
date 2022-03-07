from flask import Blueprint, request, abort, jsonify
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg

bp_m_attractions = Blueprint('m_attractions', __name__)

# API 旅遊景點 → 取得景點資料列表

@with_cnx(need_commit = False)
def query_attractions(cursor, page_unit, page, keyword):
  start_index = page * page_unit
  keyword_val = keyword if keyword else '%'
  query_sql = '''
    SELECT attractions.id, attractions.name, attractions.category, attractions.description, attractions.address, 
    attractions.transport, attractions.mrt, attractions.latitude, attractions.longitude, group_concat(attractions_imgs.img_url) AS images 
    FROM attractions_imgs INNER JOIN attractions ON attractions.id = attractions_imgs.attraction_id 
    WHERE name LIKE %s
    GROUP BY attraction_id LIMIT %s, %s
  '''
  cursor.execute(query_sql, ('%'+keyword_val+'%', start_index, page_unit))
  columns = [col[0] for col in cursor.description]
  attractions = [dict(zip(columns, row)) for row in cursor.fetchall()]
  return attractions

@bp_m_attractions.route('/attractions', methods=['GET'])
def api_attractions():
  try:
    page_unit = 12
    page = request.args.get('page', type=int)
    keyword = request.args.get('keyword')
    if page is None:
      abort(400, description='Parameter page type:int is required.')
    else:
      result = query_attractions(page_unit, page, keyword)
      for index, row in enumerate(result):
        result[index]['images'] = row['images'].split(',')
      next_page = None if len(result) < page_unit else page + 1
      return jsonify({'nextPage': next_page, 'data': result})
  except Exception as e:
    abort(500, description=abort_msg(e))