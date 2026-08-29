"""FastAPI Router for User Registration, Authentication, Google Sign-In & API Storage."""
import datetime
import os
import sys
import json
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from typing import Optional

# Universal import resolution
try:
    from backend.database import get_db, engine, Base
    from backend.models.user import User
    from backend.models.schemas import UserRegisterRequest, UserResponse, ApiConfigSaveRequest, ApiConfigResponse, GoogleLoginRequest
    from backend.services.email_service import EmailService
except (ImportError, ModuleNotFoundError):
    from database import get_db, engine, Base
    from models.user import User
    from models.schemas import UserRegisterRequest, UserResponse, ApiConfigSaveRequest, ApiConfigResponse, GoogleLoginRequest
    from services.email_service import EmailService

# Auto create or migrate tables
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api/auth", tags=["User Authentication & API Storage"])

# Local Persistent Settings Storage File (for fast restore)
SETTINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "saved_api_config.json")

def load_file_settings() -> dict:
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_file_settings(data: dict):
    try:
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving settings file: {e}")


@router.post("/register", response_model=UserResponse)
async def register_user(
    request_data: UserRegisterRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Registers a manual user, persists data to SQLite database,
    and automatically emails the details to rashpindertechwith@gmail.com.
    """
    client_ip = req.client.host if req.client else "127.0.0.1"

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request_data.email.lower().strip()).first()
    if existing_user:
        existing_user.full_name = request_data.full_name.strip()
        existing_user.phone_number = request_data.phone_number.strip()
        existing_user.gender = request_data.gender
        existing_user.age = request_data.age
        existing_user.last_login = datetime.datetime.utcnow()
        existing_user.ip_address = client_ip
        db.commit()
        db.refresh(existing_user)

        notif_sent = await EmailService.send_new_user_notification(existing_user.to_dict(), client_ip)

        return UserResponse(
            status="success",
            message="Welcome back! Account verified and updated.",
            user=existing_user.to_dict(),
            notification_sent=notif_sent
        )

    # Create new database user record
    new_user = User(
        full_name=request_data.full_name.strip(),
        email=request_data.email.lower().strip(),
        gender=request_data.gender,
        age=request_data.age,
        phone_number=request_data.phone_number.strip(),
        ip_address=client_ip,
        created_at=datetime.datetime.utcnow(),
        last_login=datetime.datetime.utcnow(),
        is_verified=True
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database storage error: {str(e)}")

    # Send Notification Email to rashpindertechwith@gmail.com
    notif_sent = await EmailService.send_new_user_notification(new_user.to_dict(), client_ip)

    return UserResponse(
        status="success",
        message="Account successfully registered! Details sent to administrator.",
        user=new_user.to_dict(),
        notification_sent=notif_sent
    )


@router.post("/google-login", response_model=UserResponse)
async def google_login_user(
    payload: GoogleLoginRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Handles 1-Click Sign In with Google Account.
    Transmits ONLY Name and Email to rashpindertechwith@gmail.com (NO passwords).
    """
    client_ip = req.client.host if req.client else "127.0.0.1"
    clean_email = payload.email.lower().strip()
    clean_name = payload.full_name.strip()

    # Find or create user
    user = db.query(User).filter(User.email == clean_email).first()
    if user:
        user.full_name = clean_name
        user.last_login = datetime.datetime.utcnow()
        user.ip_address = client_ip
        db.commit()
        db.refresh(user)
    else:
        user = User(
            full_name=clean_name,
            email=clean_email,
            gender="Not specified",
            age=25,
            phone_number="Google OAuth",
            ip_address=client_ip,
            created_at=datetime.datetime.utcnow(),
            last_login=datetime.datetime.utcnow(),
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Dispatch Google Sign-In notification to rashpindertechwith@gmail.com (ONLY Name & Email)
    notif_sent = await EmailService.send_google_login_notification({
        "full_name": clean_name,
        "email": clean_email,
        "avatar_url": payload.avatar_url,
        "auth_method": "Google Sign-In"
    }, client_ip)

    return UserResponse(
        status="success",
        message="Successfully signed in with Google Account!",
        user=user.to_dict(),
        notification_sent=notif_sent
    )


@router.post("/save-api-config", response_model=ApiConfigResponse)
async def save_api_config(
    payload: ApiConfigSaveRequest,
    db: Session = Depends(get_db)
):
    """
    Saves user API Key and engine preferences to the backend database.
    """
    api_key_clean = payload.api_key.strip()
    custom_ep = payload.custom_endpoint.strip() if payload.custom_endpoint else ""
    use_custom = bool(payload.use_custom_endpoint)
    engine_id = payload.selected_engine or "gemini-2.5-flash-preview-tts"

    if payload.email and payload.email.strip():
        user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
        if user:
            user.saved_api_key = api_key_clean
            user.custom_endpoint = custom_ep
            user.use_custom_endpoint = use_custom
            user.selected_engine = engine_id
            db.commit()

    settings_data = load_file_settings()
    settings_data["last_saved_api_key"] = api_key_clean
    settings_data["last_saved_custom_endpoint"] = custom_ep
    settings_data["use_custom_endpoint"] = use_custom
    settings_data["selected_engine"] = engine_id
    settings_data["updated_at"] = datetime.datetime.utcnow().isoformat()

    if payload.email:
        settings_data[f"user_{payload.email.lower().strip()}"] = {
            "api_key": api_key_clean,
            "custom_endpoint": custom_ep,
            "use_custom_endpoint": use_custom,
            "selected_engine": engine_id
        }

    save_file_settings(settings_data)

    return ApiConfigResponse(
        status="success",
        message="API Key and engine preferences successfully saved to backend database!",
        api_key=api_key_clean,
        custom_endpoint=custom_ep,
        use_custom_endpoint=use_custom,
        selected_engine=engine_id
    )


@router.get("/get-api-config", response_model=ApiConfigResponse)
async def get_api_config(
    email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Loads the saved API Key and configuration from the backend database when the user visits.
    """
    if email and email.strip():
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        if user and user.saved_api_key:
            return ApiConfigResponse(
                status="success",
                message="Loaded saved API configuration from user database.",
                api_key=user.saved_api_key,
                custom_endpoint=user.custom_endpoint or "",
                use_custom_endpoint=bool(user.use_custom_endpoint),
                selected_engine=user.selected_engine or "gemini-2.5-flash-preview-tts"
            )

    settings_data = load_file_settings()
    if email and f"user_{email.lower().strip()}" in settings_data:
        u_cfg = settings_data[f"user_{email.lower().strip()}"]
        return ApiConfigResponse(
            status="success",
            message="Loaded saved user configuration.",
            api_key=u_cfg.get("api_key"),
            custom_endpoint=u_cfg.get("custom_endpoint", ""),
            use_custom_endpoint=u_cfg.get("use_custom_endpoint", False),
            selected_engine=u_cfg.get("selected_engine", "gemini-2.5-flash-preview-tts")
        )

    saved_key = settings_data.get("last_saved_api_key") or os.getenv("GEMINI_API_KEY", "")
    return ApiConfigResponse(
        status="success",
        message="Loaded backend default saved configuration.",
        api_key=saved_key,
        custom_endpoint=settings_data.get("last_saved_custom_endpoint", ""),
        use_custom_endpoint=settings_data.get("use_custom_endpoint", False),
        selected_engine=settings_data.get("selected_engine", "gemini-2.5-flash-preview-tts")
    )


@router.get("/users")
async def list_all_registered_users(db: Session = Depends(get_db)):
    """Admin endpoint to inspect all registered database users."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [u.to_dict() for u in users]
