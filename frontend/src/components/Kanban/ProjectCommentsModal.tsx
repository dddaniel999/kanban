import React, { useEffect, useState } from "react";
import {
  getProjectComments,
  postProjectComment,
  deleteProjectComment,
  togglePinProjectComment,
  getProjectRole,
} from "../../api/api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash, Pin, PinOff } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ProjectCommentsModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface Comment {
  id: number;
  content: string;
  authorUsername: string;
  createdAt: string;
  pinned?: boolean;
}

const ProjectCommentsModal: React.FC<ProjectCommentsModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [pinned, setPinned] = useState<Comment[]>([]);
  const [unpinned, setUnpinned] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [isProjectManager, setIsProjectManager] = useState(false);

  //  La deschiderea modalului, încărcăm comentariile și rolul userului
  useEffect(() => {
    if (isOpen) {
      loadComments();
      loadUserInfo();
    }
  }, [isOpen]);

  const loadUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    setCurrentUsername(payload.sub);

    try {
      const role = await getProjectRole(projectId);
      setIsProjectManager(role === "MANAGER");
    } catch {
      setIsProjectManager(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await getProjectComments(projectId);
      setPinned(data.pinned || []);
      setUnpinned(data.unpinned || []);
    } catch {
      toast.error("Eroare la încărcarea comentariilor");
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast.error("Comentariul nu poate fi gol");
      return;
    }

    try {
      setLoading(true);
      await postProjectComment(projectId, newComment.trim());
      setNewComment("");
      await loadComments();
    } catch {
      toast.error("Eroare la trimitere");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteProjectComment(projectId, commentId);
      toast.success("Comentariu șters");
      await loadComments();
    } catch {
      toast.error("Eroare la ștergere");
    }
  };

  const handleTogglePin = async (commentId: number) => {
    try {
      await togglePinProjectComment(projectId, commentId);
      await loadComments();
    } catch {
      toast.error("Eroare la pin/unpin");
    }
  };

  // Comentariu afișat, cu suport Markdown și butoane pentru manager/autori
  const renderComment = (c: Comment) => (
    <div
      key={c.id}
      className="border p-3 rounded-md relative dark:border-gray-600"
    >
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{c.content}</ReactMarkdown>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {c.authorUsername} • {new Date(c.createdAt).toLocaleString()}
      </p>
      <div className="absolute top-2 right-2 flex gap-2">
        {isProjectManager && (
          <button onClick={() => handleTogglePin(c.id)} title="Pin/unpin">
            {c.pinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
        )}
        {c.authorUsername === currentUsername && (
          <button onClick={() => handleDelete(c.id)} title="Șterge">
            <Trash size={16} className="text-red-500 hover:text-red-700" />
          </button>
        )}
      </div>
    </div>
  );

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
            className="relative bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[75vh] overflow-y-auto p-8 rounded-2xl shadow-lg z-50"
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
              Comentarii Proiect
            </h2>

            <div className="space-y-4 mb-4">
              {pinned.length > 0 && (
                <>
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Pinned
                  </p>
                  {pinned.map(renderComment)}
                </>
              )}
              {unpinned.length === 0 && pinned.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Niciun comentariu încă.
                </p>
              )}
              {unpinned.length > 0 && (
                <>
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Alte comentarii
                  </p>
                  {unpinned.map(renderComment)}
                </>
              )}
            </div>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="Scrie un comentariu..."
              className="w-full border rounded-md p-2 mb-1 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />

            <p className="text-xs text-gray-500 mb-2">
              Suportă Markdown: <code>**bold**</code>, <code>*italic*</code>,{" "}
              <code>`code`</code>, etc.
            </p>

            {/* Live preview Markdown */}
            {newComment.trim() && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 mb-4 bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-400 mb-2">Previzualizare:</p>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{newComment}</ReactMarkdown>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Trimite
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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

export default ProjectCommentsModal;
