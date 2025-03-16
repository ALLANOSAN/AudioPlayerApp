import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Linking, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { StatusBar, StatusBarStyle } from 'react-native';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const appVersion = '1.0.0';
  
  const openGithub = () => {
    Linking.openURL('https://github.com/ALLANOSAN/AudioPlayerApp');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={theme.statusBar as StatusBarStyle}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('settings')}
          </Text>
          
          <ThemeToggle style={styles.settingItem} />
          
          <LanguageSelector style={styles.settingItem} />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('about')}
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              {t('version')}
            </Text>
            <Text style={[styles.settingValue, { color: theme.secondaryText }]}>
              {appVersion}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.card }]}
            onPress={openGithub}
            accessible={true}
            accessibilityLabel="GitHub"
            accessibilityHint="Toque para abrir o repositório do projeto no GitHub"
            accessibilityRole="link"
          >
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              GitHub
            </Text>
            <Text style={[styles.settingValue, { color: theme.primary }]}>
              Ver código
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
  },
}); 