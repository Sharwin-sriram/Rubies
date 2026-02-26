import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated and not on public pages
    if (!loading && !isAuthenticated) {
      const publicPaths = ['/login', '/register', '/', '/shop', '/products'];
      const isPublicPath = publicPaths.some(path => 
        location.pathname === path || location.pathname.startsWith(path)
      );
      
      if (!isPublicPath) {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  return <>{children}</>;
};

export default AuthWrapper;
