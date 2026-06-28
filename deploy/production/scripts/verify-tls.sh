#!/usr/bin/env bash
set -Eeuo pipefail

API_HOST="${API_HOST:-api.lenshub.shop}"
STORAGE_HOST="${STORAGE_HOST:-storage.lenshub.shop}"
EXPECTED_IP="${EXPECTED_IP:-}"
RENEWAL_DRY_RUN=false

if [[ "${1:-}" == "--renewal-dry-run" ]]; then
  RENEWAL_DRY_RUN=true
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--renewal-dry-run]" >&2
  exit 2
fi

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"
}

check_dns() {
  local host="$1"
  local addresses
  addresses="$(getent ahostsv4 "$host" | awk '{print $1}' | sort -u)"
  [[ -n "$addresses" ]] || fail "$host has no IPv4 DNS record"

  if [[ -n "$EXPECTED_IP" ]] && ! grep -Fxq "$EXPECTED_IP" <<<"$addresses"; then
    fail "$host does not resolve to EXPECTED_IP=$EXPECTED_IP"
  fi

  echo "PASS: $host resolves to $(tr '\n' ',' <<<"$addresses" | sed 's/,$//')"
}

check_certificate() {
  local host="$1"
  if ! openssl s_client -connect "${host}:443" -servername "$host" </dev/null 2>/dev/null \
    | openssl x509 -noout -checkend 1209600 >/dev/null; then
    fail "$host certificate is invalid or expires within 14 days"
  fi
  echo "PASS: $host certificate is valid for more than 14 days"
}

check_loopback_port() {
  local port="$1"
  local addresses
  addresses="$(ss -ltnH | awk -v suffix=":${port}" '$4 ~ suffix "$" {print $4}')"
  [[ -n "$addresses" ]] || fail "Nothing listens on port $port"

  while IFS= read -r address; do
    case "$address" in
      127.0.0.1:*|\[::1\]:*) ;;
      *) fail "Port $port is exposed beyond loopback at $address" ;;
    esac
  done <<<"$addresses"

  echo "PASS: port $port is loopback-only"
}

require_command curl
require_command getent
require_command openssl
require_command ss

check_dns "$API_HOST"
check_dns "$STORAGE_HOST"
check_certificate "$API_HOST"
check_certificate "$STORAGE_HOST"

curl --fail --silent --show-error \
  "https://${API_HOST}/api/actuator/health/readiness" >/dev/null \
  || fail "Backend readiness endpoint failed"
echo "PASS: backend readiness endpoint"

curl --fail --silent --show-error \
  "https://${STORAGE_HOST}/minio/health/live" >/dev/null \
  || fail "MinIO liveness endpoint failed"
echo "PASS: MinIO liveness endpoint"

anonymous_status="$(
  curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
    "https://${STORAGE_HOST}/"
)"
[[ "$anonymous_status" == "401" || "$anonymous_status" == "403" ]] \
  || fail "Anonymous MinIO root request returned HTTP $anonymous_status"
echo "PASS: anonymous MinIO access denied"

check_loopback_port 8080
check_loopback_port 9000
check_loopback_port 9001

if [[ "$RENEWAL_DRY_RUN" == true ]]; then
  require_command certbot
  certbot renew --dry-run
  echo "PASS: Certbot renewal dry run"
fi

echo "All Phase 04 edge checks passed."
