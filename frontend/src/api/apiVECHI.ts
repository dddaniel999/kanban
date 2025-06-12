import type { Task } from "../components/TaskCard";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  role: string;
  // alte câmpuri dacă mai ai
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

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getUserDashboard = async () => {
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Eroare la fetch /dashboard");
  return res.json();
};

export const getManagerDashboard = async () => {
  const res = await fetch(`${API_BASE}/dashboard/manager`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Eroare la fetch /dashboard/manager");
  return res.json();
};

export const getUserTasks = async () => {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  console.log("🚨 Taskuri primite:", data);
  return data;
};

export const updateTask = async (task: Task) => {
  const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Eroare la actualizarea task-ului");
  return res.json();
};

export const deleteTask = async (taskId: number) => {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Eroare la ștergerea task-ului");

  // ✅ Nu mai încerci să citești JSON dacă statusul este 204
  if (res.status === 204 || res.headers.get("content-length") === "0")
    return true;

  try {
    return await res.json();
  } catch {
    return true; // fallback în caz că nu e JSON dar nici 204
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
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: taskData.title,
      description: taskData.description,
      deadline: taskData.deadline,
      status: taskData.status,
      projectId: taskData.projectId,
      assignedToId: taskData.assignedToId,
    }),
  });

  if (!res.ok) {
    const errorMessage = await res.text();
    throw new Error(errorMessage || "Eroare la crearea task-ului");
  }

  return res.json(); // taskul nou creat
};

export const getProjectRole = async (projectId: number): Promise<string> => {
  const res = await fetch(`${API_BASE}/projects/${projectId}/role/self`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Eroare la verificarea rolului în proiect");

  return await res.text(); // ex: "MANAGER" or "MEMBER"
};

export const getProjectMembers = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
    method: "GET",
    headers: getAuthHeaders(), // ✅ apelezi funcția corect
  });

  if (!res.ok) {
    throw new Error("Eroare la obținerea membrilor proiectului");
  }

  return await res.json(); // lista de membri: [{ id, username, role }]
};

// În api.ts

export const getUserProjects = async () => {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      errorText || "Eroare la obținerea proiectelor utilizatorului"
    );
  }

  return res.json(); // [{ id, name, description, ... }]
};

export const getUserTasksPerProject = async (projectId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/tasks?projectId=${projectId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok)
    throw new Error("Eroare la obținerea task-urilor pentru proiect");

  return await res.json();
};

export const createProject = async (projectData: {
  title: string;
  description?: string;
  memberIds?: number[];
}) => {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Eroare la crearea proiectului");
  }
  console.log("📦 Proiect trimis:", projectData);

  return res.json();
};

export const getAllUsers = async () => {
  const res = await fetch(`${API_BASE}/users`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Eroare la obținerea utilizatorilor");
  }

  return res.json();
};

export const deleteProject = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Eroare la ștergerea proiectului");
  }

  return true;
};
