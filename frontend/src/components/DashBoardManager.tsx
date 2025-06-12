import React from "react";
import {
  FolderKanban,
  Users,
  ListChecks,
  Clock,
  Timer,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Props {
  data: {
    managedProjects: number;
    totalMembers: number;
    totalTasks: number;
    todoCount: number;
    inProgressCount: number;
    doneCount: number;
    lateCount: number;
  };
}

const DashboardManager: React.FC<Props> = ({ data }) => {
  const completionPercent =
    data.totalTasks > 0
      ? Math.round((data.doneCount / data.totalTasks) * 100)
      : 0;

  return (
    <div className="mt-10 w-full">
      <h2 className="text-2xl text-white font-bold mb-6">Dashboard Manager</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card
          title="Proiecte gestionate"
          value={data.managedProjects}
          icon={<FolderKanban className="text-indigo-500" />}
        />
        <Card
          title="Membri unici"
          value={data.totalMembers}
          icon={<Users className="text-yellow-500" />}
        />
        <Card
          title="Taskuri totale"
          value={data.totalTasks}
          icon={<ListChecks className="text-blue-500" />}
        />
        <Card
          title="To Do"
          value={data.todoCount}
          icon={<Clock className="text-gray-500" />}
        />
        <Card
          title="În lucru"
          value={data.inProgressCount}
          icon={<Timer className="text-blue-600" />}
        />
        <Card
          title="Finalizate"
          value={data.doneCount}
          icon={<CheckCircle2 className="text-green-600" />}
        />
        <Card
          title="Întârziate"
          value={data.lateCount}
          icon={<AlertCircle className="text-red-600" />}
          highlight={data.lateCount > 0}
        />
      </div>

      <div className="mt-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden shadow-inner">
        <div
          className="bg-green-500 h-full text-xs font-medium text-center text-white leading-5"
          style={{ width: `${completionPercent}%` }}
        >
          {completionPercent}% completate
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{
  title: string;
  value: number;
  icon?: React.ReactNode;
  highlight?: boolean;
}> = ({ title, value, icon, highlight = false }) => (
  <div
    className={`flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md ${
      highlight ? "ring-2 ring-red-500" : ""
    }`}
  >
    <div className="text-3xl">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">
        {value}
      </p>
    </div>
  </div>
);

export default DashboardManager;
