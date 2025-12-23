// === models/index.ts ===

// Padronização de resposta dos serviços (Auth, Notes, etc)
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Modelo de Nota
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags?: string[];
  isArchived?: boolean;
  isDeleted?: boolean;
  reminderDay?: number;
  createdAt?: any;
  updatedAt?: any;
}

// Modelo de Usuário (opcional para futuro uso no Firestore)
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: any;
}