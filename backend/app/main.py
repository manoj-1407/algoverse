import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.core.config import get_settings
from app.core.database import engine, Base
from app.api.v1.router import router
from app.middleware import RateLimitMiddleware, RequestTimingMiddleware
import app.models.benchmark  # noqa

settings = get_settings()
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, room: str):
        await ws.accept()
        self.active.setdefault(room, []).append(ws)

    def disconnect(self, ws: WebSocket, room: str):
        if room in self.active:
            self.active[room] = [w for w in self.active[room] if w != ws]

    async def broadcast(self, message: dict, room: str):
        import json
        for ws in self.active.get(room, []):
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                pass


manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Algoverse API",
    version="3.0.0",
    description="Computational Universe — Algorithm Intelligence Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RequestTimingMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["health"])
def root():
    return {"service": "Algoverse API", "version": "3.0.0", "status": "running", "algorithms": "70+"}


@app.get("/ping")
def ping():
    return {"pong": True}


@app.websocket("/ws/battle/{room_id}")
async def battle_websocket(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast({"from": room_id, **data}, room_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
