from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

app = FastAPI()


class RoomID(BaseModel):
    room_id: str


class RoomManager:
    def __init__(self):
        self.connections: dict[str, Optional[WebSocket]] = dict()

    def prepare(self, room_id: str):
        self.connections[room_id] = None

    async def connect(self, room_id: str, websocket: WebSocket) -> bool:
        await websocket.accept()
        if room_id in self.connections:
            self.connections[room_id] = websocket
            return True
        else:
            await websocket.close()
            return False

    async def disconnect(self, room_id: str):
        websocket = self.connections.pop(room_id, None)
        if websocket is not None:
            await websocket.close()

    async def send_message(self, room_id: str, message: str):
        websocket = self.connections.get(room_id, None)
        if websocket is not None:
            await websocket.send_text(message)


manager = RoomManager()


@app.post(
    "/room",
    summary="create new room",
    description="Create new room and return the id of the room.",
    response_model=RoomID,
)
async def create_room():
    room_id = str(uuid4())
    manager.prepare(room_id)
    return RoomID(room_id=room_id)


@app.websocket("/room-ws")
async def open_connection(websocket: WebSocket, room_id: str):
    if not await manager.connect(room_id, websocket):
        return

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(room_id)


@app.post(
    "/room/prev",
    summary="back to the previous slide",
    description="Go to the previous slide of the host of the room.",
)
async def back_to_prev_slide(room_id: str):
    await manager.send_message(room_id, "prev")


@app.post(
    "/room/next",
    summary="go to the next slide",
    description="Go to the next slide of the host of the room.",
    response_model=None,
)
async def go_to_next_slide(room_id: str):
    await manager.send_message(room_id, "next")
