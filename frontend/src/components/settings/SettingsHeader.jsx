import React from "react";
import { Camera } from "lucide-react";
import { getInitials } from "../../utils/avatarUtils";

const SettingsHeader = ({ user }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-3xl p-8 shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#E31B54] font-bold text-3xl">
          {getInitials(user?.name)}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {user?.name}
          </h1>
          <p className="text-white/90 text-lg mb-1">{user?.email}</p>
          <p className="text-white/70 text-sm">
            Member since{" "}
            {new Date(user?.createdAt || Date.now()).toLocaleDateString(
              "en-US",
              { month: "long", year: "numeric" }
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
