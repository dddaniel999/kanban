import React from "react";
import { differenceInHours } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, User } from "lucide-react";
import type { Task } from "../TaskCard";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

type EffectiveStatus = "TO_DO" | "IN_PROGRESS" | "DONE" | "LATE";

const getEffectiveStatus = (task: Task): EffectiveStatus => {
  if (
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "DONE"
  ) {
    return "LATE";
  }
  return task.status;
};

const statusStyles: Record<EffectiveStatus, string> = {
  TO_DO: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
  LATE: "bg-red-100 text-red-800",
};

const ViewTaskModal: React.FC<Props> = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  const effectiveStatus = getEffectiveStatus(task);
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const now = new Date();

  const isLate = effectiveStatus === "LATE";
  const isDueSoon =
    deadlineDate &&
    differenceInHours(deadlineDate, now) <= 72 &&
    differenceInHours(deadlineDate, now) > 0 &&
    effectiveStatus !== "DONE";

  const deadlineClass = isLate
    ? "text-red-600 bg-red-100"
    : isDueSoon
    ? "text-yellow-600 bg-yellow-100"
    : "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-xl w-full shadow-xl z-50"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* STATUS badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[effectiveStatus]}`}
              >
                {
                  {
                    TO_DO: "În așteptare",
                    IN_PROGRESS: "În lucru",
                    DONE: "Finalizat",
                    LATE: "Întârziat",
                  }[effectiveStatus]
                }
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {task.title}
            </h2>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              {task.description || "Fără descriere"}
            </p>

            {/* Taguri */}
            {Array.isArray(task.tags) && task.tags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Taguri:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-3 py-1 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deadline */}
            {deadlineDate && (
              <div className="space-y-2 mt-2">
                <div
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${deadlineClass}`}
                >
                  <Clock className="w-3 h-3" />
                  Deadline: {deadlineDate.toLocaleString("ro-RO")}
                </div>

                {task.assignedTo?.username && (
                  <div className="flex items-center gap-1 text-xs text-blue-800 dark:text-blue-100 bg-blue-200 dark:bg-blue-500 px-2 py-1 rounded-full w-fit">
                    <User className="w-3 h-3" />
                    <span className="font-medium">
                      {task.assignedTo.username}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Buton */}
            <div className="mt-10 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded"
              >
                Închide
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewTaskModal;
