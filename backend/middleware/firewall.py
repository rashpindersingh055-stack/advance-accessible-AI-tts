"""Enterprise Web Application Firewall (WAF), DDoS Rate Limiter, and OWASP Security Middleware."""
import time
import re
import ipaddress
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

# WAF Malicious Pattern Signatures
WAF_SIGNATURES = [
    # SQL Injection Patterns
    re.compile(r"(\bUNION\b.{1,40}\bSELECT\b)", re.IGNORECASE),
    re.compile(r"(\bSELECT\b.{1,40}\bFROM\b.{1,40}\bWHERE\b)", re.IGNORECASE),
    re.compile(r"(\bDROP\s+TABLE\b|\bINSERT\s+INTO\b|\bDELETE\s+FROM\b)", re.IGNORECASE),
    re.compile(r"('.*--|\bor\b\s+1\s*=\s*1|'\s*or\s*'1'\s*=\s*'1')", re.IGNORECASE),
    re.compile(r"(\bWAITFOR\s+DELAY\b|\bBENCHMARK\s*\(|\bSLEEP\s*\()", re.IGNORECASE),

    # Cross-Site Scripting (XSS)
    re.compile(r"(<script.*?>|javascript:|onload\s*=|onerror\s*=|document\.cookie)", re.IGNORECASE),
    re.compile(r"(<iframe|<object|<embed|<svg/onload|<img.*?onerror)", re.IGNORECASE),

    # Remote Code Execution (RCE) / Command Injection
    re.compile(r"(;|\||`|\$\().*?(\brm\s+-rf|\bcat\s+/etc/passwd|\bpowershell\b|\bcmd\.exe\b|\bwget\b|\bcurl\s+http)", re.IGNORECASE),
    re.compile(r"(\beval\s*\(|\bexec\s*\(|\bpassthru\s*\(|\bsystem\s*\()", re.IGNORECASE),

    # Path Traversal
    re.compile(r"(\.\./\.\./|\.\.\\\.\.\\|/etc/shadow|/etc/passwd|c:\\windows\\system32)", re.IGNORECASE)
]

# Blocked Bad Bots / Vulnerability Scanners User-Agents
BLOCKED_USER_AGENTS = [
    "sqlmap", "nikto", "dirbuster", "gobuster", "nmap", "masscan",
    "wpscan", "acunetix", "nessus", "havij", "zgrab"
]

class SecurityFirewallMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests_per_minute: int = 120):
        super().__init__(app)
        self.max_requests_per_minute = max_requests_per_minute
        # IP Rate Limiting Store: { ip: [timestamp1, timestamp2, ...] }
        self.rate_limit_store = defaultdict(list)

    def is_rate_limited(self, client_ip: str) -> bool:
        now = time.time()
        window_start = now - 60.0 # 60-second window

        # Clean old timestamps
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
        client_ip = request.client.host if request.client else "127.0.0.1"
        user_agent = request.headers.get("user-agent", "").lower()

        # 1. Block Malicious Vulnerability Scanners / Scrapers
        for bad_bot in BLOCKED_USER_AGENTS:
            if bad_bot in user_agent:
                return JSONResponse(
                    status_code=403,
                    content={"error": "Access Denied by Vision Max Web Application Firewall (Blocked Scanner)."}
                )

        # 2. DDoS & Rate Limiting Check
        if self.is_rate_limited(client_ip):
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded. Too many requests from your IP.",
                    "retry_after_seconds": 30
                },
                headers={"Retry-After": "30"}
            )

        # 3. WAF Request Inspection (Query Params & URL Path)
        url_full = str(request.url)
        if self.scan_for_malicious_payload(url_full):
            return JSONResponse(
                status_code=403,
                content={"error": "Request rejected by WAF Security Rule (Malicious Query Pattern Detected)."},
                headers={"X-Firewall-Status": "Blocked-Threat"}
            )

        # 4. Process Request
        response = await call_next(request)

        # 5. Inject Strict OWASP Production Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["X-Firewall-Protected-By"] = "Vision-Max-WAF-v2.0"

        return response
