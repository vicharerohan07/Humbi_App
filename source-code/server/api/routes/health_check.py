from api.application import app


@app.get("/ht")
async def health_check():
    return {"status": "ok"}
