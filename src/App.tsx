import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
import DriversPage from "./pages/DriversPage";
import DriverFormPage from "./pages/DriverFormPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import VehicleCategoriesPage from "./pages/VehicleCategoriesPage";
import VehicleFormPage from "./pages/VehicleFormPage";
import VehiclesPage from "./pages/VehiclesPage";
import ReservationsPage from "./pages/ReservationsPage";
import ReservationFormPage from "./pages/ReservationFormPage";
import ReservationDetailsPage from "./pages/ReservationDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected with layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/vehicle-categories"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <VehicleCategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <VehiclesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/new"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <VehicleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id/edit"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <VehicleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <DriversPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers/new"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <DriverFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers/:id/edit"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <DriverFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <ReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/new"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <ReservationFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/:id/edit"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <ReservationFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/:id"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <ReservationDetailsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
