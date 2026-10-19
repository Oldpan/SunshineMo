#!/usr/bin/env python3
"""Upload a file of any size to Google Drive via resumable upload (stdlib only).

  gdrive_upload.py <local_file> [--name NAME] [--parent FOLDER_ID]

Credentials: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET plus a refresh token from
GOOGLE_REFRESH_TOKEN, or from $GDRIVE_TOKEN_FILE (written by gdrive_auth.py) if set
and present. The file is streamed, not loaded into memory. See docs/google-drive-api.md.
"""
import argparse, json, mimetypes, os, sys, urllib.error, urllib.parse, urllib.request


def refresh_token():
    path = os.environ.get("GDRIVE_TOKEN_FILE", ".gdrive_tokens.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)["refresh_token"]
    return os.environ["GOOGLE_REFRESH_TOKEN"]


def access_token():
    body = urllib.parse.urlencode({
        "client_id": os.environ["GOOGLE_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
        "refresh_token": refresh_token(),
        "grant_type": "refresh_token",
    }).encode()
    try:
        return json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", body))["access_token"]
    except urllib.error.HTTPError as e:
        sys.exit("token refresh failed (invalid_grant => regenerate the refresh token, see docs): " + e.read().decode())


def upload(path, name=None, parent=None):
    size = os.path.getsize(path)
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    auth = {"Authorization": "Bearer " + access_token()}
    meta = {"name": name or os.path.basename(path)}
    if parent:
        meta["parents"] = [parent]
    start = urllib.request.Request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,size,webViewLink",
        json.dumps(meta).encode(), method="POST",
        headers={**auth, "Content-Type": "application/json; charset=UTF-8",
                 "X-Upload-Content-Type": mime, "X-Upload-Content-Length": str(size)})
    session = urllib.request.urlopen(start).headers["Location"]
    with open(path, "rb") as f:
        put = urllib.request.Request(session, f, method="PUT",
                                     headers={"Content-Type": mime, "Content-Length": str(size)})
        return json.load(urllib.request.urlopen(put))


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("file")
    ap.add_argument("--name")
    ap.add_argument("--parent")
    a = ap.parse_args()
    print(json.dumps(upload(a.file, a.name, a.parent), indent=2))
