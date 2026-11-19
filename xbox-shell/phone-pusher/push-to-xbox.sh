#!/usr/bin/env bash
# push-to-xbox.sh — install a UWP package on an Xbox in Developer Mode,
# straight from a phone (Termux) or any bash + curl machine on the same
# network as the console. No browser clicking, no PC.
#
# Usage:
#   ./push-to-xbox.sh <xbox-ip> <package-url-or-local-file> [cert-file]
#
# Examples:
#   ./push-to-xbox.sh 192.168.43.2 https://example.com/ConcreteDragonShell.appx
#   ./push-to-xbox.sh 192.168.43.2 ./RetroArch.appx ./RetroArch.cer
#
# The portal username/password are PROMPTED (password hidden) and are never
# written to disk or into this repo. They are the credentials you set in
# Dev Home -> Remote Access Settings on the Xbox itself.
#
# Xbox Device Portal quirks handled here (they differ from desktop WDP):
#   - HTTP BASIC auth (desktop uses Digest)          -> curl --basic
#   - self-signed portal cert                        -> curl -k
#   - ?package=<filename> query param is REQUIRED
#   - packages must be signed; install the .cer FIRST when one is provided
#   - install status is polled at /api/app/packagemanager/state
set -u

PORT=11443

die() { echo "ERROR: $*" >&2; exit 1; }

[ $# -ge 2 ] || { echo "usage: $0 <xbox-ip> <package-url-or-local-file> [cert-file]"; exit 2; }
command -v curl >/dev/null 2>&1 || die "curl not found (Termux: pkg install curl)"

XBOX_IP="$1"
SOURCE="$2"
CERT_ARG="${3:-}"
BASE="https://${XBOX_IP}:${PORT}"

read -r -p "Xbox Device Portal username: " PORTAL_USER
read -r -s -p "Xbox Device Portal password: " PORTAL_PASS; echo
[ -n "$PORTAL_USER" ] && [ -n "$PORTAL_PASS" ] || die "username and password are required"
AUTH=(-u "${PORTAL_USER}:${PORTAL_PASS}" --basic -k -sS)

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

# --- resolve the package to a local file -----------------------------------
if [ -f "$SOURCE" ]; then
  PKG_FILE="$SOURCE"
else
  PKG_FILE="$WORKDIR/$(basename "${SOURCE%%\?*}")"
  echo "Downloading $SOURCE ..."
  curl -fL -o "$PKG_FILE" "$SOURCE" || die "download failed"
fi
PKG_NAME="$(basename "$PKG_FILE")"
case "$PKG_NAME" in
  *.appx|*.appxbundle|*.msix|*.msixbundle) ;;
  *) die "package must be .appx/.appxbundle/.msix/.msixbundle (got: $PKG_NAME)" ;;
esac

# --- resolve the certificate (explicit arg, or <package>.cer next to it) ---
CERT_FILE=""
if [ -n "$CERT_ARG" ]; then
  CERT_FILE="$CERT_ARG"
elif [ -f "${PKG_FILE%.*}.cer" ]; then
  CERT_FILE="${PKG_FILE%.*}.cer"
fi

# --- sanity: portal reachable ----------------------------------------------
echo "Contacting Xbox Device Portal at $BASE ..."
curl "${AUTH[@]}" -o /dev/null -w "" "$BASE/" 2>/dev/null \
  || echo "  (portal root probe failed — continuing; the install calls below are the real test)"

# --- install certificate first (unsigned/untrusted packages are rejected) --
if [ -n "$CERT_FILE" ]; then
  [ -f "$CERT_FILE" ] || die "cert file not found: $CERT_FILE"
  CERT_NAME="$(basename "$CERT_FILE")"
  echo "Installing certificate $CERT_NAME ..."
  curl "${AUTH[@]}" -X POST -F "file=@${CERT_FILE};type=application/octet-stream" \
    "$BASE/api/app/packagemanager/certificate?package=${CERT_NAME}" \
    -w "\n  cert install HTTP %{http_code}\n" || die "cert install request failed"
fi

# --- install the package ----------------------------------------------------
echo "Installing $PKG_NAME ..."
curl "${AUTH[@]}" -X POST -F "file=@${PKG_FILE};type=application/octet-stream" \
  "$BASE/api/app/packagemanager/package?package=${PKG_NAME}" \
  -w "\n  package install HTTP %{http_code}\n" || die "package install request failed"

# --- poll install state -----------------------------------------------------
echo "Polling install state (Ctrl-C to stop watching; install continues) ..."
for i in $(seq 1 30); do
  STATE="$(curl "${AUTH[@]}" "$BASE/api/app/packagemanager/state" 2>/dev/null || true)"
  echo "  [$i] ${STATE:-<no response>}"
  case "$STATE" in
    *'"Success":true'*|*'"Success": true'*) echo "INSTALL SUCCEEDED — check Dev Home on the Xbox."; exit 0 ;;
    *'"Failure"':true*|*'"Failure": true'*) die "portal reports install failure (see state above)" ;;
  esac
  sleep 2
done
echo "Still installing after 60s (or state format differs). Check Dev Home on the Xbox — the package list there is ground truth."
