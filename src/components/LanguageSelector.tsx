import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface LanguageSelectorProps {
  style?: object;
}

export function LanguageSelector({ style = {} }: LanguageSelectorProps) {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Mapeia os idiomas para acessar diretamente seus nomes, otimizando buscas
  const languageMap = useMemo(() => {
    return availableLanguages.reduce((acc, lang) => {
      acc[lang.code] = lang.name;
      return acc;
    }, {} as { [key: string]: string });
  }, [availableLanguages]);

  const getLanguageName = (code: string) => languageMap[code] || code;

  const handleSelectLanguage = (langCode: string) => {
    setLanguage(langCode as any);
    setModalVisible(false);
  };

  return (
    <>
      {/* Botão para abrir o modal */}
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.card }, style]}
        onPress={() => setModalVisible(true)}
        accessible={true}
        accessibilityLabel={t('language')}
        accessibilityHint="Toque para selecionar o idioma do aplicativo"
        accessibilityRole="button"
      >
        <Text style={[styles.label, { color: theme.text }]}>{t('language')}</Text>
        <Text style={[styles.value, { color: theme.secondaryText }]}>
          {getLanguageName(language)}
        </Text>
      </TouchableOpacity>

      {/* Modal para seleção de idioma */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        accessible={true}
        accessibilityLabel={t('language')}
        accessibilityHint="Selecione o idioma desejado na lista"
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('language')}</Text>

            {/* Lista de idiomas */}
            <FlatList
              data={availableLanguages}
              keyExtractor={(item) => item.code}
              ListEmptyComponent={() => (
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  {t('noLanguagesAvailable')}
                </Text>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    language === item.code && {
                      backgroundColor: `${theme.primary}20`,
                      borderColor: theme.primary,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => handleSelectLanguage(item.code)}
                  accessible={true}
                  accessibilityLabel={`Selecionar o idioma ${item.name}`}
                  accessibilityHint={
                    language === item.code
                      ? 'Idioma atual'
                      : 'Toque para selecionar este idioma'
                  }
                >
                  <Text style={[styles.languageName, { color: theme.text }]}>{item.name}</Text>
                  {language === item.code && (
                    <View
                      style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}
                    />
                  )}
                </TouchableOpacity>
              )}
            />

            {/* Botão para fechar o modal */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.secondary }]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  languageName: {
    fontSize: 16,
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});
