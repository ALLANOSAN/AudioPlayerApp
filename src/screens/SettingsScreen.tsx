import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import DeviceInfo from 'react-native-device-info'; // Alterado
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector'; // Assumindo que este componente existe e está correto
import { useTranslate } from '@tolgee/react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function SettingsScreen() {
  const { t } = useTranslate();
  const { theme, isDark } = useTheme();
  const appVersion = DeviceInfo.getVersion(); // Alterado
  const buildNumber = DeviceInfo.getBuildNumber(); // Adicional

  const openGithub = async () => {
    const url = 'https://github.com/seu-usuario/seu-repositorio'; // Substitua pelo seu link
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(t('erro.titulo'), t('erro.abrirLink', { url }));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{t('configuracoes.titulo')}</Text>

        {/* Seção de Aparência */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('configuracoes.aparencia')}
          </Text>
          <View
            style={[
              styles.settingItem,
              { backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border },
            ]}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons
                name="brightness-6"
                size={22}
                color={theme.text}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {t('configuracoes.tema')}
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        {/* Seção de Idioma */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('configuracoes.idioma')}
          </Text>
          <View
            style={[
              styles.settingItem,
              styles.languageSelectorContainer,
              { backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border },
            ]}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons
                name="language"
                size={22}
                color={theme.text}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 10 }]}>
                {t('configuracoes.selecionarIdioma')}
              </Text>
            </View>
            <LanguageSelector />
          </View>
        </View>

        {/* Seção Sobre */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('configuracoes.sobre')}
          </Text>
          <View
            style={[
              styles.settingItem,
              { backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border },
            ]}>
            <View style={styles.settingLabelContainer}>
              <MaterialIcons
                name="info-outline"
                size={22}
                color={theme.text}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {t('configuracoes.versao')}
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: theme.secondaryText }]}>
              {appVersion} (Build {buildNumber})
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.card }]}
            onPress={openGithub}
            accessible={true}
            accessibilityLabel="GitHub"
            accessibilityHint={t('configuracoes.dicaGithub')}
            accessibilityRole="link">
            <View style={styles.settingLabelContainer}>
              <MaterialIcons name="code" size={22} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>GitHub</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.settingValue, { color: theme.primary, marginRight: 5 }]}>
                {t('configuracoes.verCodigo')}
              </Text>
              <MaterialIcons name="open-in-new" size={18} color={theme.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Adicionado SafeAreaView para melhor layout no iOS
const SafeAreaView = Platform.OS === 'ios' ? require('react-native').SafeAreaView : View;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30, // Espaço no final da rolagem
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    // borderBottomColor: theme.border, // Definido inline
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 17,
  },
  settingValue: {
    fontSize: 17,
  },
  languageSelectorContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinha o label à esquerda
  },
});
