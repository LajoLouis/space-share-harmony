import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  AuthStore, 
  LoginCredentials, 
  RegisterData, 
  VerificationData,
  ForgotPasswordData,
  ResetPasswordData,
  User
} from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(credentials);
          
          if (response.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            toast.success('Login successful! Welcome back.');
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(data);
          
          if (response.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            toast.success('Registration successful! Welcome to LajoSpaces.');
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: () => {
        set({ isLoading: true });
        
        try {
          authService.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          toast.success('Logged out successfully');
        } catch (error: any) {
          console.error('Logout error:', error);
          // Still clear the state even if API call fails
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      verifyEmail: async (data: VerificationData) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.verifyEmail(data);
          
          // Update user verification status
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, isEmailVerified: true },
              isLoading: false,
            });
          }
          
          toast.success('Email verified successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Email verification failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      verifyPhone: async (data: VerificationData) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.verifyPhone(data);
          
          // Update user verification status
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, isPhoneVerified: true },
              isLoading: false,
            });
          }
          
          toast.success('Phone number verified successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Phone verification failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      forgotPassword: async (data: ForgotPasswordData) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.forgotPassword(data);
          set({ isLoading: false });
          
          toast.success('Password reset instructions sent to your email/phone');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset instructions';
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      resetPassword: async (data: ResetPasswordData) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.resetPassword(data);
          set({ isLoading: false });
          
          toast.success('Password reset successfully! Please login with your new password.');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const response = await authService.refreshToken();
          
          if (response.success) {
            set({
              token: response.data.token,
              error: null,
            });
          }
        } catch (error: any) {
          console.error('Token refresh failed:', error);
          // Force logout on refresh failure
          get().logout();
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuthStatus: async () => {
        set({ isLoading: true });
        
        try {
          const user = await authService.checkAuthStatus();
          
          if (user) {
            set({
              user,
              token: authService.getStoredToken(),
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          console.error('Auth status check failed:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'auth-store',
      // Only store non-sensitive data in devtools
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        user: state.user ? {
          id: state.user.id,
          email: state.user.email,
          firstName: state.user.firstName,
          lastName: state.user.lastName,
          role: state.user.role,
        } : null,
      }),
    }
  )
);

// Selectors for common use cases
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
  };
};

export const useAuthActions = () => {
  const store = useAuthStore();
  return {
    login: store.login,
    register: store.register,
    logout: store.logout,
    verifyEmail: store.verifyEmail,
    verifyPhone: store.verifyPhone,
    forgotPassword: store.forgotPassword,
    resetPassword: store.resetPassword,
    clearError: store.clearError,
    checkAuthStatus: store.checkAuthStatus,
  };
};
