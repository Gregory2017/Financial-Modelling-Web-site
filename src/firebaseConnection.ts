import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  getDocFromServer,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { CryptoDiaryEntry, UserSession, OperationType, FirestoreErrorInfo } from './types';
import firebaseConfig from './firebase-applet-config.json';

// Detect if Firebase setup is fully populated at runtime
export const isFirebaseActive = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5);

let forceLocal = localStorage.getItem('fs_modelling_force_local') === 'true';

export function getFirebaseActive(): boolean {
  return isFirebaseActive && !forceLocal;
}

export function setForceLocal(val: boolean) {
  forceLocal = val;
  localStorage.setItem('fs_modelling_force_local', String(val));
  if (val) {
    if (auth) {
      try { firebaseSignOut(auth); } catch {}
    }
    triggerAuthCallbacks(currentLocalSession);
  } else {
    if (auth && auth.currentUser) {
      triggerAuthCallbacks({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || "",
        isLocal: false,
        nickname: auth.currentUser.email?.split('@')[0] || "User"
      });
    } else {
      triggerAuthCallbacks(null);
    }
  }
}

let app: any = null;
export let auth: any = null;
export let db: any = null;

if (isFirebaseActive) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

    // Warm connection check as required by Firebase skill guidelines
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration: Client is offline.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("Failed to initialize Firebase SDK:", err);
  }
}

// Global Custom Firestore Error Handler matching SKILL requirements
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Central local storage fallbacks state triggers
const authCallbacks: Array<(session: UserSession | null) => void> = [];

function triggerAuthCallbacks(session: UserSession | null) {
  authCallbacks.forEach(cb => cb(session));
}

// Initialize active session from LocalStorage wrapper if Firebase is disabled
let currentLocalSession: UserSession | null = null;
if (!isFirebaseActive || forceLocal) {
  const saved = localStorage.getItem('fs_modelling_session');
  if (saved) {
    try {
      currentLocalSession = JSON.parse(saved);
    } catch {
      currentLocalSession = null;
    }
  }
}

// Global Auth listener
export function subscribeToAuth(callback: (session: UserSession | null) => void) {
  authCallbacks.push(callback);
  
  if (getFirebaseActive() && auth) {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const email = firebaseUser.email || "";
        let nickname = email.split('@')[0];
        
        // Return default nickname first
        callback({
          uid,
          email,
          isLocal: false,
          nickname
        });

        // Try load verified nickname in Firestore
        if (db) {
          try {
            const userSnap = await getDocFromServer(doc(db, 'users', uid));
            if (userSnap.exists()) {
              const data = userSnap.data();
              if (data?.nickname) {
                nickname = data.nickname;
                callback({
                  uid,
                  email,
                  isLocal: false,
                  nickname
                });
              }
            }
          } catch (dbErr) {
            console.warn("Couldn't enrich user auth session with nickname:", dbErr);
          }
        }
      } else {
        callback(null);
      }
    });
    return unsubscribe;
  } else {
    // Return mock subscription trigger
    callback(currentLocalSession);
    return () => {
      const idx = authCallbacks.indexOf(callback);
      if (idx > -1) authCallbacks.splice(idx, 1);
    };
  }
}

