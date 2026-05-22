const supabase = require("../config/supabase");

/**
 * Simple token estimator for mock mode.
 * This is not real Claude token counting.
 * It gives us an approximate count so billing workflow can be tested.
 */
const estimateTokensFromText = (text = "") => {
  if (!text || typeof text !== "string") {
    return 0;
  }

  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};

/**
 * Estimate tokens from JSON output.
 */
const estimateTokensFromJson = (jsonData = {}) => {
  const jsonString = JSON.stringify(jsonData);
  return estimateTokensFromText(jsonString);
};

/**
 * Save AI usage log in database.
 */
const logAiUsage = async ({
  taskId,
  agentId,
  model,
  mode,
  inputTokens,
  outputTokens,
  totalCostUsd,
  status,
  errorMessage,
}) => {
  const totalTokens = (inputTokens || 0) + (outputTokens || 0);

  const { data, error } = await supabase
    .from("ai_usage_logs")
    .insert([
      {
        task_id: taskId,
        agent_id: agentId,
        model: model || "mock-seo-agent",
        mode: mode || "mock",
        input_tokens: inputTokens || 0,
        output_tokens: outputTokens || 0,
        total_tokens: totalTokens,
        total_cost_usd: totalCostUsd || 0,
        status: status || "success",
        error_message: errorMessage || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  estimateTokensFromText,
  estimateTokensFromJson,
  logAiUsage,
};