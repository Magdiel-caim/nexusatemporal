import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import ChatPage from './pages/ChatPage';
import AgendaPage from './pages/AgendaPage';
import ProntuariosPage from './pages/ProntuariosPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Navigate to="/dashboard" replace />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LeadsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ChatPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AgendaPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/prontuarios"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProntuariosPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/financeiro"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Financeiro</h2>
                    <p className="text-gray-600">Em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/estoque"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Estoque</h2>
                    <p className="text-gray-600">Em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/colaboracao"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Colaboração</h2>
                    <p className="text-gray-600">Em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bi"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">BI & Analytics</h2>
                    <p className="text-gray-600">Em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Marketing</h2>
                    <p className="text-gray-600">Em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Configurações</h2>
                    <p className="text-gray-600">Em desenvolvimento...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
