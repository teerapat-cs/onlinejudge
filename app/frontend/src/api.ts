import { API_BASE_URL } from './config';

export type NoteStatus = 'open' | 'solved' | 'revisit';

export interface Note {
  id: number;
  title: string;
  platform: string | null;
  problem_ref: string | null;
  content: string;
  tags: string | null;
  status: NoteStatus;
  created_at: string;
  updated_at: string;
}

export interface NotePayload {
  title: string;
  platform?: string | null;
  problem_ref?: string | null;
  content: string;
  tags?: string | null;
  status?: NoteStatus;
}

export interface Algorithm {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  pseudocode: string | null;
  time_complexity: string | null;
  space_complexity: string | null;
  sample_input: unknown;
  created_at: string;
  updated_at: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorText = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.description) {
        errorText = String(data.description);
      } else if (data?.error) {
        errorText = String(data.error);
      } else {
        errorText = JSON.stringify(data);
      }
    } catch {
      const txt = await res.text();
      if (txt) errorText = txt;
    }
    throw new Error(errorText);
  }
  return (await res.json()) as T;
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${API_BASE_URL}/api/notes`);
  return handleResponse<Note[]>(res);
}

export async function fetchNote(id: number | string): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/api/notes/${id}`);
  return handleResponse<Note>(res);
}

export async function createNote(payload: NotePayload): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Note>(res);
}

export async function updateNote(
  id: number | string,
  payload: Partial<NotePayload>
): Promise<Note> {
  const res = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Note>(res);
}

export async function deleteNote(id: number | string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
}

export async function fetchAlgorithms(): Promise<Algorithm[]> {
  const res = await fetch(`${API_BASE_URL}/api/algorithms`);
  return handleResponse<Algorithm[]>(res);
}

export async function fetchAlgorithmBySlug(slug: string): Promise<Algorithm> {
  const res = await fetch(
    `${API_BASE_URL}/api/algorithms/${encodeURIComponent(slug)}`
  );
  return handleResponse<Algorithm>(res);
}

