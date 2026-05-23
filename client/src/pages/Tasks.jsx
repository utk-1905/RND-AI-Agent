import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Eye, RefreshCw } from "lucide-react";
import { getTasks } from "../api/taskApi";

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "created":
      return "bg-slate-100 text-slate-700";
    case "assigned":
      return "bg-blue-100 text-blue-700";
    case "in_progress":
      return "bg-yellow-100 text-yellow-700";
    case "draft_generated":
      return "bg-purple-100 text-purple-700";
    case "approved":
      return "bg-green-100 text-green-700";
    case "revision_requested":
      return "bg-orange-100 text-orange-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "finalized":
      return "bg-emerald-100 text-emerald-700";
    case "archived":
      return "bg-zinc-100 text-zinc-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200";
    case "medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "low":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const activeStatuses = [
  "created",
  "assigned",
  "in_progress",
  "draft_generated",
  "approved",
  "revision_requested",
];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getTasks();
      setTasks(response.data || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setErrorMessage("Failed to load tasks. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      active: tasks.filter((task) => activeStatuses.includes(task.status)).length,
      finalized: tasks.filter((task) => task.status === "finalized").length,
      rejected: tasks.filter((task) => task.status === "rejected").length,
      archived: tasks.filter((task) => task.status === "archived").length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") return tasks;

    if (activeFilter === "active") {
      return tasks.filter((task) => activeStatuses.includes(task.status));
    }

    return tasks.filter((task) => task.status === activeFilter);
  }, [tasks, activeFilter]);

  const filters = [
    { key: "active", label: "Active", count: counts.active },
    { key: "all", label: "All", count: counts.all },
    { key: "finalized", label: "Finalized", count: counts.finalized },
    { key: "rejected", label: "Rejected", count: counts.rejected },
    { key: "archived", label: "Archived", count: counts.archived },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold">Tasks</h2>
          <p className="text-slate-500 mt-1">
            Manage CEO tasks across active, finalized, rejected, and archived states.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadTasks}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <Link
            to="/tasks/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800"
          >
            <PlusCircle size={16} />
            New Task
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {errorMessage}
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-xl border text-sm transition ${
              activeFilter === filter.key
                ? "bg-slate-950 text-white border-slate-950"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {filter.label}{" "}
            <span
              className={`ml-1 ${
                activeFilter === filter.key ? "text-slate-300" : "text-slate-400"
              }`}
            >
              ({filter.count})
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-6 text-slate-500">
            No tasks found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    Task
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    Priority
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    Created
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-slate-600 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="border-b last:border-b-0">
                    <td className="px-5 py-4">
                      <h3 className="font-semibold text-slate-900">
                        {task.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {task.description}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full border ${getPriorityBadgeClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadgeClass(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {task.created_at
                        ? new Date(task.created_at).toLocaleString()
                        : "N/A"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-slate-50 text-sm"
                      >
                        <Eye size={15} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;