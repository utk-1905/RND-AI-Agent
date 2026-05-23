import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getBillingUsage } from "../api/billingApi";

const Billing = () => {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getBillingUsage();
      setBillingData(response.data);
    } catch (error) {
      console.error("Billing load error:", error);
      setErrorMessage("Failed to load billing usage. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const summary = billingData?.summary || {};
  const modelWiseUsage = billingData?.model_wise_usage || [];
  const agentWiseUsage = billingData?.agent_wise_usage || [];
  const recentLogs = billingData?.recent_logs || [];

  if (loading) {
    return <p className="text-slate-500">Loading billing usage...</p>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold">Billing Usage</h2>
          <p className="text-slate-500 mt-1">
            Track AI/mock usage, tokens, model usage, and estimated cost.
          </p>
        </div>

        <button
          onClick={loadBillingData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {errorMessage}
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={summary.total_requests || 0} />
        <StatCard label="Successful" value={summary.successful_requests || 0} />
        <StatCard label="Failed" value={summary.failed_requests || 0} />
        <StatCard label="Estimated Cost $" value={summary.total_cost_usd || 0} />
      </div>

      <div className="grid md:grid-cols-4 gap-4 mt-4">
        <StatCard label="Input Tokens" value={summary.total_input_tokens || 0} />
        <StatCard label="Output Tokens" value={summary.total_output_tokens || 0} />
        <StatCard label="Total Tokens" value={summary.total_tokens || 0} />
        <StatCard label="Today's Tokens" value={summary.today_tokens || 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h3 className="text-xl font-semibold">Model-wise Usage</h3>
          <p className="text-sm text-slate-500 mt-1">
            Usage grouped by AI model or mock model.
          </p>

          <div className="mt-4 overflow-x-auto">
            {modelWiseUsage.length === 0 ? (
              <p className="text-slate-500">No model usage found.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3">Requests</th>
                    <th className="px-4 py-3">Tokens</th>
                    <th className="px-4 py-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {modelWiseUsage.map((item) => (
                    <tr key={item.model} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium">{item.model}</td>
                      <td className="px-4 py-3">{item.requests}</td>
                      <td className="px-4 py-3">{item.total_tokens}</td>
                      <td className="px-4 py-3">${item.total_cost_usd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h3 className="text-xl font-semibold">Agent-wise Usage</h3>
          <p className="text-sm text-slate-500 mt-1">
            Usage grouped by department agent.
          </p>

          <div className="mt-4 overflow-x-auto">
            {agentWiseUsage.length === 0 ? (
              <p className="text-slate-500">No agent usage found.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Requests</th>
                    <th className="px-4 py-3">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {agentWiseUsage.map((item) => (
                    <tr key={item.agent_name} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium">{item.agent_name}</td>
                      <td className="px-4 py-3">{item.agent_type}</td>
                      <td className="px-4 py-3">{item.requests}</td>
                      <td className="px-4 py-3">{item.total_tokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-5 mt-6">
        <h3 className="text-xl font-semibold">Recent AI Usage Logs</h3>
        <p className="text-sm text-slate-500 mt-1">
          Latest AI/mock calls recorded by the system.
        </p>

        <div className="mt-4 overflow-x-auto">
          {recentLogs.length === 0 ? (
            <p className="text-slate-500">No recent usage logs found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Input</th>
                  <th className="px-4 py-3">Output</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-medium">{log.model}</td>
                    <td className="px-4 py-3">{log.mode}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{log.input_tokens}</td>
                    <td className="px-4 py-3">{log.output_tokens}</td>
                    <td className="px-4 py-3">{log.total_tokens}</td>
                    <td className="px-4 py-3">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-slate-950 text-white p-5">
        <h3 className="text-lg font-semibold">Note</h3>
        <p className="text-sm text-slate-300 mt-2">
          Current usage is based on mock SEO Agent runs. When Claude is added,
          this page will show real model usage and estimated cost.
        </p>
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

export default Billing;