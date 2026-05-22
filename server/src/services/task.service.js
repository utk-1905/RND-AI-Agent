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

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  getFullTaskDetails,
};