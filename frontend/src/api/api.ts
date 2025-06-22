import type { Task } from "../components/TaskCard";
import { jwtDecode } from "jwt-decode";
import { fetchWithAuth } from "./fetchWithAuth";

interface JwtPayload {
  sub: string;
  role: string;
}

export const getUserRoleFromToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role;
  } catch {
    return null;
  }
};

const API_BASE = "http://localhost:8080";

// const getAuthHeaders = () => {
//   const token = localStorage.getItem("token");
//   return {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   };
// };

export const getUserDashboard = async () => {
  const res = await fetchWithAuth(`${API_BASE}/dashboard`);
  if (!res || !res.ok) throw new Error("Eroare la fetch /dashboard");
  return res.json();
};

export const getManagerDashboard = async () => {
  const res = await fetchWithAuth(`${API_BASE}/dashboard/manager`);
  if (!res || !res.ok) throw new Error("Eroare la fetch /dashboard/manager");
  return res.json();
};

export const getUserTasks = async () => {
  const res = await fetchWithAuth(`${API_BASE}/tasks`, {
    method: "GET",
  });
  const data = await res?.json();
  console.log("🚨 Taskuri primite:", data);
  return data;
};

export const updateTask = async (task: Task) => {
  const res = await fetchWithAuth(`${API_BASE}/tasks/${task.id}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });

  if (!res?.ok) {
    const text = await res?.text(); // sau `await res.json()` dacă trimiți JSON
    throw new Error(text);
  }

  return res?.json();
};
export const deleteTask = async (taskId: number) => {
  const res = await fetchWithAuth(`${API_BASE}/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!res || !res.ok) throw new Error("Eroare la ștergerea task-ului");

  if (res.status === 204 || res.headers.get("content-length") === "0")
    return true;

  try {
    return await res.json();
  } catch {
    return true;
  }
};

export const addTask = async (taskData: {
  title?: string;
  description?: string;
  deadline?: string;
  status?: "TO_DO" | "IN_PROGRESS" | "DONE";
  projectId: number;
  assignedToId: number;
}) => {
  const res = await fetchWithAuth(`${API_BASE}/tasks`, {
    method: "POST",
    body: JSON.stringify(taskData),
  });

  if (!res || !res.ok) {
    const errorMessage = await res?.text();
    throw new Error(errorMessage || "Eroare la crearea task-ului");
  }

  return res.json();
};

export const getProjectRole = async (projectId: number): Promise<string> => {
  const res = await fetchWithAuth(
    `${API_BASE}/projects/${projectId}/role/self`
  );
  if (!res || !res.ok)
    throw new Error("Eroare la verificarea rolului în proiect");
  return await res.text();
};

export const getProjectMembers = async (projectId: number) => {
  const res = await fetchWithAuth(`${API_BASE}/projects/${projectId}/members`, {
    method: "GET",
  });

  if (!res || !res.ok)
    throw new Error("Eroare la obținerea membrilor proiectului");

  return await res.json();
};

export const getUserProjects = async () => {
  const res = await fetchWithAuth(`${API_BASE}/projects`);
  if (!res || !res.ok) {
    const errorText = await res?.text();
    throw new Error(
      errorText || "Eroare la obținerea proiectelor utilizatorului"
    );
  }

  return res.json();
};

export const getUserTasksPerProject = async (projectId: number) => {
  const res = await fetchWithAuth(`${API_BASE}/tasks?projectId=${projectId}`);
  if (!res || !res.ok)
    throw new Error("Eroare la obținerea task-urilor pentru proiect");

  return await res.json();
};

export const createProject = async (projectData: {
  title: string;
  description?: string;
  memberIds?: number[];
}) => {
  const res = await fetchWithAuth(`${API_BASE}/projects`, {
    method: "POST",
    body: JSON.stringify(projectData),
  });

  if (!res || !res.ok) {
    const message = await res?.text();
    throw new Error(message || "Eroare la crearea proiectului");
  }

  console.log("📦 Proiect trimis:", projectData);
  return res.json();
};

