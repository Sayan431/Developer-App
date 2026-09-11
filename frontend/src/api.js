const BASE = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

// Health
export const getHealth = () => request('/health');

// Snippets
export const getSnippets    = ()        => request('/snippets');
export const createSnippet  = (data)    => request('/snippets', { method: 'POST', body: JSON.stringify(data) });
export const updateSnippet  = (id, d)   => request(`/snippets/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteSnippet  = (id)      => request(`/snippets/${id}`, { method: 'DELETE' });

// Tasks
export const getTasks       = ()        => request('/tasks');
export const createTask     = (data)    => request('/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateTask     = (id, d)   => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteTask     = (id)      => request(`/tasks/${id}`, { method: 'DELETE' });

// Notes
export const getNotes       = ()        => request('/notes');
export const createNote     = (data)    => request('/notes', { method: 'POST', body: JSON.stringify(data) });
export const updateNote     = (id, d)   => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteNote     = (id)      => request(`/notes/${id}`, { method: 'DELETE' });

// Bookmarks
export const getBookmarks   = ()        => request('/bookmarks');
export const createBookmark = (data)    => request('/bookmarks', { method: 'POST', body: JSON.stringify(data) });
export const updateBookmark = (id, d)   => request(`/bookmarks/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteBookmark = (id)      => request(`/bookmarks/${id}`, { method: 'DELETE' });

// Projects
export const getProjects    = ()        => request('/projects');
export const createProject  = (data)    => request('/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject  = (id, d)   => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteProject  = (id)      => request(`/projects/${id}`, { method: 'DELETE' });

// EnvSets
export const getEnvSets     = ()        => request('/envsets');
export const createEnvSet   = (data)    => request('/envsets', { method: 'POST', body: JSON.stringify(data) });
export const updateEnvSet   = (id, d)   => request(`/envsets/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteEnvSet   = (id)      => request(`/envsets/${id}`, { method: 'DELETE' });

// Changelog
export const getChangelog   = ()        => request('/changelog');
export const createChangelog= (data)    => request('/changelog', { method: 'POST', body: JSON.stringify(data) });
export const updateChangelog= (id, d)   => request(`/changelog/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteChangelog= (id)      => request(`/changelog/${id}`, { method: 'DELETE' });

// API Tester
export const testApi = (data) => request('/api-test', { method: 'POST', body: JSON.stringify(data) });
