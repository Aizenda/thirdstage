from fastapi import *
from fastapi.responses import FileResponse
from backend.routers import upload
from fastapi.staticfiles import StaticFiles

app=FastAPI()
app.include_router(upload.router)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def index():
	file_path = "./static/html/index.html"
	return FileResponse(file_path, media_type="text/html")