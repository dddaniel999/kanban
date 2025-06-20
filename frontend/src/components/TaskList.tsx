import React from "react";
import { useNavigate } from "react-router-dom";
import TaskCard, { type Task } from "./TaskCard";
import { type Project } from "./ProjectList";
import { Folder } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks, projects }) => {
  const navigate = useNavigate();

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return (
      <div className="w-full text-center py-10">
        <p className="text-gray-500 text-lg font-medium">
          Nu există task-uri de afișat.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => {
        const validStatus = ["TO_DO", "IN_PROGRESS", "DONE"].includes(
          task.status
        );
        if (!validStatus) return null;

        const projectId = (task as any).projectId ?? (task as any).project?.id;
        const projectTitle = projects.find((p) => p.id === projectId)?.title;

        return (
          <div
            key={task.id}
            onClick={() => {
              if (projectId) {
                localStorage.setItem("activeProjectId", String(projectId));
                navigate(`/kanbanBoard/${projectId}`);
              } else {
                console.warn(
                  "❌ task.projectId este undefined pentru task:",
                  task
                );
              }
            }}
            className="cursor-pointer group transition-transform hover:scale-[1.015]"
          >
            <TaskCard task={task} />
            {projectTitle && (
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500 italic group-hover:text-blue-700 transition-all">
                <p>proiect:</p>
                <Folder className="w-4 h-4 group-hover:text-blue-700 group-hover:drop-shadow" />
                <span>{projectTitle}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
