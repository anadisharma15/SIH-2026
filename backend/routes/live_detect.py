from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import random

router = APIRouter(tags=["Live Detection"])

@router.websocket("/ws/live-detect")
async def websocket_live_detect(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"type": "log", "message": "Connected to Vaani AI Live Engine"})
    
    try:
        while True:
            # Receive audio chunk from frontend
            data = await websocket.receive_bytes()
            
            # Since ML model shouldn't be added, we return random/mock probabilities
            ai_prob = random.uniform(0.1, 0.4)
            human_prob = 1.0 - ai_prob
            
            await websocket.send_json({
                "type": "probabilities",
                "ai": ai_prob,
                "human": human_prob
            })
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
