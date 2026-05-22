const supabase = require("../config/supabase");

/**
 * Get overall AI usage summary.
 */
const getOverallUsageSummary = async () => {
  const { data: usageLogs, error } = await supabase
    .from("ai_usage_logs")
    .select(`
      *,
      tasks (
        id,
        title,
        status
      ),
      agents (
        id,
        agent_name,
        agent_type
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const logs = usageLogs || [];

  const totalRequests = logs.length;

  const totalInputTokens = logs.reduce(
    (sum, log) => sum + Number(log.input_tokens || 0),
    0
  );

  const totalOutputTokens = logs.reduce(
    (sum, log) => sum + Number(log.output_tokens || 0),
    0
  );

  const totalTokens = logs.reduce(
    (sum, log) => sum + Number(log.total_tokens || 0),
    0
  );

  const totalCostUsd = logs.reduce(
    (sum, log) => sum + Number(log.total_cost_usd || 0),
    0
  );

  const successfulRequests = logs.filter((log) => log.status === "success").length;
  const failedRequests = logs.filter((log) => log.status === "failed").length;

  const today = new Date().toISOString().slice(0, 10);

  const todayLogs = logs.filter((log) => {
    if (!log.created_at) return false;
    return log.created_at.slice(0, 10) === today;
  });

  const todayTokens = todayLogs.reduce(
    (sum, log) => sum + Number(log.total_tokens || 0),
    0
  );

  const todayCostUsd = todayLogs.reduce(
    (sum, log) => sum + Number(log.total_cost_usd || 0),
    0
  );

  const modelWiseUsage = {};

  logs.forEach((log) => {
    const model = log.model || "unknown";

    if (!modelWiseUsage[model]) {
      modelWiseUsage[model] = {
        model,
        requests: 0,
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
        total_cost_usd: 0,
      };
    }

    modelWiseUsage[model].requests += 1;
    modelWiseUsage[model].input_tokens += Number(log.input_tokens || 0);
    modelWiseUsage[model].output_tokens += Number(log.output_tokens || 0);
    modelWiseUsage[model].total_tokens += Number(log.total_tokens || 0);
    modelWiseUsage[model].total_cost_usd += Number(log.total_cost_usd || 0);
  });

  const agentWiseUsage = {};

  logs.forEach((log) => {
    const agentName = log.agents?.agent_name || "Unknown Agent";

    if (!agentWiseUsage[agentName]) {
      agentWiseUsage[agentName] = {
        agent_name: agentName,
        agent_type: log.agents?.agent_type || "unknown",
        requests: 0,
        total_tokens: 0,
        total_cost_usd: 0,
      };
    }

    agentWiseUsage[agentName].requests += 1;
    agentWiseUsage[agentName].total_tokens += Number(log.total_tokens || 0);
    agentWiseUsage[agentName].total_cost_usd += Number(log.total_cost_usd || 0);
  });

  return {
    summary: {
      total_requests: totalRequests,
      successful_requests: successfulRequests,
      failed_requests: failedRequests,
      total_input_tokens: totalInputTokens,
      total_output_tokens: totalOutputTokens,
      total_tokens: totalTokens,
      total_cost_usd: Number(totalCostUsd.toFixed(6)),
      today_requests: todayLogs.length,
      today_tokens: todayTokens,
      today_cost_usd: Number(todayCostUsd.toFixed(6)),
    },
    model_wise_usage: Object.values(modelWiseUsage),
    agent_wise_usage: Object.values(agentWiseUsage),
    recent_logs: logs.slice(0, 10),
  };
};

/**
 * Get AI usage logs for one task.
 */
const getUsageByTaskId = async (taskId) => {
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  const { data: logs, error } = await supabase
    .from("ai_usage_logs")
    .select(`
      *,
      agents (
        id,
        agent_name,
        agent_type
      )
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const usageLogs = logs || [];

  const totalTokens = usageLogs.reduce(
    (sum, log) => sum + Number(log.total_tokens || 0),
    0
  );

  const totalCostUsd = usageLogs.reduce(
    (sum, log) => sum + Number(log.total_cost_usd || 0),
    0
  );

  return {
    task,
    summary: {
      total_requests: usageLogs.length,
      total_tokens: totalTokens,
      total_cost_usd: Number(totalCostUsd.toFixed(6)),
    },
    logs: usageLogs,
  };
};

module.exports = {
  getOverallUsageSummary,
  getUsageByTaskId,
};