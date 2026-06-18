from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import json

API_KEY = "14075abf38be0d21416d75c3d32a083206b04b3caa5224e3a8794a8c26719255"
LYFTA_URL = "https://my.lyfta.app/api/v1/exercises"


class LyftaProxyHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/lyfta-exercises":
            self.proxy_lyfta(parsed.query)
            return
        super().do_GET()

    def proxy_lyfta(self, query):
        params = parse_qs(query)
        limit = params.get("limit", ["100"])[0]
        page = params.get("page", ["1"])[0]
        lyfta_query = urlencode({"limit": limit, "page": page})
        request = Request(
            f"{LYFTA_URL}?{lyfta_query}",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Accept": "application/json",
                "User-Agent": "IronForm-Lyfta-Proxy/1.0",
            },
        )

        try:
            with urlopen(request, timeout=20) as response:
                body = response.read()
                status = response.status
        except HTTPError as error:
            body = error.read() or json.dumps({"status": False, "error": str(error)}).encode("utf-8")
            status = error.code
        except URLError as error:
            body = json.dumps({"status": False, "error": str(error.reason)}).encode("utf-8")
            status = 502

        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8767), LyftaProxyHandler)
    print("IronForm Lyfta server: http://127.0.0.1:8767/index.html")
    server.serve_forever()
