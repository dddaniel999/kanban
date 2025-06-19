import React from "react";
import type { Task } from "../TaskCard";
import { Pencil, Trash2, User, Clock } from "lucide-react";
import { differenceInHours } from "date-fns";
import { motion } from "framer-motion";

interface KanbanTaskCardProps {
  task: Task;
  isManager: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  isManager,
  onEdit,
  onDelete,
}) => {
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const now = new Date();

  const isLate = deadlineDate && deadlineDate < now && task.status !== "DONE";

  const isDueSoon =
    deadlineDate &&
    !isLate &&
    differenceInHours(deadlineDate, now) <= 72 &&
    differenceInHours(deadlineDate, now) > 0;

  const deadlineClass = isLate
    ? "bg-red-100 text-red-600"
    : isDueSoon
    ? "bg-yellow-100 text-yellow-600"
    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative bg-gradient-to-br from-white to-gray-100 dark:from-gray-700/20 dark:to-gray-800/40 p-4 rounded-xl mb-3 shadow transition duration-200 hover:shadow-md ${
        isLate
          ? "border border-red-500"
          : isDueSoon
          ? "border border-yellow-400"
          : "border border-transparent"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="w-full">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">
            {task.title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2">
            {task.description || "Fără descriere"}
          </p>

          {deadlineDate && (
            <div
              className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${deadlineClass}`}
            >
              <Clock className="w-3 h-3" />
              Deadline: {deadlineDate.toLocaleString("ro-RO")}
            </div>
          )}

          {task.assignedTo?.username && (
            <div className="mt-2 flex items-center gap-1 text-xs text-blue-800 dark:text-blue-100 bg-blue-200 dark:bg-blue-500 px-2 py-1 rounded-full w-fit">
              <User className="w-3 h-3" />
              <span className="font-medium">{task.assignedTo.username}</span>
            </div>
          )}
        </div>

        {isManager && (
          <div className="flex flex-col gap-2 items-end">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KanbanTaskCard;
