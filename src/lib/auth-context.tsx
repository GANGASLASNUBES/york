import React, { createContext, useContext } from 'react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const signOut = async () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useConvexAuth() {
  return useContext(AuthContext) || { signOut: () => {} };
}
