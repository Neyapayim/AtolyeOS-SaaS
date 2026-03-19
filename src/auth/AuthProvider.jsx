import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth.js';

const AuthContext = createContext(null);

/**
 * AuthProvider: Tüm uygulamayı sarar, auth state'i sağlar.
 */
export function AuthProvider({ children }) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuthContext: Auth state'ine erişim hook'u.
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
