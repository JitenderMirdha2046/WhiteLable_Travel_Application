#!/usr/bin/env python3
"""Host-side API proxy for rootless Docker containers.

Run: python3 api-proxy.py
Then ai-service will use this proxy instead of calling external APIs directly.
"""
import http.server
import urllib.request
import json
import os
import sys

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY", "")

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith("/gemini"):
            if not GEMINI_API_KEY:
                self.send_error(400, "GEMINI_API_KEY not set"); return
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                req = urllib.request.Request(f"{GEMINI_URL}?key={GEMINI_API_KEY}", data=body, headers={"Content-Type": "application/json"})
                resp = urllib.request.urlopen(req, timeout=15)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(resp.read())
            except Exception as e:
                print(f"[proxy] Gemini error: {e}")
                self.send_error(502, f"Gemini API error: {e}")
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path.startswith("/weather"):
            if not WEATHER_API_KEY:
                self.send_error(400, "WEATHER_API_KEY not set"); return
            from urllib.parse import urlparse, parse_qs
            qs = parse_qs(urlparse(self.path).query)
            city = qs.get("q", [""])[0]
            if not city:
                self.send_error(400, "Missing ?q=city"); return
            try:
                resp = urllib.request.urlopen(f"{WEATHER_URL}?q={city}&appid={WEATHER_API_KEY}&units=metric", timeout=10)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(resp.read())
            except Exception as e:
                print(f"[proxy] Weather error: {e}")
                self.send_error(502, f"Weather API error: {e}")
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        print(f"[proxy] {args[0]} {args[1]} {args[2]}")

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
    server.serve_forever()
