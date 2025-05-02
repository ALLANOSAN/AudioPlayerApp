import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslate } from '@tolgee/react';

interface ThemeToggleProps {
  style?: object;
}

export function ThemeToggle({ style = {} }: ThemeToggleProps) {
  const { isDark, toggleTheme, theme } = useTheme();
  const { t } = useTranslate();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }, style]}
      onPress={toggleTheme}
      accessible={true}
      accessibilityLabel={isDark ? t('tema.mudarParaClaro') : t('tema.mudarParaEscuro')}
      accessibilityHint={t('tema.dica')}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
    >
      <View style={styles.toggleWrapper}>
        <View style={[
          styles.toggleIndicator, 
          { 
            backgroundColor: theme.primary,
            transform: [{ translateX: isDark ? 22 : 0 }]
          }
        ]} />
      </View>
      <Text style={[styles.text, { color: theme.text }]}>
        {isDark ? t('tema.escuro') : t('tema.claro')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  toggleWrapper: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 3,
    marginRight: 12,
  },
  toggleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4CAF50',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});