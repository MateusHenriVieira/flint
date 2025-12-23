import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Markdown from 'react-native-markdown-display';

// Serviços
import { moveToTrash, saveNote, toggleArchiveNote, updateNote } from '../services/notesService';
import { registerForPushNotificationsAsync, scheduleMonthlyReminder } from '../services/notificationService';

const Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: '#E0E0E0',
  textSecondary: '#A0A0A0',
  primary: '#FF6B35',
  danger: '#CF6679',
  border: '#2C2C2C',
  overlay: 'rgba(0,0,0,0.5)',
};

export default function EditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Estados de Dados
  const noteId = params.id as string;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState(''); 
  const [isArchived, setIsArchived] = useState(false);
  
  const [reminderDay, setReminderDay] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // UI States
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();

    if (noteId) {
      setTitle(params.title as string || '');
      setContent(params.content as string || '');
      const tagsParam = params.tags ? String(params.tags) : ''; 
      setTags(tagsParam);
      const archivedParam = params.isArchived === 'true';
      setIsArchived(archivedParam);

      if (params.reminderDay) {
        const day = Number(params.reminderDay);
        if (!isNaN(day)) setReminderDay(day);
      }
    }
  }, [noteId]);

  // === AÇÕES ===

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');

    const noteData = {
      title,
      content,
      tags: tagsArray,
      isArchived,
      reminderDay: reminderDay ?? undefined 
    };

    if (reminderDay) {
      try {
        await scheduleMonthlyReminder(
          `Lembrete: ${title || 'Nota'}`,
          `Verificar nota do dia ${reminderDay}.`,
          reminderDay
        );
      } catch (error) { console.warn(error); }
    }

    let success = false;
    if (noteId) {
      success = await updateNote(noteId, noteData);
    } else {
      success = await saveNote(noteData);
    }
    
    setIsSaving(false);
    if (success) router.back();
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert("Mover para Lixeira", "Você poderá restaurar esta nota depois.", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Mover", 
        style: "destructive", 
        onPress: async () => {
          await moveToTrash(noteId);
          router.back();
        }
      }
    ]);
  };

  const handleArchive = async () => {
    setShowMenu(false);
    await toggleArchiveNote(noteId, isArchived);
    setIsArchived(!isArchived); 
  };

  const handleShare = async () => {
    setShowMenu(false);
    try {
      const messageToShare = `${title || 'Sem Título'}\n\n${content || ''}`.trim();
      if (!messageToShare) {
        Alert.alert("Atenção", "A nota está vazia.");
        return;
      }
      await Share.share({
        message: messageToShare,
        title: title || 'Nota Flint',
      });
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  };

  // === RENDERIZAÇÃO ===
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <Stack.Screen 
        options={{
          headerTitle: "", 
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                <Text style={[styles.saveButton, isSaving && { opacity: 0.5 }]}>
                  {isSaving ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>

              {noteId && (
                <>
                  <View style={{ width: 15 }} /> 
                  <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
                    <Ionicons name="ellipsis-vertical" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ),
        }} 
      />

      {/* Modal Menu */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={Colors.textPrimary} />
              <Text style={styles.menuText}>Compartilhar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
              <Ionicons name={isArchived ? "refresh-outline" : "archive-outline"} size={20} color={Colors.textPrimary} />
              <Text style={styles.menuText}>{isArchived ? "Desarquivar" : "Arquivar"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              <Text style={[styles.menuText, { color: Colors.danger }]}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* Metadados */}
        <View style={styles.metaContainer}>
          <TextInput
            style={styles.tagsInput}
            placeholder="Tags..."
            placeholderTextColor={Colors.textSecondary}
            value={tags}
            onChangeText={setTags}
            autoCapitalize="none"
          />
          
          <TouchableOpacity 
            style={[
              styles.metaButton, 
              // Estilo condicional corrigido para visibilidade
              { 
                borderColor: reminderDay ? Colors.primary : Colors.border,
                backgroundColor: reminderDay ? 'rgba(255, 107, 53, 0.1)' : Colors.surface 
              }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons 
              name={reminderDay ? "alarm" : "alarm-outline"} 
              size={20} 
              color={reminderDay ? Colors.primary : Colors.textPrimary} 
            />
            <Text style={{
              color: reminderDay ? Colors.primary : Colors.textPrimary, 
              marginLeft: 5,
              fontWeight: reminderDay ? 'bold' : 'normal'
            }}>
              {reminderDay ? `Dia ${reminderDay}` : "Definir Data"}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (event.type === 'set' && selectedDate) {
                setReminderDay(selectedDate.getDate());
              }
            }}
          />
        )}

        {/* Inputs */}
        <TextInput
          style={styles.titleInput}
          placeholder="Título"
          placeholderTextColor={Colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {isPreview ? (
          <Markdown style={markdownStyles}>
            {content || "*Nenhum conteúdo.*"}
          </Markdown>
        ) : (
          <TextInput
            style={styles.contentInput}
            placeholder="Escreva em Markdown..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            scrollEnabled={false}
            value={content}
            onChangeText={setContent}
          />
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={() => setIsPreview(!isPreview)}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isPreview ? "create-outline" : "eye-outline"} 
          size={24} 
          color="#FFF" 
        />
      </TouchableOpacity>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContainer: { flex: 1, padding: 20 },
  
  headerRightContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end',
    paddingRight: 5
  },
  saveButton: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
  menuButton: { padding: 4 },

  modalOverlay: { flex: 1, backgroundColor: Colors.overlay },
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 5,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  menuItemLast: { borderBottomWidth: 0 },
  menuText: { color: Colors.textPrimary, fontSize: 16 },

  metaContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  tagsInput: { flex: 1, backgroundColor: Colors.surface, borderRadius: 8, padding: 12, color: Colors.textPrimary, fontSize: 14 },
  metaButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    borderWidth: 1, 
    // Cores agora são dinâmicas no inline style
  },
  
  titleInput: { fontSize: 26, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 20, marginTop: 10 },
  contentInput: { fontSize: 16, color: Colors.textPrimary, lineHeight: 24, minHeight: 300, textAlignVertical: 'top' },
  
  toggleButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: Colors.surface, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, elevation: 8 }
});

const markdownStyles = StyleSheet.create({
  body: { color: Colors.textPrimary, fontSize: 16, lineHeight: 24 },
  heading1: { color: Colors.primary, fontWeight: 'bold', marginBottom: 10, marginTop: 10, fontSize: 24 },
  heading2: { color: Colors.textPrimary, fontWeight: 'bold', marginTop: 20, marginBottom: 10, fontSize: 20 },
  code_inline: { backgroundColor: Colors.surface, color: Colors.primary, borderRadius: 4, fontWeight: 'bold' },
  fence: { backgroundColor: Colors.surface, color: Colors.textSecondary, borderColor: Colors.border, borderWidth: 1, padding: 10, marginTop: 10, marginBottom: 10, borderRadius: 6 },
  blockquote: { backgroundColor: Colors.surface, borderLeftColor: Colors.primary, borderLeftWidth: 4, padding: 10, marginTop: 10, marginBottom: 10, borderRadius: 4 },
  bullet_list: { color: Colors.textPrimary },
});