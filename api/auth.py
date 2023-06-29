from flask import Blueprint, render_template, request, jsonify, render_template
import flask_praetorian
from . import guard
from . import User, db
from .token import generate_confirmation_token, confirm_token
import datetime
from .email import send_email

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
  req = request.get_json(force=True)
  email = req.get('email', None)
  password = req.get('password', None)

  user = User.query.filter_by(email=email).first()
  print(user.confirmed)
  if user is None:
    return {}, 401
  if not user.confirmed:
    return {"error", "Please verify email address"}, 401

  user = guard.authenticate(email, password)
  ret = {'access_token': guard.encode_jwt_token(user)}
  return ret, 200


@auth.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
  req = request.get_json(force=True)
  email = req.get('email', None)
  username = req.get('username', None)
  password1 = req.get('password1', None)
  password2 = req.get('password2', None)


  email_exists = User.query.filter_by(email=email).first() is not None
  username_exists = User.query.filter_by(username=username).first() is not None

  if email_exists:
    return jsonify({'error': 'Email already exists'}), 400
  
  if username_exists:
    return jsonify({'error': 'Username already exists'}), 400

  if password1 != password2:
    return jsonify({'error': 'Passwords do not match'}), 400

  user = User(email=email, username=username, password=guard.hash_password(password1))
  user.confirmed = False
  db.session.add(user)
  db.session.commit()

  token = generate_confirmation_token(user.email)
  # confirm_url = url_for('views.confirm_email', token=token, _external=True)
  confirm_url = f"http://localhost:5173/confirm-email/{token}" # frontend link
  html = render_template('email.html', confirm_url=confirm_url)
  subject = "Please confirm your email [CodeRacer]"
  send_email(user.email, subject, html)
  
  # user = guard.authenticate(email, password1)
  # ret = {'access_token': guard.encode_jwt_token(user)}

  return {"data": "Account created, a link has been sent to your email to verify your account"}, 201


@auth.route('/sign-out', methods=['GET'])
def sign_out():
  return jsonify({'message': 'Sign out'})


@auth.route('/refresh', methods=['POST'])
def refresh():
  """
  Refreshes an existing JWT by creating a new one that is a copy of the old
  except that it has a refrehsed access expiration.
  .. example::
      $ curl http://localhost:5000/api/refresh -X GET \
        -H "Authorization: Bearer <your_token>"
  """
  print("refresh request")
  old_token = request.get_data()
  new_token = guard.refresh_jwt_token(old_token)
  ret = {'access_token': new_token}
  return ret, 200


@auth.route("/confirm-email/<token>", methods=['GET'])
def confirm_email(token):
  # try:
  #   email = confirm_token(token)
  # except:
  #   return {'error' : "The confirmation link is invalid or has expired." }, 401
  email = confirm_token(token)
  if not email:
    return {'error' : "The confirmation link is invalid or has expired." }, 401

  user = User.query.filter_by(email=email).first_or_404()
  if user.confirmed:
    return {"data" : "User already confirmed"}, 200

  user.confirmed = True
  user.confirmed_on = datetime.datetime.now()
  db.session.add(user)
  db.session.commit()
  return {"data" : "'You have confirmed your account. Thanks!'"}, 200

@auth.route("/validate-token", methods=['GET'])
@flask_praetorian.auth_required
def validate_token():
  return {"loggedIn" : True}, 200
