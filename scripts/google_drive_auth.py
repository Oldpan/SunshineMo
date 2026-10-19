#!/usr/bin/env python3
"""Google Drive OAuth helper (stdlib only).

Reads GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET from the environment and walks
through the OAuth flow to obtain a refresh token.

Usage:
  python3 scripts/google_drive_auth.py url                  # print the consent URL
  python3 scripts/google_drive_auth.py exchange <code|url>  # trade the code for tokens
  python3 scripts/google_drive_auth.py verify               # check GOOGLE_REFRESH_TOKEN works

Flow:
  1. Run `url`, open the link in your browser and approve access.
  2. The browser is redirected to REDIRECT_URI (the page will fail to load,
     that is expected). Copy the full address-bar URL, or just its `code=` value.
  3. Run `exchange '<that URL or code>'`; it prints the refresh token.
  4. Store it as the environment variable GOOGLE_REFRESH_TOKEN, then run `verify`.

Env overrides:
  GOOGLE_REDIRECT_URI  default http://localhost
  GOOGLE_DRIVE_SCOPES  space-separated scopes, default drive.file
                       (use https://www.googleapis.com/auth/drive for full access)
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
ABOUT_ENDPOINT = "https://www.googleapis.com/drive/v3/about?fields=user,storageQuota"

REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost")
SCOPES = os.environ.get(
    "GOOGLE_DRIVE_SCOPES", "https://www.googleapis.com/auth/drive.file"
)


def require_env(name):
    value = os.environ.get(name)
    if not value:
        sys.exit(f"error: environment variable {name} is not set")
    return value


def post_form(url, data):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode())
    try:
        with urllib.request.urlopen(req) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"error: {e.code} {e.read().decode(errors='replace')}")


def cmd_url():
    params = {
        "client_id": require_env("GOOGLE_CLIENT_ID"),
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        # offline + consent forces Google to return a refresh token every time
        "access_type": "offline",
        "prompt": "consent",
    }
    print(f"{AUTH_ENDPOINT}?{urllib.parse.urlencode(params)}")


def extract_code(value):
    if "code=" in value:
        query = urllib.parse.urlparse(value).query or value
        codes = urllib.parse.parse_qs(query).get("code")
        if codes:
            return codes[0]
    return value


def cmd_exchange(raw):
    tokens = post_form(
        TOKEN_ENDPOINT,
        {
            "client_id": require_env("GOOGLE_CLIENT_ID"),
            "client_secret": require_env("GOOGLE_CLIENT_SECRET"),
            "code": extract_code(raw),
            "grant_type": "authorization_code",
            "redirect_uri": REDIRECT_URI,
        },
    )
    refresh = tokens.get("refresh_token")
    if not refresh:
        sys.exit(
            "error: no refresh_token returned. Revoke the app at "
            "https://myaccount.google.com/permissions and run `url` again."
        )
    print(f"scope: {tokens.get('scope')}")
    print("Set this in your environment (keep it secret):")
    print(f"GOOGLE_REFRESH_TOKEN={refresh}")


def cmd_verify():
    tokens = post_form(
        TOKEN_ENDPOINT,
        {
            "client_id": require_env("GOOGLE_CLIENT_ID"),
            "client_secret": require_env("GOOGLE_CLIENT_SECRET"),
            "refresh_token": require_env("GOOGLE_REFRESH_TOKEN"),
            "grant_type": "refresh_token",
        },
    )
    req = urllib.request.Request(
        ABOUT_ENDPOINT, headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            about = json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"error: {e.code} {e.read().decode(errors='replace')}")
    user = about.get("user", {})
    print(f"OK: Drive access works as {user.get('emailAddress')} ({user.get('displayName')})")


def main(argv):
    if len(argv) >= 2 and argv[1] == "url":
        cmd_url()
    elif len(argv) == 3 and argv[1] == "exchange":
        cmd_exchange(argv[2])
    elif len(argv) == 2 and argv[1] == "verify":
        cmd_verify()
    else:
        print(__doc__)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
