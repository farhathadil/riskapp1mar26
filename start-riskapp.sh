#!/usr/bin/env bash
set -euo pipefail

cd /home/faa/riskapp

mkdir -p /tmp

if pgrep -f 'node /home/faa/riskapp/server.mjs' >/dev/null 2>&1; then
  exit 0
fi

setsid -f env HOST=0.0.0.0 PORT=8080 node /home/faa/riskapp/server.mjs >/tmp/riskapp-server.log 2>&1
