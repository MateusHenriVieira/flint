import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function Layout() {
  
  // Hack para Web: Garante altura total
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.body.style.height = '100%';
      document.documentElement.style.height = '100%';
      // Remove barra de rolagem lateral indesejada
      document.body.style.overflowY = 'scroll'; 
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Removemos o 'content' que limitava a largura. Agora o Stack ocupa tudo. */}
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Cor de fundo do app (não mais preto)
    // Removemos alignItems: 'center' e maxWidth
  },
});