import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTolgee } from '@tolgee/react';

const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

const LanguageSelector = () => {
  const tolgee = useTolgee();
  const [currentLanguage, setCurrentLanguage] = useState(tolgee.getLanguage());

  // Carregar o idioma salvo no AsyncStorage
  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && savedLanguage !== currentLanguage) {
        await tolgee.changeLanguage(savedLanguage);
        setCurrentLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, [currentLanguage, tolgee]);

  // Função para mudar o idioma
  const onChangeLanguage = async (lng: string) => {
    await tolgee.changeLanguage(lng);
    setCurrentLanguage(lng);
    await AsyncStorage.setItem('language', lng);
  };

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => onChangeLanguage(lang.code)}
          style={[
            styles.button,
            currentLanguage === lang.code && styles.selectedButton
          ]}
        >
          <Text style={[
            styles.text,
            currentLanguage === lang.code && styles.selectedText
          ]}>
            {lang.flag} {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 5,
    borderRadius: 4,
    backgroundColor: '#f0f0f0'
  },
  selectedButton: {
    backgroundColor: '#6200ee'
  },
  text: {
    color: '#333'
  },
  selectedText: {
    color: 'white'
  }
});

export default LanguageSelector;
