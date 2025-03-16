import React, { useState } from 'react';
import { View, Text, Button, Modal, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import i18n from '../i18n'; // Certifique-se de ajustar o caminho

type LanguageCode = 'pt' | 'en' | 'es'; // Define os idiomas suportados

// Define a interface para as propriedades do componente
interface LanguageSelectorProps {
  style?: ViewStyle; // Adiciona suporte para a propriedade 'style'
}

const availableLanguages = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const changeLanguage = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode); // Troca o idioma
    setModalVisible(false);
  };

  return (
    <View style={style}> {/* Aplica o estilo recebido na View externa */}
      <Button title="Change Language" onPress={() => setModalVisible(true)} />
      <Modal visible={modalVisible} transparent>
        <View style={styles.modal}>
          {availableLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => changeLanguage(lang.code as LanguageCode)}
              style={styles.button}
            >
              <Text>{lang.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  button: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
});
