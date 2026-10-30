"""Offline API tests: no OpenAI/Tavily key and no Redis needed (model calls are never made)."""
import os

os.environ.setdefault("OPENAI_API_KEY", "")
os.environ.setdefault("TAVILY_API_KEY", "")
os.environ["REDIS_URL"] = "redis://127.0.0.1:1"  # unreachable -> in-memory task store

import pytest
from fastapi.testclient import TestClient

from api import config
from api.main import app


@pytest.fixture()
def client():
    with TestClient(app) as c:  # runs startup: must not crash without keys
        yield c


def test_starts_and_reports_degraded_without_keys(client):
    body = client.get("/health").json()
    assert body["status"] == "degraded"
    assert body["services"]["openai"] == "not_configured"
    assert body["services"]["tavily"] == "not_configured"


def test_missing_keys_listed_and_strict_mode_raises(monkeypatch):
    monkeypatch.setattr(config.settings, "openai_api_key", "")
    monkeypatch.setattr(config.settings, "tavily_api_key", "x")
    assert config.missing_api_keys() == ["OPENAI_API_KEY"]
    with pytest.raises(ValueError):
        config.validate_api_keys(strict=True)
    config.validate_api_keys()  # non-strict only warns


def test_request_validation(client):
    assert client.post("/generate-post", json={}).status_code in (400, 422)
    assert client.post("/verify-post", json={"paper_title": "x"}).status_code in (400, 422)


def test_unknown_task_is_404(client):
    assert client.get("/status/does-not-exist").status_code == 404


def test_task_list_is_a_list(client):
    r = client.get("/tasks")
    assert r.status_code == 200 and isinstance(r.json(), list)
