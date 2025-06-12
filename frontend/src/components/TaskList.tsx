import React from "react";
import { useNavigate } from "react-router-dom";
import TaskCard, { type Task } from "./TaskCard";
import Tooltip from "@mui/material/Tooltip";

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const navigate = useNavigate();

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return <p className="text-gray-500">Nu există task-uri de afișat.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => {
        const validStatus = ["TO_DO", "IN_PROGRESS", "DONE"].includes(
          task.status
        );
        if (!validStatus) return null;

        return (
          <Tooltip
            key={task.id}
            title="Navighează spre proiect"
            arrow
            placement="top"
          >
            <div
              onClick={() => {
                const projectId =
                  (task as any).projectId ?? (task as any).project?.id;
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
              className="cursor-pointer"
            >
              <TaskCard task={task} />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default TaskList;
