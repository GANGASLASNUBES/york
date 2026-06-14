export const getAuthUser = () => null;
export const logout = () => {};
export const useAuth = () => ({
  user: null,
  loading: false,
  updateMicrosoftServices: async (data?: any) => ({ error: null }),
  profile: null,
  connectMicrosoft: async (email?: string, name?: string) => ({ error: null }),
  disconnectMicrosoft: async () => ({ error: null }),
  signIn: async (email?: string, password?: string) => ({ error: null }),
  signUp: async (email?: string, password?: string, name?: string) => ({ error: null }),
  signOut: async () => ({ error: null }),
});
export const useConvexAuth = () => ({
  isAuthenticated: false,
  isLoading: false,
  signInWithPassword: async (creds?: any) => {},
  signUpWithPassword: async (creds?: any) => {},
});
