from flask import current_app, Blueprint, request, abort, jsonify, make_response
from flask.views import MethodView
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg

bp_m_orders = Blueprint('m_orders', __name__)

class Api_Orders(MethodView): 
  def get(self):
    # api: 取得訂單列表
    pass
  def post(self):
    # api: 新增 1 筆訂單
    pass


bp_m_orders.add_url_rule('/orders', view_func=Api_Orders.as_view('api_orders'))