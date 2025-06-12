import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  getUserTasksPerProject,
  updateTask,
  deleteTask,
  getProjectRole,
  getProjectMembers,
  addTask,
  getProjectById,
} from "../api/api";
import type { Task } from "../components/TaskCard";
import KanbanTaskCard from "../components/Kanban/KanbanTaskCard";
import EditTaskModal from "../components/Kanban/EditTaskModal";
import CreateTaskModal from "../components/Kanban/CreateTaskModal";
import ViewTaskModal from "../components/Kanban/ViewTaskModal";
import toast from "react-hot-toast";
import { UserIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import ProjectSettingsModal from "../components/Kanban/ProjectSettingsModal";
import { ClipboardList, Loader, CheckCircle, Settings } from "lucide-react";

const columns = ["TO_DO", "IN_PROGRESS", "DONE"] as const;

const columnLabels: Record<
  (typeof columns)[number],
  { label: string; icon: React.FC<{ className?: string }> }
> = {
  TO_DO: { label: "De făcut", icon: ClipboardList },
  IN_PROGRESS: { label: "În lucru", icon: Loader },
  DONE: { label: "Finalizate", icon: CheckCircle },
};

const iconColors: Record<(typeof columns)[number], string> = {
  TO_DO: "text-yellow-500",
  IN_PROGRESS: "text-blue-500",
  DONE: "text-green-500",
};

const columnBgClasses: Record<(typeof columns)[number], string> = {
  TO_DO: "bg-yellow-100/30 dark:bg-yellow-300/5 backdrop-blur-md",
  IN_PROGRESS: "bg-blue-100/30 dark:bg-blue-300/5 backdrop-blur-md",
  DONE: "bg-green-100/30 dark:bg-green-300/5 backdrop-blur-md",
};

const KanbanBoard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = Number(projectId);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [creatingFor, setCreatingFor] = useState<Task["status"] | null>(null);
  const [members, setMembers] = useState<
    { id: number; username: string; role?: string }[]
  >([]);
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState<string>("");

  const refreshProjectData = async () => {
    try {
      const [tasksData, role, memberList, projectData] = await Promise.all([
        getUserTasksPerProject(activeProjectId),
        getProjectRole(activeProjectId) as Promise<string>,
        getProjectMembers(activeProjectId),
        getProjectById(activeProjectId),
      ]);

      setTasks(tasksData);
      setIsProjectManager(role === "MANAGER");
      setProjectTitle(projectData.title);
      setMembers(
        memberList.map(
          (m: { userId: number; username: string; role: string }) => ({
            id: m.userId,
            username: m.username,
            role: m.role,
          })
        )
      );
    } catch (err) {
      toast.error("Eroare la reîncărcarea datelor.");
      console.error(err);
    }
  };

  useEffect(() => {
    refreshProjectData();
  }, [activeProjectId]);

  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const updatedTasks = tasks.map((task) => {
      if (task.id.toString() === draggableId) {
        return { ...task, status: destination.droppableId as Task["status"] };
      }
      return task;
    });

    const movedTask = updatedTasks.find((t) => t.id.toString() === draggableId);

    if (movedTask) {
      try {
        await updateTask({ ...movedTask, status: movedTask.status });
        setTasks(updatedTasks);
      } catch (err) {
        toast.error("Eroare la actualizarea statusului.");
      }
    }
  };

  const handleEditSave = async (updated: Task) => {
    const cleanStatus: "TO_DO" | "IN_PROGRESS" | "DONE" =
      updated.status === "LATE" ? "IN_PROGRESS" : updated.status;

    try {
      const res = await updateTask({ ...updated, status: cleanStatus });
      setTasks((prev) => prev.map((t) => (t.id === res.id ? res : t)));
    } catch (err) {
      toast.error("Eroare la salvarea task-ului.");
    }
    setIsEditOpen(false);
  };

  const handleDelete = async (id: number) => {
    toast(
      (t) => (
        <span className="text-sm">
          Ești sigur că vrei să ștergi acest task?
          <div className="mt-2 flex gap-2 justify-end">
            <button
              className="px-3 py-1 text-sm !bg-red-600 text-white rounded hover:bg-red-700"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteTask(id);
                  setTasks((prev) => prev.filter((t) => t.id !== id));
                  toast.success("Task șters cu succes!");
                } catch {
                  toast.error("Eroare la ștergerea task-ului");
                }
              }}
            >
              Confirmă
            </button>
            <button
              className="px-3 py-1 text-sm !bg-gray-300 text-black rounded hover:bg-gray-400"
              onClick={() => toast.dismiss(t.id)}
            >
              Anulează
            </button>
          </div>
        </span>
      ),
      { duration: 10000 }
    );
  };

  const handleTaskCreate = async (taskData: Partial<Task>) => {
    if (!taskData.assignedTo || !taskData.assignedTo.id) {
      toast.error("Selectează un membru pentru task.");
      return;
    }

    const cleanStatus: "TO_DO" | "IN_PROGRESS" | "DONE" =
      taskData.status === "LATE" || !taskData.status
        ? "TO_DO"
        : taskData.status;

    try {
      const newTask = await addTask({
        title: taskData.title || "",
        description: taskData.description || "",
        status: cleanStatus,
        deadline: taskData.deadline,

        projectId: activeProjectId,
        assignedToId: taskData.assignedTo.id,
      });

      setTasks((prev) => [...prev, newTask]);
      toast.success("Task creat cu succes!");
    } catch (err: any) {
      toast.error(err.message || "Eroare la crearea task-ului");
    }
  };

  return (
    <>
      <div className="fixed top-12 left-4 z-10 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-white hover:text-blue-600"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Dashboard
        </button>
      </div>
      <div className="fixed bottom-4 left-4 px-4 py-2 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-lg shadow-sm text-sm text-gray-800 dark:text-gray-200">
        <span className="italic">Proiect:</span>
        <span className="ml-2 font-semibold">
          {projectTitle || "Titlu proiect indisponibil"}
        </span>
      </div>

      {isProjectManager && (
        <div className="fixed top-12 right-4 z-10">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 text-m text-gray-600 dark:text-white hover:text-blue-600"
          >
            <Settings className="w-7 h-7" />
            Setări
          </button>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-screen h-screen flex items-center justify-center overflow-x-hidden">
          <div className="w-[80vw] h-[80vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {columns.map((col) => (
              <Droppable key={col} droppableId={col}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded-xl shadow h-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 ${columnBgClasses[col]}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                        {React.createElement(columnLabels[col].icon, {
                          className: `w-5 h-5 ${iconColors[col]}`,
                        })}
                        {columnLabels[col].label}
                      </h2>
                      {isProjectManager && (
                        <button
                          onClick={() => {
                            if (members.length < 1) {
                              toast.error(
                                "Proiectul nu are membri disponibili pentru asignare."
                              );
                              return;
                            }
                            setCreatingFor(col);
                          }}
                          className="text-xl text-blue-600 hover:text-blue-800"
                        >
                          +
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {tasks
                        .filter((task) => task.status === col)
                        .map((task, index) => (
                          <Draggable
                            key={task.id.toString()}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="p-1"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => {
                                  setViewingTask(task);
                                  setIsViewOpen(true);
                                }}
                              >
                                <KanbanTaskCard
                                  task={task}
                                  isManager={isProjectManager}
                                  onEdit={(t) => {
                                    setEditingTask(t);
                                    setIsEditOpen(true);
                                  }}
                                  onDelete={handleDelete}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>

      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        task={editingTask}
        onSave={handleEditSave}
      />

      <CreateTaskModal
        isOpen={creatingFor !== null}
        onClose={() => setCreatingFor(null)}
        defaultStatus={creatingFor || "TO_DO"}
        onCreate={handleTaskCreate}
        members={members}
      />

      <ViewTaskModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        task={viewingTask}
      />

      <div className="w-[60vw] mx-auto bg-gradient-to-br from-white to-gray-100 dark:from-gray-700/20 dark:to-gray-800 p-4 rounded-xl shadow-md">
        <h2 className="text-lg text-center font-bold text-gray-800 dark:text-white mb-4">
          Membrii proiectului
        </h2>

        {["MANAGER", "MEMBER"].map((roleKey) => {
          const label = roleKey === "MANAGER" ? "Manageri" : "Membri (DEV)";
          const filtered = members.filter((m) => m.role === roleKey);

          return (
            <div key={roleKey} className="mb-6 text-center">
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                -- {label}
              </h3>
              {filtered.length > 0 ? (
                <ul className="space-y-2 flex flex-col items-center">
                  {filtered.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-2 text-sm text-gray-800 dark:text-white"
                    >
                      <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                      <span>{m.username}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Niciun utilizator
                </p>
              )}
            </div>
          );
        })}
      </div>

      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectId={activeProjectId}
        refreshProjectData={refreshProjectData}
      />
    </>
  );
};

export default KanbanBoard;
