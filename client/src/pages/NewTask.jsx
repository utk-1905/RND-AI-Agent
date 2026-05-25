import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask } from "../api/taskApi";

const NewTask = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    created_by: "CEO",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage("Title and description are required.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await createTask(formData);

      const createdTaskId = response?.data?.id;

      if (!createdTaskId) {
        throw new Error("Task created, but task ID was not returned.");
      }

      navigate(`/tasks/${createdTaskId}`);
    } catch (error) {
      console.error("Create task error:", error);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to create task. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Create New Task</h2>
        <p className="text-slate-500 mt-1">
          Create a task that can later be assigned to the right department agents.
        </p>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-6 max-w-3xl">
        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Example: SEO improvement plan for RND Technosoft website"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what the Agents should analyze and generate..."
              className="w-full min-h-40 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Creating Task..." : "Create Task"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTask;