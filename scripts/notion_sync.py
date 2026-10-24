#!/usr/bin/env python3
"""Add one delivered video to the Notion video list (stdlib only).

  notion_sync.py --title T --intro-file 介绍和文案.md --video-url URL [--folder-url URL] [--cover png] [--replace]
  notion_sync.py --copy 介绍和文案.md --video-url URL ...      # title and introduction from the `# 标题` file

Each video becomes: a heading with its title, the 16:9 cover, the introduction, the Drive link, a divider.
If the target is a database, each video is a row instead (title property = title, cover = page cover,
same blocks inside). A video whose title is already there is skipped; --replace rewrites it.

Target: NOTION_VIDEO_PAGE (page or database id/URL), default the user's video list page.
Auth: NOTION_TOKEN if set; otherwise the cloud proxy injects it (network secret for api.notion.com).
The integration must be connected to the page (Notion page menu > Connections). See docs/notion.md.
"""
import argparse, json, mimetypes, os, re, sys, urllib.error, urllib.request, uuid

API = "https://api.notion.com/v1"
VERSION = "2022-06-28"
DEFAULT_PAGE = "4031081a28be8062adc1dcf511ec4f05"


def page_id(s):
    m = re.findall(r"[0-9a-f]{32}", s.replace("-", "").lower())
    if not m:
        sys.exit(f"notion: no page id in {s!r}")
    return m[-1]


def call(method, path, body=None, raw=None, ctype="application/json"):
    headers = {"Authorization": "Bearer " + os.environ.get("NOTION_TOKEN", "injected-by-proxy"),
               "Notion-Version": VERSION}
    data = raw
    if body is not None:
        data = json.dumps(body).encode()
    if data is not None:
        headers["Content-Type"] = ctype
    url = path if path.startswith("http") else API + path
    try:
        return json.load(urllib.request.urlopen(urllib.request.Request(url, data, method=method, headers=headers)))
    except urllib.error.HTTPError as e:
        msg = e.read().decode(errors="replace")
        if e.code == 401:
            msg += "\n(no valid Notion token: set NOTION_TOKEN or the api.notion.com network secret)"
        if e.code == 404:
            msg += "\n(page not found: connect the integration to the page in Notion > ··· > Connections)"
        sys.exit(f"notion: {method} {path} -> {e.code}: {msg}")


def upload(path):
    """Notion file upload (single part, < 20 MB); returns the file_upload id."""
    name = os.path.basename(path)
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    up = call("POST", "/file_uploads", {"filename": name, "content_type": mime})
    boundary = uuid.uuid4().hex
    with open(path, "rb") as f:
        payload = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{name}\"\r\n"
                   f"Content-Type: {mime}\r\n\r\n").encode() + f.read() + f"\r\n--{boundary}--\r\n".encode()
    call("POST", up.get("upload_url") or f"/file_uploads/{up['id']}/send", raw=payload,
         ctype=f"multipart/form-data; boundary={boundary}")
    return up["id"]


def text(s, url=None):
    t = {"type": "text", "text": {"content": s}}
    if url:
        t["text"]["link"] = {"url": url}
    return t


def blocks(title, intro, video_url, folder_url, cover_id, with_heading):
    out = []
    if with_heading:
        out.append({"type": "heading_2", "heading_2": {"rich_text": [text(title)]}})
    if cover_id:
        out.append({"type": "image", "image": {"type": "file_upload", "file_upload": {"id": cover_id}}})
    out.append({"type": "paragraph", "paragraph": {"rich_text": [text(intro)]}})
    links = [text("视频（Drive）", video_url)]
    if folder_url:
        links += [text(" · "), text("文件夹", folder_url)]
    out.append({"type": "paragraph", "paragraph": {"rich_text": links}})
    if with_heading:
        out.append({"type": "divider", "divider": {}})
    return out


def children(block):
    out, cursor = [], None
    while True:
        r = call("GET", f"/blocks/{block}/children?page_size=100" + (f"&start_cursor={cursor}" if cursor else ""))
        out += r["results"]
        if not r.get("has_more"):
            return out
        cursor = r["next_cursor"]


def plain(b):
    return "".join(t.get("plain_text", "") for t in b.get(b["type"], {}).get("rich_text", []))


def sync_page(pid, a, intro):
    kids = children(pid)
    start = next((i for i, b in enumerate(kids) if b["type"] == "heading_2" and plain(b) == a.title), None)
    if start is not None:
        if not a.replace:
            print(f"notion: {a.title!r} is already on the page (--replace to rewrite)")
            return
        end = next((i for i in range(start, len(kids)) if kids[i]["type"] == "divider"), len(kids) - 1)
        for b in kids[start:end + 1]:
            call("DELETE", f"/blocks/{b['id']}")
    cover = upload(a.cover) if a.cover else None
    call("PATCH", f"/blocks/{pid}/children",
         {"children": blocks(a.title, intro, a.video_url, a.folder_url, cover, True)})
    print(f"notion: added {a.title!r} to the page")


def sync_database(db, a, intro):
    props = db["properties"]
    title_prop = next(k for k, v in props.items() if v["type"] == "title")
    hits = call("POST", f"/databases/{db['id']}/query",
                {"filter": {"property": title_prop, "title": {"equals": a.title}}})["results"]
    if hits and not a.replace:
        print(f"notion: {a.title!r} is already in the database (--replace to rewrite)")
        return
    for h in hits:
        call("PATCH", f"/pages/{h['id']}", {"archived": True})
    cover = upload(a.cover) if a.cover else None
    values = {title_prop: {"title": [text(a.title)]}}
    for k, v in props.items():  # fill obvious columns when the database has them
        if v["type"] == "url" and re.search(r"drive|链接|link|url|视频", k, re.I):
            values[k] = {"url": a.video_url}
        elif v["type"] == "rich_text" and re.search(r"介绍|简介|intro|desc", k, re.I):
            values[k] = {"rich_text": [text(intro)]}
    page = {"parent": {"database_id": db["id"]}, "properties": values,
            "children": blocks(a.title, intro, a.video_url, a.folder_url, cover, False)}
    if cover:
        page["cover"] = {"type": "file_upload", "file_upload": {"id": cover}}
    call("POST", "/pages", page)
    print(f"notion: added {a.title!r} to the database")


def read_copy(path):
    lines = open(path, encoding="utf-8").read().strip().splitlines()
    if not lines or not lines[0].startswith("# "):
        sys.exit(f"notion: {path} must start with `# 标题`")
    return lines[0][2:].strip(), "\n".join(l for l in lines[1:] if l.strip())


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--copy", help="介绍和文案.md: `# 标题` + introduction")
    ap.add_argument("--title")
    ap.add_argument("--intro")
    ap.add_argument("--video-url", required=True)
    ap.add_argument("--folder-url")
    ap.add_argument("--cover", help="16:9 cover png")
    ap.add_argument("--replace", action="store_true")
    ap.add_argument("--target", default=os.environ.get("NOTION_VIDEO_PAGE", DEFAULT_PAGE))
    a = ap.parse_args(argv)
    if a.copy:
        title, intro = read_copy(a.copy)
        a.title = a.title or title
        a.intro = a.intro or intro
    if not a.title or not a.intro:
        ap.error("need --copy, or --title and --intro")
    target = page_id(a.target)
    obj = call("GET", f"/blocks/{target}")
    if obj["type"] == "child_database":
        sync_database(call("GET", f"/databases/{target}"), a, a.intro)
    else:
        sync_page(target, a, a.intro)


if __name__ == "__main__":
    main()
