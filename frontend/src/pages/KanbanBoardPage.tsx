import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
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
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import ProjectSettingsModal from "../components/Kanban/ProjectSettingsModal";
import {
  ClipboardList,
  Loader,
  CheckCircle,
  Settings,
  PlusIcon,
  MessageSquare,
} from "lucide-react";
import ProjectCommentsModal from "../components/Kanban/ProjectCommentsModal";
import MemberList from "../components/Kanban/MemberList";

const columns = ["TO_DO", "IN_PROGRESS", "DONE"] as const;

type ColumnType = (typeof columns)[number] | "LATE";

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

const KanbanBoard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const activeProjectId = Number(projectId);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [creatingFor, setCreatingFor] = useState<ColumnType | null>(null);
  const [members, setMembers] = useState<
    { id: number; username: string; role?: string }[]
  >([]);
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

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

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const draggedTask = tasks.find((t) => t.id.toString() === draggableId);
    if (!draggedTask) return;

    const newStatus = destination.droppableId as ColumnType;

    const previousState = [...tasks];

    // Mutare optimistă
    const newTasks = tasks
      .filter((t) => t.id !== draggedTask.id)
      .map((t) => ({ ...t }));

    // Inserăm în noua poziție
    const tasksInNewCol = newTasks
      .filter((t) => t.status === newStatus)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    tasksInNewCol.splice(destination.index, 0, {
      ...draggedTask,
      status: newStatus,
    });

    // Rescriem pozițiile în noua coloană
    tasksInNewCol.forEach((t, index) => {
      t.position = index;
    });

    // Refacem lista combinată
    const finalTasks = newTasks
      .filter((t) => t.status !== newStatus)
      .concat(tasksInNewCol);

    setTasks(finalTasks);

    // Salvăm în backend doar task-ul mutat
    updateTask({
      ...draggedTask,
      status: newStatus,
      position: destination.index,
    }).catch(() => {
      toast.error("Eroare la actualizare. Revin la starea anterioară.");
      setTasks(previousState);
    });
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
      <div className="fixed top-28 left-4 z-10">
        <button
          onClick={() => setIsCommentsOpen(true)}
          className="flex items-center gap-2 bg-gray-800 text-sm px-3 py-2 rounded hover:bg-gray-900 transition"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full h-screen flex items-center justify-center overflow-hidden">
          <div className="w-[80vw] h-[80vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {columns.map((col) => (
              <Droppable key={col} droppableId={col}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 transition-colors duration-200
              bg-white dark:bg-gray-800 flex flex-col
              // FIXĂM ÎNĂLȚIMEA COLOANEI
              h-[80vh] 
              `}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                        {React.createElement(columnLabels[col].icon, {
                          className: `w-5 h-5 ${iconColors[col]}`,
                        })}
                        {columnLabels[col].label}
                      </h2>
                      {isProjectManager && col === "TO_DO" && (
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
                          <PlusIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    {/* Container taskuri cu scroll */}
                    <div className="flex-1 overflow-y-auto min-h-[12rem]">
                      {tasks
                        .filter((task) => task.status === col)
                        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                        .map((task, index) => (
                          <Draggable
                            key={task.id.toString()}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                className={`p-1 transition-all duration-200 ${
                                  snapshot.isDragging
                                    ? "scale-105 drop-shadow-lg"
                                    : ""
                                }`}
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

      <MemberList members={members} />

      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectId={activeProjectId}
        refreshProjectData={refreshProjectData}
      />

      {projectId && (
        <ProjectCommentsModal
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          projectId={parseInt(projectId)}
        />
      )}
    </>
  );
};

export default KanbanBoard;
