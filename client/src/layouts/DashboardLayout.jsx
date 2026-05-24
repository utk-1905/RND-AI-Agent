import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  BarChart3,
  Building2,
} from "lucide-react";

const DashboardLayout = () => {
  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Departments",
      path: "/departments",
      icon: Building2,
      end: true,
    },
    {
      label: "Tasks",
      path: "/tasks",
      icon: ListChecks,
      end: true,
    },
    {
      label: "New Task",
      path: "/tasks/new",
      icon: PlusCircle,
      end: true,
    },
    {
      label: "Billing Usage",
      path: "/billing",
      icon: BarChart3,
      end: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-72 bg-slate-950 text-white p-6 hidden md:block">
        <h1 className="text-2xl font-bold">RND AI Agent</h1>
        <p className="text-sm text-slate-400 mt-2">CEO Control Dashboard</p>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? "bg-white text-slate-950"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;