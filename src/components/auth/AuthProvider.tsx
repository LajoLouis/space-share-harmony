import React, { useEffect, useState } from 'react';
import { useAuth, useSessionManagement, useTokenExpiration } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  fallback 
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { checkAuthStatus } = useAuth();

  // Initialize session management and token expiration handling
  useSessionManagement();
  useTokenExpiration();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize auth service and check for existing session
        const user = await authService.initialize();
        
        if (user) {
          // Update the auth store with the current user
          await checkAuthStatus();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear any invalid auth data
        authService.logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [checkAuthStatus]);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">LajoSpaces</h2>
              <p className="text-sm text-gray-600">Initializing your session...</p>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

// Auth status indicator component
export const AuthStatusIndicator: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking auth...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span>Not authenticated</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span>Authenticated as {user?.firstName}</span>
    </div>
  );
};

// Development-only auth debug component
export const AuthDebugPanel: React.FC = () => {
  const { user, isAuthenticated, token, isLoading, error } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>Token: {token ? '✅' : '❌'}</div>
        <div>User: {user ? `${user.firstName} ${user.lastName}` : 'None'}</div>
        <div>Role: {user?.role || 'None'}</div>
        <div>Email Verified: {user?.isEmailVerified ? '✅' : '❌'}</div>
        <div>Phone Verified: {user?.isPhoneVerified ? '✅' : '❌'}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
      </div>
    </div>
  );
};