export const getAllUsers = async () => {
  const res = await fetchWithAuth(`${API_BASE}/users`);
  if (!res || !res.ok) {
    const message = await res?.text();
    throw new Error(message || "Eroare la obținerea utilizatorilor");
  }

  return res.json();
};

export const deleteProject = async (projectId: number) => {
  const res = await fetchWithAuth(`${API_BASE}/projects/${projectId}`, {
    method: "DELETE",
  });

  if (!res || !res.ok) {
    const text = await res?.text();
    throw new Error(text || "Eroare la ștergerea proiectului");
  }

  return true;
};

export const updateProject = async (
  projectId: number,
  data: {
    title?: string;
    description?: string;
    memberIds?: number[]; //
  }
) => {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Eroare la actualizarea proiectului");
  }

  return response.json();
};

export const getProjectById = async (projectId: number) => {
  const res = await fetchWithAuth(
    `http://localhost:8080/projects/${projectId}`
  );
  if (!res || !res.ok) {
    const message = await res?.text();
    throw new Error(message || "Eroare la obținerea proiectului");
  }
  return res.json();
};

// Comentarii proiect

export const getProjectComments = async (projectId: number) => {
  const res = await fetchWithAuth(`${API_BASE}/projects/${projectId}/comments`);
  if (!res || !res.ok)
    throw new Error("Eroare la obținerea comentariilor proiectului");

  return res.json();
};

export const postProjectComment = async (
  projectId: number,
  content: string
) => {
  const res = await fetchWithAuth(
    `${API_BASE}/projects/${projectId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );

  if (!res || !res.ok) {
    const text = await res?.text();
    throw new Error(text || "Eroare la trimiterea comentariului");
  }

  return res.json();
};

// Ștergere comentariu
export async function deleteProjectComment(
  projectId: number,
  commentId: number
) {
  const res = await fetchWithAuth(
    `${API_BASE}/projects/${projectId}/comments/${commentId}`,
    { method: "DELETE" }
  );

  if (!res || !res.ok) {
    const text = await res?.text?.();
    throw new Error(text || "Eroare la ștergerea comentariului");
  }

  return true;
}

// Pin/unpin comentariu
export async function togglePinProjectComment(
  projectId: number,
  commentId: number
) {
  const res = await fetchWithAuth(
    `${API_BASE}/projects/${projectId}/comments/${commentId}/pin`,
    { method: "PATCH" }
  );

  if (!res || !res.ok) {
    const text = await res?.text?.();
    throw new Error(text || "Eroare la schimbarea stării pinned");
  }

  return true;
}

// admin stuff

export const isAdmin = (): boolean => {
  const role = getUserRoleFromToken();
  return role === "ADMIN";
};

export const deleteUser = async (userId: number) => {
  const res = await fetchWithAuth(`${API_BASE}/users/${userId}`, {
    method: "DELETE",
  });

  if (!res || !res.ok) {
    const message = await res?.text();
    throw new Error(message || "Eroare la ștergerea utilizatorului");
  }

  return true;
};

export const updateUser = async (
  userId: number,
  data: { username?: string; password?: string }
) => {
  const res = await fetchWithAuth(`${API_BASE}/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res || !res.ok) {
    const msg = await res?.text();
    throw new Error(msg || "Eroare la actualizarea utilizatorului");
  }

  return res.text();
};

export const createUser = async (userData: {
  username: string;
  password: string;
}) => {
  const res = await fetchWithAuth(`${API_BASE}/users`, {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (!res || !res.ok) {
    const message = await res?.text();
    throw new Error(message || "Eroare la crearea utilizatorului");
  }

  return res.text();
};

export const getAllProjects = async () => {
  const res = await fetchWithAuth(`${API_BASE}/admin/projects`);
  if (!res.ok) throw new Error("Nu s-au putut încărca proiectele");
  return res.json();
};

export const getAllTasks = async () => {
  const res = await fetchWithAuth(`${API_BASE}/admin/tasks`);
  if (!res.ok) throw new Error("Nu s-au putut încărca task-urile");
  return res.json();
};
