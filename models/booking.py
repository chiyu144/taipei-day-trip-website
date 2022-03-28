from flask import current_app, Blueprint, request, abort, jsonify, make_response
from flask.views import MethodView
from utils.with_cnx import with_cnx
from utils.abort_msg import abort_msg

bp_m_booking = Blueprint('m_booking', __name__)

class Api_Booking(MethodView): 
  def get(self):
    pass
  def post(self):
    pass
  def delete(self):
    pass

bp_m_booking.add_url_rule('/booking', view_func=Api_Booking.as_view('api_booking'))