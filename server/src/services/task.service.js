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

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
};