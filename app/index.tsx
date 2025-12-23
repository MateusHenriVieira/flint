import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

import { logoutUser, subscribeToAuth } from '../services/authService';
import {
  Note,
  deleteNotePermanently,
  moveToTrash,
  restoreFromTrash,
  subscribeToNotes,
  toggleArchiveNote
} from '../services/notesService';

const Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: '#E0E0E0',
  textSecondary: '#A0A0A0',
  primary: '#FF6B35',     
  success: '#4CAF50',
  danger: '#CF6679',
  border: '#2C2C2C',
  overlay: 'rgba(0,0,0,0.5)',
};

type ViewMode = 'active' | 'archived' | 'trash';

export default function HomeScreen() {
  const router = useRouter();
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [displayedNotes, setDisplayedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const swipeRefs = useRef<Map<string, Swipeable>>(new Map());

  // === PROTEÇÃO DE ROTA (AUTH) ===
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      if (!user) {
        // Se saiu, vai pro login
        router.replace('/login');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // === BUSCA DE NOTAS ===
  useEffect(() => {
    // Agora o subscribeToNotes verifica o usuário internamente
    const unsubscribeNotes = subscribeToNotes((fetchedNotes) => {
      setAllNotes(fetchedNotes);
      setLoading(false);
    });
    return () => unsubscribeNotes();
  }, []);

  useEffect(() => {
    let filtered = allNotes;
    if (viewMode === 'trash') {
      filtered = filtered.filter(n => n.isDeleted);
    } else if (viewMode === 'archived') {
      filtered = filtered.filter(n => n.isArchived && !n.isDeleted);
    } else {
      filtered = filtered.filter(n => !n.isArchived && !n.isDeleted);
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(lowerQuery) || 
        n.content.toLowerCase().includes(lowerQuery) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(lowerQuery)))
      );
    }
    setDisplayedNotes(filtered);
  }, [allNotes, viewMode, searchQuery]);

  // === AÇÕES ===
  const handleLogout = async () => {
    await logoutUser();
  };

  const handleArchive = async (id: string, currentStatus: boolean) => {
    if (swipeRefs.current.has(id)) swipeRefs.current.get(id)?.close();
    await toggleArchiveNote(id, currentStatus);
  };

  const handleTrash = async (id: string) => {
    if (swipeRefs.current.has(id)) swipeRefs.current.get(id)?.close();
    await moveToTrash(id);
  };

  const handleRestore = async (id: string) => {
    await restoreFromTrash(id);
  };

  const handleDeletePermanent = (id: string) => {
    Alert.alert("Excluir", "Apagar para sempre?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar", style: 'destructive', onPress: () => deleteNotePermanently(id) }
    ]);
  };

  // === RENDER SWIPE ACTIONS ===
  const renderLeftActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({ inputRange: [0, 100], outputRange: [0.8, 1], extrapolate: 'clamp' });
    const opacity = dragX.interpolate({ inputRange: [0, 50, 100], outputRange: [0, 0.5, 1], extrapolate: 'clamp' });

    return (
      <View style={styles.swipeLeftContainer}>
        <RNAnimated.View style={[styles.swipeContent, { transform: [{ scale }], opacity }]}>
           <Ionicons name="archive" size={24} color="#FFF" />
           <Text style={styles.swipeText}>Arquivar</Text>
        </RNAnimated.View>
      </View>
    );
  };

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({ inputRange: [-100, 0], outputRange: [1, 0.8], extrapolate: 'clamp' });
    const opacity = dragX.interpolate({ inputRange: [-100, -50, 0], outputRange: [1, 0.5, 0], extrapolate: 'clamp' });

    return (
      <View style={styles.swipeRightContainer}>
        <RNAnimated.View style={[styles.swipeContent, { transform: [{ scale }], opacity }]}>
          <Ionicons name="trash" size={24} color="#FFF" />
          <Text style={styles.swipeText}>Lixeira</Text>
        </RNAnimated.View>
      </View>
    );
  };

  // === CARD ===
  const renderNoteItem = ({ item }: { item: Note }) => {
    const CardContent = () => (
      <View style={[styles.card, viewMode === 'trash' && styles.cardDeleted]}>
        <View style={styles.cardHeader}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={[styles.cardTitle, viewMode === 'trash' && styles.textDeleted]} numberOfLines={1}>
              {item.title || "Sem Título"}
            </Text>
            {item.reminderDay && !item.isDeleted && (
              <View style={styles.reminderBadge}>
                <Ionicons name="alarm" size={10} color={Colors.primary} />
                <Text style={styles.reminderText}>Dia {item.reminderDay}</Text>
              </View>
            )}
          </View>
          
          {viewMode === 'trash' ? (
            <View style={{flexDirection: 'row', gap: 10}}>
                <TouchableOpacity onPress={() => handleRestore(item.id)}>
                   <Ionicons name="refresh" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePermanent(item.id)}>
                   <Ionicons name="close-circle" size={20} color={Colors.danger} />
                </TouchableOpacity>
            </View>
          ) : (
            <Ionicons name="chevron-back" size={16} color={Colors.border} style={{opacity: 0.3}} />
          )}
        </View>

        <Text style={styles.cardPreview} numberOfLines={2}>
          {item.content || "Sem conteúdo..."}
        </Text>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, i) => (
              <View key={i} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );

    // Animação Linear (Clean Enterprise)
    const animConfig = Layout.duration(300);

    if (viewMode === 'trash') {
      return (
        <Animated.View layout={animConfig} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
          <CardContent />
        </Animated.View>
      );
    }

    return (
      <Animated.View layout={animConfig} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
        <Swipeable
          ref={(ref) => { if (ref) swipeRefs.current.set(item.id, ref); }}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          friction={2} 
          leftThreshold={120} 
          rightThreshold={120} 
          overshootLeft={true} 
          overshootRight={true} 
          onSwipeableOpen={(direction) => {
            if (direction === 'left') handleArchive(item.id, item.isArchived || false);
            else handleTrash(item.id);
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push({
              pathname: '/editor',
              params: {
                id: item.id,
                title: item.title,
                content: item.content,
                tags: item.tags?.join(', '), 
                isArchived: String(item.isArchived),
                reminderDay: item.reminderDay ? String(item.reminderDay) : ''
              }
            })}
          >
            <CardContent />
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {viewMode === 'trash' ? 'Lixeira' : viewMode === 'archived' ? 'Arquivados' : 'Flint'}
        </Text>
        
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          {/* Botão Logout */}
          <TouchableOpacity onPress={handleLogout}>
             <Ionicons name="log-out-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          {/* Botão Menu */}
          <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
        )}
      </View>

      {/* MENU MODAL */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setViewMode('active'); setShowMenu(false); }}>
              <Ionicons name="document-text-outline" size={20} color={Colors.textPrimary} />
              <Text style={styles.menuText}>Notas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setViewMode('archived'); setShowMenu(false); }}>
              <Ionicons name="archive-outline" size={20} color={Colors.textPrimary} />
              <Text style={styles.menuText}>Arquivados</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={() => { setViewMode('trash'); setShowMenu(false); }}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              <Text style={[styles.menuText, { color: Colors.danger }]}>Lixeira</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <View style={styles.centerContent}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : displayedNotes.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name={viewMode === 'trash' ? "trash-bin-outline" : "search-outline"} size={64} color={Colors.surface} />
          <Text style={styles.emptyText}>Nada por aqui.</Text>
        </View>
      ) : (
        <FlatList
          data={displayedNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {viewMode === 'active' && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/editor')}>
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary },
  headerButton: { padding: 5 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: 20, marginBottom: 20, paddingHorizontal: 15, height: 50, borderRadius: 12 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 16 },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  swipeLeftContainer: {
    backgroundColor: Colors.success,
    flex: 1, 
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: 12,
    marginRight: -15, 
    paddingLeft: 20, 
    alignItems: 'flex-start', 
    zIndex: -1,
  },
  swipeRightContainer: {
    backgroundColor: Colors.danger,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: 12,
    marginLeft: -15,
    paddingRight: 20,
    alignItems: 'flex-end', 
    zIndex: -1,
  },
  swipeContent: { alignItems: 'center', justifyContent: 'center', width: 60 },
  swipeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', marginTop: 4 },

  card: { 
    backgroundColor: Colors.surface, 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    borderLeftWidth: 4, 
    borderLeftColor: Colors.primary,
    minHeight: 100, 
    justifyContent: 'center'
  },
  cardDeleted: { opacity: 0.6, borderLeftColor: Colors.danger },
  textDeleted: { textDecorationLine: 'line-through' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4, lineHeight: 22, flexShrink: 1 },
  cardPreview: { fontSize: 14, color: Colors.textSecondary, marginBottom: 10 },
  reminderBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 107, 53, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4, marginTop: 4, alignSelf: 'flex-start' },
  reminderText: { color: Colors.primary, fontSize: 10, fontWeight: 'bold' },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: { backgroundColor: '#2A2A2A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tagText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: Colors.overlay },
  menuContainer: { position: 'absolute', top: 90, right: 20, backgroundColor: Colors.surface, borderRadius: 12, padding: 5, minWidth: 180, elevation: 10, borderWidth: 1, borderColor: Colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  menuItemLast: { borderBottomWidth: 0 },
  menuText: { color: Colors.textPrimary, fontSize: 16 },

  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.7 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, marginTop: 16 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: Colors.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 999 }
});