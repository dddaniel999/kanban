import React, { useEffect, useState } from "react";
import { getProjectComments, postProjectComment } from "../../api/api";
import toast from "react-hot-toast";

interface ProjectCommentsProps {
  projectId: number;
}

interface Comment {
  id: number;
  content: string;
  authorUsername: string;
  createdAt: string;
}

const ProjectComments: React.FC<ProjectCommentsProps> = ({ projectId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    try {
      const data = await getProjectComments(projectId);
      setComments(data);
    } catch (e) {
      toast.error("Eroare la încărcarea comentariilor");
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return toast.error("Comentariul nu poate fi gol");
    try {
      setLoading(true);
      await postProjectComment(projectId, newComment.trim());
      setNewComment("");
      await loadComments();
    } catch (e) {
      toast.error("Eroare la trimitere");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [projectId]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Comentarii proiect</h2>

      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
        {comments.length === 0 && (
          <p className="text-gray-500">Niciun comentariu încă.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="border rounded-md p-2">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {c.content}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {c.authorUsername} • {new Date(c.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="w-full border p-2 rounded-md mb-2"
        placeholder="Scrie un comentariu..."
        rows={3}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Trimite
      </button>
    </div>
  );
};

export default ProjectComments;
