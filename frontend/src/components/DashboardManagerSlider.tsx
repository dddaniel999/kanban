import React, { useState } from "react";
import DashboardManager from "./DashBoardManager";
import { ChevronRight } from "lucide-react";
import { Tooltip } from "@mui/material";

const DashboardManagerSlider: React.FC<{ data: any }> = ({ data }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sertar lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md md:max-w-lg bg-white dark:bg-gray-900 shadow-lg transition-transform duration-500 ease-in-out z-40 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Buton unificat: acționează și la deschidere și închidere */}
        <Tooltip title="DashboardManager" placement="left" arrow>
          <button
            onClick={() => setOpen(!open)}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full bg-blue-600 text-white p-2 rounded-l-lg z-50"
          >
            <ChevronRight
              className={`${open ? "rotate-180" : ""} transition-transform`}
            />
          </button>
        </Tooltip>

        <div className="p-6 overflow-y-auto h-full">
          <DashboardManager data={data} />
        </div>
      </div>
    </>
  );
};

export default DashboardManagerSlider;
