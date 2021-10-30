from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, Path, WebSocket, WebSocketDisconnect, status
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RoomID(BaseModel):
    room_id: str


class SlideOperation(BaseModel):
    direction: str


class RoomManager:
    def __init__(self):
        self.connections: dict[str, Optional[WebSocket]] = dict()

    def prepare(self, room_id: str):
        self.connections[room_id] = None

    def does_exist(self, room_id: str):
        return room_id in self.connections

    async def connect(self, room_id: str, websocket: WebSocket) -> bool:
        await websocket.accept()
        if room_id in self.connections and self.connections[room_id] is None:
            self.connections[room_id] = websocket
            return True
        else:
            await websocket.close()
            return False

    async def disconnect(self, room_id: str):
        if (websocket := self.connections.get(room_id)) is not None:
            self.connections[room_id] = None
            await websocket.close()

    async def operate_slide(self, room_id: str, direction: str) -> bool:
        websocket = self.connections.get(room_id, None)
        if websocket is not None:
            await websocket.send_json(SlideOperation(direction=direction).dict())
            return True
        else:
            return False


manager = RoomManager()


@app.post(
    "/room",
    summary="create new room",
    description="Create new room and return the id of the room.",
    response_model=RoomID,
)
async def create_room():
    room_id = str(uuid4())[:6]
    manager.prepare(room_id)
    return RoomID(room_id=room_id)


@app.websocket("/room/{room_id}")
async def open_connection(websocket: WebSocket, room_id: str = Path(...)):
    if not await manager.connect(room_id, websocket):
        return

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(room_id)


@app.get(
    "/room/{room_id}",
    summary="check if the room exists",
    description="Check if the room which has the specified id exists",
    response_model=bool,
)
async def does_room_exist(room_id: str = Path(...)):
    return manager.does_exist(room_id)


@app.post(
    "/room/{room_id}/prev",
    summary="back to the previous slide",
    description="Go to the previous slide of the host of the room.",
    response_model=str,
)
async def back_to_prev_slide(room_id: str = Path(...)):
    if not await manager.operate_slide(room_id, "prev"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return "ok"


@app.post(
    "/room/{room_id}/next",
    summary="go to the next slide",
    description="Go to the next slide of the host of the room.",
    response_model=str,
)
async def go_to_next_slide(room_id: str = Path(...)):
    if not await manager.operate_slide(room_id, "next"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return "ok"