// Actions: Sign Up
export async function signUp(email: string, pass: string, nickname?: string): Promise<UserSession> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanNickname = (nickname || email.split('@')[0]).trim() || "User";
  
  if (getFirebaseActive() && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const uid = userCredential.user.uid;
      
      // Save profile metadata inside Firestore
      if (db) {
        try {
          await setDoc(doc(db, 'users', uid), {
            uid,
            email: cleanEmail,
            nickname: cleanNickname,
            updatedAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.error("Signed up successfully, but failed to save user document to Firestore:", dbErr);
        }
      }

      return {
        uid,
        email: cleanEmail,
        isLocal: false,
        nickname: cleanNickname
      };
    } catch (err: any) {
      throw new Error(err.message || "Registration failed. Try database settings.");
    }
  } else {
    // LocalStorage Fallback Authentication Flow
    const usersRaw = localStorage.getItem('fs_modelling_users') || "{}";
    const users = JSON.parse(usersRaw);
    
    if (users[cleanEmail]) {
      throw new Error("This email is already registered locally.");
    }
    
    const uid = 'local_usr_' + Math.random().toString(36).substring(2, 9);
    users[cleanEmail] = { password: pass, uid, nickname: cleanNickname };
    localStorage.setItem('fs_modelling_users', JSON.stringify(users));
    
    const session: UserSession = { uid, email: cleanEmail, isLocal: true, nickname: cleanNickname };
    currentLocalSession = session;
    localStorage.setItem('fs_modelling_session', JSON.stringify(session));
    triggerAuthCallbacks(session);
    return session;
  }
}

// Actions: Sign In
export async function signIn(email: string, pass: string): Promise<UserSession> {
  const cleanEmail = email.trim().toLowerCase();
  
  if (getFirebaseActive() && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const uid = userCredential.user.uid;
      
      // Try to load custom nickname/profile
      let nickname = cleanEmail.split('@')[0];
      if (db) {
        try {
          const userSnap = await getDocFromServer(doc(db, 'users', uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data?.nickname) {
              nickname = data.nickname;
            }
          }
        } catch (dbErr) {
          console.warn("Signed in, but could not load profile document:", dbErr);
        }
      }

      return {
        uid,
        email: cleanEmail,
        isLocal: false,
        nickname
      };
    } catch (err: any) {
      throw new Error(err.message || "Authentication credentials invalid.");
    }
  } else {
    // LocalStorage Fallback Flow
    const usersRaw = localStorage.getItem('fs_modelling_users') || "{}";
    const users = JSON.parse(usersRaw);
    
    const matchedUser = users[cleanEmail];
    if (!matchedUser || matchedUser.password !== pass) {
      throw new Error("Invalid password or username combination.");
    }
    
    const nickname = matchedUser.nickname || cleanEmail.split('@')[0];
    const session: UserSession = { uid: matchedUser.uid, email: cleanEmail, isLocal: true, nickname };
    currentLocalSession = session;
    localStorage.setItem('fs_modelling_session', JSON.stringify(session));
    triggerAuthCallbacks(session);
    return session;
  }
}

// Actions: Sign Out
export async function signOut(): Promise<void> {
  if (getFirebaseActive() && auth) {
    await firebaseSignOut(auth);
  } else {
    currentLocalSession = null;
    localStorage.removeItem('fs_modelling_session');
    triggerAuthCallbacks(null);
  }
}

// Actions: Password Recovery / Reset
export async function recoverPassword(email: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Please enter an email address to recover credentials.");
  }

  if (getFirebaseActive() && auth) {
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return `Password reset email has been dispatched by Firebase Console! Inspect your inbox at ${cleanEmail} for instructions.`;
    } catch (err: any) {
      throw new Error(err.message || "Failed to trigger Firebase reset email.");
    }
  } else {
    const usersRaw = localStorage.getItem('fs_modelling_users') || "{}";
    const users = JSON.parse(usersRaw);
    const matchedUser = users[cleanEmail];
    
    if (!matchedUser) {
      throw new Error("No sandbox record found with this email. Register credentials first!");
    }
    
    return `[Local Environment Success] We found your sandbox configuration profile! Stored pass: "${matchedUser.password}"`;
  }
}

