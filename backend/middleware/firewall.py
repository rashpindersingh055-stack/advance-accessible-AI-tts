"""Enterprise Web Application Firewall (WAF), DDoS Rate Limiter, and OWASP Security Middleware."""
import time
import re
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

WAF_SIGNATURES = [
    re.compile(r"(\bUNION\b.{1,40}\bSELECT\b)", re.IGNORECASE),
    re.compile(r"(\bSELECT\b.{1,40}\bFROM\b.{1,40}\bWHERE\b)", re.IGNORECASE),
    re.compile(r"(\bDROP\s+TABLE\b|\bINSERT\s+INTO\b|\bDELETE\s+FROM\b)", re.IGNORECASE),
    re.compile(r"('.*--|\bor\b\s+1\s*=\s*1|'\s*or\s*'1'\s*=\s*'1')", re.IGNORECASE),
    re.compile(r"(<script.*?>|javascript:|onload\s*=|onerror\s*=|document\.cookie)", re.IGNORECASE),
    re.compile(r"(<iframe|<object|<embed|<svg/onload)", re.IGNORECASE),
    re.compile(r"(;|\||`|\$\().*?(\brm\s+-rf|\bpowershell\b|\bcmd\.exe\b)", re.IGNORECASE),
    re.compile(r"(\.\./\.\./|\.\.\\\.\.\\|/etc/passwd)", re.IGNORECASE)
]

BLOCKED_USER_AGENTS = [
    "sqlmap", "nikto", "dirbuster", "gobuster", "wpscan", "acunetix"
]

class SecurityFirewallMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests_per_minute: int = 120):
        super().__init__(app)
        self.max_requests_per_minute = max_requests_per_minute
        self.rate_limit_store = defaultdict(list)

    def is_rate_limited(self, client_ip: str) -> bool:
        now = time.time()
        window_start = now - 60.0
        timestamps = [t for t in self.rate_limit_store[client_ip] if t > window_start]
        self.rate_limit_store[client_ip] = timestamps

        if len(timestamps) >= self.max_requests_per_minute:
            return True

        self.rate_limit_store[client_ip].append(now)
        return False

    def scan_for_malicious_payload(self, text: str) -> bool:
        if not text:
            return False
        for pattern in WAF_SIGNATURES:
            if pattern.search(text):
                return True
        return False

    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            client_ip = "127.0.0.1"
            if request.client and hasattr(request.client, "host") and request.client.host:
                client_ip = request.client.host
            
            x_fwd = request.headers.get("x-forwarded-for")
            if x_fwd:
                client_ip = x_fwd.split(",")[0].strip()

            user_agent = request.headers.get("user-agent", "").lower()
            for bad_bot in BLOCKED_USER_AGENTS:
                if bad_bot in user_agent:
                    return JSONResponse(
                        status_code=403,
                        content={"error": "Access Denied by WAF Security Rule."}
                    )

            if self.is_rate_limited(client_ip):
                return JSONResponse(
                    status_code=429,
                    content={"error": "Rate limit exceeded. Too many requests.", "retry_after_seconds": 30},
                    headers={"Retry-After": "30"}
                )

            url_full = str(request.url)
            if self.scan_for_malicious_payload(url_full):
                return JSONResponse(
                    status_code=403,
                    content={"error": "Request rejected by WAF Security Rule."},
                    headers={"X-Firewall-Status": "Blocked-Threat"}
                )

            response = await call_next(request)

            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
            response.headers["X-Firewall-Protected-By"] = "Vision-Max-WAF-v2.0"

            return response
        except Exception:
            return await call_next(request)
