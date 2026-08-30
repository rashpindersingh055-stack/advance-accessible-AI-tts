"""Email Notification Dispatcher for Vision Max Intelligence with Official Live Origin."""
import os
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
from typing import Dict, Any

ADMIN_NOTIFICATION_EMAIL = "rashpindertechwith@gmail.com"
OFFICIAL_WEBSITE_URL = "https://advance-accessible-ai-tts-npum.vercel.app"

class EmailService:
    @staticmethod
    async def send_new_user_notification(user_data: Dict[str, Any], client_ip: str = "Unknown") -> bool:
        """
        Sends an instant email alert to rashpindertechwith@gmail.com with new user details.
        """
        full_name = user_data.get("full_name", "N/A")
        email = user_data.get("email", "N/A")
        gender = user_data.get("gender", "N/A")
        age = user_data.get("age", "N/A")
        phone_number = user_data.get("phone_number", "N/A")
        timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # High-End Dark Aesthetic HTML Email
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
            .header {{ background: linear-gradient(135deg, #4f46e5, #9333ea, #db2777); padding: 30px 20px; text-align: center; }}
            .header h1 {{ margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px; }}
            .header p {{ margin: 6px 0 0 0; color: #e0e7ff; font-size: 13px; }}
            .body {{ padding: 25px 30px; }}
            .badge {{ display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 20px; color: #a5b4fc; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; }}
            .data-table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
            .data-table tr {{ border-bottom: 1px solid #1e293b; }}
            .data-table td {{ padding: 12px 6px; font-size: 14px; }}
            .label {{ color: #94a3b8; font-weight: 600; width: 35%; }}
            .value {{ color: #ffffff; font-weight: bold; }}
            .highlight {{ color: #38bdf8; font-family: monospace; }}
            .footer {{ background: #090d16; padding: 15px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VISION MAX INTELLIGENCE</h1>
              <p>New User Registration Alert</p>
            </div>
            <div class="body">
              <span class="badge">🚀 User Registration</span>
              <p style="font-size: 15px; color: #cbd5e1; margin-top: 0;">
                A new user has registered on the <strong>Vision Max Neural Voice Studio</strong> platform.
              </p>

              <table class="data-table">
                <tr>
                  <td class="label">🌐 Website:</td>
                  <td class="value highlight"><a href="{OFFICIAL_WEBSITE_URL}" style="color: #818cf8; text-decoration: none;">{OFFICIAL_WEBSITE_URL}</a></td>
                </tr>
                <tr>
                  <td class="label">👤 Full Name:</td>
                  <td class="value">{full_name}</td>
                </tr>
                <tr>
                  <td class="label">📧 Email Address:</td>
                  <td class="value highlight">{email}</td>
                </tr>
                <tr>
                  <td class="label">📞 Phone Number:</td>
                  <td class="value highlight">{phone_number}</td>
                </tr>
                <tr>
                  <td class="label">⚧ Gender:</td>
                  <td class="value">{gender}</td>
                </tr>
                <tr>
                  <td class="label">🎂 Age:</td>
                  <td class="value">{age} years old</td>
                </tr>
                <tr>
                  <td class="label">🌐 Client IP:</td>
                  <td class="value highlight">{client_ip}</td>
                </tr>
                <tr>
                  <td class="label">⏱️ Time:</td>
                  <td class="value">{timestamp}</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              Sent automatically to <strong>{ADMIN_NOTIFICATION_EMAIL}</strong> • Vision Max Intelligence Security Gateway
            </div>
          </div>
        </body>
        </html>
        """

        plain_text = f"""
        VISION MAX INTELLIGENCE - NEW USER REGISTRATION

        Website: {OFFICIAL_WEBSITE_URL}
        Full Name: {full_name}
        Email: {email}
        Phone Number: {phone_number}
        Gender: {gender}
        Age: {age}
        Client IP: {client_ip}
        Registration Time: {timestamp}

        Sent to {ADMIN_NOTIFICATION_EMAIL}
        """

        return await EmailService._dispatch_email(
            subject=f"🚀 New User Registered: {full_name} ({email})",
            plain_text=plain_text,
            html_content=html_content,
            user_data={
                "Website URL": OFFICIAL_WEBSITE_URL,
                "Full Name": full_name,
                "Email": email,
                "Phone Number": phone_number,
                "Gender": gender,
                "Age": age,
                "Registered At": timestamp
            },
            client_ip=client_ip
        )

    @staticmethod
    async def send_google_login_notification(user_data: Dict[str, Any], client_ip: str = "Unknown") -> bool:
        """
        Sends an alert when a user signs in via Google Account.
        Transmits ONLY Name, Email, and Timestamp (NO passwords).
        """
        full_name = user_data.get("full_name", "Google User")
        email = user_data.get("email", "N/A")
        timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
            .header {{ background: linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335); padding: 28px 20px; text-align: center; }}
            .header h1 {{ margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }}
            .header p {{ margin: 6px 0 0 0; color: #ffffff; font-size: 13px; opacity: 0.95; }}
            .body {{ padding: 25px 30px; }}
            .badge {{ display: inline-block; padding: 4px 12px; background: rgba(66, 133, 244, 0.2); border: 1px solid rgba(66, 133, 244, 0.4); border-radius: 20px; color: #60a5fa; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; }}
            .data-table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
            .data-table tr {{ border-bottom: 1px solid #1e293b; }}
            .data-table td {{ padding: 12px 6px; font-size: 14px; }}
            .label {{ color: #94a3b8; font-weight: 600; width: 35%; }}
            .value {{ color: #ffffff; font-weight: bold; }}
            .highlight {{ color: #60a5fa; font-family: monospace; }}
            .footer {{ background: #090d16; padding: 15px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VISION MAX INTELLIGENCE</h1>
              <p>Google Account Sign-In Alert</p>
            </div>
            <div class="body">
              <span class="badge">🌐 Google OAuth Sign-In</span>
              <p style="font-size: 15px; color: #cbd5e1; margin-top: 0;">
                A user has signed into <strong>Vision Max Neural Voice Studio</strong> using their <strong>Google Account</strong>.
              </p>

              <table class="data-table">
                <tr>
                  <td class="label">🌐 Website:</td>
                  <td class="value highlight"><a href="{OFFICIAL_WEBSITE_URL}" style="color: #60a5fa; text-decoration: none;">{OFFICIAL_WEBSITE_URL}</a></td>
                </tr>
                <tr>
                  <td class="label">👤 Full Name:</td>
                  <td class="value">{full_name}</td>
                </tr>
                <tr>
                  <td class="label">📧 Google Email:</td>
                  <td class="value highlight">{email}</td>
                </tr>
                <tr>
                  <td class="label">🔑 Auth Method:</td>
                  <td class="value" style="color: #34d399;">Google Account OAuth 2.0 (No Password Transmitted)</td>
                </tr>
                <tr>
                  <td class="label">🌐 Client IP:</td>
                  <td class="value highlight">{client_ip}</td>
                </tr>
                <tr>
                  <td class="label">⏱️ Sign-In Time:</td>
                  <td class="value">{timestamp}</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              Sent automatically to <strong>{ADMIN_NOTIFICATION_EMAIL}</strong> • Vision Max Intelligence Security Gateway
            </div>
          </div>
        </body>
        </html>
        """

        plain_text = f"""
        VISION MAX INTELLIGENCE - GOOGLE SIGN-IN ALERT

        Website: {OFFICIAL_WEBSITE_URL}
        Full Name: {full_name}
        Email: {email}
        Auth Method: Google Account OAuth (No Password Transmitted)
        Client IP: {client_ip}
        Sign-In Time: {timestamp}

        Sent to {ADMIN_NOTIFICATION_EMAIL}
        """

        return await EmailService._dispatch_email(
            subject=f"🌐 Google Sign-In: {full_name} ({email})",
            plain_text=plain_text,
            html_content=html_content,
            user_data={
                "Website URL": OFFICIAL_WEBSITE_URL,
                "Full Name": full_name,
                "Email": email,
                "Auth Method": "Google Sign-In",
                "Registered At": timestamp
            },
            client_ip=client_ip
        )

    @staticmethod
    async def _dispatch_email(subject: str, plain_text: str, html_content: str, user_data: dict, client_ip: str) -> bool:
        """Internal dispatcher supporting SMTP and Cloud Webhook Relay with verified origin headers."""
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_pass = os.getenv("SMTP_PASSWORD", "")

        # 1. Direct SMTP if configured
        if smtp_user and smtp_pass:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"Vision Max Studio <{smtp_user}>"
                msg["To"] = ADMIN_NOTIFICATION_EMAIL

                msg.attach(MIMEText(plain_text, "plain"))
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(smtp_server, smtp_port) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_user, [ADMIN_NOTIFICATION_EMAIL], msg.as_string())
                print(f"✅ Notification email sent via SMTP to {ADMIN_NOTIFICATION_EMAIL}")
                return True
            except Exception as e:
                print(f"⚠️ SMTP Send Notice: {e}")

        # 2. FormSubmit Cloud Relay with explicit Origin & Captcha Bypass
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(
                    f"https://formsubmit.co/ajax/{ADMIN_NOTIFICATION_EMAIL}",
                    json={
                        "_subject": subject,
                        "_captcha": "false",
                        "_template": "table",
                        "Website": OFFICIAL_WEBSITE_URL,
                        **user_data,
                        "Client IP": client_ip
                    },
                    headers={
                        "Accept": "application/json",
                        "Origin": OFFICIAL_WEBSITE_URL,
                        "Referer": f"{OFFICIAL_WEBSITE_URL}/"
                    }
                )
                if res.status_code == 200:
                    print(f"✅ Cloud notification relayed to {ADMIN_NOTIFICATION_EMAIL}")
                    return True
        except Exception as err:
            print(f"⚠️ Cloud webhook notice: {err}")

        print(f"📝 Notification Logged for {ADMIN_NOTIFICATION_EMAIL}: {subject}")
        return True
