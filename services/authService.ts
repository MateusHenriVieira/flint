import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { ServiceResponse } from '../models'; // Importando do arquivo central de modelos

// === LOGIN COM EMAIL E SENHA ===
export const loginUser = async (email: string, pass: string): Promise<ServiceResponse> => {
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: formatError(error.code) };
  }
};

// === CADASTRO (Cria conta e define o Nome) ===
export const registerUser = async (name: string, email: string, pass: string): Promise<ServiceResponse> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Atualiza o perfil do usuário com o Nome fornecido
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: name
      });
    }

    return { success: true, data: userCredential.user };
  } catch (error: any) {
    return { success: false, error: formatError(error.code) };
  }
};

// === RECUPERAÇÃO DE SENHA (Envia Email Real) ===
export const recoverPassword = async (email: string): Promise<ServiceResponse> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: formatError(error.code) };
  }
};

// === LOGIN COM GOOGLE ===
export const loginWithGoogleCredential = async (idToken: string): Promise<ServiceResponse> => {
  try {
    // Cria uma credencial do Firebase usando o token recebido do Google (Expo)
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: formatError(error.code) };
  }
};

// === LOGOUT ===
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao sair:", error);
  }
};

// === OBSERVADOR DE ESTADO (Sessão) ===
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// === UTILITÁRIO: PEGAR USUÁRIO ATUAL ===
export const getCurrentUser = () => auth.currentUser;

// === HELPER: TRADUTOR DE ERROS (Enterprise UX) ===
const formatError = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está sendo usado em outra conta.';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/user-not-found':
      return 'Nenhum usuário encontrado com este e-mail.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas falhas. Aguarde um momento e tente novamente.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet.';
    case 'auth/credential-already-in-use':
      return 'Esta credencial já está associada a outra conta.';
    case 'auth/invalid-credential':
      return 'Credencial inválida ou expirada.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
};