import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert, Keyboard,
    KeyboardAvoidingView, Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { loginUser } from '../services/authService';

const Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF6B35',
  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  border: '#333',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Na web, não forçamos o dismiss do teclado para evitar conflitos de foco
    if (Platform.OS !== 'web') Keyboard.dismiss();

    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      router.replace('/'); 
    } else {
      Alert.alert("Erro de Login", result.error);
    }
  };

  // === CORREÇÃO CRÍTICA ===
  // 1. O 'as any' resolve o erro do TypeScript "does not have construct signatures".
  // 2. Usamos View na Web para não "roubar" o clique do input.
  // 3. Usamos Touchable no Mobile para fechar o teclado ao tocar fora.
  const MainContainer = (Platform.OS === 'web' ? View : TouchableWithoutFeedback) as any;
  
  const containerProps = Platform.OS === 'web' 
    ? { style: { flex: 1 } } 
    : { onPress: Keyboard.dismiss };

  return (
    <MainContainer {...containerProps}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* O estilo condicional 'webContent' impede que o form fique gigante no PC */}
        <View style={[styles.content, Platform.OS === 'web' && styles.webContent]}>
          <View style={styles.header}>
            <Ionicons name="flame" size={60} color={Colors.primary} />
            <Text style={styles.appName}>Flint</Text>
            <Text style={styles.subtitle}>Sua produtividade, organizada.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="exemplo@email.com"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput 
              style={styles.input} 
              placeholder="••••••••" 
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              style={styles.forgotButton} 
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta?</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.linkText}> Crie agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </MainContainer>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background, 
    justifyContent: 'center',
    alignItems: 'center' // Centraliza tudo na tela
  },
  content: { 
    padding: 30, 
    width: '100%' // No celular ocupa tudo
  },
  webContent: { 
    maxWidth: 480, // No PC limita a largura para parecer um card elegante
    width: '100%',
    alignSelf: 'center'
  },
  header: { alignItems: 'center', marginBottom: 40 },
  appName: { fontSize: 40, fontWeight: 'bold', color: Colors.text, marginTop: 10 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 5 },
  form: { width: '100%' },
  label: { color: Colors.textSecondary, marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: { 
    backgroundColor: Colors.surface, 
    color: Colors.text, 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginBottom: 20, 
    fontSize: 16,
    // Remove o brilho azul padrão do navegador no input
    ...Platform.select({
      web: { outlineStyle: 'none' } as any
    })
  },
  forgotButton: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: Colors.textSecondary, fontSize: 14 },
  button: { backgroundColor: Colors.primary, padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: Colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  linkText: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 }
});