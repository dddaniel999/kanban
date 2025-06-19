import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  deleteProject,
  getAllUsers,
  getProjectMembers,
  updateProject,
} from "../../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface UserItem {
  userId: number;
  username: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  refreshProjectData: () => Promise<void>;
}

const ProjectSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  projectId,
  refreshProjectData,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserItem[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      getAllUsers().then((users) => {
        const formatted = users.map((user: any) => ({
          userId: user.userId ?? user.id,
          username: user.username,
        }));
        setAvailableUsers(formatted);
      });

      getProjectMembers(projectId).then((members) => {
        setSelectedMembers(members.map((m: any) => m.userId ?? m.id));
      });
    }
  }, [isOpen, projectId]);

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      toast.success("Proiect șters cu succes!");
      navigate("/");
    } catch {
      toast.error("Eroare la ștergerea proiectului.");
    }
  };

  const handleProjectUpdate = async () => {
    if (
      !newTitle.trim() &&
      !newDescription.trim() &&
      selectedMembers.length === 0
    ) {
      toast.error("Completează cel puțin un câmp pentru a salva.");
      return;
    }

    try {
      setLoading(true);
      await updateProject(projectId, {
        title: newTitle.trim() || undefined,
        description: newDescription.trim() || undefined,
        memberIds: selectedMembers,
      });
      toast.success("Proiect actualizat cu succes!");
      await refreshProjectData();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Eroare la actualizare.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal content */}
          <motion.div
            className="relative bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-2xl shadow-lg z-50"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
              onClick={onClose}
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Setări Proiect
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titlu:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Noul titlu"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descriere:
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descriere proiect"
                  className="w-full h-24 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Membri proiect:
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {availableUsers.map((user, index) => (
                    <label
                      key={user.userId ?? `idx-${index}`}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user.userId)}
                        onChange={() => toggleMember(user.userId)}
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user.username}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleProjectUpdate}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Salvează modificările
              </button>

              <div className="border-t pt-4">
                {!confirmDelete ? (
                  <button
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Șterge Proiectul
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-red-700">
                      Sigur vrei să ștergi proiectul? Acțiunea e ireversibilă.
                    </p>
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                      >
                        Confirmă
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
                      >
                        Anulează
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectSettingsModal;
