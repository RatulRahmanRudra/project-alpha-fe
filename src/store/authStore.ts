import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { apiClient, UserStatus } from '../utils/api';

interface AuthState {
  user: User | null;
  userStatus: UserStatus | null;
  isLoading: boolean;
  googleIdToken: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setUserStatus: (status: UserStatus) => void;
  setGoogleIdToken: (token: string | null) => void;
  initializeAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserStatus: () => Promise<void>;

}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userStatus: null,
      isLoading: true,
      googleIdToken: localStorage.getItem('googleIdToken'),

      setUser: (user) => set({ user }),
      
      setUserStatus: (status) => set({ userStatus: status }),
      
      setGoogleIdToken: (token) => {
        if (token) {
          localStorage.setItem('googleIdToken', token);
        } else {
          localStorage.removeItem('googleIdToken');
        }
        set({ googleIdToken: token });
      },

      initializeAuth: () => {
        onAuthStateChanged(auth, async (user) => {
          set({ user, isLoading: false });
          
          if (user) {
            try {
              // Get ID token for API authentication
              const idToken = await user.getIdToken();
              get().setGoogleIdToken(idToken);
              
              // Get user status from API
              await get().refreshUserStatus();
            } catch (error) {
              console.error('Error getting user token:', error);
            }
          } else {
            get().setGoogleIdToken(null);
            set({ userStatus: null });
          }
        });
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true });
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          
          // Get ID token
          const idToken = await result.user.getIdToken();
          get().setGoogleIdToken(idToken);
          
          // Get user status
          await get().refreshUserStatus();
        } catch (error) {
          console.error('Google sign-in error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await auth.signOut();
          get().setGoogleIdToken(null);
          set({ 
            user: null, 
            userStatus: null 
          });
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },

      refreshUserStatus: async () => {
        try {
          const guestToken = localStorage.getItem('guestToken');
          const status = await apiClient.getUserStatus(guestToken || undefined);
          get().setUserStatus(status);
        } catch (error) {
          console.error('Error refreshing user status:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        googleIdToken: state.googleIdToken 
      }),
    }
  )
);

// Selectors for easier access
export const useAuthStatus = () => {
  const user = useAuthStore(state => state.user);
  const userStatus = useAuthStore(state => state.userStatus);
  
  const isAuthenticated = user !== null && userStatus?.user_type === 'authenticated';
  const hasCredits = userStatus?.user_type === 'authenticated' && (userStatus.credits || 0) > 0;
  const freeAttemptsRemaining = userStatus?.user_type === 'guest' ? (userStatus.free_attempts_remaining || 0) : 0;
  
  return {
    isAuthenticated,
    hasCredits,
    freeAttemptsRemaining,
    userType: userStatus?.user_type,
    credits: userStatus?.credits,
  };
};