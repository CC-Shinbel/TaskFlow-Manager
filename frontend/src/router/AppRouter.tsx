import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage.tsx";
import RegisterPage from "../pages/RegisterPage.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";
import TaskListPage from "../pages/TaskListPage.tsx";
import CreateTaskPage from "../pages/CreateTaskPage.tsx";
import EditTaskPage from "../pages/EditTaskPage.tsx";
import ProtectedRoute from "../components/ProtectedRoute.tsx";
import AppLayout from "../layouts/AppLayout";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TaskListPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks/create"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateTaskPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EditTaskPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;