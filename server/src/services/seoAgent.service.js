const supabase = require("../config/supabase");
const { runSeoAgent } = require("../agents/seo.agent");

/**
 * Run SEO Agent for a specific assigned task.
 */
const runSeoAgentForTask = async ({ taskId, triggered_by }) => {
  // 1. Find task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  // 2. Find SEO Department
  const { data: department, error: departmentError } = await supabase
    .from("departments")
    .select("*")
    .eq("name", "SEO Department")
    .single();

  if (departmentError || !department) {
    throw new Error("SEO Department not found.");
  }

  // 3. Find SEO AI Agent
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("*")
    .eq("department_id", department.id)
    .eq("agent_type", "seo")
    .single();

  if (agentError || !agent) {
    throw new Error("SEO AI Agent not found.");
  }

  // 4. Check task assignment
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

  // 5. Update task status to in_progress
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

  // 6. Add status log: old status -> in_progress
  const { error: inProgressLogError } = await supabase
    .from("task_status_logs")
    .insert([
      {
        task_id: taskId,
        old_status: task.status,
        new_status: "in_progress",
        changed_by: triggered_by || "CEO",
        note: "SEO AI Agent execution started.",
      },
    ]);

  if (inProgressLogError) {
    throw new Error(inProgressLogError.message);
  }

  // 7. Run SEO Agent mock output
  const seoOutput = await runSeoAgent(task);

  // 8. Save output in agent_outputs table
  const { data: savedOutput, error: outputError } = await supabase
    .from("agent_outputs")
    .insert([
      {
        task_id: taskId,
        agent_id: agent.id,
        output_type: "seo_analysis",
        output_content: seoOutput,
        status: "draft_generated",
      },
    ])
    .select()
    .single();

  if (outputError) {
    throw new Error(outputError.message);
  }

  // 9. Update task status to draft_generated
  const { data: updatedTask, error: finalTaskError } = await supabase
    .from("tasks")
    .update({
      status: "draft_generated",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (finalTaskError) {
    throw new Error(finalTaskError.message);
  }

  // 10. Add status log: in_progress -> draft_generated
  const { error: draftLogError } = await supabase
    .from("task_status_logs")
    .insert([
      {
        task_id: taskId,
        old_status: "in_progress",
        new_status: "draft_generated",
        changed_by: triggered_by || "CEO",
        note: "SEO AI Agent generated draft output.",
      },
    ]);

  if (draftLogError) {
    throw new Error(draftLogError.message);
  }

  return {
    task: updatedTask,
    assignment,
    output: savedOutput,
  };
};

module.exports = {
  runSeoAgentForTask,
};