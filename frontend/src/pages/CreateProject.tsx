import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject, getAllUsers } from "../api/api";
import toast from "react-hot-toast";

interface UserItem {
  userId: number;
  username: string;
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllUsers()
      .then((users) => {
        const formatted = users.map((user: any) => ({
          userId: user.userId ?? user.id,
          username: user.username,
        }));
        setAvailableUsers(formatted);
      })
      .catch(() => {
        toast.error("Eroare la încărcarea utilizatorilor.");
      });
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const createdProject = await createProject({
        title,
        description,
        memberIds: selectedMembers,
      });
      toast.success("Proiect creat cu succes!");
      navigate(`/kanbanBoard/${createdProject.id}`);
    } catch (err: any) {
      setError(err.message || "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">
        Creează un nou proiect
      </h1>
      <form onSubmit={handleCreateProject} className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Titlu proiect
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Descriere
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Adaugă membri
          </label>
          <select
            multiple
            value={selectedMembers.map(String)}
            onChange={(e) =>
              setSelectedMembers(
                Array.from(e.target.selectedOptions, (opt) =>
                  parseInt(opt.value)
                )
              )
            }
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
          >
            {availableUsers.map((user, index) => (
              <option key={user.userId ?? `idx-${index}`} value={user.userId}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-600 font-medium text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition"
        >
          {loading ? "Se salvează..." : "Creează proiect"}
        </button>
      </form>
    </div>
  );
};

export default CreateProject;
