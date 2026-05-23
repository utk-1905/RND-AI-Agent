import { useParams, Link } from "react-router-dom";

const TaskDetail = () => {
  const { taskId } = useParams();

  return (
    <div>
      <Link to="/tasks" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to Tasks
      </Link>

      <div className="mt-6">
        <h2 className="text-3xl font-bold">Task Detail</h2>
        <p className="text-slate-500 mt-1">
          Full workflow page will be built next.
        </p>

        <div className="mt-6 bg-white border rounded-2xl p-5">
          <p className="text-sm text-slate-500">Task ID</p>
          <p className="font-mono text-sm mt-2">{taskId}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;