#!/usr/bin/env python3
"""Google Drive OAuth helper (stdlib only). See docs/google-drive-api.md.

  gdrive_auth.py url                  print the consent URL to open in a browser
  gdrive_auth.py exchange <code|url>  swap the authorization code (or the whole
                                      http://localhost/?code=... URL) for tokens
  gdrive_auth.py check                try the refresh token (token file, else
                                      GOOGLE_REFRESH_TOKEN) and report ok / invalid_grant

Reads GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET from the environment. Tokens are
written to $GDRIVE_TOKEN_FILE (default .gdrive_tokens.json, mode 600, gitignored);
they are never printed.
"""
import json, os, sys, urllib.error, urllib.parse, urllib.request

REDIRECT_URI = os.environ.get("GDRIVE_REDIRECT_URI", "http://localhost")  # must match the OAuth client exactly
SCOPE = os.environ.get("GDRIVE_SCOPE", "https://www.googleapis.com/auth/drive.file")
TOKEN_FILE = os.environ.get("GDRIVE_TOKEN_FILE", ".gdrive_tokens.json")


def consent_url():
    return "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
        "client_id": os.environ["GOOGLE_CLIENT_ID"],
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",  # needed to get a refresh token
        "prompt": "consent",       # forces a refresh token even on re-consent
    })


def exchange(code_or_url):
    code = code_or_url
    if "code=" in code_or_url:
        code = urllib.parse.parse_qs(urllib.parse.urlparse(code_or_url).query)["code"][0]
    body = urllib.parse.urlencode({
        "code": code,
        "client_id": os.environ["GOOGLE_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }).encode()
    try:
        tokens = json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", body))
    except urllib.error.HTTPError as e:
        sys.exit("token exchange failed: " + e.read().decode())
    fd = os.open(TOKEN_FILE, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(tokens, f)
    print(f"saved to {TOKEN_FILE}; refresh_token={'yes' if 'refresh_token' in tokens else 'NO'}; scope={tokens.get('scope')}")
    if "refresh_token_expires_in" in tokens:
        days = tokens["refresh_token_expires_in"] / 86400
        print(f"WARNING: this refresh token expires in {days:.1f} days (time-limited grant). "
              "Publish the OAuth app to 'In production' and re-run url/exchange; see docs/google-drive-api.md")


def check():
    """Exit 0 if the refresh token still works, 1 otherwise. Prints no secrets."""
    source, rt = "GOOGLE_REFRESH_TOKEN", os.environ.get("GOOGLE_REFRESH_TOKEN")
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE) as f:
            source, rt = TOKEN_FILE, json.load(f).get("refresh_token")
    if not rt:
        sys.exit("no refresh token (run url/exchange, or set GOOGLE_REFRESH_TOKEN)")
    body = urllib.parse.urlencode({
        "client_id": os.environ["GOOGLE_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
        "refresh_token": rt,
        "grant_type": "refresh_token",
    }).encode()
    try:
        json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", body, timeout=15))
    except urllib.error.HTTPError as e:
        err = json.loads(e.read() or b"{}").get("error", e.code)
        sys.exit(f"{source}: {err} (invalid_grant => token expired/revoked, regenerate; see docs/google-drive-api.md)")
    print(f"{source}: ok")


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "url":
        print(consent_url())
    elif len(sys.argv) == 3 and sys.argv[1] == "exchange":
        exchange(sys.argv[2])
    elif len(sys.argv) == 2 and sys.argv[1] == "check":
        check()
    else:
        sys.exit(__doc__)
