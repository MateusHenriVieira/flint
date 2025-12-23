import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView, Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { recoverPassword } from '../services/authService';

const Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF6B35',
  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  border: '#333',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(''); // Estado para erro visual

  // Função para validar formato de email
  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text) && text.length > 0) {
      setEmailError("Digite um e-mail válido");
    } else {
      setEmailError("");
    }
    setEmail(text);
  };

  const handleRecover = async () => {
    if (!email || emailError) {
      Alert.alert("Atenção", "Por favor, insira um e-mail válido.");
      return;
    }

    // Fecha o teclado para melhor UX
    Keyboard.dismiss();
    setLoading(true);

    const result = await recoverPassword(email);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Email Enviado", 
        "Verifique sua caixa de entrada (e a pasta de Spam/Lixo Eletrônico). O link expira em breve.", 
        [{ text: "Voltar ao Login", onPress: () => router.back() }]
      );
    } else {
      Alert.alert("Erro", result.error);
    }
  };

  return (
    // TouchableWithoutFeedback fecha o teclado ao clicar fora
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>Digite seu e-mail para receber o link de redefinição.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Cadastrado</Text>
            
            <TextInput 
              style={[styles.input, emailError ? { borderColor: '#CF6679' } : {}]} 
              placeholder="exemplo@email.com"
              placeholderTextColor={Colors.textSecondary}
              
              // CONFIGURAÇÕES DO TECLADO
              keyboardType="email-address" // Mostra o @ e remove emojis
              autoCapitalize="none"        // Não começa com maiúscula
              autoCorrect={false}          // Desativa corretor
              returnKeyType="send"         // Botão "Enviar" no teclado
              
              value={email}
              onChangeText={validateEmail}
              onSubmitEditing={handleRecover} // Envia ao dar Enter no teclado
            />
            
            {/* Mensagem de Erro abaixo do input */}
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleRecover} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Enviar Link</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 30, zIndex: 10, padding: 10 },
  
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 8 },

  form: { width: '100%' },
  label: { color: Colors.textSecondary, marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: { 
    backgroundColor: Colors.surface, color: Colors.text, padding: 15, borderRadius: 12, 
    borderWidth: 1, borderColor: Colors.border, marginBottom: 10, fontSize: 16 
  },
  errorText: { color: '#CF6679', fontSize: 12, marginBottom: 10, marginLeft: 5 },
  
  button: {
    backgroundColor: Colors.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10,
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});