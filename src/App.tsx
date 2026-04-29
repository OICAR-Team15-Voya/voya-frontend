import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import DriversPage from './pages/DriversPage';
import DriverFormPage from './pages/DriverFormPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

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
            path="/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <DriversPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers/new"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <DriverFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers/:id/edit"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <DriverFormPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;