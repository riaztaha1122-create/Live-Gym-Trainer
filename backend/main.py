from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
import uuid
from pose_module import PoseDetector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize a base detector once to share the heavy model
base_detector = PoseDetector()
shared_landmarker = base_detector.detector

@app.get("/")
def read_root():
    return {"status": "Gym Trainer API is running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = str(uuid.uuid4())
    # Create a fresh detector for this specific connection
    detector = PoseDetector(detector=shared_landmarker, session_id=session_id)
    logger.info(f"Client connected - New session started: {session_id}")
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "reset":
                detector.reset()
                continue

            frame_base64 = message.get("frame")
            exercise = message.get("exercise", "squat")
            
            if frame_base64:
                try:
                    result = detector.process_frame(frame_base64, exercise)
                    await websocket.send_text(json.dumps(result))
                except Exception as e:
                    logger.error(f"Error processing frame: {e}")
                    await websocket.send_text(json.dumps({"error": str(e)}))
            
    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Reset detector state on disconnect? Maybe better to keep it or have a reset signal
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
