#!/usr/bin/env python3
"""Upload a file of any size to Google Drive via resumable upload (stdlib only).

  gdrive_upload.py <local_file> [--name NAME] [--parent FOLDER_ID | --folder FOLDER_NAME]

--folder reuses a folder of that name created by this app (drive.file scope can
only see those), or creates it in My Drive.

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


def ensure_folder(name, token):
    auth = {"Authorization": "Bearer " + token}
    q = ("mimeType='application/vnd.google-apps.folder' and trashed=false and name='%s'"
         % name.replace("\\", "\\\\").replace("'", "\\'"))
    url = "https://www.googleapis.com/drive/v3/files?" + urllib.parse.urlencode({"q": q, "fields": "files(id)"})
    found = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=auth)))["files"]
    if found:
        return found[0]["id"]
    req = urllib.request.Request(
        "https://www.googleapis.com/drive/v3/files?fields=id",
        json.dumps({"name": name, "mimeType": "application/vnd.google-apps.folder"}).encode(),
        method="POST", headers={**auth, "Content-Type": "application/json; charset=UTF-8"})
    return json.load(urllib.request.urlopen(req))["id"]


def upload(path, name=None, parent=None, token=None):
    size = os.path.getsize(path)
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    auth = {"Authorization": "Bearer " + (token or access_token())}
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
    ap.add_argument("--folder")
    a = ap.parse_args()
    token = access_token()
    parent = ensure_folder(a.folder, token) if a.folder else a.parent
    print(json.dumps(upload(a.file, a.name, parent, token), indent=2))
