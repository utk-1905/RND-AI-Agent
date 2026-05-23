import { Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  BarChart3,
} from "lucide-react";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-72 bg-slate-950 text-white p-6 hidden md:block">
        <h1 className="text-2xl font-bold">RND AI Agent</h1>
        <p className="text-sm text-slate-400 mt-2">CEO Control Dashboard</p>

        <nav className="mt-8 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link to="/tasks" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800">
            <ListChecks size={18} />
            Tasks
          </Link>

          <Link to="/tasks/new" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800">
            <PlusCircle size={18} />
            New Task
          </Link>

          <Link to="/billing" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800">
            <BarChart3 size={18} />
            Billing Usage
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;