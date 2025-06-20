import React from "react";
import { useNavigate } from "react-router-dom";
import { deleteProject } from "../api/api";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

// Interfață locală Project
export interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt?: string;
  role?: string; // "MANAGER" sau "MEMBER"
}

interface ProjectListProps {
  projects: Project[];
  onProjectClick?: (projectId: number) => void;
  onProjectDeleted?: (projectId: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectClick,
  onProjectDeleted,
}) => {
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    toast(
      (t) => (
        <span className="text-sm">
          Sigur vrei să ștergi proiectul?
          <div className="mt-2 flex gap-2 justify-end">
            <button
              className="px-3 py-1 !bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteProject(projectId);
                  toast.success("Proiect șters cu succes!");
                  onProjectDeleted?.(projectId);
                } catch (err: any) {
                  toast.error(err.message || "Eroare la ștergere");
                }
              }}
            >
              Confirmă
            </button>
            <button
              className="px-3 py-1 !bg-gray-300 text-black rounded hover:bg-gray-400 text-sm"
              onClick={() => toast.dismiss(t.id)}
            >
              Anulează
            </button>
          </div>
        </span>
      ),
      { duration: 8000 }
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() =>
            onProjectClick
              ? onProjectClick(project.id)
              : navigate(`/kanbanBoard/${project.id}`)
          }
          className="group relative bg-white dark:bg-gray-700 p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {project.description}
            </p>
          )}

          {project.role === "MANAGER" && (
            <div className="absolute bottom-2 right-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded shadow-sm">
              MANAGER
            </div>
          )}

          {/* Afișăm butonul doar dacă userul e MANAGER în acel proiect */}
          {project.role === "MANAGER" && (
            <button
              onClick={(e) => handleDelete(e, project.id)}
              className="absolute top-2 right-2 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition"
              title="Șterge proiect"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ))}

      {/* Card de creare proiect */}
      <div
        onClick={() => navigate("/createProject")}
        className="flex flex-col items-center justify-center gap-2 bg-white dark:bg-gray-700 p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer border-2 border-dashed border-blue-500 hover:border-blue-700"
      >
        <span className="text-4xl text-blue-500 font-bold">+</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Adaugă proiect nou
        </span>
      </div>
    </div>
  );
};

export default ProjectList;
