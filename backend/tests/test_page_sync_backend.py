import pytest
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocketDisconnect

from app.main import app


@pytest.fixture(scope="module")
def client():
    client = TestClient(app)
    return client


def test_success_scenario(client):
    response = client.post("/room")
    assert response.status_code == 200

    room_id = response.json()["room_id"]

    with client.websocket_connect(f"/room-ws/{room_id}") as websocket:
        response = client.post(f"/room/{room_id}/prev")
        assert response.status_code == 200

        data = websocket.receive_json()
        assert data["direction"] == "prev"

        response = client.post(f"/room/{room_id}/next")
        assert response.status_code == 200

        data = websocket.receive_json()
        assert data["direction"] == "next"


def test_failure_scenario(client):
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/room-ws/invalid") as websocket:
            client.post("/room/invalid/prev")
            websocket.receive_text()


def test_nonexistent_room_id(client):
    response = client.post("/room/invalid/prev")
    assert response.status_code == 404
    response = client.post("/room/invalid/next")
    assert response.status_code == 404
