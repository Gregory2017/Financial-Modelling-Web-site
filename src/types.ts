export interface UserSession {
  uid: string;
  email: string;
  isLocal: boolean;
  nickname?: string;
}

export interface CryptoDiaryEntry {
  id: string;
  userId: string;
  date: string;
  cryptoName: string;
  closePrice: string;
  ema50: string;
  ema200: string;
  sma50: string;
  sma200: string;
  macd: string;
  rsi: string;
  hillEstimator: string;
  createdAt: string; // ISO String or serialized
  updatedAt?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}
