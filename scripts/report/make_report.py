"""PUZZLTHINK 현황 보고서 — one HTML page with charts.

Run (from anywhere):
  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
  ~/.local/bin/uvx --python 3.12 --from analytics-mcp python -I scripts/report/make_report.py   (or: scripts/report/report.sh)
  Add --day YYYY-MM-DD (or --day yesterday) for a finished day instead of today so far.

Data: Supabase admin_report() (aggregates only, guarded by ~/.config/puzzlthink/report_token),
Google Analytics (property 525486998) and Search Console (sc-domain:puzzlthink.com) via the
gcloud application-default login. Writes reports/puzzlthink-report-YYYYMMDD-HHMM.html (git-ignored).
"""
import datetime as dt
import html
import json
import os
import sys
import urllib.request

HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "reports")
ENV_FILE = os.environ.get("PUZZLTHINK_ENV", "/Users/hoons/wallgo/.env.local")
TOKEN_FILE = os.path.expanduser("~/.config/puzzlthink/report_token")
GA_PROPERTY = "properties/525486998"
GSC_SITE = "sc-domain:puzzlthink.com"
KST = dt.timezone(dt.timedelta(hours=9))

GAME_KO = {"wallgo": "벽바둑", "heavy13": "무거운 13", "janggi": "십이장기", "russian_janggi": "러시아장기",
           "russian_roulette": "러시안 룰렛", "blind_gomoku": "블라인드 오목", "laser_janggi": "레이저 장기",
           "nemo_count": "네모 세기", "black_white": "흑과 백", "black_white_2": "흑과 백 II", "piggy_bank": "돼지 저금통",
           "sniper_holdem": "스나이퍼 홀덤", "hexagon": "헥사곤", "equation_signal": "수식 신호등", "equation_tower": "수식의 탑", "merge2048": "2048", "nine_mens_morris": "나인 멘스 모리스", "flip_omok": "뒤집기 오목", "four_three": "4인 3목", "point_omok": "포인트 오목", "hit_stay": "Hit,Stay", "gradation": "그라데이션", "card_janggi": "카드 장기", "color_link_duel": "컬러 링크", "sudoku": "스도쿠",
           "wallgo2": "벽바둑 II", "slitherlink": "슬리더링크", "gyulhap": "결합", "indian_poker": "인디언 포커"}
MODE_KO = {"ai": "AI", "friend": "친구", "solo": "혼자"}
SOURCE_KO = {"header": "상단 헤더", "header_menu": "모바일 메뉴", "result": "게임 결과 화면", "open_room": "오픈 대전 대기방",
             "game_open": "게임 페이지 오픈 대전", "home_open": "홈 오픈 대전 카드", "hard_clear": "어려움 클리어 팝업",
             "records": "기록실", "other": "기타"}
SUPPORT_KO = {"card": "후원 카드", "footer": "푸터 링크", "result": "결과 화면 문구", "hall": "명예의 전당 팝업",
              "open_rank": "오픈 랭킹 팝업", "hard_clear": "클리어 인증서 팝업"}


# ---------------------------------------------------------------- data

def env():
    out = {}
    for line in open(ENV_FILE):
        if "=" in line and not line.lstrip().startswith("#"):
            k, v = line.strip().split("=", 1)
            out[k] = v.strip().strip('"')
    return out


def pick_day():
    """The day to report: --day YYYY-MM-DD / --day yesterday, else today (KST)."""
    today = dt.datetime.now(KST).date()
    if "--day" in sys.argv:
        arg = sys.argv[sys.argv.index("--day") + 1]
        return today - dt.timedelta(days=1) if arg == "yesterday" else dt.date.fromisoformat(arg)
    return today


