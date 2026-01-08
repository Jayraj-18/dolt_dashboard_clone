import { useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

const App = () => {
  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-background">
          <RouterProvider router={router} />
          <Toaster />
        </div>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;