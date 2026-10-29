from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analyse import router as analyze_router

# Import de ton nouveau routeur

app = FastAPI(title="Chess Coach API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)