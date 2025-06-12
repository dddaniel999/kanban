import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import type { Task } from "../TaskCard";
import toast from "react-hot-toast";

interface Member {
  id: number;
  username: string;
  role?: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus: Task["status"];
  onCreate: (taskData: Partial<Task> & { assignedToId?: number }) => void;
  members: Member[];
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultStatus,
  onCreate,
  members,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignedToId, setAssignedToId] = useState<number | undefined>();

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Titlul este obligatoriu.");
      return;
    }

    if (!deadline) {
      toast.error("Deadline-ul este obligatoriu.");
      return;
    }

    if (!assignedToId) {
      toast.error("Trebuie să selectezi un membru.");
      return;
    }

    const selectedMember = members.find((m) => m.id === assignedToId);
    if (!selectedMember) {
      toast.error("Membrul selectat nu este valid.");
      return;
    }

    onCreate({
      title,
      description,
      deadline,
      status: defaultStatus,
      assignedTo: { id: selectedMember.id, username: selectedMember.username },
    });

    setTitle("");
    setDescription("");
    setDeadline("");
    setAssignedToId(undefined);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md z-50">
        <Dialog.Title className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          Creează un task
        </Dialog.Title>

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

        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          Deadline
          <input
            type="datetime-local"
            className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-200">
          Asignează membru
          <select
            className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
            value={assignedToId ?? ""}
            onChange={(e) =>
              setAssignedToId(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          >
            <option value="">-- selectează un membru --</option>
            {members
              .filter(
                (m): m is { id: number; username: string } =>
                  !!m && typeof m.id === "number"
              )
              .map((member) => (
                <option key={`member-${member.id}`} value={member.id}>
                  {member.username}
                </option>
              ))}
          </select>
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
            onClick={handleSubmit}
          >
            Creează
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateTaskModal;
