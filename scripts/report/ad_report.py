"""Numbers for the Hidden Log banner campaign, as plain text ready to send to the advertiser.

Run: scripts/report/ad_report.sh [--to YYYY-MM-DD]   (default: today, KST)

- Ad counts come from public.ad_events_daily in the self-hosted DB (docker container supabase-db).
- Site visitors come from Google Analytics (same property as the status report).
- Counting starts at LAUNCHED_AT; the rows were reset at that moment, so day one is a partial day.
"""
import datetime as dt
import subprocess
import sys

CAMPAIGN = "hiddenlog_2611"
LAUNCHED_AT = "2026-11-23 00:49"
START = dt.date(2026, 11, 23)
END = dt.date(2026, 12, 2)
GA_PROPERTY = "properties/525486998"
KST = dt.timezone(dt.timedelta(hours=9))
PLACES = {"top": "상단 띠배너", "result": "결과창 카드"}


def ad_counts(last):
    sql = (f"select day, place, event, count from public.ad_events_daily where campaign = '{CAMPAIGN}' "
           f"and day between '{START}' and '{last}' order by day, place, event;")
    out = subprocess.run(["docker", "exec", "-i", "supabase-db", "psql", "-U", "postgres", "-d", "postgres", "-At", "-F", "\t", "-c", sql],
                         capture_output=True, text=True, check=True).stdout
    rows = {}
    for line in out.strip().splitlines():
        day, place, event, count = line.split("\t")
        rows.setdefault(day, {}).setdefault(place, {})[event] = int(count)
    return rows


def ga_visitors(last):
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest
    c = BetaAnalyticsDataClient()
    rng = [DateRange(start_date=str(START), end_date=str(last))]
    daily = c.run_report(RunReportRequest(property=GA_PROPERTY, date_ranges=rng, dimensions=[Dimension(name="date")],
                                          metrics=[Metric(name="totalUsers"), Metric(name="screenPageViews")]))
    total = c.run_report(RunReportRequest(property=GA_PROPERTY, date_ranges=rng, metrics=[Metric(name="totalUsers"), Metric(name="screenPageViews")]))
    per_day = {f"{r.dimension_values[0].value[:4]}-{r.dimension_values[0].value[4:6]}-{r.dimension_values[0].value[6:]}":
               (int(r.metric_values[0].value), int(r.metric_values[1].value)) for r in daily.rows}
    t = total.rows[0].metric_values if total.rows else None
    return per_day, ((int(t[0].value), int(t[1].value)) if t else (0, 0))


def main():
    today = dt.datetime.now(KST).date()
    last = dt.date.fromisoformat(sys.argv[sys.argv.index("--to") + 1]) if "--to" in sys.argv else today
    last = min(last, END)
    ads = ad_counts(last)
    try:
        visitors, visitors_total = ga_visitors(last)
    except Exception as e:  # GA is optional; the ad numbers still go out
        visitors, visitors_total = {}, None
        print(f"(GA 불러오기 실패: {e})", file=sys.stderr)

    n = lambda v: f"{v:,}"
    pct = lambda a, b: f"{a / b * 100:.2f}%" if b else "—"
    days = [START + dt.timedelta(days=i) for i in range((last - START).days + 1)]
    lines = [f"[PUZZLTHINK × 히든로그] 배너 광고 집계 · {START:%m/%d} ~ {last:%m/%d} ({len(days)}일차)", f"집계 시작: {LAUNCHED_AT} (KST)", ""]
    tot = {p: {"impression": 0, "click": 0, "dismiss": 0} for p in PLACES}
    lines.append("날짜 | 띠배너 노출 | 띠배너 클릭 | 띠배너 닫기 | 결과창 노출 | 결과창 클릭 | 방문자(GA)")
    for d in days:
        row = ads.get(str(d), {})
        for p in PLACES:
            for ev in tot[p]:
                tot[p][ev] += row.get(p, {}).get(ev, 0)
        top, res = row.get("top", {}), row.get("result", {})
        vis = visitors.get(str(d), (0, 0))[0]
        lines.append(f"{d:%m/%d} | {n(top.get('impression', 0))} | {n(top.get('click', 0))} | {n(top.get('dismiss', 0))} | "
                     f"{n(res.get('impression', 0))} | {n(res.get('click', 0))} | {n(vis)}")
    lines += ["", "■ 누적"]
    for p, label in PLACES.items():
        t = tot[p]
        extra = f" · X로 닫음 {n(t['dismiss'])}" if p == "top" else ""
        lines.append(f"- {label}: 노출 {n(t['impression'])} · 클릭 {n(t['click'])} (클릭률 {pct(t['click'], t['impression'])}){extra}")
    if visitors_total:
        lines.append(f"- 사이트 방문자(GA, 기간 중 순 사용자): {n(visitors_total[0])}명 · 페이지뷰 {n(visitors_total[1])}")
    lines += ["", "※ 띠배너 닫기(X) 버튼은 11/23 01:01에 없앴어요. 닫기 수는 00:49~01:01 사이 값이에요.",
              "※ 노출: 띠배너는 배너가 보인 페이지뷰마다, 결과창은 결과 화면이 뜰 때마다 1회. 광고는 한국어 페이지에만 나가요.",
              "※ 클릭은 저희 쪽에서 버튼을 누른 횟수라, 히든로그 쪽 집계와 조금 다를 수 있어요."]
    print("\n".join(lines))


main()
