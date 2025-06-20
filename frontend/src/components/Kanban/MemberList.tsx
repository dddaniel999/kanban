import React from "react";
import { UserIcon } from "@heroicons/react/24/solid";

interface Member {
  id: number;
  username: string;
  role?: string;
}

interface MemberListProps {
  members: Member[];
}

const MemberList: React.FC<MemberListProps> = ({ members }) => {
  return (
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
              <p className="text-sm text-gray-500 italic">Niciun utilizator</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemberList;
