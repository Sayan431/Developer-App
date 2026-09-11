from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import httpx
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import models

# ─── Create all tables on startup ────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DevHub API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://developer-app-rho.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class Snippet(BaseModel):
    title: str
    code: str
    language: str
    tags: Optional[List[str]] = []

class SnippetOut(Snippet):
    id: str
    created_at: str
    class Config: from_attributes = True

class Task(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "medium"
    status: Optional[str] = "todo"

class TaskOut(Task):
    id: str
    created_at: str
    class Config: from_attributes = True

class Note(BaseModel):
    title: str
    content: str

class NoteOut(Note):
    id: str
    updated_at: str
    class Config: from_attributes = True

class Bookmark(BaseModel):
    title: str
    url: str
    description: Optional[str] = ""
    tags: Optional[List[str]] = []
    category: Optional[str] = "General"

class BookmarkOut(Bookmark):
    id: str
    created_at: str
    class Config: from_attributes = True

class Project(BaseModel):
    name: str
    description: Optional[str] = ""
    color: Optional[str] = "#6c63ff"
    icon: Optional[str] = "folder"

class ProjectOut(Project):
    id: str
    created_at: str
    class Config: from_attributes = True

class EnvVar(BaseModel):
    key: str
    value: str
    secret: Optional[bool] = False

class EnvSet(BaseModel):
    project_name: str
    vars: Optional[List[dict]] = []

class EnvSetOut(EnvSet):
    id: str
    updated_at: str
    class Config: from_attributes = True

class ChangelogEntry(BaseModel):
    title: str
    date: Optional[str] = None
    items: Optional[List[str]] = []
    project_id: Optional[str] = None

class ChangelogEntryOut(ChangelogEntry):
    id: str
    created_at: str
    class Config: from_attributes = True

class APITestRequest(BaseModel):
    method: str
    url: str
    headers: Optional[dict] = {}
    body: Optional[str] = None

# ─── Snippets ────────────────────────────────────────────────────────────────

@app.get("/snippets", response_model=List[SnippetOut])
def list_snippets(db: Session = Depends(get_db)):
    return db.query(models.Snippet).all()

@app.post("/snippets", response_model=SnippetOut)
def create_snippet(snippet: Snippet, db: Session = Depends(get_db)):
    row = models.Snippet(id=str(uuid.uuid4()), created_at=datetime.utcnow().isoformat(), **snippet.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row

@app.put("/snippets/{sid}", response_model=SnippetOut)
def update_snippet(sid: str, snippet: Snippet, db: Session = Depends(get_db)):
    row = db.query(models.Snippet).filter(models.Snippet.id == sid).first()
    if not row: raise HTTPException(404, "Snippet not found")
    for k, v in snippet.model_dump().items(): setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

@app.delete("/snippets/{sid}")
def delete_snippet(sid: str, db: Session = Depends(get_db)):
    row = db.query(models.Snippet).filter(models.Snippet.id == sid).first()
    if not row: raise HTTPException(404, "Snippet not found")
    db.delete(row); db.commit()
    return {"message": "Deleted"}

# ─── Tasks ───────────────────────────────────────────────────────────────────

@app.get("/tasks", response_model=List[TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).all()

@app.post("/tasks", response_model=TaskOut)
def create_task(task: Task, db: Session = Depends(get_db)):
    row = models.Task(id=str(uuid.uuid4()), created_at=datetime.utcnow().isoformat(), **task.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row

@app.put("/tasks/{tid}", response_model=TaskOut)
def update_task(tid: str, task: Task, db: Session = Depends(get_db)):
    row = db.query(models.Task).filter(models.Task.id == tid).first()
    if not row: raise HTTPException(404, "Task not found")
    for k, v in task.model_dump().items(): setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

@app.delete("/tasks/{tid}")
def delete_task(tid: str, db: Session = Depends(get_db)):
    row = db.query(models.Task).filter(models.Task.id == tid).first()
    if not row: raise HTTPException(404, "Task not found")
    db.delete(row); db.commit()
    return {"message": "Deleted"}

# ─── Notes ───────────────────────────────────────────────────────────────────

@app.get("/notes", response_model=List[NoteOut])
def list_notes(db: Session = Depends(get_db)):
    return db.query(models.Note).all()

@app.post("/notes", response_model=NoteOut)
def create_note(note: Note, db: Session = Depends(get_db)):
    row = models.Note(id=str(uuid.uuid4()), updated_at=datetime.utcnow().isoformat(), **note.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row

@app.put("/notes/{nid}", response_model=NoteOut)
def update_note(nid: str, note: Note, db: Session = Depends(get_db)):
    row = db.query(models.Note).filter(models.Note.id == nid).first()
    if not row: raise HTTPException(404, "Note not found")
    for k, v in note.model_dump().items(): setattr(row, k, v)
    row.updated_at = datetime.utcnow().isoformat()
    db.commit(); db.refresh(row)
    return row

@app.delete("/notes/{nid}")
def delete_note(nid: str, db: Session = Depends(get_db)):
    row = db.query(models.Note).filter(models.Note.id == nid).first()
    if not row: raise HTTPException(404, "Note not found")
    db.delete(row); db.commit()
    return {"message": "Deleted"}

# ─── Bookmarks ───────────────────────────────────────────────────────────────

@app.get("/bookmarks", response_model=List[BookmarkOut])
def list_bookmarks(db: Session = Depends(get_db)):
    return db.query(models.Bookmark).all()

@app.post("/bookmarks", response_model=BookmarkOut)
def create_bookmark(bm: Bookmark, db: Session = Depends(get_db)):
    row = models.Bookmark(id=str(uuid.uuid4()), created_at=datetime.utcnow().isoformat(), **bm.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row

@app.put("/bookmarks/{bid}", response_model=BookmarkOut)
def update_bookmark(bid: str, bm: Bookmark, db: Session = Depends(get_db)):
    row = db.query(models.Bookmark).filter(models.Bookmark.id == bid).first()
    if not row: raise HTTPException(404, "Bookmark not found")
    for k, v in bm.model_dump().items(): setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

@app.delete("/bookmarks/{bid}")
def delete_bookmark(bid: str, db: Session = Depends(get_db)):
    row = db.query(models.Bookmark).filter(models.Bookmark.id == bid).first()
    if not row: raise HTTPException(404, "Bookmark not found")
    db.delete(row); db.commit()
    return {"message": "Deleted"}

# ─── Projects ────────────────────────────────────────────────────────────────

@app.get("/projects", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()

@app.post("/projects", response_model=ProjectOut)
def create_project(project: Project, db: Session = Depends(get_db)):
    row = models.Project(id=str(uuid.uuid4()), created_at=datetime.utcnow().isoformat(), **project.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row

@app.put("/projects/{pid}", response_model=ProjectOut)
def update_project(pid: str, project: Project, db: Session = Depends(get_db)):
    row = db.query(models.Project).filter(models.Project.id == pid).first()
    if not row: raise HTTPException(404, "Project not found")
    for k, v in project.model_dump().items(): setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

@app.delete("/projects/{pid}")
def delete_project(pid: str, db: Session = Depends(get_db)):
    row = db.query(models.Project).filter(models.Project.id == pid).first()
    if not row: raise HTTPException(404, "Project not found")
    db.delete(row); db.commit()
    return {"message": "Deleted"}

# ─── Env Sets ────────────────────────────────────────────────────────────────

@app.get("/envsets", response_model=List[EnvSetOut])
def list_envsets(db: Session = Depends(get_db)):
    return db.query(models.EnvSet).all()

@app.post("/envsets", response_model=EnvSetOut)
def create_envset(envset: EnvSet, db: Session = Depends(get_db)):
    row = models.EnvSet(id=str(uuid.uuid4()), updated_at=datetime.utcnow().isoformat(), **envset.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row

@app.put("/envsets/{eid}", response_model=EnvSetOut)
def update_envset(eid: str, envset: EnvSet, db: Session = Depends(get_db)):
    row = db.query(models.EnvSet).filter(models.EnvSet.id == eid).first()
    if not row: raise HTTPException(404, "EnvSet not found")
    for k, v in envset.model_dump().items(): setattr(row, k, v)
    row.updated_at = datetime.utcnow().isoformat()
    db.commit(); db.refresh(row)
    return row

@app.delete("/envsets/{eid}")
def delete_envset(eid: str, db: Session = Depends(get_db)):
    row = db.query(models.EnvSet).filter(models.EnvSet.id == eid).first()
    if not row: raise HTTPException(404, "EnvSet not found")
    db.delete(row); db.commit()
    return {"message": "Deleted"}

# ─── Changelog ───────────────────────────────────────────────────────────────

@app.get("/changelog", response_model=List[ChangelogEntryOut])
def list_changelog(db: Session = Depends(get_db)):
    return db.query(models.ChangelogEntry).order_by(models.ChangelogEntry.created_at.desc()).all()

@app.post("/changelog", response_model=ChangelogEntryOut)
def create_changelog(entry: ChangelogEntry, db: Session = Depends(get_db)):
    payload = entry.model_dump()
    if not payload.get("date"):
        payload["date"] = datetime.utcnow().strftime("%Y-%m-%d")
    row = models.ChangelogEntry(id=str(uuid.uuid4()), created_at=datetime.utcnow().isoformat(), **payload)
    db.add(row); db.commit(); db.refresh(row)
    return row

@app.put("/changelog/{cid}", response_model=ChangelogEntryOut)
def update_changelog(cid: str, entry: ChangelogEntry, db: Session = Depends(get_db)):
    row = db.query(models.ChangelogEntry).filter(models.ChangelogEntry.id == cid).first()
    if not row: raise HTTPException(404, "Entry not found")
    payload = entry.model_dump()
    if not payload.get("date"): payload["date"] = row.date
    for k, v in payload.items(): setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

@app.delete("/changelog/{cid}")
def delete_changelog(cid: str, db: Session = Depends(get_db)):
    row = db.query(models.ChangelogEntry).filter(models.ChangelogEntry.id == cid).first()
    if not row: raise HTTPException(404, "Entry not found")
    db.delete(row); db.commit()
    return {"message": "Deleted"}

# ─── API Tester ───────────────────────────────────────────────────────────────

@app.post("/api-test")
async def test_api(req: APITestRequest):
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.request(
                method=req.method.upper(),
                url=req.url,
                headers=req.headers or {},
                content=req.body.encode() if req.body else None,
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
def health(db: Session = Depends(get_db)):
    return {
        "status":    "ok",
        "snippets":  db.query(models.Snippet).count(),
        "tasks":     db.query(models.Task).count(),
        "notes":     db.query(models.Note).count(),
        "bookmarks": db.query(models.Bookmark).count(),
        "projects":  db.query(models.Project).count(),
        "envsets":   db.query(models.EnvSet).count(),
        "changelog": db.query(models.ChangelogEntry).count(),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
