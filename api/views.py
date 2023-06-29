from flask import Blueprint
import flask_praetorian

views = Blueprint('views', __name__)



@views.route('/get-user-data', methods=['GET'])
@flask_praetorian.auth_required
def get_user_data():
  user = flask_praetorian.current_user()
  return {'data': {
            "username" : user.username,
            "email" : user.email,
            "id": user.id
            }
          }

