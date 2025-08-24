from flask_socketio import emit, join_room, leave_room
from flask_jwt_extended import decode_token
from flask import request
from app import socketio, db
from models import User, ChatMessage
from datetime import datetime
import json

# Store active users
active_users = {}

@socketio.on('connect')
def handle_connect(auth):
    try:
        # Verify JWT token
        if auth and 'token' in auth:
            token = auth['token']
            decoded_token = decode_token(token)
            user_id = decoded_token['sub']
            
            # Store user in active users
            active_users[user_id] = request.sid
            
            # Join user to their personal room
            join_room(user_id)
            
            emit('connected', {'message': 'Connected successfully'})
            
            # Notify other users that this user is online
            emit('user_online', {'user_id': user_id}, broadcast=True)
            
        else:
            emit('error', {'message': 'Authentication required'})
            
    except Exception as e:
        emit('error', {'message': 'Connection failed'})

@socketio.on('disconnect')
def handle_disconnect():
    try:
        # Find and remove user from active users
        user_id = None
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
        
        if user_id:
            del active_users[user_id]
            leave_room(user_id)
            
            # Notify other users that this user is offline
            emit('user_offline', {'user_id': user_id}, broadcast=True)
            
    except Exception as e:
        pass

@socketio.on('join_chat')
def handle_join_chat(data):
    try:
        token = data.get('token')
        other_user_id = data.get('other_user_id')
        
        if not token or not other_user_id:
            emit('error', {'message': 'Token and other_user_id required'})
            return
        
        decoded_token = decode_token(token)
        user_id = decoded_token['sub']
        
        # Create chat room name (consistent ordering)
        room_name = f"chat_{min(user_id, other_user_id)}_{max(user_id, other_user_id)}"
        
        join_room(room_name)
        
        # Get chat history
        messages = ChatMessage.query.filter(
            ((ChatMessage.sender_id == user_id) & (ChatMessage.receiver_id == other_user_id)) |
            ((ChatMessage.sender_id == other_user_id) & (ChatMessage.receiver_id == user_id))
        ).order_by(ChatMessage.created_at.asc()).limit(50).all()
        
        # Mark messages as read
        ChatMessage.query.filter_by(
            sender_id=other_user_id,
            receiver_id=user_id,
            is_read=False
        ).update({'is_read': True})
        db.session.commit()
        
        emit('chat_history', {
            'messages': [msg.to_dict() for msg in messages],
            'room': room_name
        })
        
    except Exception as e:
        emit('error', {'message': 'Failed to join chat'})

@socketio.on('send_message')
def handle_send_message(data):
    try:
        token = data.get('token')
        receiver_id = data.get('receiver_id')
        message_text = data.get('message')
        message_type = data.get('message_type', 'text')
        
        if not all([token, receiver_id, message_text]):
            emit('error', {'message': 'Token, receiver_id, and message required'})
            return
        
        decoded_token = decode_token(token)
        sender_id = decoded_token['sub']
        
        # Create message in database
        message = ChatMessage(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message_text,
            message_type=message_type
        )
        
        db.session.add(message)
        db.session.commit()
        
        # Create chat room name
        room_name = f"chat_{min(sender_id, receiver_id)}_{max(sender_id, receiver_id)}"
        
        # Send message to chat room
        emit('new_message', {
            'message': message.to_dict()
        }, room=room_name)
        
        # Send push notification to receiver if they're online
        if receiver_id in active_users:
            emit('notification', {
                'type': 'new_message',
                'title': 'New Message',
                'message': f'You have a new message from {message.sender.first_name}',
                'data': message.to_dict()
            }, room=receiver_id)
        
    except Exception as e:
        emit('error', {'message': 'Failed to send message'})

@socketio.on('typing')
def handle_typing(data):
    try:
        token = data.get('token')
        other_user_id = data.get('other_user_id')
        is_typing = data.get('is_typing', False)
        
        if not token or not other_user_id:
            return
        
        decoded_token = decode_token(token)
        user_id = decoded_token['sub']
        
        # Create chat room name
        room_name = f"chat_{min(user_id, other_user_id)}_{max(user_id, other_user_id)}"
        
        # Send typing indicator to the other user
        emit('typing_indicator', {
            'user_id': user_id,
            'is_typing': is_typing
        }, room=room_name, include_self=False)
        
    except Exception as e:
        pass

@socketio.on('get_online_users')
def handle_get_online_users(data):
    try:
        token = data.get('token')
        
        if not token:
            emit('error', {'message': 'Token required'})
            return
        
        decoded_token = decode_token(token)
        user_id = decoded_token['sub']
        user = User.query.get(user_id)
        
        # Get users from same department
        if user.role == 'student':
            # Get alumni from same department
            relevant_users = User.query.filter_by(
                role='alumni',
                department=user.department,
                is_active=True
            ).all()
        elif user.role == 'alumni':
            # Get students from same department
            relevant_users = User.query.filter_by(
                role='student',
                department=user.department,
                is_active=True
            ).all()
        else:
            relevant_users = []
        
        # Check which users are online
        online_users = []
        for relevant_user in relevant_users:
            if relevant_user.id in active_users:
                online_users.append({
                    'id': relevant_user.id,
                    'name': f"{relevant_user.first_name} {relevant_user.last_name}",
                    'role': relevant_user.role,
                    'department': relevant_user.department,
                    'profile_image': relevant_user.profile_image
                })
        
        emit('online_users', {'users': online_users})
        
    except Exception as e:
        emit('error', {'message': 'Failed to get online users'})

@socketio.on('mark_messages_read')
def handle_mark_messages_read(data):
    try:
        token = data.get('token')
        sender_id = data.get('sender_id')
        
        if not token or not sender_id:
            return
        
        decoded_token = decode_token(token)
        receiver_id = decoded_token['sub']
        
        # Mark all messages from sender as read
        ChatMessage.query.filter_by(
            sender_id=sender_id,
            receiver_id=receiver_id,
            is_read=False
        ).update({'is_read': True})
        db.session.commit()
        
        # Notify sender that messages were read
        if sender_id in active_users:
            emit('messages_read', {
                'reader_id': receiver_id
            }, room=sender_id)
        
    except Exception as e:
        pass

# Job notification events
@socketio.on('subscribe_to_job_notifications')
def handle_subscribe_job_notifications(data):
    try:
        token = data.get('token')
        
        if not token:
            return
        
        decoded_token = decode_token(token)
        user_id = decoded_token['sub']
        
        # Join job notifications room
        join_room(f"job_notifications_{user_id}")
        
    except Exception as e:
        pass

# Global notification function (can be called from routes)
def send_real_time_notification(user_id, notification_data):
    try:
        if user_id in active_users:
            socketio.emit('notification', notification_data, room=user_id)
    except Exception as e:
        pass