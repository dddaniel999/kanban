import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../api/api";
import EditUserModal from "../components/Admin/EditUserModal";
import toast from "react-hot-toast";
import { Pencil, Trash, Plus } from "lucide-react";
import CreateUserModal from "../components/Admin/CreateUserModal";
import { useNavigate } from "react-router-dom";
import { getUserRoleFromToken } from "../api/api";

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Eroare la obținerea utilizatorilor");
    }
  };

  useEffect(() => {
    const role = getUserRoleFromToken();
    if (role !== "ADMIN") {
      toast.error("Acces interzis");
      navigate("/");
    }
    fetchUsers();
  }, []);

  const handleDelete = (id: number) => {
    toast(
      (t) => (
        <span className="flex flex-col">
          <span className="mb-2">
            Ești sigur că vrei să ștergi acest utilizator?
          </span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteUser(id);
                  toast.success("Utilizator șters cu succes");
                  fetchUsers();
                } catch {
                  toast.error("Eroare la ștergere");
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Șterge
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              Anulează
            </button>
          </div>
        </span>
      ),
      { duration: 8000 }
    );
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
  };

  return (
    <div className="p-12">
      <h1 className="text-2xl font-bold mb-4">Panou Administrator</h1>

      <table className="min-w-full bg-gray border rounded-lg">
        <thead>
          <tr className="bg-gray-800">
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-2 border">
                <div className="flex flex-col">
                  <span className="font-medium">{user.username}</span>
                  {user.email && (
                    <span className="text-sm text-gray-500 italic">
                      {user.email}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleEdit(user)}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Pencil size={16} />
                  <span>Editare</span>
                </button>

                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:underline flex items-center gap-1 ml-4"
                >
                  <Trash size={16} />
                  <span>Ștergere</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <Plus size={18} /> Adaugă utilizator
        </button>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={fetchUsers}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchUsers}
        />
      )}
    </div>
  );
};

export default AdminPage;
