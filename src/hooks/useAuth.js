import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isConfigured } from '../config/firebase.js';

/**
 * useAuth: Firebase Authentication + Firestore profil hook'u.
 * 3 adımlı güvenlik: (1) Auth (2) E-posta onayı (3) Onboarding
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);       // Firestore users/{uid}
  const [profileLoading, setProfileLoading] = useState(true); // true basla → profil okunana kadar bekle

  // Auth state listener
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Profil yükle (user değişince)
  useEffect(() => {
    if (!isConfigured || !user) {
      setProfile(null);
      setProfileLoading(false); // user yoksa bekletme
      return;
    }
    let cancelled = false;
    setProfileLoading(true);
    getDoc(doc(db, "users", user.uid))
      .then(snap => {
        if (!cancelled) setProfile(snap.exists() ? snap.data() : null);
      })
      .catch(() => { if (!cancelled) setProfile(null); })
      .finally(() => { if (!cancelled) setProfileLoading(false); });
    return () => { cancelled = true; };
  }, [user?.uid]);

  const login = async (email, password) => {
    if (!isConfigured) { setError("Firebase yapılandırılmamış"); return; }
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  const register = async (email, password) => {
    if (!isConfigured) { setError("Firebase yapılandırılmamış"); return; }
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Kayıt sonrası e-posta doğrulama maili gönder
      await sendEmailVerification(cred.user);
    } catch (e) {
      setError(e.message);
    }
  };

  const loginWithGoogle = async () => {
    if (!isConfigured) { setError("Firebase yapılandırılmamış"); return; }
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError(e.message);
    }
  };

  const logout = async () => {
    if (!isConfigured) return;
    try {
      await signOut(auth);
      setProfile(null);
    } catch (e) {
      setError(e.message);
    }
  };

  // E-posta doğrulama mailini tekrar gönder
  const resendVerification = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // Kullanıcıyı yeniden yükle (emailVerified durumunu güncellemek için)
  const reloadUser = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.reload();
      // Yükleme ekranını kısaca tetikleyerek React'i zorla güncelle
      setLoading(true);
      setUser(auth.currentUser);
      setTimeout(() => setLoading(false), 50);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // Onboarding tamamlandığında Firestore'a profil kaydet
  const completeOnboarding = useCallback(async (data) => {
    if (!isConfigured || !auth.currentUser) return;
    try {
      const profileData = {
        ...data,
        email: auth.currentUser.email,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", auth.currentUser.uid), profileData, { merge: true });
      setProfile(profileData);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  return {
    user, loading, error, profile, profileLoading,
    login, register, loginWithGoogle, logout,
    resendVerification, reloadUser, completeOnboarding,
    isConfigured,
  };
}
