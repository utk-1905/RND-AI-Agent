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

const statusLabel = {
  created: "Awaiting Department Confirmation",
  assigned: "Assigned to SEO Agent",
  in_progress: "SEO Agent Working",
  draft_generated: "Draft Ready for CEO Review",
  approved: "Approved by CEO",
  revision_requested: "Revision Requested",
  rejected: "Rejected by CEO",
  finalized: "Final Report Generated",
};

const getWorkflowHint = (status) => {
  switch (status) {
    case "created":
      return "Confirm the SEO Department to assign this task and automatically generate the first SEO draft.";
    case "assigned":
      return "This task is assigned but the SEO draft has not been generated yet. Continue generation.";
    case "in_progress":
      return "The SEO Agent is currently working on this task.";
    case "draft_generated":
      return "The SEO draft is ready. Review it and choose approve, request revision, or reject.";
    case "revision_requested":
      return "CEO feedback has been saved. Generate a revised SEO draft using the feedback.";
    case "approved":
      return "The SEO draft is approved. Generate the final downloadable PDF report.";
    case "finalized":
      return "The final report has been generated. You can download the PDF report.";
    case "rejected":
      return "This task has been rejected. No further action is required.";
    default:
      return "Manage the SEO Agent workflow for this task.";
  }
};

const getMessageClass = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("failed") || lowerMessage.includes("error")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    lowerMessage.includes("success") ||
    lowerMessage.includes("generated") ||
    lowerMessage.includes("approved") ||
    lowerMessage.includes("confirmed")
  ) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  return "border-slate-200 bg-white text-slate-700";
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
      setFeedback("");
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

  const handleConfirmAndGenerate = () => {
    runAction(async () => {
      await assignSeoTask(taskId);
      await runSeoAgent(taskId);
    }, "SEO Department confirmed and draft generated successfully.");
  };

  const handleApprove = () => {
    runAction(
      () =>
        reviewTask(taskId, {
          reviewed_by: "CEO",
          decision: "approved",
          feedback: feedback || "SEO draft approved by CEO.",
        }),
      "SEO draft approved successfully."
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
      "Revision request saved successfully."
    );
  };

  const handleReject = () => {
    runAction(
      () =>
        reviewTask(taskId, {
          reviewed_by: "CEO",
          decision: "rejected",
          feedback: feedback || "SEO output rejected by CEO.",
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
  const readableStatus = statusLabel[task.status] || task.status;

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
              className={`text-xs font-medium px-3 py-1 rounded-full ${statusClass[task.status] || "bg-slate-100 text-slate-700"
                }`}
            >
              {readableStatus}
            </span>

            <span className="text-xs font-medium px-3 py-1 rounded-full bg-white border">
              Priority: {task.priority}
            </span>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 min-w-64">
          <p className="text-sm text-slate-500">Assigned Agent</p>
          <h3 className="font-semibold mt-1">
            {assignment?.agents?.agent_name || "Not assigned yet"}
          </h3>
          <p className="text-sm text-slate-500">
            {assignment?.departments?.name || "No department confirmed"}
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${getMessageClass(
            message
          )}`}
        >
          {message}
        </div>
      )}

      <div className="mt-6 bg-white border rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Workflow Control</h3>
            <p className="text-sm text-slate-500 mt-1">
              {getWorkflowHint(task.status)}
            </p>
          </div>

          <span
            className={`text-xs font-medium px-3 py-1 rounded-full w-fit ${statusClass[task.status] || "bg-slate-100 text-slate-700"
              }`}
          >
            {readableStatus}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {task.status === "created" && (
            <button
              disabled={actionLoading}
              onClick={handleConfirmAndGenerate}
              className="px-4 py-2 rounded-xl bg-slate-950 text-white disabled:opacity-50"
            >
              {actionLoading
                ? "Confirming & Generating..."
                : "Confirm SEO Department & Generate Draft"}
            </button>
          )}

          {task.status === "assigned" && (
            <button
              disabled={actionLoading}
              onClick={() =>
                runAction(
                  () => runSeoAgent(taskId),
                  "SEO draft generated successfully."
                )
              }
              className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
            >
              {actionLoading ? "Generating..." : "Continue Draft Generation"}
            </button>
          )}

          {task.status === "draft_generated" && (
            <>
              <button
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-green-600 text-white disabled:opacity-50"
              >
                Approve Draft
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
                Reject Draft
              </button>
            </>
          )}

          {task.status === "revision_requested" && (
            <button
              disabled={actionLoading}
              onClick={() =>
                runAction(
                  () => reviseSeoOutput(taskId),
                  "Revised SEO draft generated successfully."
                )
              }
              className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-50"
            >
              {actionLoading ? "Regenerating..." : "Generate Revised Draft"}
            </button>
          )}

          {task.status === "approved" && (
            <button
              disabled={actionLoading}
              onClick={() =>
                runAction(
                  () => finalizeTask(taskId),
                  "Final PDF report generated successfully."
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-950 text-white disabled:opacity-50"
            >
              {actionLoading ? "Generating Report..." : "Generate Final Report"}
            </button>
          )}

          {task.status === "finalized" && report && (
            <a
              href={downloadReportUrl(taskId)}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
            >
              Download Final PDF Report
            </a>
          )}

          {task.status === "rejected" && (
            <div className="px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200">
              Task closed after CEO rejection.
            </div>
          )}
        </div>

        {(task.status === "draft_generated" ||
          task.status === "revision_requested") && (
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                task.status === "revision_requested"
                  ? "Optional note before regenerating the revised draft..."
                  : "Write CEO feedback before approving, requesting revision, or rejecting..."
              }
              className="mt-4 w-full min-h-28 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-300"
            />
          )}
      </div>

      {output && (
        <div className="mt-6 bg-white border rounded-2xl p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">Latest SEO Output</h3>
              <p className="text-sm text-slate-500 mt-1">
                Generated by SEO AI Agent in mock mode.
              </p>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {latest_output?.output_type}
            </span>
          </div>

          <p className="mt-4 text-slate-700">{output.seo_summary}</p>
          {output.task_category && (
            <div className="mt-3">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                Task Category: {output.task_category}
              </span>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-5 mt-5">
            {output.seo_analysis && (
              <>
                <OutputList title="SEO Audit Plan" items={output.seo_audit_plan} />
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
              </>
            )}

            {output.content_generation && (
              <div className="lg:col-span-2 border rounded-xl p-4 bg-slate-50">
                <h4 className="font-semibold mb-3">Content Generation</h4>

                <div className="space-y-4 text-sm text-slate-700">
                  <div>
                    <p className="font-medium text-slate-900">Blog Title</p>
                    <p>{output.content_generation.blog_title}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-slate-900">Meta Title</p>
                      <p>{output.content_generation.meta_title}</p>
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">Slug</p>
                      <p className="font-mono text-xs">
                        {output.content_generation.slug}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-slate-900">Meta Description</p>
                    <p>{output.content_generation.meta_description}</p>
                  </div>

                  <OutputList
                    title="Content Target Keywords"
                    items={output.content_generation.target_keywords}
                  />

                  <OutputList
                    title="Blog Outline"
                    items={output.content_generation.blog_outline}
                  />

                  <div>
                    <p className="font-medium text-slate-900 mb-2">Full Blog Content</p>
                    <p className="whitespace-pre-line leading-7">
                      {output.content_generation.full_blog_content}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-slate-900 mb-2">FAQ Section</p>
                    <div className="space-y-3">
                      {output.content_generation.faq_section?.map((faq, index) => (
                        <div key={index} className="bg-white border rounded-xl p-3">
                          <p className="font-medium">{faq.question}</p>
                          <p className="text-slate-600 mt-1">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <OutputList
                    title="Internal Linking Suggestions"
                    items={output.content_generation.internal_linking_suggestions}
                  />

                  <div className="bg-white border rounded-xl p-3">
                    <p className="font-medium text-slate-900">CTA</p>
                    <p className="text-slate-600 mt-1">{output.content_generation.cta}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="text-xl font-semibold">CEO Review History</h3>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-slate-500">No CEO review has been submitted yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border rounded-xl p-3">
                  <p className="font-medium">{review.decision}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {review.feedback || "No feedback provided."}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <h3 className="text-xl font-semibold">AI Usage</h3>
          <p className="text-sm text-slate-500 mt-1">
            Mock usage now. Claude usage will appear here later.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <InfoBox label="Requests" value={usage?.summary?.total_requests || 0} />
            <InfoBox label="Tokens" value={usage?.summary?.total_tokens || 0} />
            <InfoBox label="Cost $" value={usage?.summary?.total_cost_usd || 0} />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border rounded-2xl p-5">
        <h3 className="text-xl font-semibold">Workflow Timeline</h3>
        <p className="text-sm text-slate-500 mt-1">
          Every status change is recorded for tracking and demo clarity.
        </p>

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