import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const languages = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' }
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => changeLanguage(lang.code)}
          style={[
            styles.button,
            currentLanguage === lang.code && styles.selectedButton
          ]}
        >
          <Text style={[
            styles.text,
            currentLanguage === lang.code && styles.selectedText
          ]}>
            {lang.name}
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
