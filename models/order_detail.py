from flask import Blueprint, abort, jsonify
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg

bp_m_order_detail = Blueprint('m_order_detail', __name__)

# API 訂單 → 根據 1 筆訂單編號，取得該筆訂單資料

@bp_m_order_detail.route('/order/<int:number>', methods=['GET'])
def api_order_detail(number):
  try:
    return jsonify({'data': []})
  except TypeError as e:
    abort(400, description=abort_msg(e, 'Order number is incorrect.'))
  except Exception as e:
    abort(500, description=abort_msg(e))