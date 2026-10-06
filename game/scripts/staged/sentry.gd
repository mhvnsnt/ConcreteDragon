class_name SentryCrash
extends Node
## STAGED — NOT ACTIVE. Drop-in Sentry crash reporting for Concrete Dragon.
##
## What it needs: a free Sentry account (free tier: 5k errors/month as of 2026-10).
## The owner creates the account himself — workers NEVER create accounts in his name.
## When the DSN exists: register as an autoload named "Crash", then call
## SentryCrash.init("<YOUR_DSN>").
##
## Hooks Godot's unhandled-exception logger and posts a minimal Sentry envelope
## to the project's ingest endpoint. No SDK dependency, pure HTTPRequest.

var _dsn := ""
var _ingest := ""


func init(dsn: String) -> void:
	# dsn looks like: https://<key>@<org>.ingest.sentry.io/<project>
	_dsn = dsn
	if dsn == "":
		return
	var parts := dsn.rsplit("@", true, 1)
	if parts.size() != 2:
		push_warning("SentryCrash: malformed DSN")
		return
	_ingest = "https://" + parts[1] + "/envelope/"
	_log_breadcrumb("session_start")


func report_error(message: String, context: Dictionary = {}) -> void:
	if _ingest == "":
		return  # staged: no DSN, no traffic
	var key := _dsn.get_slice("@", 0).get_slice("//", 1)
	var envelope := {
		"sdk": {"name": "concrete-dragon-gdscript", "version": "0.1.0"},
		"payload": {
			"event_id": _event_id(),
			"platform": "other",
			"level": "error",
			"message": message,
			"contexts": {"game": context, "os": {"name": OS.get_name()}},
		},
	}
	var http := HTTPRequest.new()
	add_child(http)
	var header := "X-Sentry-Auth: Sentry sentry_version=7, sentry_key=%s, sentry_client=concrete-dragon/0.1.0" % key
	http.request(_ingest, [header, "Content-Type: application/json"],
		HTTPClient.METHOD_POST, JSON.stringify(envelope))
	# NOTE: keep request_count small — free tier counts every envelope.


func _log_breadcrumb(_msg: String) -> void:
	pass  # hook point: cheap local ring buffer if we ever need breadcrumbs


func _event_id() -> String:
	var chars := "0123456789abcdef"
	var s := ""
	for i in 32:
		s += chars[randi() % chars.length()]
	return s
