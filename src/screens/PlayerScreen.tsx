import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Song } from '../types/music';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { AudioPlayer } from '../services/AudioPlayer';
import * as Haptics from 'expo-haptics';

type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

interface PlayerScreenProps {
  route: PlayerScreenRouteProp;
  navigation: PlayerScreenNavigationProp;
}

export function PlayerScreen({ route, navigation }: PlayerScreenProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const { song } = route.params;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [shuffleMode, setShuffleMode] = useState(false);
  
  const player = AudioPlayer.getInstance();
  
  useEffect(() => {
    const setupPlayer = async () => {
      setIsLoading(true);
      
      try {
        // Configurar o player com a música atual
        await player.playAudio(song.path, song.name, song.artist, song.artwork);
        
        // Configurar listeners de eventos
        player.setOnPlaybackStatusUpdate((status ) => {
          if (!isSeeking) {
            setPosition(status.positionMillis / 1000);
          }
          setDuration(status.durationMillis / 1000);
          setIsPlaying(status.isPlaying);
          
          if (status.isLoaded && isLoading) {
            setIsLoading(false);
          }
        });
        
      } catch (error) {
        console.error('Erro ao configurar player:', error);
      }
    };
    
    setupPlayer();
    
    // Limpar ao desmontar
    return () => {
      // Não pára a reprodução, apenas remove os listeners
      player.removeAllListeners();
    };
  }, [song]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) {
      await player.pauseAudio();
    } else {
      await player.resumeAudio();
    }
  };
  
  const handleSeekComplete = async (value: number) => {
    await player.seekTo(value * 1000);
    setIsSeeking(false);
  };
  
  const handlePrevious = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await player.previousTrack();
  };
  
  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await player.nextTrack();
  };
  
  const toggleRepeatMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRepeatMode((current) => {
      switch (current) {
        case 'off': return 'one';
        case 'one': return 'all';
        case 'all': return 'off';
      }
    });
    
    // Atualizar o modo de repetição no player
    player.setRepeatMode(repeatMode);
  };
  
  const toggleShuffleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShuffleMode(!shuffleMode);
    
    // Atualizar o modo aleatório no player
    player.setShuffleMode(!shuffleMode);
  };
  
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'off': return 'repeat';
      case 'one': return 'repeat-one';
      case 'all': return 'repeat';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t('player.tocandoAgora')}
        </Text>
        <View style={styles.spacer} />
      </View>
      
      <View style={styles.albumArtContainer}>
        {song.artwork ? (
          <Image source={{ uri: song.artwork }} style={styles.albumArt} />
        ) : (
          <View style={[styles.albumArt, styles.placeholderArt, { backgroundColor: theme.placeholder }]}>
            <Text style={styles.placeholderText}>{song.name.charAt(0)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.songInfoContainer}>
        <Text style={[styles.songTitle, { color: theme.text }]}>
          {song.name}
        </Text>
        <Text style={[styles.songArtist, { color: theme.secondaryText }]}>
          {song.artist}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 1}
          value={position}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.secondaryText}
          thumbTintColor={theme.primary}
          onSlidingStart={() => setIsSeeking(true)}
          onSlidingComplete={handleSeekComplete}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: theme.secondaryText }]}>
            {formatTime(position)}
          </Text>
          <Text style={[styles.timeText, { color: theme.secondaryText }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleShuffleMode} style={styles.controlButton}>
          <MaterialIcons 
            name="shuffle" 
            size={24} 
            color={shuffleMode ? theme.primary : theme.secondaryText}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
          <MaterialIcons name="skip-previous" size={36} color={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePlayPause} style={[styles.playButton, { backgroundColor: theme.primary }]}>
          <MaterialIcons 
            name={isPlaying ? 'pause' : 'play-arrow'} 
            size={36} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
          <MaterialIcons name="skip-next" size={36} color={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={toggleRepeatMode} style={styles.controlButton}>
          <MaterialIcons 
            name={getRepeatIcon()} 
            size={24} 
            color={repeatMode !== 'off' ? theme.primary : theme.secondaryText}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const albumArtSize = width - 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  spacer: {
    width: 44, // Manter o título centralizado
  },
  albumArtContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  albumArt: {
    width: albumArtSize,
    height: albumArtSize,
    borderRadius: 10,
  },
  placeholderArt: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
  },
  songInfoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  songArtist: {
    fontSize: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginVertical: 20,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -15,
  },
  timeText: {
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerScreen;