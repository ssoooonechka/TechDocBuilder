import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { Spin, ConfigProvider, App as AntdApp, Layout } from 'antd';
import useAuthStore from './store/authStores';
import useThemeStore from './store/themeStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import { useState, useEffect } from 'react';
import { setOnline } from './api/user';
import InviteJoinPage from './pages/InviteJoinPage';
import AppHeader from './components/Header/AppHeader';
import { darkTheme, lightTheme } from './themeConfig';
import WorkspacePage from './components/Workspace/Workspace';
import RoomEditorPage from './components/Workspace/RoomEditor';
import RoomAccessCheck from './components/Workspace/RoomAccessCheck';
import TemplateManager from './components/Template/TemplateManager';
import { SqlToMarkdownConverter } from './pages/Convertor';

const { Content } = Layout;

function ProtectedRoute() {
  const { token } = useAuthStore();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}

function RouterWrapper() {
  const navigate = useNavigate();
  const { token, login } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { darkMode } = useThemeStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const onlineStatus = await setOnline(token);
          if (!onlineStatus) {
            navigate('/login');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          navigate('/login');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [token, navigate]);

  if (loading) {
    return <Spin fullscreen />;
  }

  return (
    <ConfigProvider theme={darkMode ? darkTheme : lightTheme}>
      <AntdApp>
        <Routes>
          <Route path="/login" element={
            <LoginPage onLoginSuccess={(token) => {
              login(token);
              navigate('/workspace');
            }} />
          } />
          
          <Route path="/register" element={
            <RegisterPage onRegisterSuccess={(token) => {
              login(token);
              navigate('/workspace');
            }} />
          } />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            
            <Route path="/convertor" element={<SqlToMarkdownConverter />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/templates" element={<TemplateManager />} />
            <Route 
              path="/workspace/:roomId" 
              element={
                <RoomAccessCheck>
                  <RoomEditorPage />
                </RoomAccessCheck>
              } 
            />

            <Route path="/invite/:inviteToken" element={<InviteJoinPage />} />
          </Route>

          <Route 
            path="/workspace/new" 
            element={
              <RoomAccessCheck isNew={true}>
                <RoomEditorPage />
              </RoomAccessCheck>
            } 
          />

          <Route path="*" element={<Navigate to={token ? "/workspace" : "/login"} replace />} />
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RouterWrapper />
    </BrowserRouter>
  );
}

export default App;