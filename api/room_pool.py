
import uuid 
from .models import Room 
from . import db, User
from collections import defaultdict
import datetime

class RoomManager():

  JOIN_THRESHOLD = 5
  COUNTDOWN_TIME = 15 # seconds
  MAX_SIZE = 2
  def __init__ (self, use_db=False):
    self.available_rooms = {} # room code -> room id
    self.filled_rooms = {} # same thing 
    self.room_sizes = {} # rooom code -> room size
    self.room_users = defaultdict(list) # room code -> usernames
    self.room_time = {} # room code -> absolute time
    self.use_db = use_db

  def get_countdown_in_room(self, code):
    if (code not in self.room_time):
      return self.COUNTDOWN_TIME
    return max(0, RoomManager.COUNTDOWN_TIME - (datetime.datetime.now() - self.room_time[code]).seconds)

  def get_users_in_room(self, code):
    return self.room_users[code]

  def add_user_to_room(self, username):
    
    code = ""
    room_id = None
    for code1, rid in self.available_rooms.items():
      if self.get_countdown_in_room(code1) > RoomManager.JOIN_THRESHOLD:
        self.room_sizes[code1] += 1
        if self.room_sizes[code1] >= self.MAX_SIZE:
          del self.available_rooms[code1]
          self.filled_rooms[code1] = rid
        room_id = rid
        code = code1
        break
    
    if code == "":
      code = str(uuid.uuid4())
      self.room_sizes[code] = 1
      room = Room(code=code)
      room_id = room.id
      self.available_rooms[code] = room.id
      self.room_time[code] = datetime.datetime.now()
      if self.use_db:
        db.session.add(room)
    
    if self.use_db:
      user = db.session.query(User).filter_by(username=username).first()
      user.room_id = room_id
      db.session.commit()

    if username not in self.room_users[code]:
      self.room_users[code].append(username)

    return code 

  def remove_user_from_room(self, username, code):
    
    if code not in self.room_users:
      return

    if username in self.room_users[code]:
      self.room_users[code].remove(username)
    if self.use_db:
      user = db.session.query(User).filter_by(username=username).first()
      room = db.session.query(Room).filter_by(id=user.room_id).first()  
      code = room.code

    if self.room_sizes[code] == self.MAX_SIZE:
      del self.filled_rooms[code]
    
    self.room_sizes[code] -= 1
    if self.room_sizes[code] == 0:
      print('-------------------------------Deleting room---------------------------------')
      self.available_rooms.pop(code, None)
      del self.room_sizes[code]
      del self.room_time[code]
      del self.room_users[code]
      if self.use_db:
        db.session.delete(room)
        db.session.commit()
    
    return 


  
  