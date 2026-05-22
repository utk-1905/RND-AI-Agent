const supabase = require("../config/supabase");
const { runSeoAgent } = require("../agents/seo.agent");

const {
  estimateTokensFromText,
  estimateTokensFromJson,
  logAiUsage,
} = require("./usageLogger.service");

/**
 * Regenerate SEO output after CEO requests revision.
 */
const reviseSeoOutputForTask = async ({ taskId, triggered_by }) => {
  // 1. Find task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  // 2. Make sure task is in revision_requested status
  if (task.status !== "revision_requested") {
    throw new Error(
      "Task must be in revision_requested status before regenerating output."
    );
  }

  // 3. Find SEO Department
  const { data: department, error: departmentError } = await supabase
    .from("departments")
    .select("*")
    .eq("name", "SEO Department")
    .single();

  if (departmentError || !department) {
    throw new Error("SEO Department not found.");
  }

  // 4. Find SEO AI Agent
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("*")
    .eq("department_id", department.id)
    .eq("agent_type", "seo")
    .single();

  if (agentError || !agent) {
    throw new Error("SEO AI Agent not found.");
  }

  // 5. Check assignment exists
  const { data: assignment, error: assignmentError } = await supabase
    .from("task_assignments")
    .select("*")
    .eq("task_id", taskId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  if (!assignment) {
    throw new Error("Task is not assigned to SEO AI Agent.");
  }

  // 6. Get latest revision feedback from reviews table
  const { data: latestRevisionReview, error: reviewError } = await supabase
    .from("reviews")
    .select("*")
    .eq("task_id", taskId)
    .eq("decision", "revision_requested")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  if (!latestRevisionReview) {
    throw new Error("No revision feedback found for this task.");
  }

  const revisionFeedback =
    latestRevisionReview.feedback || "No specific feedback provided.";

  // 7. Update task status to in_progress
  const { error: inProgressError } = await supabase
    .from("tasks")
    .update({
      status: "in_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (inProgressError) {
    throw new Error(inProgressError.message);
  }

  // 8. Add status log: revision_requested -> in_progress
  const { error: inProgressLogError } = await supabase
    .from("task_status_logs")
    .insert([
      {
        task_id: taskId,
        old_status: "revision_requested",
        new_status: "in_progress",
        changed_by: triggered_by || "CEO",
        note: "SEO AI Agent revision started.",
      },
    ]);

  if (inProgressLogError) {
    throw new Error(inProgressLogError.message);
  }

  // 9. Run SEO Agent with revision feedback
  const revisedSeoOutput = await runSeoAgent(task, revisionFeedback);

  // 10. Save revised output
  const { data: savedOutput, error: outputError } = await supabase
    .from("agent_outputs")
    .insert([
      {
        task_id: taskId,
        agent_id: agent.id,
        output_type: "seo_revision",
        output_content: revisedSeoOutput,
        status: "draft_generated",
      },
    ])
    .select()
    .single();

  if (outputError) {
    throw new Error(outputError.message);
  }

  // 11. Log AI usage in mock mode
  const inputText = `
Task Title: ${task.title}
Task Description: ${task.description}
Priority: ${task.priority}
Revision Feedback: ${revisionFeedback}
`;

  const inputTokens = estimateTokensFromText(inputText);
  const outputTokens = estimateTokensFromJson(revisedSeoOutput);

  const usageLog = await logAiUsage({
    taskId,
    agentId: agent.id,
    model: "mock-seo-agent-v1",
    mode: process.env.AI_MODE || "mock",
    inputTokens,
    outputTokens,
    totalCostUsd: 0,
    status: "success",
  });

  // 12. Update task status back to draft_generated
  const { data: updatedTask, error: updateTaskError } = await supabase
    .from("tasks")
    .update({
      status: "draft_generated",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (updateTaskError) {
    throw new Error(updateTaskError.message);
  }

  // 13. Add status log: in_progress -> draft_generated
  const { error: draftLogError } = await supabase
    .from("task_status_logs")
    .insert([
      {
        task_id: taskId,
        old_status: "in_progress",
        new_status: "draft_generated",
        changed_by: triggered_by || "CEO",
        note: "SEO AI Agent generated revised draft output.",
      },
    ]);

  if (draftLogError) {
    throw new Error(draftLogError.message);
  }

  return {
    task: updatedTask,
    assignment,
    revision_feedback: latestRevisionReview,
    output: savedOutput,
    usage: usageLog,
  };
};

module.exports = {
  reviseSeoOutputForTask,
};