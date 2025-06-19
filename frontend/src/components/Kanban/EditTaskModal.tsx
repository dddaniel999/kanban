import React, { useState, useEffect } from "react";
import type { Task } from "../TaskCard";
import { motion, AnimatePresence } from "framer-motion";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (updatedTask: Task) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDeadline(task.deadline?.slice(0, 10) || "");
    }
  }, [task]);

  const handleSave = () => {
    if (!task) return;
    onSave({ ...task, title, description, deadline });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
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
            className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md z-50"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
              Editează task
            </h2>

            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              Titlu
              <input
                className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              Descriere
              <textarea
                className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-200">
              Deadline
              <input
                type="date"
                className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                onClick={onClose}
              >
                Anulează
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Salvează
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTaskModal;
