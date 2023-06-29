# https://yasoob.me/posts/how-to-setup-and-deploy-jwt-auth-using-react-and-flask/

from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
from os import path
import flask_cors # jwt token 
import flask_praetorian # jwt token
import datetime
from flask_mail import Mail

db = SQLAlchemy()
db.session.expire_on_commit = False
guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()
mail = None
DB_NAME = 'database.db'

class User(db.Model):
  __tablename__ = 'user'
  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.Text, unique=True)
  username = db.Column(db.Text, unique=True)
  password = db.Column(db.Text)
  roles = db.Column(db.Text)
  is_active = db.Column(db.Boolean, default=True, server_default='true')
  registered_on = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
  confirmed = db.Column(db.Boolean, nullable=False, default=False)
  confirmed_on = db.Column(db.DateTime, nullable=True)
  room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=True)

  @property
  def rolenames(self):
    try:
      return self.roles.split(',')
    except Exception:
      return []

  @classmethod
  def lookup(cls, email):
    return cls.query.filter_by(email=email).one_or_none()

  @classmethod
  def identify(cls, id):
    return cls.query.get(id)

  @property
  def identity(self):
    return self.id

  def is_valid(self):
    return self.is_active


def create_app():
  global mail
  app = Flask(__name__)
  app.config.from_object('config.BaseConfig')
  # app.config['SECRET_KEY'] = 'SUPER_SECRET_KEY'
  app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
  # app.config['JWT_ACCESS_LIFESPAN'] = { 'hours': 24 }
  # app.config['JWT_REFRESH_LIFESPAN'] = { 'days': 30 }
  # app.config['SECURITY_PASSWORD_SALT'] = 'SUPER_SEcret key that no body will get'
  
  guard.init_app(app, User)
  db.init_app(app) # tie the app to the db
  cors.init_app(app)
  mail = Mail(app)

  from .auth import auth 
  from .views import views

  app.register_blueprint(auth, url_prefix='/api')
  app.register_blueprint(views, url_prefix='/api')

  create_database(app)

  return app

def create_database(app):
  # if not path.exists('api/instance/' + DB_NAME):
  with app.app_context():
    db.create_all()
    print('Database for api stats created!')
    if db.session.query(User).filter_by(email='justin@gmail.com').count() < 1:
      print('Creating user justin...')
      db.session.add(User(
        email='justin@gmail.com',
        username='justin',
        password=guard.hash_password('1234'),
        roles='admin',
        confirmed=True,
        confirmed_on=datetime.datetime.now()
      ))
      db.session.commit()