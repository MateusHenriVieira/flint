import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export interface Note {
  id: string;
  userId: string; // ID do usuário dono da nota
  title: string;
  content: string;
  tags?: string[];
  isArchived?: boolean;
  isDeleted?: boolean;
  reminderDay?: number;
  createdAt?: any;
  updatedAt?: any;
}

// === LEITURA (Filtrada por Usuário) ===
export const subscribeToNotes = (callback: (notes: Note[]) => void) => {
  const user = auth.currentUser;

  // Segurança: Se não tem usuário, retorna lista vazia
  if (!user) {
    callback([]);
    return () => {};
  }

  const collectionRef = collection(db, 'notes');
  
  // Query: Traz apenas notas onde userId == ID do usuário logado
  const q = query(
    collectionRef, 
    where("userId", "==", user.uid),
    orderBy('updatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notesList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Note));
    callback(notesList);
  }, (error) => {
    console.error("Erro no subscribeToNotes:", error);
  });

  return unsubscribe;
};

// === ESCRITA ===
export const saveNote = async (data: Partial<Note>) => {
  const user = auth.currentUser;
  if (!user) return false; // Bloqueia salvamento sem login

  try {
    await addDoc(collection(db, 'notes'), {
      ...data,
      userId: user.uid, // Associa a nota ao usuário atual
      isArchived: false,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.error("Erro ao salvar nota:", e);
    return false;
  }
};

export const updateNote = async (id: string, data: Partial<Note>) => {
  try {
    const noteRef = doc(db, 'notes', id);
    await updateDoc(noteRef, { ...data, updatedAt: serverTimestamp() });
    return true;
  } catch (e) {
    console.error("Erro ao atualizar nota:", e);
    return false;
  }
};

// === GERENCIAMENTO DE ESTADOS (Lixeira/Arquivo) ===

// Soft Delete (Mover para Lixeira)
export const moveToTrash = async (id: string) => {
  return await updateNote(id, { isDeleted: true });
};

// Restaurar da Lixeira
export const restoreFromTrash = async (id: string) => {
  return await updateNote(id, { isDeleted: false, isArchived: false });
};

// Hard Delete (Apagar do Banco)
export const deleteNotePermanently = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'notes', id));
    return true;
  } catch (e) {
    console.error("Erro ao deletar permanentemente:", e);
    return false;
  }
};

export const toggleArchiveNote = async (id: string, currentStatus: boolean) => {
  return await updateNote(id, { isArchived: !currentStatus });
};