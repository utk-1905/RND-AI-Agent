const supabase = require("../config/supabase");

/**
 * Create a new task in the database.
 */
const createTask = async ({ title, description, priority, created_by }) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        title,
        description,
        priority: priority || "medium",
        status: "created",
        created_by: created_by || "CEO",
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Fetch all tasks from the database.
 */
const getAllTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Fetch one task by its ID.
 */
const getTaskById = async (taskId) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Fetch full task details for frontend task detail page.
 */
const getFullTaskDetails = async (taskId) => {
  // 1. Fetch task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  // 2. Fetch assignment with department and agent
  const { data: assignment, error: assignmentError } = await supabase
    .from("task_assignments")
    .select(`
      *,
      departments (
        id,
        name,
        description,
        status
      ),
      agents (
        id,
        agent_name,
        agent_type,
        status
      )
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  // 3. Fetch all outputs
  const { data: outputs, error: outputsError } = await supabase
    .from("agent_outputs")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (outputsError) {
    throw new Error(outputsError.message);
  }

  const allOutputs = outputs || [];
  const latestOutput = allOutputs.length > 0 ? allOutputs[0] : null;

  // 4. Fetch reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    throw new Error(reviewsError.message);
  }

  // 5. Fetch AI usage logs
  const { data: usageLogs, error: usageError } = await supabase
    .from("ai_usage_logs")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (usageError) {
    throw new Error(usageError.message);
  }

  // 6. Fetch latest report
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .eq("task_id", taskId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reportError) {
    throw new Error(reportError.message);
  }

  // 7. Fetch status logs
  const { data: statusLogs, error: statusLogsError } = await supabase
    .from("task_status_logs")
    .select("*")
    .eq("task_id", taskId)
    .order("changed_at", { ascending: true });

  if (statusLogsError) {
    throw new Error(statusLogsError.message);
  }

  // 8. Usage summary for this task
  const totalTokens = (usageLogs || []).reduce(
    (sum, log) => sum + Number(log.total_tokens || 0),
    0
  );

  const totalCostUsd = (usageLogs || []).reduce(
    (sum, log) => sum + Number(log.total_cost_usd || 0),
    0
  );

  return {
    task,
    assignment,
    latest_output: latestOutput,
    all_outputs: allOutputs,
    reviews: reviews || [],
    usage: {
      summary: {
        total_requests: usageLogs?.length || 0,
        total_tokens: totalTokens,
        total_cost_usd: Number(totalCostUsd.toFixed(6)),
      },
      logs: usageLogs || [],
    },
    report,
    status_logs: statusLogs || [],
  };
};

/**
 * Archive a task.
 * This keeps all task data safe but marks it as archived.
 */
const archiveTask = async ({ taskId, changed_by }) => {
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  if (task.status === "in_progress") {
    throw new Error("Cannot archive a task while it is in progress.");
  }

  if (task.status === "archived") {
    return task;
  }

  const { data: updatedTask, error: updateError } = await supabase
    .from("tasks")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: logError } = await supabase.from("task_status_logs").insert([
    {
      task_id: taskId,
      old_status: task.status,
      new_status: "archived",
      changed_by: changed_by || "CEO",
      note: "Task archived.",
    },
  ]);

  if (logError) {
    throw new Error(logError.message);
  }

  return updatedTask;
};

/**
 * Restore an archived task.
 * Restored task goes back to draft_generated by default if it has output,
 * otherwise it goes back to created.
 */
const restoreTask = async ({ taskId, changed_by }) => {
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  if (task.status !== "archived") {
    throw new Error("Only archived tasks can be restored.");
  }

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

  const restoredStatus = latestOutput ? "draft_generated" : "created";

  const { data: updatedTask, error: updateError } = await supabase
    .from("tasks")
    .update({
      status: restoredStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: logError } = await supabase.from("task_status_logs").insert([
    {
      task_id: taskId,
      old_status: "archived",
      new_status: restoredStatus,
      changed_by: changed_by || "CEO",
      note: "Task restored from archive.",
    },
  ]);

  if (logError) {
    throw new Error(logError.message);
  }

  return updatedTask;
};

/**
 * Permanently delete a task.
 * This should be used only for test/duplicate/wrong tasks.
 * If AI usage exists, deletion is blocked to protect billing accuracy.
 */
const permanentlyDeleteTask = async (taskId) => {
  // 1. Check task exists
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  // 2. Check if AI usage logs exist
  const { data: usageLogs, error: usageError } = await supabase
    .from("ai_usage_logs")
    .select("id")
    .eq("task_id", taskId);

  if (usageError) {
    throw new Error(usageError.message);
  }

  if (usageLogs && usageLogs.length > 0) {
    throw new Error(
      "This task has AI usage logs. Archive it instead to preserve billing records."
    );
  }

  // 3. Only delete if no AI usage exists
  const { error: deleteError } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return task;
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  getFullTaskDetails,
  archiveTask,
  restoreTask,
  permanentlyDeleteTask,
};