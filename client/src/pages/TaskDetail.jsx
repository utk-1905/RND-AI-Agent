import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  assignSeoTask,
  downloadReportUrl,
  finalizeTask,
  getFullTaskDetails,
  reviewTask,
  reviseSeoOutput,
  runSeoAgent,
} from "../api/taskApi";

const statusClass = {
  created: "bg-slate-100 text-slate-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  draft_generated: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  revision_requested: "bg-orange-100 text-orange-700",
  rejected: "bg-red-100 text-red-700",
  finalized: "bg-emerald-100 text-emerald-700",
};

const TaskDetail = () => {
  const { taskId } = useParams();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");

  const loadDetails = async () => {
    try {
      setLoading(true);
      const response = await getFullTaskDetails(taskId);
      setDetails(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load task details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [taskId]);

  const runAction = async (actionFn, successMessage) => {
    try {
      setActionLoading(true);
      setMessage("");

      await actionFn();
      setMessage(successMessage);
      await loadDetails();
    } catch (error) {
      console.error(error);
      setMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Action failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => {
    runAction(
      () =>
        reviewTask(taskId, {
          reviewed_by: "CEO",
          decision: "approved",
          feedback: feedback || "SEO draft approved.",
        }),
      "Task approved successfully."
    );
  };

  const handleRevisionRequest = () => {
    runAction(
      () =>
        reviewTask(taskId, {
          reviewed_by: "CEO",
          decision: "revision_requested",
          feedback:
            feedback ||
            "Please improve this SEO output with more specific suggestions.",
        }),
      "Revision requested successfully."
    );
  };

  const handleReject = () => {
    runAction(
      () =>
        reviewTask(taskId, {
          reviewed_by: "CEO",
          decision: "rejected",
          feedback: feedback || "Output rejected by CEO.",
        }),
      "Task rejected successfully."
    );
  };

  if (loading) {
    return <p className="text-slate-500">Loading task details...</p>;
  }

  if (!details) {
    return <p className="text-red-600">Task details not found.</p>;
  }

  const { task, assignment, latest_output, reviews, usage, report, status_logs } =
    details;

  const output = latest_output?.output_content;

  return (
    <div>
      <Link to="/tasks" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to Tasks
      </Link>

      <div className="mt-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">{task.title}</h2>
          <p className="text-slate-500 mt-2 max-w-3xl">{task.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                statusClass[task.status] || "bg-slate-100 text-slate-700"
              }`}
            >
              {task.status}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-white border">
              Priority: {task.priority}
            </span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 min-w-64">
          <p className="text-sm text-slate-500">Assigned Agent</p>
          <h3 className="font-semibold mt-1">
            {assignment?.agents?.agent_name || "Not assigned"}
          </h3>
          <p className="text-sm text-slate-500">
            {assignment?.departments?.name || "No department"}
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-5 rounded-xl border bg-white px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="mt-6 bg-white border rounded-2xl p-5">
        <h3 className="text-xl font-semibold">Workflow Actions</h3>
        <p className="text-sm text-slate-500 mt-1">
          Control the SEO Agent workflow for this task.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {task.status === "created" && (
            <button
              disabled={actionLoading}
              onClick={() =>
                runAction(
                  () => assignSeoTask(taskId),
                  "Task assigned to SEO Agent."
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-950 text-white disabled:opacity-50"
            >
              Confirm SEO Department
            </button>
          )}

          {task.status === "assigned" && (
            <button
              disabled={actionLoading}
              onClick={() =>
                runAction(
                  () => runSeoAgent(taskId),
                  "SEO Agent generated draft output."
                )
              }
              className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
            >
              Run SEO Agent
            </button>
          )}

          {task.status === "draft_generated" && (
            <>
              <button
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-green-600 text-white disabled:opacity-50"
              >
                Approve
              </button>

              <button
                disabled={actionLoading}
                onClick={handleRevisionRequest}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white disabled:opacity-50"
              >
                Request Revision
              </button>

              <button
                disabled={actionLoading}
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-red-600 text-white disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}

          {task.status === "revision_requested" && (
            <button
              disabled={actionLoading}
              onClick={() =>
                runAction(
                  () => reviseSeoOutput(taskId),
                  "SEO Agent revised the output."
                )
              }
              className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-50"
            >
              Regenerate Revised Output
            </button>
          )}

          {task.status === "approved" && (
            <button
              disabled={actionLoading}
              onClick={() =>
                runAction(
                  () => finalizeTask(taskId),
                  "Final PDF report generated."
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-950 text-white disabled:opacity-50"
            >
              Generate Final Report
            </button>
          )}

          {task.status === "finalized" && report && (
            <a
              href={downloadReportUrl(taskId)}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
            >
              Download PDF Report
            </a>
          )}
        </div>

        {(task.status === "draft_generated" ||
          task.status === "revision_requested") && (
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="CEO feedback for approval/revision/rejection..."
            className="mt-4 w-full min-h-28 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-300"
          />
        )}
      </div>

      {output && (
        <div className="mt-6 bg-white border rounded-2xl p-5">
          <h3 className="text-xl font-semibold">Latest SEO Output</h3>
          <p className="mt-3 text-slate-700">{output.seo_summary}</p>

          <div className="grid lg:grid-cols-2 gap-5 mt-5">
            <OutputList title="Target Keywords" items={output.target_keywords} />
            <OutputList
              title="On-Page Suggestions"
              items={output.on_page_suggestions}
            />
            <OutputList
              title="Technical SEO"
              items={output.technical_seo_suggestions}
            />
            <OutputList title="Content Strategy" items={output.content_strategy} />
            <OutputList title="AEO Suggestions" items={output.aeo_suggestions} />
            <OutputList title="GEO Suggestions" items={output.geo_suggestions} />
            <OutputList
              title="LLM Optimization"
              items={output.llm_optimization_suggestions}
            />
            <OutputList title="Next Steps" items={output.next_steps} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="text-xl font-semibold">CEO Reviews</h3>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-slate-500">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border rounded-xl p-3">
                  <p className="font-medium">{review.decision}</p>
                  <p className="text-sm text-slate-500">{review.feedback}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <h3 className="text-xl font-semibold">AI Usage</h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <InfoBox label="Requests" value={usage?.summary?.total_requests || 0} />
            <InfoBox label="Tokens" value={usage?.summary?.total_tokens || 0} />
            <InfoBox label="Cost $" value={usage?.summary?.total_cost_usd || 0} />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border rounded-2xl p-5">
        <h3 className="text-xl font-semibold">Status Timeline</h3>
        <div className="mt-4 space-y-3">
          {status_logs.map((log) => (
            <div key={log.id} className="border-l-4 border-slate-300 pl-4">
              <p className="font-medium">
                {log.old_status || "start"} → {log.new_status}
              </p>
              <p className="text-sm text-slate-500">{log.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OutputList = ({ title, items = [] }) => {
  return (
    <div className="border rounded-xl p-4">
      <h4 className="font-semibold mb-2">{title}</h4>
      {items?.length ? (
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No data available.</p>
      )}
    </div>
  );
};

const InfoBox = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 border p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-bold mt-1">{value}</p>
    </div>
  );
};

export default TaskDetail;