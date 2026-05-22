const supabase = require("../config/supabase");

/**
 * Assign a task to a department agent.
 * For now, we assign specifically to SEO AI Agent.
 */
const assignTaskToSeoAgent = async ({ taskId, assigned_by }) => {
  // 1. Check if task exists
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  // 2. Get SEO Department
  const { data: department, error: departmentError } = await supabase
    .from("departments")
    .select("*")
    .eq("name", "SEO Department")
    .single();

  if (departmentError || !department) {
    throw new Error("SEO Department not found.");
  }

  // 3. Get SEO AI Agent
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("*")
    .eq("department_id", department.id)
    .eq("agent_type", "seo")
    .single();

  if (agentError || !agent) {
    throw new Error("SEO AI Agent not found.");
  }

  // 4. Check if task is already assigned to this agent
  const { data: existingAssignment, error: existingError } = await supabase
    .from("task_assignments")
    .select("*")
    .eq("task_id", taskId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingAssignment) {
    return {
      assignment: existingAssignment,
      task,
      message: "Task is already assigned to SEO AI Agent.",
    };
  }

  // 5. Create assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from("task_assignments")
    .insert([
      {
        task_id: taskId,
        department_id: department.id,
        agent_id: agent.id,
        assigned_by: assigned_by || "CEO",
        status: "assigned",
      },
    ])
    .select()
    .single();

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  // 6. Update task status to assigned
  const { data: updatedTask, error: updateTaskError } = await supabase
    .from("tasks")
    .update({
      status: "assigned",
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
      new_status: "assigned",
      changed_by: assigned_by || "CEO",
      note: "Task assigned to SEO AI Agent.",
    },
  ]);

  if (logError) {
    throw new Error(logError.message);
  }

  return {
    assignment,
    task: updatedTask,
    message: "Task assigned to SEO AI Agent successfully.",
  };
};

module.exports = {
  assignTaskToSeoAgent,
};