import { AppProvider, useApp } from './context/AppContext';
import { Auth } from './components/Auth';
import { ModernDashboard } from './components/ModernDashboard';

function AppContent() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Auth />;
  }

  return <ModernDashboard />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
