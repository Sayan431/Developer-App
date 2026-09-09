from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import httpx

app = FastAPI(title="DevHub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory data stores ────────────────────────────────────────────────────

snippets_db: dict = {}
tasks_db: dict = {}
notes_db: dict = {}

# ─── Models ──────────────────────────────────────────────────────────────────

class Snippet(BaseModel):
    title: str
    code: str
    language: str
    tags: Optional[List[str]] = []

class SnippetOut(Snippet):
    id: str
    created_at: str

class Task(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "medium"   # low | medium | high
    status: Optional[str] = "todo"       # todo | in_progress | done

class TaskOut(Task):
    id: str
    created_at: str

class Note(BaseModel):
    title: str
    content: str

class NoteOut(Note):
    id: str
    updated_at: str

class APITestRequest(BaseModel):
    method: str
    url: str
    headers: Optional[dict] = {}
    body: Optional[str] = None

# ─── Snippets ────────────────────────────────────────────────────────────────

@app.get("/snippets", response_model=List[SnippetOut])
def list_snippets():
    return list(snippets_db.values())

@app.post("/snippets", response_model=SnippetOut)
def create_snippet(snippet: Snippet):
    sid = str(uuid.uuid4())
    data = SnippetOut(id=sid, created_at=datetime.utcnow().isoformat(), **snippet.model_dump())
    snippets_db[sid] = data.model_dump()
    return data

@app.put("/snippets/{sid}", response_model=SnippetOut)
def update_snippet(sid: str, snippet: Snippet):
    if sid not in snippets_db:
        raise HTTPException(404, "Snippet not found")
    data = SnippetOut(id=sid, created_at=snippets_db[sid]["created_at"], **snippet.model_dump())
    snippets_db[sid] = data.model_dump()
    return data

@app.delete("/snippets/{sid}")
def delete_snippet(sid: str):
    if sid not in snippets_db:
        raise HTTPException(404, "Snippet not found")
    del snippets_db[sid]
    return {"message": "Deleted"}

# ─── Tasks ───────────────────────────────────────────────────────────────────

@app.get("/tasks", response_model=List[TaskOut])
def list_tasks():
    return list(tasks_db.values())

@app.post("/tasks", response_model=TaskOut)
def create_task(task: Task):
    tid = str(uuid.uuid4())
    data = TaskOut(id=tid, created_at=datetime.utcnow().isoformat(), **task.model_dump())
    tasks_db[tid] = data.model_dump()
    return data

@app.put("/tasks/{tid}", response_model=TaskOut)
def update_task(tid: str, task: Task):
    if tid not in tasks_db:
        raise HTTPException(404, "Task not found")
    data = TaskOut(id=tid, created_at=tasks_db[tid]["created_at"], **task.model_dump())
    tasks_db[tid] = data.model_dump()
    return data

@app.delete("/tasks/{tid}")
def delete_task(tid: str):
    if tid not in tasks_db:
        raise HTTPException(404, "Task not found")
    del tasks_db[tid]
    return {"message": "Deleted"}

# ─── Notes ───────────────────────────────────────────────────────────────────

@app.get("/notes", response_model=List[NoteOut])
def list_notes():
    return list(notes_db.values())

@app.post("/notes", response_model=NoteOut)
def create_note(note: Note):
    nid = str(uuid.uuid4())
    data = NoteOut(id=nid, updated_at=datetime.utcnow().isoformat(), **note.model_dump())
    notes_db[nid] = data.model_dump()
    return data

@app.put("/notes/{nid}", response_model=NoteOut)
def update_note(nid: str, note: Note):
    if nid not in notes_db:
        raise HTTPException(404, "Note not found")
    data = NoteOut(id=nid, updated_at=datetime.utcnow().isoformat(), **note.model_dump())
    notes_db[nid] = data.model_dump()
    return data

@app.delete("/notes/{nid}")
def delete_note(nid: str):
    if nid not in notes_db:
        raise HTTPException(404, "Note not found")
    del notes_db[nid]
    return {"message": "Deleted"}

# ─── API Tester ───────────────────────────────────────────────────────────────

@app.post("/api-test")
async def test_api(req: APITestRequest):
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            headers = req.headers or {}
            content = req.body.encode() if req.body else None
            response = await client.request(
                method=req.method.upper(),
                url=req.url,
                headers=headers,
                content=content,
            )
            try:
                body = response.json()
            except Exception:
                body = response.text
            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "body": body,
                "elapsed_ms": int(response.elapsed.total_seconds() * 1000),
            }
    except httpx.RequestError as e:
        raise HTTPException(400, f"Request failed: {str(e)}")

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "snippets": len(snippets_db),
        "tasks": len(tasks_db),
        "notes": len(notes_db),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
