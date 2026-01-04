import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Index() {
  const { user, isLoading } = useAuth();   // 🟢 hook must run always
  const navigate = useNavigate();          // 🟢 hook must run always

  const MAIN_URL =
    import.meta.env.VITE_PUBLIC_FRONTEND_MAIN_URL

  // 🟢 useEffect must run before any conditional return
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role) {
        navigate(`/${user.role}`);
      } else {
        console.error("User has no role, redirecting to login");
        navigate("/login");
      }
    }
  }, [user, isLoading, navigate]);

  // 🟡 Now conditional returns AFTER hooks

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    window.location.replace(MAIN_URL);
    return null; // prevent rendering
  }

  return null;
}

export default Index;
