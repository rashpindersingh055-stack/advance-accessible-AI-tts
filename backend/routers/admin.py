"""FastAPI Router for Website Creator Admin Command Center, User Management, Logs & Notification Dispatcher."""
import datetime
import os
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

try:
    from backend.database import get_db, engine, Base
    from backend.models.user import User, Notification, ActivityLog
except (ImportError, ModuleNotFoundError):
    from database import get_db, engine, Base
    from models.user import User, Notification, ActivityLog

# Ensure database tables exist
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database schema init notice: {e}")

router = APIRouter(prefix="/api/admin", tags=["Website Creator Admin"])

ADMIN_EMAILS = ["dev019@gmail.com", "rashpindertechwith@gmail.com"]
ADMIN_NAMES = ["admin star", "Admin Star", "admin"]

def verify_admin(admin_email: Optional[str] = None, admin_name: Optional[str] = None):
    """Verifies that the caller is the website creator / admin star."""
    email_clean = (admin_email or "").strip().lower()
    name_clean = (admin_name or "").strip().lower()
    
    if email_clean in ADMIN_EMAILS or name_clean in ADMIN_NAMES:
        return True
    return False

# Pydantic Schemas for Admin
class NotificationCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=2, max_length=5000)
    type: str = Field(default="announcement", description="announcement, update, alert, info")
    target_email: Optional[str] = Field(default=None, description="Specific user email or null for all users")
    sender: str = Field(default="admin star")
    admin_email: str = Field(..., description="dev019@gmail.com")

class ActivityLogCreateRequest(BaseModel):
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    details: Optional[str] = None

# --- Admin Endpoints ---

@router.get("/users")
async def get_all_users(
    admin_email: str = Query(..., description="Admin email authentication"),
    admin_name: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns all registered users with their details and last activity (Creator Only)."""
    if not verify_admin(admin_email, admin_name):
        raise HTTPException(status_code=403, detail="Unauthorized: Website Creator access only.")

    users = db.query(User).order_by(User.created_at.desc()).all()
    user_list = [u.to_dict() for u in users]

    # Calculate statistics
    total_users = len(user_list)
    active_users = sum(1 for u in user_list if u.get("is_active", True))

    return {
        "status": "success",
        "total_users": total_users,
        "active_users": active_users,
        "users": user_list
    }


@router.delete("/users/{email}")
async def delete_user(
    email: str,
    admin_email: str = Query(..., description="Admin email authentication"),
    db: Session = Depends(get_db)
):
    """Deletes / removes a user from the platform (Creator Only)."""
    if not verify_admin(admin_email):
        raise HTTPException(status_code=403, detail="Unauthorized: Website Creator access only.")

    target_email = email.strip().lower()
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with email '{email}' not found.")

    db.delete(user)
    db.commit()

    # Log admin removal
    admin_log = ActivityLog(
        user_email=admin_email,
        user_name="admin star",
        action="Removed User",
        details=f"Admin deleted user account: {target_email}",
        created_at=datetime.datetime.utcnow()
    )
    db.add(admin_log)
    db.commit()

    return {
        "status": "success",
        "message": f"User {target_email} successfully removed from the platform."
    }


@router.get("/logs")
async def get_activity_logs(
    admin_email: str = Query(..., description="Admin email authentication"),
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db)
):
    """Fetches real-time user activity logs (Creator Only)."""
    if not verify_admin(admin_email):
        raise HTTPException(status_code=403, detail="Unauthorized: Website Creator access only.")

    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return {
        "status": "success",
        "total_logs": len(logs),
        "logs": [log.to_dict() for log in logs]
    }


@router.post("/logs")
async def record_activity_log(
    request_data: ActivityLogCreateRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Internal endpoint to record user activity."""
    client_ip = req.client.host if req.client else "127.0.0.1"
    new_log = ActivityLog(
        user_email=request_data.user_email,
        user_name=request_data.user_name,
        action=request_data.action,
        details=request_data.details,
        ip_address=client_ip,
        created_at=datetime.datetime.utcnow()
    )
    try:
        db.add(new_log)
        db.commit()
        return {"status": "success", "log_id": new_log.id}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}


@router.post("/notifications")
async def send_notification(
    request_data: NotificationCreateRequest,
    db: Session = Depends(get_db)
):
    """Sends a system notification / announcement to all users or a specific user (Creator Only)."""
    if not verify_admin(request_data.admin_email):
        raise HTTPException(status_code=403, detail="Unauthorized: Website Creator access only.")

    target = request_data.target_email.strip().lower() if request_data.target_email else None
    
    new_notif = Notification(
        title=request_data.title.strip(),
        message=request_data.message.strip(),
        type=request_data.type,
        target_email=target,
        sender=request_data.sender or "admin star",
        created_at=datetime.datetime.utcnow(),
        is_read=False
    )

    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)

    # Also log this notification dispatch
    log = ActivityLog(
        user_email=request_data.admin_email,
        user_name=request_data.sender or "admin star",
        action="Dispatched Notification",
        details=f"Title: {new_notif.title} | Target: {target or 'Broadcast to ALL users'}",
        created_at=datetime.datetime.utcnow()
    )
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "message": f"Notification '{new_notif.title}' successfully sent!",
        "notification": new_notif.to_dict()
    }


@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    admin_email: str = Query(..., description="Admin email authentication"),
    db: Session = Depends(get_db)
):
    """Deletes a notification (Creator Only)."""
    if not verify_admin(admin_email):
        raise HTTPException(status_code=403, detail="Unauthorized: Website Creator access only.")

    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")

    db.delete(notif)
    db.commit()
    return {"status": "success", "message": "Notification deleted successfully."}


# --- Public / User Notifications Endpoint ---

@router.get("/user-notifications")
async def get_user_notifications(
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetches broadcast notifications and personal notifications for the current user."""
    query = db.query(Notification)
    
    if user_email and user_email.strip():
        email_clean = user_email.strip().lower()
        # Get broadcast notifications (target_email is None) OR targeted to this user
        notifications = query.filter(
            (Notification.target_email == None) | (Notification.target_email == "") | (Notification.target_email == email_clean)
        ).order_by(Notification.created_at.desc()).limit(30).all()
    else:
        # Only broadcast notifications
        notifications = query.filter(
            (Notification.target_email == None) | (Notification.target_email == "")
        ).order_by(Notification.created_at.desc()).limit(30).all()

    return {
        "status": "success",
        "notifications": [n.to_dict() for n in notifications]
    }
