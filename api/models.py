from . import db

class Room(db.Model):

  __tablename__ = 'room'
  id = db.Column(db.Integer, primary_key=True)
  code = db.Column(db.Text, unique=True)
  users = db.relationship('User', backref='room')

class CodeBlocks(db.Model):

  __tablename__ = 'code_blocks'
  ROWID = db.Column(db.Integer, primary_key=True) 
  text = db.Column(db.Text, unique=True)