from sqlalchemy import Column, String, Boolean, Text, JSON
from database import Base

class Snippet(Base):
    __tablename__ = "snippets"
    id         = Column(String, primary_key=True)
    title      = Column(String, nullable=False)
    code       = Column(Text, nullable=False)
    language   = Column(String, nullable=False)
    tags       = Column(JSON, default=[])
    created_at = Column(String, nullable=False)

class Task(Base):
    __tablename__ = "tasks"
    id          = Column(String, primary_key=True)
    title       = Column(String, nullable=False)
    description = Column(Text, default="")
    priority    = Column(String, default="medium")
    status      = Column(String, default="todo")
    created_at  = Column(String, nullable=False)

class Note(Base):
    __tablename__ = "notes"
    id         = Column(String, primary_key=True)
    title      = Column(String, nullable=False)
    content    = Column(Text, nullable=False)
    updated_at = Column(String, nullable=False)

class Bookmark(Base):
    __tablename__ = "bookmarks"
    id          = Column(String, primary_key=True)
    title       = Column(String, nullable=False)
    url         = Column(String, nullable=False)
    description = Column(Text, default="")
    tags        = Column(JSON, default=[])
    category    = Column(String, default="General")
    created_at  = Column(String, nullable=False)

class Project(Base):
    __tablename__ = "projects"
    id          = Column(String, primary_key=True)
    name        = Column(String, nullable=False)
    description = Column(Text, default="")
    color       = Column(String, default="#6c63ff")
    icon        = Column(String, default="folder")
    created_at  = Column(String, nullable=False)

class EnvSet(Base):
    __tablename__ = "envsets"
    id           = Column(String, primary_key=True)
    project_name = Column(String, nullable=False)
    vars         = Column(JSON, default=[])
    updated_at   = Column(String, nullable=False)

class ChangelogEntry(Base):
    __tablename__ = "changelog"
    id         = Column(String, primary_key=True)
    title      = Column(String, nullable=False)
    date       = Column(String, nullable=True)
    items      = Column(JSON, default=[])
    project_id = Column(String, nullable=True)
    created_at = Column(String, nullable=False)
