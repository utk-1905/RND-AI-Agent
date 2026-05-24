import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Tasks from "./pages/Tasks";
import NewTask from "./pages/NewTask";
import Billing from "./pages/Billing";
import TaskDetail from "./pages/TaskDetail";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/new" element={<NewTask />} />
        <Route path="/tasks/:taskId" element={<TaskDetail />} />
        <Route path="/billing" element={<Billing />} />
      </Route>
    </Routes>
  );
};

export default App;