import { Power, Folders, LogOut, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserRoleFromToken } from "../api/api";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const globalRole = getUserRoleFromToken();

  const handleLogout = () => {
    toast.success("Te-ai delogat cu succes");
    logout();
    setTimeout(() => navigate("/login"), 300);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white flex justify-between items-center px-3 py-1 shadow-md">
        <h1
          className="flex text-2xl font-semibold cursor-pointer hover:text-blue-400 transition"
          onClick={() => navigate("/")}
        >
          KanbanSGSM
          <Folders className="w-5 h-5 ml-1" />
        </h1>

        <div className="flex items-center gap-4">
          {globalRole === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
              title="Panou Admin"
            >
              <Shield size={20} />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 hover:text-red-400 transition"
            title="Logout"
          >
            <Power size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <LogOut className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Ești sigur?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Dacă continui, vei fi delogat.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleLogout();
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Da, deloghează-mă
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Anulează
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
