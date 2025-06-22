import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createUser } from "../../api/api";

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: () => void; // ✅ adăugat pentru a elimina eroarea
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  onClose,
  onCreated,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUser({ username, password });
      toast.success("Utilizator creat cu succes!");
      onCreated(); // reîncărcăm lista după creare
      onClose(); // închidem modalul
    } catch (error: any) {
      toast.error(error.message || "Eroare la creare");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <h2 className="text-xl font-semibold mb-4">Creare utilizator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Parolă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Creează
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateUserModal;
