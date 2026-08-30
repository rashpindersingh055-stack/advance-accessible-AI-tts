"""User, ActivityLog, and Notification Database Models for Vision Max Intelligence."""
import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    gender = Column(String(50), nullable=False)
    age = Column(Integer, nullable=False)
    phone_number = Column(String(50), nullable=False)
    
    # Saved User API & Engine Preferences
    saved_api_key = Column(Text, nullable=True)
    custom_endpoint = Column(Text, nullable=True)
    use_custom_endpoint = Column(Boolean, default=False)
    selected_engine = Column(String(100), default="gemini-2.5-flash-preview-tts")

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)
    ip_address = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "gender": self.gender,
            "age": self.age,
            "phone_number": self.phone_number,
            "saved_api_key": self.saved_api_key,
            "custom_endpoint": self.custom_endpoint,
            "use_custom_endpoint": self.use_custom_endpoint,
            "selected_engine": self.selected_engine,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "is_verified": self.is_verified,
            "is_active": self.is_active
        }


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="announcement") # announcement, update, alert, info
    target_email = Column(String(200), nullable=True) # null = broadcast to all users
    sender = Column(String(100), default="admin star")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_read = Column(Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "target_email": self.target_email,
            "sender": self.sender,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_read": self.is_read
        }


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_email = Column(String(200), nullable=True, index=True)
    user_name = Column(String(150), nullable=True)
    action = Column(String(150), nullable=False) # e.g. "AI Story Generation", "TTS Synthesis", "User Registration"
    details = Column(Text, nullable=True)
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "user_name": self.user_name,
            "action": self.action,
            "details": self.details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
