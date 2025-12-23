import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { registerUser } from '../services/authService';

const Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF6B35',
  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  border: '#333',
};

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert("Sucesso", "Conta criada! Bem-vindo ao Flint.", [
        { text: "OK", onPress: () => router.replace('/') }
      ]);
    } else {
      Alert.alert("Erro", result.error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se ao Flint e organize suas ideias.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Seu nome"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            placeholder="exemplo@email.com"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Mínimo 6 caracteres" 
            placeholderTextColor={Colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}> Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, padding: 30, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 30, zIndex: 10 },
  
  header: { marginBottom: 40, marginTop: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 8 },

  form: { width: '100%' },
  label: { color: Colors.textSecondary, marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: { 
    backgroundColor: Colors.surface, color: Colors.text, padding: 15, borderRadius: 12, 
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20, fontSize: 16 
  },
  
  button: {
    backgroundColor: Colors.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10,
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 5
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  linkText: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 }
});