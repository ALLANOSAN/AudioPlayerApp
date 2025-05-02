import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTranslate, useTolgee } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

interface Language {
  code: string;
  name: string;
}

interface LanguageSelectorProps {
  style?: object;
}

export function LanguageSelector({ style = {} }: LanguageSelectorProps) {
  const { t } = useTranslate();
  const tolgee = useTolgee();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  
  const languages: Language[] = [
    { code: 'pt-BR', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];
  
  const currentLanguage = tolgee.getLanguage();
  
  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? lang.name : 'Português';
  };
  
  const handleLanguageSelect = (languageCode: string) => {
    tolgee.changeLanguage(languageCode);
    setModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem, 
        { backgroundColor: item.code === currentLanguage ? theme.background : theme.card }
      ]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text style={[styles.languageName, { color: theme.text }]}>
        {item.name}
      </Text>
      {item.code === currentLanguage && (
        <MaterialIcons name="check" size={20} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.card }, style]}
        onPress={() => setModalVisible(true)}
        accessible={true}
        accessibilityLabel={t('idioma.seletor')}
        accessibilityHint={t('idioma.dica')}
        accessibilityRole="button"
      >
        <View style={styles.content}>
          <MaterialIcons name="language" size={24} color={theme.primary} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              {t('idioma.titulo')}
            </Text>
            <Text style={[styles.selectedLanguage, { color: theme.secondaryText }]}>
              {getCurrentLanguageName()}
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={theme.secondaryText} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t('idioma.selecione')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={renderLanguageItem}
              style={styles.languageList}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedLanguage: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageList: {
    marginTop: 8,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageName: {
    fontSize: 16,
  },
});