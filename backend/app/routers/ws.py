import asyncio
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/ws/game/{mission_id}")
async def game_websocket(websocket: WebSocket, mission_id: uuid.UUID):
    await websocket.accept()

    try:
        time_left = 300
        while time_left > 0:
            data = None
            try:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=1.0)
            except asyncio.TimeoutError:
                pass

            if data:
                action = data.get("action")
                if action == "start_timer":
                    time_left = data.get("seconds", 300)
                elif action == "stop":
                    break

            await websocket.send_json({
                "type": "timer",
                "time_left": time_left,
                "mission_id": str(mission_id),
            })
            time_left -= 1

        if time_left <= 0:
            await websocket.send_json({
                "type": "time_up",
                "mission_id": str(mission_id),
            })

    except WebSocketDisconnect:
        pass
