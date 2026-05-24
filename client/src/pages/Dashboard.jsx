import { useEffect, useState } from "react";
import { getTasks } from "../api/taskApi";
import { getBillingUsage } from "../api/billingApi";

const activeStatuses = [
  "created",
  "assigned",
  "in_progress",
  "draft_generated",
  "approved",
  "revision_requested",
];

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const tasksResponse = await getTasks();
      const billingResponse = await getBillingUsage();

      setTasks(tasksResponse.data || []);
      setBilling(billingResponse.data || null);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((task) =>
    activeStatuses.includes(task.status)
  ).length;
  const finalizedTasks = tasks.filter(
    (task) => task.status === "finalized"
  ).length;
  const archivedTasks = tasks.filter(
    (task) => task.status === "archived"
  ).length;
  const rejectedTasks = tasks.filter(
    (task) => task.status === "rejected"
  ).length;

  const recentActiveTasks = tasks.filter(
    (task) => task.status !== "archived"
  );

  if (loading) {
    return <p className="text-slate-600">Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">CEO Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Monitor active work, completed reports, archived records, and AI usage.
        </p>
      </div>

      <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Tasks" value={totalTasks} />
        <StatCard label="Active Tasks" value={activeTasks} />
        <StatCard label="Finalized" value={finalizedTasks} />
        <StatCard label="Archived" value={archivedTasks} />
        <StatCard label="Rejected" value={rejectedTasks} />
        <StatCard
          label="AI Requests"
          value={billing?.summary?.total_requests || 0}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-5">
          <h3 className="text-xl font-semibold mb-1">Recent Active Tasks</h3>
          <p className="text-sm text-slate-500 mb-4">
            Archived tasks are hidden here to keep CEO workflow clean.
          </p>

          {recentActiveTasks.length === 0 ? (
            <p className="text-slate-500">No active tasks available.</p>
          ) : (
            <div className="space-y-3">
              {recentActiveTasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="flex justify-between items-center border rounded-xl p-4"
                >
                  <div>
                    <h4 className="font-semibold">{task.title}</h4>
                    <p className="text-sm text-slate-500">
                      Priority: {task.priority}
                    </p>
                  </div>

                  <span className="text-sm px-3 py-1 rounded-full bg-slate-100">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-950 text-white rounded-2xl shadow-sm p-5">
          <h3 className="text-xl font-semibold">Demo Flow</h3>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <p>1. Create CEO Task</p>
            <p>2. Confirm Suggested Department</p>
            <p>3. Agent Generates Output</p>
            <p>4. CEO Review / Revision</p>
            <p>5. Final Report / Archive</p>
          </div>

          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <p>1. New Task</p>
            <p>2. Confirm Department</p>
            <p>3. Agent Draft</p>
            <p>4. CEO Review</p>
            <p>5. Final Report</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border">
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
};

export default Dashboard;