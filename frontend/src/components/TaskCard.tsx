import React from "react";
import { differenceInHours } from "date-fns";
import { User } from "lucide-react";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE" | "LATE";
  deadline?: string;
  assignedTo?: { id: number; username: string; email?: string };
  projectId: number;
  tags?: string[];
  position?: number;
}

export interface TaskDTO {
  id: number;
  title: string;
  description?: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE" | "LATE";
  deadline?: string;
  assignedToId?: number;
  assignedToUsername?: string;
  tags?: string[];
  projectId: number;
  position?: number;
}

interface TaskCardProps {
  task: TaskDTO;
}

type EffectiveStatus = "TO_DO" | "IN_PROGRESS" | "DONE" | "LATE";

const statusColors: Record<EffectiveStatus, string> = {
  TO_DO: "bg-gray-300 text-gray-800",
  IN_PROGRESS: "bg-blue-300 text-blue-800",
  DONE: "bg-green-300 text-green-800",
  LATE: "bg-red-300 text-red-800",
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const effectiveStatus: EffectiveStatus =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "DONE"
      ? "LATE"
      : task.status;

  const now = new Date();
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;

  const isDueSoon =
    deadlineDate &&
    differenceInHours(deadlineDate, now) <= 3 &&
    differenceInHours(deadlineDate, now) > 0 &&
    effectiveStatus !== "DONE";

  const deadlineClass =
    effectiveStatus === "LATE"
      ? "text-red-600"
      : isDueSoon
      ? "text-yellow-600"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="border rounded-2xl p-4 shadow-md hover:shadow-xl transition duration-200 cursor-pointer bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {task.title}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[effectiveStatus]}`}
        >
          {effectiveStatus.replace("_", " ")}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {task.description}
        </p>
      )}

      {task.deadline && (
        <p className={`text-xs ${deadlineClass}`}>
          Deadline: {new Date(task.deadline).toLocaleString("ro-RO")}
        </p>
      )}

      {task.assignedToUsername && (
        <div className="mt-1 flex items-center gap-1 text-xs text-blue-800 dark:text-blue-100 bg-blue-200 dark:bg-blue-500 px-2 py-1 rounded-full w-fit">
          <User className="w-3 h-3" />
          <span className="font-medium">{task.assignedToUsername}</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
