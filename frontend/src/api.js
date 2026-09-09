const BASE = 'http://localhost:8000';

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

// Snippets
export const getSnippets  = ()       => request('/snippets');
export const createSnippet = (data)  => request('/snippets', { method: 'POST', body: JSON.stringify(data) });
export const updateSnippet = (id, d) => request(`/snippets/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteSnippet = (id)    => request(`/snippets/${id}`, { method: 'DELETE' });

// Tasks
export const getTasks    = ()       => request('/tasks');
export const createTask  = (data)   => request('/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateTask  = (id, d)  => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteTask  = (id)     => request(`/tasks/${id}`, { method: 'DELETE' });

// Notes
export const getNotes    = ()       => request('/notes');
export const createNote  = (data)   => request('/notes', { method: 'POST', body: JSON.stringify(data) });
export const updateNote  = (id, d)  => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteNote  = (id)     => request(`/notes/${id}`, { method: 'DELETE' });

// API Tester
export const testApi = (data) => request('/api-test', { method: 'POST', body: JSON.stringify(data) });

// Health
export const getHealth = () => request('/health');
