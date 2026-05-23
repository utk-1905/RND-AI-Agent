import { useEffect, useState } from "react";
import { getTasks } from "../api/taskApi";
import { getBillingUsage } from "../api/billingApi";

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
  const finalizedTasks = tasks.filter((task) => task.status === "finalized").length;
  const rejectedTasks = tasks.filter((task) => task.status === "rejected").length;
  const pendingTasks = tasks.filter(
    (task) => task.status !== "finalized" && task.status !== "rejected"
  ).length;

  if (loading) {
    return <p className="text-slate-600">Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">CEO Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Monitor SEO agent workflow, reports, and AI usage.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Total Tasks</p>
          <h3 className="text-3xl font-bold mt-2">{totalTasks}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Pending</p>
          <h3 className="text-3xl font-bold mt-2">{pendingTasks}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Finalized</p>
          <h3 className="text-3xl font-bold mt-2">{finalizedTasks}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Rejected</p>
          <h3 className="text-3xl font-bold mt-2">{rejectedTasks}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">AI Requests</p>
          <h3 className="text-3xl font-bold mt-2">
            {billing?.summary?.total_requests || 0}
          </h3>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border p-5">
        <h3 className="text-xl font-semibold mb-4">Recent Tasks</h3>

        {tasks.length === 0 ? (
          <p className="text-slate-500">No tasks created yet.</p>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 6).map((task) => (
              <div key={task.id} className="flex justify-between items-center border rounded-xl p-4">
                <div>
                  <h4 className="font-semibold">{task.title}</h4>
                  <p className="text-sm text-slate-500">Priority: {task.priority}</p>
                </div>

                <span className="text-sm px-3 py-1 rounded-full bg-slate-100">
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;