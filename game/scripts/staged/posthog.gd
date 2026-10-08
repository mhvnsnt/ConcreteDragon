class_name PostHogAnalytics
extends Node
## STAGED — NOT ACTIVE. Drop-in PostHog analytics for Concrete Dragon.
##
## What it needs: a free PostHog account (1M events/month free as of 2026-10).
## The owner creates the account himself — workers NEVER create accounts in his name.
## When the key exists: put this node in the main scene or register as an
## autoload named "Analytics", then call PostHog.setup("<PROJECT_API_KEY>", "<distinct_id>").
##
## Sends events to https://us.i.posthog.com/capture via HTTPRequest (Godot 4).
## Session/retention events the game should emit once active:
##   game_opened, fight_started, wave_cleared, ko, run_ended, upgrade_bought.

const ENDPOINT := "https://us.i.posthog.com/capture/"

var _api_key := ""
var _distinct_id := ""
var _http: HTTPRequest


func setup(api_key: String, distinct_id: String = "") -> void:
	_api_key = api_key
	_distinct_id = distinct_id if distinct_id != "" else _make_id()
	_http = HTTPRequest.new()
	add_child(_http)
	capture("game_opened", {"platform": OS.get_name()})


func capture(event: String, properties: Dictionary = {}) -> void:
	if _api_key == "" or _http == null:
		return  # staged: no key, no traffic
	var payload := {
		"api_key": _api_key,
		"event": event,
		"distinct_id": _distinct_id,
		"properties": properties,
	}
	_http.request(ENDPOINT, ["Content-Type: application/json"],
		HTTPClient.METHOD_POST, JSON.stringify(payload))


func _make_id() -> String:
	# Stable-ish per install: stored in user:// so retention is real.
	var path := "user://posthog_id.txt"
	if FileAccess.file_exists(path):
		var f := FileAccess.open(path, FileAccess.READ)
		if f:
			return f.get_as_text().strip_edges()
	var id := "cd-" + str(abs(hash(str(Time.get_unix_time_from_system()) + OS.get_unique_id())))
	var w := FileAccess.open(path, FileAccess.WRITE)
	if w:
		w.store_string(id)
	return id
