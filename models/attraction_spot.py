from flask import Blueprint, abort, jsonify
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg

bp_m_attraction_spot = Blueprint('m_attraction_spot', __name__)

# API 旅遊景點 → 根據景點編號取得景點資料


@with_cnx(need_commit=False)
def query_attraction_spot(cursor, attraction_id):
  cursor.execute('SET SESSION group_concat_max_len = 10000')
  query_sql = '''
    SELECT attractions.id, attractions.name, attractions.category, attractions.description, attractions.address, 
    attractions.transport, attractions.mrt, attractions.latitude, attractions.longitude, group_concat(attractions_imgs.img_url) AS images 
    FROM attractions_imgs INNER JOIN attractions ON attractions.id = attractions_imgs.attraction_id 
    WHERE attraction_id = %s
    GROUP BY attraction_id
    '''
  cursor.execute(query_sql, (attraction_id, ))
  columns = [col[0] for col in cursor.description]
  attraction = dict(zip(columns, cursor.fetchone()))
  return attraction


@bp_m_attraction_spot.route('/attraction/<int:attraction_id>', methods=['GET'])
def api_attraction_spot(attraction_id):
  try:
    result = query_attraction_spot(attraction_id)
    result['images'] = result['images'].split(',')
    return jsonify({'data': [result]})
  except TypeError as e:
    abort(400, description=abort_msg(e, 'Attraction id is incorrect.'))
  except Exception as e:
    abort(500, description=abort_msg(e))
