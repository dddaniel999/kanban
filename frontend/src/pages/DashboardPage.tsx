import React, { useEffect, useState } from "react";
import {
  getUserDashboard,
  getManagerDashboard,
  getUserTasks,
  getUserProjects,
} from "../api/api";
import TaskList from "../components/TaskList";
import ProjectList from "../components/ProjectList";
import type { Task } from "../components/TaskCard";
import type { Project } from "../components/ProjectList";
import DashboardManagerSlider from "../components/DashboardManagerSlider";
import useAuthRedirect from "../hooks/useAuthRedirect";
import {
  Folder,
  ListTodo,
  Timer,
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardData {
  projectCount: number;
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  lateCount: number;
}

type CardType = "projects" | "tasks" | "todo" | "inProgress" | "done" | "late";

const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [managerData, setManagerData] = useState<any | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const [error, setError] = useState<string | null>(null);

  useAuthRedirect();

  useEffect(() => {
    getUserDashboard()
      .then(setData)
      .catch((err) => setError(err.message));

    getManagerDashboard()
      .then(setManagerData)
      .catch(() => setManagerData(null));

    getUserTasks()
      .then(setTasks)
      .catch((err) => setError(err.message));

    getUserProjects()
      .then(setProjects)
      .catch((err) => setError(err.message));
  }, []);

  const handleProjectDeleted = (deletedId: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== deletedId));
    setData((prev) =>
      prev ? { ...prev, projectCount: prev.projectCount - 1 } : prev
    );
  };

  const filteredTasks = (type: CardType) => {
    switch (type) {
      case "todo":
        return tasks.filter((t) => t.status === "TO_DO");
      case "inProgress":
        return tasks.filter((t) => t.status === "IN_PROGRESS");
      case "done":
        return tasks.filter((t) => t.status === "DONE");
      case "late":
        return tasks.filter(
          (t) => new Date(t.deadline || "") < new Date() && t.status !== "DONE"
        );
      default:
        return tasks;
    }
  };

  const displayNames: Record<CardType, string> = {
    projects: "Proiectele mele",
    tasks: "Toate taskurile",
    todo: "Taskuri în așteptare",
    inProgress: "Taskuri în lucru",
    done: "Taskuri finalizate",
    late: "Taskuri întârziate",
  };

  const cardColor = (type: CardType) => {
    switch (type) {
      case "late":
        return "text-red-600 dark:text-red-400";
      case "inProgress":
        return "text-blue-600 dark:text-blue-400";
      case "done":
        return "text-green-600 dark:text-green-400";
      case "todo":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-indigo-600 dark:text-indigo-400";
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return <div className="text-gray-500">Se încarcă...</div>;

  return (
    <div className="relative w-screen h-screen overflow-y-auto flex flex-col items-center bg-gray-100 dark:bg-gray-900 pt-30">
      <div className="w-full max-w-6xl space-y-6">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            title="Proiecte"
            value={data.projectCount}
            onClick={() => setSelectedCard("projects")}
            type="projects"
            colorClass={cardColor("projects")}
          />
          <Card
            title="Taskuri totale"
            value={data.totalTasks}
            onClick={() => setSelectedCard("tasks")}
            type="tasks"
            colorClass={cardColor("tasks")}
          />
        </motion.div>

        <motion.div
          className="w-full text-center bg-gray-800 rounded-xl text-white py-2 font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Filtrări
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            title="To Do"
            value={data.todoCount}
            onClick={() => setSelectedCard("todo")}
            colorClass={cardColor("todo")}
            type="todo"
          />
          <Card
            title="În lucru"
            value={data.inProgressCount}
            onClick={() => setSelectedCard("inProgress")}
            colorClass={cardColor("inProgress")}
            type="inProgress"
          />
          <Card
            title="Finalizate"
            value={data.doneCount}
            onClick={() => setSelectedCard("done")}
            colorClass={cardColor("done")}
            type="done"
          />
          <Card
            title="Întârziate"
            value={data.lateCount}
            onClick={() => setSelectedCard("late")}
            colorClass={cardColor("late")}
            type="late"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedCard && (
            <motion.div
              key={selectedCard}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                onClick={() => setSelectedCard(null)}
              >
                Înapoi
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                {displayNames[selectedCard]}
              </h2>

              {selectedCard === "projects" ? (
                <ProjectList
                  projects={projects}
                  onProjectDeleted={handleProjectDeleted}
                />
              ) : (
                <TaskList tasks={filteredTasks(selectedCard)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full">
          {managerData && <DashboardManagerSlider data={managerData} />}
        </div>
      </div>
    </div>
  );
};

const getIconForType = (type: CardType) => {
  switch (type) {
    case "projects":
      return <Folder className="w-5 h-5 text-gray-400 mr-2" />;
    case "tasks":
      return <LayoutDashboard className="w-5 h-5 text-blue-400 mr-2" />;
    case "todo":
      return <ListTodo className="w-5 h-5 text-gray-400 mr-2" />;
    case "inProgress":
      return <Timer className="w-5 h-5 text-blue-400 mr-2" />;
    case "done":
      return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />;
    case "late":
      return <AlertCircle className="w-5 h-5 text-red-500 mr-2" />;
    default:
      return null;
  }
};

const Card: React.FC<{
  title: string;
  value: number;
  onClick: () => void;
  colorClass?: string;
  type: CardType;
}> = ({
  title,
  value,
  onClick,
  type,
  colorClass = "text-blue-600 dark:text-blue-400",
}) => (
  <motion.div
    onClick={onClick}
    className="cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:ring-2 hover:ring-blue-500 hover:scale-105 transition-transform"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {getIconForType(type)}
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
          {title}
        </h3>
      </div>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  </motion.div>
);

export default DashboardPage;
