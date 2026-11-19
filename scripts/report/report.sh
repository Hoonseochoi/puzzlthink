#!/bin/sh
# PUZZLTHINK 현황 보고서: prints the path of a fresh HTML report.
cd "$(dirname "$0")/../.." || exit 1
GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/application_default_credentials.json" \
GOOGLE_CLOUD_PROJECT=master-magnet-331311 \
"$HOME/.local/bin/uvx" --python 3.12 --from analytics-mcp python -I scripts/report/make_report.py "$@" 2>&1 | grep -v ev_poll | tail -1
