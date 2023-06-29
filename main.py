from api import create_app
from flask import session
from flask_socketio import SocketIO, join_room, leave_room, send, emit
from api.models import Room, CodeBlocks
from api import db
from api.room_pool import RoomManager
from sqlalchemy.sql.expression import func 
import random
import datetime


room_manager = RoomManager(use_db=False)
app = create_app()
socketio = SocketIO(app, cors_allowed_origins="*")


def generate_code_block():
    code_block = random.choice(db.session.query(CodeBlocks).order_by(func.random()).limit(100).all())
    print(code_block.text)
    return code_block.text

@socketio.on('join')
def on_join(data):
    username = data['username']
    room_code = room_manager.add_user_to_room(username)
    join_room(room_code)
    session['room'] = room_code # per client
    socketio.emit('join', {'username' : username, 
                            'room' : room_code, 
                            'users' : room_manager.get_users_in_room(room_code),
                            'code_block': generate_code_block()}, to=room_code)
    print(username + ' has joined room '+ room_code)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room_code = session.get('room')
    room_manager.remove_user_from_room(username, room_code)
    leave_room(room_code)
    socketio.emit('leave', {"username" : username}, to=room_code)
    print(username + ' has left room '+ room_code)

@socketio.on('updatedCode')
def on_message(data):
    room = session.get('room')
    socketio.emit('opponentUpdate', data, to=room, include_self=False)

@socketio.on('countdown')
def on_countdown():
    room = session.get('room')
    print(room, "time left", room_manager.get_countdown_in_room(room))
    socketio.emit('countdown', {'time_left': room_manager.get_countdown_in_room(room)}, to=room)

if __name__ == '__main__':
    socketio.run(app, debug=True)
    db.session.close()
