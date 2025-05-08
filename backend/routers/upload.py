from fastapi import *
from fastapi.responses import JSONResponse
from ..model.upload_function import Uploader, UploadText

router = APIRouter()
uploader = Uploader()
uploader_text = UploadText()

MAX_FILE_SIZE = 1 * 1024 * 1024

@router.post("/upload")
async def upload(text: str = Form(...), file: UploadFile = File(...)):
     
    if len(await file.read()) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 5MB limit")
    await file.seek(0)

    file_url = await uploader.upload_file(file, "petbuddy-img")

    uploader_text.create_table()

    uploader_text.insert_text(text, file_url)

    return JSONResponse({"ok":True},status_code=200)

@router.get("/upload")
async def show():
    data = uploader_text.select()
    return JSONResponse(content={"data": data}, status_code=200)

