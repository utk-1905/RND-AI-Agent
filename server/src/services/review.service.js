const supabase = require("../config/supabase");

/**
 * Review a task output as CEO.
 */
const reviewTask = async ({ taskId, reviewed_by, decision, feedback }) => {
  // 1. Validate allowed review decisions
  const allowedDecisions = ["approved", "rejected", "revision_requested"];

  if (!allowedDecisions.includes(decision)) {
    throw new Error(
      "Invalid decision. Use approved, rejected, or revision_requested."
    );
  }

  // 2. Find task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  // 3. Make sure task has agent output before review
  const { data: latestOutput, error: outputError } = await supabase
    .from("agent_outputs")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (outputError) {
    throw new Error(outputError.message);
  }

  if (!latestOutput) {
    throw new Error("No agent output found for this task. Run SEO Agent first.");
  }

  // 4. Decide new task status
  let newStatus = "";

  if (decision === "approved") {
    newStatus = "approved";
  }

  if (decision === "rejected") {
    newStatus = "rejected";
  }

  if (decision === "revision_requested") {
    newStatus = "revision_requested";
  }

  // 5. Save review decision
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .insert([
      {
        task_id: taskId,
        reviewed_by: reviewed_by || "CEO",
        decision,
        feedback: feedback || null,
      },
    ])
    .select()
    .single();

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  // 6. Update task status
  const { data: updatedTask, error: updateTaskError } = await supabase
    .from("tasks")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (updateTaskError) {
    throw new Error(updateTaskError.message);
  }

  // 7. Add status log
  const { error: logError } = await supabase.from("task_status_logs").insert([
    {
      task_id: taskId,
      old_status: task.status,
      new_status: newStatus,
      changed_by: reviewed_by || "CEO",
      note:
        decision === "revision_requested"
          ? `CEO requested revision: ${feedback || "No feedback provided."}`
          : `CEO review decision: ${decision}`,
    },
  ]);

  if (logError) {
    throw new Error(logError.message);
  }

  return {
    task: updatedTask,
    review,
    latest_output: latestOutput,
  };
};

module.exports = {
  reviewTask,
};