def site_data(day):
    e = env()
    url = e["NEXT_PUBLIC_SUPABASE_URL"] + "/rest/v1/rpc/admin_report"
    key = e.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") or e.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    body = json.dumps({"p_token": open(TOKEN_FILE).read().strip(), "p_day": str(day)}).encode()
    req = urllib.request.Request(url, data=body, headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", "User-Agent": "puzzlthink-report"})
    return json.load(urllib.request.urlopen(req, timeout=30))


def ga_data(day):
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, OrderBy, RunReportRequest, RunRealtimeReportRequest
    c = BetaAnalyticsDataClient()

    def run(dims, mets, start="today", end="today", limit=50, order_dim=None):
        ob = [OrderBy(dimension=OrderBy.DimensionOrderBy(dimension_name=order_dim))] if order_dim else [OrderBy(metric=OrderBy.MetricOrderBy(metric_name=mets[0]), desc=True)]
        r = c.run_report(RunReportRequest(property=GA_PROPERTY, date_ranges=[DateRange(start_date=start, end_date=end)],
                                          dimensions=[Dimension(name=d) for d in dims], metrics=[Metric(name=m) for m in mets], order_bys=ob, limit=limit))
        return [[v.value for v in row.dimension_values] + [v.value for v in row.metric_values] for row in r.rows]

    d0, d1, d13 = str(day), str(day - dt.timedelta(days=1)), str(day - dt.timedelta(days=13))
    live = day == dt.datetime.now(KST).date()
    rt = c.run_realtime_report(RunRealtimeReportRequest(property=GA_PROPERTY, metrics=[Metric(name="activeUsers")])) if live else None
    hours = {k: {int(h): int(s) for h, s in run(["hour"], ["sessions"], d, d, 24)} for k, d in (("today", d0), ("yesterday", d1))}
    return {
        "realtime": (int(rt.rows[0].metric_values[0].value) if rt.rows else 0) if rt else None,
        "today": run([], ["activeUsers", "sessions", "screenPageViews"], d0, d0),
        "yesterday": run([], ["activeUsers", "sessions", "screenPageViews"], d1, d1),
        "daily": run(["date"], ["activeUsers"], d13, d0, 20, order_dim="date"),
        "hours": hours,
        "sources": run(["sessionSource"], ["sessions"], d0, d0, 10),
        "countries": run(["country"], ["activeUsers"], d0, d0, 6),
        "devices": run(["deviceCategory"], ["activeUsers"], d0, d0),
    }


def gsc_data():
    import google.auth
    import google.auth.transport.requests as tr
    import urllib.parse
    creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    s = tr.AuthorizedSession(creds)
    u = f"https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(GSC_SITE, safe='')}/searchAnalytics/query"
    end = dt.date.today(); start = end - dt.timedelta(days=14)

    def q(dims, limit):
        r = s.post(u, json={"startDate": str(start), "endDate": str(end), "dimensions": dims, "rowLimit": limit, "dataState": "all"}).json()
        return r.get("rows", [])
    return {"daily": q(["date"], 20), "queries": q(["query"], 12)}


def safe(fn):
    try:
        return fn()
    except Exception as e:  # a section that fails shows a note instead of breaking the report
        return {"error": f"{type(e).__name__}: {str(e)[:160]}"}


# ---------------------------------------------------------------- charts (inline SVG, no libraries)

esc = lambda s: html.escape(str(s))
fmt = lambda n: f"{int(n):,}"


def hbar(items, unit=""):
    """Horizontal bars: [(label, value)], one series."""
    if not items:
        return '<p class="empty">아직 데이터가 없어요</p>'
    mx = max(v for _, v in items) or 1
    row_h, w, lw = 30, 640, 150
    h = row_h * len(items) + 8
    out = [f'<svg viewBox="0 0 {w} {h}" class="chart" role="img">']
    for i, (label, v) in enumerate(items):
        y = i * row_h + 4
        bw = max(3, (w - lw - 70) * v / mx)
        out.append(f'<g class="hit" data-tip="{esc(label)}: {fmt(v)}{unit}"><rect x="0" y="{y}" width="{w}" height="{row_h}" fill="transparent"/>'
                   f'<text x="{lw - 10}" y="{y + 19}" text-anchor="end" class="lab">{esc(label)}</text>'
                   f'<rect x="{lw}" y="{y + 6}" width="{bw:.1f}" height="{row_h - 12}" rx="4" class="s1"/>'
                   f'<text x="{lw + bw + 8:.1f}" y="{y + 19}" class="val">{fmt(v)}{unit}</text></g>')
    out.append("</svg>")
    return "".join(out)


def vbar(items, unit=""):
    """Vertical bars over days: [(label, value)]."""
    if not items:
        return '<p class="empty">아직 데이터가 없어요</p>'
    mx = max(v for _, v in items) or 1
    w, h, pad_b, pad_t = 640, 220, 26, 22
    bw = (w - 20) / len(items)
    out = [f'<svg viewBox="0 0 {w} {h}" class="chart" role="img"><line x1="0" x2="{w}" y1="{h - pad_b}" y2="{h - pad_b}" class="axis"/>']
    for i, (label, v) in enumerate(items):
        bh = (h - pad_b - pad_t) * v / mx
        x = 10 + i * bw
        last = i == len(items) - 1
        out.append(f'<g class="hit" data-tip="{esc(label)}: {fmt(v)}{unit}"><rect x="{x:.1f}" y="0" width="{bw:.1f}" height="{h}" fill="transparent"/>'
                   f'<rect x="{x + 2:.1f}" y="{h - pad_b - bh:.1f}" width="{max(2, bw - 4):.1f}" height="{bh:.1f}" rx="4" class="{"s1" if last else "s1 soft"}"/>'
                   f'<text x="{x + bw / 2:.1f}" y="{h - 8}" text-anchor="middle" class="tick">{esc(label)}</text>'
                   + (f'<text x="{x + bw / 2:.1f}" y="{h - pad_b - bh - 6:.1f}" text-anchor="middle" class="val">{fmt(v)}</text>' if (last or v == mx or len(items) <= 7) else "")
                   + "</g>")
    out.append("</svg>")
    return "".join(out)


def lines(series, labels, cut=None):
    """Two-series line chart (today vs yesterday by hour). series: [(name, values, cls)]."""
    w, h, pad_l, pad_b, pad_t = 640, 230, 34, 26, 16
    mx = max([max(v) for _, v, _ in series if v] + [1])
    n = len(labels)
    X = lambda i: pad_l + (w - pad_l - 10) * i / (n - 1)
    Y = lambda v: h - pad_b - (h - pad_b - pad_t) * v / mx
    out = [f'<svg viewBox="0 0 {w} {h}" class="chart" role="img">']
    for t in (0, mx / 2, mx):
        out.append(f'<line x1="{pad_l}" x2="{w - 10}" y1="{Y(t):.1f}" y2="{Y(t):.1f}" class="grid"/><text x="{pad_l - 6}" y="{Y(t) + 4:.1f}" text-anchor="end" class="tick">{fmt(t)}</text>')
    for i in range(0, n, 3):
        out.append(f'<text x="{X(i):.1f}" y="{h - 8}" text-anchor="middle" class="tick">{labels[i]}</text>')
    for name, vals, cls in series:
        upto = len(vals) if cut is None or cls != "s1" else cut
        pts = " ".join(f"{X(i):.1f},{Y(v):.1f}" for i, v in enumerate(vals[:upto]))
        out.append(f'<polyline points="{pts}" class="line {cls}"/>')
        if upto:
            lx = X(upto - 1)
            anchor = "end" if lx > w - 60 else "start"
            out.append(f'<text x="{lx + (-6 if anchor == "end" else 6):.1f}" y="{Y(vals[upto - 1]) - 8:.1f}" text-anchor="{anchor}" class="lab">{esc(name)}</text>')
    for i in range(n):  # hover columns
        tip = " · ".join(f"{name} {fmt(vals[i])}" for name, vals, cls in series if (cut is None or cls != 's1' or i < cut))
        out.append(f'<rect x="{X(i) - 10:.1f}" y="0" width="20" height="{h}" fill="transparent" class="hit col" data-tip="{labels[i]}시 · {esc(tip)}"/>')
    out.append("</svg>")
    return "".join(out)


def table(headers, rows):
    head = "".join(f"<th>{esc(x)}</th>" for x in headers)
    body = "".join("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>" for r in rows)
    return f'<details><summary>표로 보기</summary><table><tr>{head}</tr>{body}</table></details>'


# ---------------------------------------------------------------- page

def build(site, ga, gsc, day):
    now = site.get("generated_at", dt.datetime.now(KST).strftime("%Y-%m-%d %H:%M"))
    today = day
    live = day == dt.datetime.now(KST).date()
    T, Y = ("오늘", "어제") if live else (f"{day.month}/{day.day}", "전날")  # labels for the day and the one before
    visits = site.get("visits", [])
    v_today = next((x["n"] for x in visits if x["day"] == str(today)), 0)
    v_yest = next((x["n"] for x in visits if x["day"] == str(today - dt.timedelta(days=1))), 0)
    plays_today = sum(x["n"] for x in site.get("plays_today", []))
    signups_today = next((x["n"] for x in site.get("signups_daily", []) if x["day"] == str(today)), 0)
    ga_ok = "error" not in ga
    ga_today = int(ga["today"][0][0]) if ga_ok and ga["today"] else 0

    rt_note = (f"지금 접속 {ga['realtime']}명 (30분)" if live else f"{Y} {fmt(int(ga['yesterday'][0][0]) if ga['yesterday'] else 0)}") if ga_ok else "GA 연결 안 됨"
    tiles = [(f"{T} 방문자", fmt(v_today), f"{Y} {fmt(v_yest)}"), (f"{T} 플레이", fmt(plays_today), "판"),
             ("전체 회원", fmt(site.get("members", 0)), f"{T} +{signups_today}"),
             (f"GA {T} 사용자", fmt(ga_today) if ga_ok else "—", rt_note)]
    tiles_html = "".join(f'<div class="tile"><p class="k">{k}</p><p class="v">{v}</p><p class="s">{s}</p></div>' for k, v, s in tiles)

    sections = []

    def sec(title, desc, body):
        sections.append(f'<section><h2>{title}</h2><p class="desc">{desc}</p>{body}</section>')

    vis_items = [(x["day"][5:].replace("-", "/"), x["n"]) for x in visits if x["day"] <= str(day)][-14:]
    sec("방문자 추이", "PUZZLTHINK 자체 집계 (같은 날 같은 브라우저는 1명)." + (" 오늘은 진행 중이에요." if live else ""), vbar(vis_items, "명") + table(["날짜", "방문자"], vis_items))

    if ga_ok:
        hours_t, hours_y = ga["hours"]["today"], ga["hours"]["yesterday"]
        t_vals = [hours_t.get(h, 0) for h in range(24)]
        # GA processes today with a lag: stop today's line at the last hour that has data (not a fake drop to 0).
        now_h = max([h for h in range(24) if hours_t.get(h, 0) > 0] or [0]) if live else 23
        y_vals = [hours_y.get(h, 0) for h in range(24)]
        sec(f"시간대별 세션 (GA) — {T} vs {Y}", f"GA는 오늘 데이터를 몇 시간 늦게 처리해요. 오늘 선은 처리된 {now_h}시까지예요." if live else "하루 전체 (0–23시).",
            f'<p class="legend"><i class="sw s1"></i>{T} <i class="sw s2"></i>{Y}</p>'
            + lines([(T, t_vals, "s1"), (Y, y_vals, "s2")], [str(h) for h in range(24)], cut=now_h + 1)
            + table(["시", T, Y], [(h, t_vals[h], y_vals[h]) for h in range(24)]))
        src = [(r[0], int(r[1])) for r in ga["sources"]]
        sec(f"{T} 유입 경로 (GA)", "세션 기준. (direct)는 주소 입력·카톡 등 출처가 안 찍힌 방문이에요.", hbar(src, "세션") + table(["경로", "세션"], src))
    else:
        sec("GA", "구글 애널리틱스를 불러오지 못했어요.", f'<p class="empty">{esc(ga["error"])}</p>')

    games = {}
    for x in site.get("plays_today", []):
        games[x["game"]] = games.get(x["game"], 0) + x["n"]
    g_items = sorted(((GAME_KO.get(k, k), v) for k, v in games.items()), key=lambda t: -t[1])
    sec(f"{T} 게임별 플레이", "AI·친구·혼자 플레이를 합친 판 수예요.", hbar(g_items, "판")
        + table(["게임", "방식", "판"], [(GAME_KO.get(x["game"], x["game"]), MODE_KO.get(x["mode"], x["mode"]), x["n"]) for x in site.get("plays_today", [])]))

    su = [(x["day"][5:].replace("-", "/"), x["n"]) for x in site.get("signups_daily", []) if x["day"] <= str(day)][-14:]
    sec("가입자 추이", "날짜별 새 회원 수예요.", vbar(su, "명") + table(["날짜", "가입"], su))

    src_items = [(SOURCE_KO.get(x["source"], x["source"]), x["n"]) for x in site.get("signup_sources", [])]
    sec("가입 경로", "새 회원이 어느 로그인 버튼으로 가입했는지 (추적을 시작한 뒤 가입자만).", hbar(src_items, "명") + table(["경로", "가입"], src_items))

    if "error" not in gsc:
        qs = [(r["keys"][0], int(r["clicks"]), int(r["impressions"]), f'{r["position"]:.1f}위') for r in gsc.get("queries", [])]
        gd = [(r["keys"][0][5:].replace("-", "/"), int(r["clicks"])) for r in gsc.get("daily", [])]
        sec("구글 검색 (서치 콘솔, 최근 2주)", "서치 콘솔은 2일쯤 늦게 들어와요. 막대는 날짜별 클릭 수예요.",
            vbar(gd, "클릭") + '<table class="plain"><tr><th>검색어</th><th>클릭</th><th>노출</th><th>평균 순위</th></tr>'
            + "".join(f"<tr><td>{esc(a)}</td><td>{b}</td><td>{c}</td><td>{d}</td></tr>" for a, b, c, d in qs) + "</table>")

    o, d = site.get("open", {}), site.get("duels", {})
    app = {}
    for x in site.get("app", []):
        app[x["event"]] = app.get(x["event"], 0) + x["n"]
    feats = [
        ("오픈 대전", f'누적 {fmt(o.get("games", 0))}판 · 참여 {fmt(o.get("players", 0))}명 · {T} {fmt(o.get("today", 0))}판'),
        ("명예의 전당", " · ".join(f'{GAME_KO.get(x["game"], x["game"])} {x["n"]}명' for x in site.get("hall", [])[:6]) or "—"),
        ("어려움 클리어 인증서", " · ".join(f'{GAME_KO.get(x["game"], x["game"])} {x["n"]}' for x in site.get("certs", [])) or "—"),
        ("네모 세기 도전장", f'만든 도전장 {fmt(d.get("made", 0))}개 · 도전 {fmt(d.get("runs", 0))}회'),
        ("후원 클릭", " · ".join(f'{SUPPORT_KO.get(x["place"], x["place"])} {x["n"]}' for x in site.get("support", [])) or "아직 없음"),
        ("앱 설치", f'설치 안내 노출 {fmt(app.get("shown_top", 0) + app.get("shown_game", 0))} · 설치 클릭 {fmt(app.get("click", 0))} · 설치 완료 {fmt(app.get("installed", 0))} · {T} 앱으로 연 기기 {fmt(site.get("app_today_opens", 0))}'),
    ]
    sec("기능별 현황", "새로 만든 기능들이 얼마나 쓰이는지 (누적).",
        '<table class="plain">' + "".join(f"<tr><th>{esc(k)}</th><td>{esc(v)}</td></tr>" for k, v in feats) + "</table>")

    if ga_ok:
        extra = [("국가", ", ".join(f"{r[0]} {r[1]}" for r in ga["countries"])), ("기기", ", ".join(f"{r[0]} {r[1]}" for r in ga["devices"]))]
        sec(f"{T} 방문자 특징 (GA)", "사용자 수 기준.", '<table class="plain">' + "".join(f"<tr><th>{k}</th><td>{esc(v)}</td></tr>" for k, v in extra) + "</table>")

    when = esc(now) + " (한국 시간) 기준" if live else f"{day.year}년 {day.month}월 {day.day}일 하루 · {esc(now)} 생성"
    return PAGE.replace("{{NOW}}", when).replace("{{TILES}}", tiles_html).replace("{{SECTIONS}}", "".join(sections))


PAGE = """<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PUZZLTHINK 현황 보고서</title>
<style>
.viz-root{color-scheme:light;--surface-0:#f6f5f1;--surface-1:#fcfcfb;--border:#e4e2dc;--text-primary:#0b0b0b;--text-secondary:#52514e;--text-muted:#8a8984;
--series-1:#2a78d6;--series-2:#eb6834;--grid:#ecebe6}
@media (prefers-color-scheme:dark){.viz-root{color-scheme:dark;--surface-0:#121211;--surface-1:#1a1a19;--border:#2c2c2a;--text-primary:#f0efec;--text-secondary:#c3c2b7;--text-muted:#8f8e86;
--series-1:#3987e5;--series-2:#d95926;--grid:#2a2a28}}
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif}
.viz-root{background:var(--surface-0);color:var(--text-primary);min-height:100vh;padding:28px 16px 60px}
.wrap{max-width:760px;margin:0 auto}
h1{font-size:28px;margin:4px 0 2px;letter-spacing:-.02em}.sub{color:var(--text-secondary);font-size:13px;margin:0}
.kicker{font-size:11px;font-weight:800;letter-spacing:.2em;color:var(--series-2)}
.tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:20px 0}@media(min-width:640px){.tiles{grid-template-columns:repeat(4,1fr)}}
.tile{background:var(--surface-1);border:1px solid var(--border);border-radius:16px;padding:14px}
.tile .k{margin:0;font-size:12px;color:var(--text-secondary);font-weight:700}.tile .v{margin:4px 0 0;font-size:30px;font-weight:900;letter-spacing:-.02em}
.tile .s{margin:2px 0 0;font-size:12px;color:var(--text-muted)}
section{background:var(--surface-1);border:1px solid var(--border);border-radius:18px;padding:18px 18px 12px;margin-top:14px}
h2{font-size:17px;margin:0}.desc{margin:4px 0 12px;font-size:12px;color:var(--text-secondary)}
.chart{width:100%;height:auto;display:block}
.s1{fill:var(--series-1)}.soft{opacity:.55}.s2{fill:var(--series-2)}
.line{fill:none;stroke-width:2;stroke-linejoin:round}.line.s1{stroke:var(--series-1);fill:none}.line.s2{stroke:var(--series-2);fill:none;stroke-dasharray:5 4}
.axis{stroke:var(--border)}.grid{stroke:var(--grid)}
.lab{font-size:13px;fill:var(--text-primary);font-weight:600}.val{font-size:12px;fill:var(--text-secondary);font-weight:700}.tick{font-size:11px;fill:var(--text-muted)}
.hit:hover rect.s1{opacity:1}.hit:hover .lab{text-decoration:underline}
.legend{font-size:12px;color:var(--text-secondary);margin:0 0 6px}.sw{display:inline-block;width:12px;height:4px;border-radius:2px;margin:0 4px 2px 10px;vertical-align:middle}
.sw.s1{background:var(--series-1)}.sw.s2{background:var(--series-2)}
details{margin:8px 0 4px;font-size:12px;color:var(--text-secondary)}summary{cursor:pointer}
table{border-collapse:collapse;width:100%;font-size:13px;margin-top:6px}th,td{text-align:left;padding:7px 6px;border-top:1px solid var(--border);vertical-align:top}
th{color:var(--text-secondary);font-weight:700;white-space:nowrap}table.plain td{color:var(--text-primary)}
.empty{color:var(--text-muted);font-size:13px;padding:14px 0;margin:0}
#tip{position:fixed;pointer-events:none;background:var(--text-primary);color:var(--surface-1);font-size:12px;font-weight:700;padding:6px 9px;border-radius:8px;opacity:0;transition:opacity .1s;z-index:9}
.foot{margin-top:22px;font-size:11px;color:var(--text-muted);line-height:1.6}
</style></head><body><div class="viz-root"><div class="wrap">
<p class="kicker">PUZZLTHINK REPORT</p><h1>현황 보고서</h1><p class="sub">{{NOW}}</p>
<div class="tiles">{{TILES}}</div>{{SECTIONS}}
<p class="foot">방문자·플레이·회원·기능 현황: PUZZLTHINK 데이터베이스 · 유입·국가·기기·시간대: 구글 애널리틱스 · 검색어: 구글 서치 콘솔.<br>
GA와 사이트 자체 방문자 수는 세는 방식이 달라서 다를 수 있어요 (GA는 광고 차단기를 쓰는 사람을 못 세요).</p>
</div><div id="tip"></div></div>
<script>
const tip=document.getElementById('tip');
document.querySelectorAll('.hit').forEach(el=>{el.addEventListener('mousemove',e=>{tip.textContent=el.dataset.tip;tip.style.opacity=1;tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY-30)+'px'});
el.addEventListener('mouseleave',()=>tip.style.opacity=0);el.addEventListener('touchstart',()=>{tip.textContent=el.dataset.tip;tip.style.opacity=1;const r=el.getBoundingClientRect();tip.style.left=r.left+'px';tip.style.top=(r.top-30)+'px'},{passive:true})});
</script></body></html>"""


if __name__ == "__main__":
    day = pick_day()
    site = site_data(day)
    ga = safe(lambda: ga_data(day))
    gsc = safe(gsc_data)
    live = day == dt.datetime.now(KST).date()
    stamp = dt.datetime.now(KST).strftime("%Y%m%d-%H%M") if live else day.strftime("%Y%m%d") + "-day"
    os.makedirs(HERE, exist_ok=True)
    path = os.path.abspath(os.path.join(HERE, f"puzzlthink-report-{stamp}.html"))
    with open(path, "w") as f:
        f.write(build(site, ga, gsc, day))
    print(path)
