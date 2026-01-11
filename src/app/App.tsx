import { useState, useEffect } from "react";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/sonner";
import { AuthPage } from "./components/auth/AuthPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { auth, db } from "../lib/firebase/config";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { getDatabase, ref, onDisconnect, set } from "firebase/database";
import { USER_ROLES } from "../utils/constants";

// Define a type that combines Firebase User with our custom fields
export interface AppUser extends User {
  role?: string;
  id?: string; // mapping uid to id for compatibility
}

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: any) => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (!auth.currentUser) return;
      const userStatusRef = doc(db, "users", auth.currentUser.uid);

      if (document.visibilityState === 'hidden') {
        inactivityTimer = setTimeout(() => {
          updateDoc(userStatusRef, { status: 'away', lastSeen: serverTimestamp() });
        }, 60 * 1000); // 1 minute
      } else {
        clearTimeout(inactivityTimer);
        updateDoc(userStatusRef, { status: 'online', lastSeen: serverTimestamp() });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cleanup previous listener if any
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = undefined;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        // --- Realtime Database for Presence ---
        const rtdb = getDatabase();
        const userStatusDatabaseRef = ref(rtdb, '/status/' + firebaseUser.uid);
        
        // Firestore and Realtime DB status update
        try {
            await updateDoc(userDocRef, {
            status: 'online',
            lastSeen: serverTimestamp()
            });
            await set(userStatusDatabaseRef, { isOnline: true });

            // Use onDisconnect for graceful offline status
            onDisconnect(userStatusDatabaseRef).set({ isOnline: false, lastSeen: serverTimestamp() });
        } catch (e) {
            console.error("Error updating status:", e);
        }

        // Listen to real-time updates for the current user profile
        let isFirstLoad = true;
        unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                
                const appUser: AppUser = {
                    ...firebaseUser,
                    role: userData.role || USER_ROLES.MEMBER,
                    bio: userData.bio || "",
                    id: firebaseUser.uid,
                    displayName: userData.displayName || firebaseUser.displayName,
                    photoURL: userData.photoURL || firebaseUser.photoURL,
                    phoneNumber: userData.phoneNumber || firebaseUser.phoneNumber,
                    ...userData 
                } as unknown as AppUser;
                
                setUser(appUser);
            }
            if (isFirstLoad) {
                setLoading(false);
                isFirstLoad = false;
            }
        }, (error) => {
            console.log("Snapshot error (expected on logout):", error.code);
            setLoading(false);
        });
        
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, displayName: string, phoneNumber?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName });

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      displayName: displayName,
      phoneNumber: phoneNumber || "",
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      role: USER_ROLES.MEMBER,
      createdAt: serverTimestamp(),
      status: 'online',
      lastSeen: serverTimestamp(),
      bio: ""
    });
  };

  const logout = async () => {
    if (auth.currentUser) {
      // Set offline status in Firestore
      const userStatusRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userStatusRef, {
        status: 'offline',
        lastSeen: serverTimestamp()
      });
      // Set offline in RTDB
      const rtdb = getDatabase();
      const userStatusDatabaseRef = ref(rtdb, '/status/' + auth.currentUser.uid);
      await set(userStatusDatabaseRef, { isOnline: false });
    }
    await signOut(auth);
    setUser(null);
  };

  const updateProfileData = async (data: any) => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, data, { merge: true });

    if (data.displayName || data.photoURL) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL
      });
    }

    setUser(prev => prev ? ({ ...prev, ...data }) : null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthContext.Provider value={{ user, login, signup, logout, updateProfileData }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/auth"
              element={user ? <Navigate to="/dashboard" /> : <AuthPage />}
            />
            <Route
              path="/dashboard/*"
              element={user ? <Dashboard /> : <Navigate to="/auth" />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? "/dashboard" : "/auth"} />}
            />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;