// Database Actions: Fetch entries for current user
export async function fetchEntries(userId: string): Promise<CryptoDiaryEntry[]> {
  if (getFirebaseActive() && db) {
    const path = `users/${userId}/entries`;
    try {
      const querySnap = await getDocs(collection(db, path));
      const entries: CryptoDiaryEntry[] = [];
      querySnap.forEach((docSnap) => {
        const rawData = docSnap.data();
        let createdAtStr = new Date().toISOString();
        let updatedAtStr = new Date().toISOString();

        if (rawData.createdAt) {
          if (typeof rawData.createdAt.toDate === "function") {
            createdAtStr = rawData.createdAt.toDate().toISOString();
          } else if (typeof rawData.createdAt === "string") {
            createdAtStr = rawData.createdAt;
          }
        }
        if (rawData.updatedAt) {
          if (typeof rawData.updatedAt.toDate === "function") {
            updatedAtStr = rawData.updatedAt.toDate().toISOString();
          } else if (typeof rawData.updatedAt === "string") {
            updatedAtStr = rawData.updatedAt;
          }
        }

        entries.push({
          id: docSnap.id,
          ...rawData,
          createdAt: createdAtStr,
          updatedAt: updatedAtStr
        } as CryptoDiaryEntry);
      });
      // Sort by date descending
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  } else {
    // LocalStorage Fallback Database Loader
    const rawKeys = localStorage.getItem(`fs_modelling_entries_${userId}`) || "[]";
    try {
      const parsed: CryptoDiaryEntry[] = JSON.parse(rawKeys);
      return parsed.sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }
}

// Database Actions: Save/Create single entry
export async function saveEntry(userId: string, entry: Partial<CryptoDiaryEntry>): Promise<CryptoDiaryEntry> {
  const timestamp = new Date().toISOString();
  const entryId = entry.id || 'entry_' + Math.random().toString(36).substring(2, 11);
  
  const fullEntry: CryptoDiaryEntry = {
    id: entryId,
    userId,
    date: entry.date || new Date().toISOString().split('T')[0],
    cryptoName: entry.cryptoName || "BTC-USD",
    closePrice: entry.closePrice || "0",
    ema50: entry.ema50 || "",
    ema200: entry.ema200 || "",
    sma50: entry.sma50 || "",
    sma200: entry.sma200 || "",
    macd: entry.macd || "",
    rsi: entry.rsi || "",
    hillEstimator: entry.hillEstimator || "",
    createdAt: entry.createdAt || timestamp,
    updatedAt: timestamp
  };

  if (getFirebaseActive() && db) {
    const path = `users/${userId}/entries`;
    try {
      const firestorePayload: any = {
        userId,
        date: entry.date || new Date().toISOString().split('T')[0],
        cryptoName: (entry.cryptoName || "BTC-USD").toUpperCase(),
        closePrice: entry.closePrice || "0",
        ema50: entry.ema50 || "",
        ema200: entry.ema200 || "",
        sma50: entry.sma50 || "",
        sma200: entry.sma200 || "",
        macd: entry.macd || "",
        rsi: entry.rsi || "",
        hillEstimator: entry.hillEstimator || "",
        createdAt: entry.createdAt ? Timestamp.fromDate(new Date(entry.createdAt)) : serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      // Set single doc
      await setDoc(doc(db, path, entryId), firestorePayload);
      return fullEntry;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${entryId}`);
      throw error;
    }
  } else {
    // Storage Fallback Engine
    const entries = await fetchEntries(userId);
    const existingIndex = entries.findIndex(e => e.id === entryId);
    
    if (existingIndex > -1) {
      entries[existingIndex] = fullEntry;
    } else {
      entries.push(fullEntry);
    }
    
    localStorage.setItem(`fs_modelling_entries_${userId}`, JSON.stringify(entries));
    return fullEntry;
  }
}

// Database Actions: Delete single entry
export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  if (getFirebaseActive() && db) {
    const path = `users/${userId}/entries/${entryId}`;
    try {
      await deleteDoc(doc(db, `users/${userId}/entries`, entryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  } else {
    const entries = await fetchEntries(userId);
    const filtered = entries.filter(e => e.id !== entryId);
    localStorage.setItem(`fs_modelling_entries_${userId}`, JSON.stringify(filtered));
  }
}
