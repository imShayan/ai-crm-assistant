import { LayoutDashboard, Users, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-black text-white p-5">
      <h1 className="text-2xl font-bold mb-10">AI CRM</h1>

      <div className="space-y-6">
        <div className="flex items-center gap-3 cursor-pointer hover:text-gray-300">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>

        <div className="flex items-center gap-3 cursor-pointer hover:text-gray-300">
          <Users size={20} />
          <span>Customers</span>
        </div>

        <div className="flex items-center gap-3 cursor-pointer hover:text-gray-300">
          <Settings size={20} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
}