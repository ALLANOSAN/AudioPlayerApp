import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
// Usando @react-native-documents/picker para seleção de arquivos
import DocumentPicker, { types as DocumentPickerTypes, DocumentPickerResponse } from '@react-native-documents/picker';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslate } from '@tolgee/react'; // Assumindo que @tolgee/react está configurado
import { Song } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { lastFmService } from '../services/lastFmService'; // Certifique-se que este serviço existe
// import { TrackPlayerService } from '../services/TrackPlayerService'; // Não precisa instanciar aqui, PlayerScreen fará
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { addSongs as addSongsToRedux, removeSongs as removeSongsFromRedux, RootState } from '../store/slices/songsSlice';
import { Logger } from '../utils/logger';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

const SongsScreen = () => {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const songsFromRedux = useSelector((state: RootState) => state.songs.allSongs);

  const [filteredSongs, setFilteredSongs] = useState<Song[]>(songsFromRedux);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setFilteredSongs(songsFromRedux);
  }, [songsFromRedux]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songsFromRedux);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = songsFromRedux.filter(
        (song) =>
          song.name.toLowerCase().includes(lowerQuery) ||
          (song.artist || '').toLowerCase().includes(lowerQuery) ||
          (song.album || '').toLowerCase().includes(lowerQuery)
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, songsFromRedux]);

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true; // Permissão não necessária para outras plataformas

    try {
      const permissionToRequest =
        parseInt(String(Platform.Version), 10) >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const granted = await PermissionsAndroid.request(
        permissionToRequest,
        {
          title: t('permissoes.armazenamentoTitulo') || "Permissão de Armazenamento",
          message: t('permissoes.armazenamentoMensagem') || "O aplicativo precisa de acesso aos seus arquivos de áudio.",
          buttonNeutral: t('permissoes.perguntarDepois') || "Perguntar Depois",
          buttonNegative: t('comum.cancelar') || "Cancelar",
          buttonPositive: t('comum.ok') || "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Logger.info("Permissão de armazenamento concedida.");
        return true;
      } else {
        Logger.warn("Permissão de armazenamento negada.");
        return false;
      }
    } catch (err) {
      Logger.error('Erro ao solicitar permissão de armazenamento:', err);
      return false;
    }
  };

  const addSongsFromFolder = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        t('permissoes.tituloNegada') || "Permissão Negada",
        t('permissoes.armazenamentoNegada') || "Não é possível adicionar músicas sem permissão de acesso aos arquivos."
      );
      return;
    }

    try {
      setIsLoading(true);
      const results: DocumentPickerResponse[] | null = await DocumentPicker.pick({
        type: [DocumentPickerTypes.audio], // Use o tipo correto da biblioteca
        allowMultiSelection: true,
        copyTo: 'cachesDirectory', // Opcional, mas recomendado para acesso estável
      });

      if (!results || results.length === 0) {
        Logger.info('Nenhum arquivo selecionado.');
        setIsLoading(false);
        return;
      }

      const newSongsPromises = results.map(async (file) => {
        const filenameWithExt = file.name || file.uri.split('/').pop() || 'Unknown Track';
        const filename = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.')) || filenameWithExt; // Remove extensão

        try {
          // Tenta buscar informações da música, mas não bloqueia se falhar
          const songInfo = await lastFmService.fetchSongInfo(filename).catch(() => null);
          return {
            id: file.uri, // URI é um bom ID único para arquivos locais
            path: file.uri, // Caminho para o arquivo de áudio
            name: songInfo?.title || filename,
            artist: songInfo?.artist || (t('musicas.artistaDesconhecido') || 'Artista Desconhecido'),
            album: (songInfo && 'album' in songInfo ? (songInfo as any).album : '') || '',
            artwork: songInfo?.cover || '',
            duration: 0, // TrackPlayer pode obter isso, ou você pode usar uma lib para metadados
          };
        } catch (error) { // Captura erros específicos do processamento desta música
          Logger.warn(`Erro ao processar o arquivo ${filenameWithExt}:`, error);
          return { // Retorna um objeto base para que a música ainda possa ser adicionada
            id: file.uri,
            path: file.uri,
            name: filename,
            artist: t('musicas.artistaDesconhecido') || 'Artista Desconhecido',
            album: '',
            artwork: '',
            duration: 0,
          };
        }
      });

      const newSongsArray = (await Promise.all(newSongsPromises)).filter(Boolean) as Song[];
      const uniqueNewSongs = newSongsArray.filter(ns => !songsFromRedux.some(s => s.path === ns.path));

      if (uniqueNewSongs.length > 0) {
        dispatch(addSongsToRedux(uniqueNewSongs));
        Logger.info(`${uniqueNewSongs.length} novas músicas adicionadas.`);
      } else {
        Logger.info('Nenhuma música nova para adicionar (já existem ou array vazio).');
      }

    } catch (err: any) {
      // Verificar como @react-native-documents/picker lida com cancelamento
      if (err.code === 'DOCUMENT_PICKER_CANCELED' || err.message?.includes('cancelled') || err.message?.includes('canceled')) {
        Logger.info('Seleção de arquivos cancelada pelo usuário.');
      } else {
        Logger.error('Erro ao adicionar músicas de pasta:', err);
        Alert.alert(t('erro.titulo') || "Erro", t('erro.adicionarMusicas') || "Ocorreu um erro ao adicionar as músicas.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const playSong = (song: Song, playlistContext: Song[]) => {
    const songIndex = playlistContext.findIndex(s => s.id === song.id);
    if (songIndex === -1) {
        Logger.error("Música não encontrada na playlist fornecida para playSong.");
        return;
    }
    // Navega para PlayerScreen, passando a música, a playlist atual (filtrada ou todas) e o índice
    navigation.navigate('Player', { song, playlist: playlistContext, songIndex });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const toggleSelectSong = (songId: string) => {
    setSelectedIds((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const confirmDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
        t('musicas.excluir') || "Excluir Músicas",
        t('musicas.confirmaExcluirMultiplas', { count: selectedIds.length }) || `Tem certeza que deseja excluir ${selectedIds.length} música(s)?`,
        [
          { text: t('comum.cancelar') || "Cancelar", style: 'cancel' },
          {
            text: t('comum.excluir') || "Excluir",
            style: 'destructive',
            onPress: () => {
              dispatch(removeSongsFromRedux(selectedIds));
              setSelectionMode(false);
              setSelectedIds([]);
              Logger.info(`${selectedIds.length} músicas removidas.`);
            },
          },
        ]
    );
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.songItem,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
          isSelected && { backgroundColor: theme.primary + '30' }, // Um tom mais claro do primário
        ]}
        onPress={() => (selectionMode ? toggleSelectSong(item.id) : playSong(item, filteredSongs))}
        onLongPress={() => {
          if (!selectionMode) setSelectionMode(true);
          toggleSelectSong(item.id); // Seleciona/deseleciona no long press
        }}
        activeOpacity={0.7}
      >
        <View style={styles.songNumberContainer}>
          <Text style={[styles.songNumber, { color: theme.tertiaryText }]}>{index + 1}</Text>
        </View>
        <View style={styles.songInfo}>
          <Text style={[styles.songName, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.songArtist, { color: theme.secondaryText }]} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        {selectionMode && (
            <MaterialIcons
                name={isSelected ? "check-box" : "check-box-outline-blank"}
                size={24}
                color={isSelected ? theme.primary : theme.secondaryText}
                style={styles.checkboxIcon}
            />
        )}
      </TouchableOpacity>
    );
  };

  const playAllSongs = () => {
    if (filteredSongs.length > 0) {
      playSong(filteredSongs[0], filteredSongs); // Toca a partir da lista filtrada atual
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <MaterialIcons name="search" size={24} color={theme.secondaryText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text, backgroundColor: theme.card }]}
          placeholder={t('busca.placeholder') || "Buscar músicas..."}
          placeholderTextColor={theme.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <MaterialIcons name="close" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {!selectionMode ? (
        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.primary }]}
                onPress={addSongsFromFolder}
                disabled={isLoading}
            >
                <MaterialIcons name="add" size={20} color={theme.buttonText || "white"} />
                <Text style={[styles.headerButtonText, {color: theme.buttonText || "white"}]}>
                {isLoading ? (t('comum.carregando') || "Carregando...") : (t('musicas.adicionarMusicas') || "Adicionar")}
                </Text>
            </TouchableOpacity>
            {songsFromRedux.length > 0 && (
                <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.secondary, marginLeft: 10 }]}
                onPress={playAllSongs}
                >
                <MaterialIcons name="play-arrow" size={20} color={theme.buttonText || "white"} />
                <Text style={[styles.headerButtonText, {color: theme.buttonText || "white"}]}>{t('musicas.tocarTudo') || "Tocar Tudo"}</Text>
                </TouchableOpacity>
            )}
        </View>
      ) : (
        <View style={styles.selectionActionsContainer}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.error, flex: 1 }]}
            onPress={confirmDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            <MaterialIcons name="delete" size={20} color={theme.buttonText || "white"} />
            <Text style={[styles.headerButtonText, {color: theme.buttonText || "white"}]}>{t('musicas.excluirSelecionadas') || "Excluir"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.card, marginLeft: 10, flex: 1, borderWidth: 1, borderColor: theme.border }]}
            onPress={() => {
              setSelectionMode(false);
              setSelectedIds([]);
            }}
          >
             <MaterialIcons name="close" size={20} color={theme.text} />
            <Text style={[styles.headerButtonText, {color: theme.text}]}>{t('comum.cancelar') || "Cancelar"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && songsFromRedux.length === 0 ? ( // Mostra loading apenas se não houver músicas ainda
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.messageText, { color: theme.text }]}>{t('musicas.carregando') || "Carregando músicas..."}</Text>
        </View>
      ) : filteredSongs.length === 0 ? (
        <View style={styles.centeredMessageContainer}>
          <MaterialIcons name="music-off" size={64} color={theme.secondaryText} />
          <Text style={[styles.messageText, { color: theme.secondaryText }]}>
            {searchQuery.trim() !== '' ? (t('musicas.nenhumResultado') || "Nenhum resultado encontrado") : (t('musicas.nenhumaMusica') || "Nenhuma música")}
          </Text>
          {searchQuery.trim() === '' && (
            <Text style={[styles.subMessageText, { color: theme.tertiaryText }]}>
              {t('musicas.adicioneAlgumas') || "Adicione algumas músicas para começar."}
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
          contentContainerStyle={{ paddingBottom: selectionMode ? 140 : 80 }} // Mais espaço se ações de seleção estiverem visíveis
          ListFooterComponent={isLoading ? <ActivityIndicator style={{marginVertical: 20}} size="small" color={theme.primary} /> : null} // Indicador se carregando mais
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 0 : 16, // Ajuste para SafeAreaView no iOS
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    minWidth: 120, // Largura mínima para botões
  },
  headerButtonText: {
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  selectionActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  songNumberContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 10,
  },
  songNumber: {
    fontSize: 14,
  },
  songInfo: {
    flex: 1,
    marginRight: 10, // Espaço antes do checkbox
  },
  songName: {
    fontSize: 16,
    fontWeight: '500',
  },
  songArtist: {
    fontSize: 14,
  },
  checkboxIcon: {
    marginLeft: 'auto', // Alinha à direita
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
  subMessageText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default SongsScreen;