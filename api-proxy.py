#!/usr/bin/env python3
"""Host-side API proxy for rootless Docker containers.

Run: python3 api-proxy.py
Then ai-service will use this proxy instead of calling external APIs directly.

On Linux rootless Docker, containers cannot reach external APIs directly.
This proxy runs on the host and forwards requests, adding the real API keys.
"""
import http.server
import urllib.request
import json
import os
import sys
import traceback

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY", "")

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        # Health check endpoint
        if self.path == "/gemini" or self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "API proxy running",
                "endpoints": {
                    "gemini": "POST /gemini",
                    "weather": "GET /weather?q=<city>"
                }
            }).encode())
            return
        
        # Weather endpoint
        if self.path.startswith("/weather"):
            if not WEATHER_API_KEY:
                self.send_error(400, "WEATHER_API_KEY not set")
                return
            from urllib.parse import urlparse, parse_qs
            qs = parse_qs(urlparse(self.path).query)
            city = qs.get("q", [""])[0]
            if not city:
                self.send_error(400, "Missing ?q=city")
                return
            try:
                resp = urllib.request.urlopen(
                    f"{WEATHER_URL}?q={city}&appid={WEATHER_API_KEY}&units=metric",
                    timeout=10
                )
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(resp.read())
            except urllib.error.HTTPError as e:
                print(f"[proxy] Weather HTTP error: {e.code}")
                self.send_response(e.code)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                print(f"[proxy] Weather error: {e}")
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_error(404, "Not found")

    def do_POST(self):
        if self.path.startswith("/gemini") or self.path == "/gemini/":
            if not GEMINI_API_KEY:
                self.send_error(400, "GEMINI_API_KEY not set")
                return
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                # Ignore any incoming key parameter - always use the host's key
                req = urllib.request.Request(
                    f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                    data=body,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                resp = urllib.request.urlopen(req, timeout=15)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(resp.read())
                print(f"[proxy] Gemini success")
            except urllib.error.HTTPError as e:
                print(f"[proxy] Gemini HTTP error: {e.code} {e.reason}")
                self.send_response(e.code)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                print(f"[proxy] Gemini error: {e}")
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_error(404, "Not found")

    def log_message(self, format, *args):
        if len(args) >= 3:
            print(f"[proxy] {args[0]} {args[1]} {args[2]}")
        else:
            print(f"[proxy] {format % args}")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3090
    if not GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY not set. Gemini calls will fail.")
    if not WEATHER_API_KEY:
        print("WARNING: WEATHER_API_KEY not set. Weather calls will fail.")
    print(f"API proxy listening on http://0.0.0.0:{port}")
    print(f"  Gemini: POST /gemini")
    print(f"  Weather: GET /weather?q=<city>")
    server = http.server.HTTPServer(("0.0.0.0", port), ProxyHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[proxy] Shutting down...")
        server.shutdown()