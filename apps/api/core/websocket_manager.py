from collections.abc import Iterable

from fastapi import WebSocket


class WebSocketManager:
    def __init__(self) -> None:
        self._connections: dict[str, WebSocket] = {}

    async def connect(self, connection_id: str, websocket: WebSocket) -> None:
        self._connections[connection_id] = websocket
        await websocket.accept()

    def disconnect(self, connection_id: str) -> None:
        self._connections.pop(connection_id, None)

    async def send(self, connection_id: str, message: str) -> None:
        websocket = self._connections.get(connection_id)
        if websocket is not None:
            await websocket.send_text(message)

    async def broadcast(self, message: str) -> None:
        for websocket in list(self._connections.values()):
            await websocket.send_text(message)

    def active_connection_ids(self) -> Iterable[str]:
        return self._connections.keys()


websocket_manager = WebSocketManager()
