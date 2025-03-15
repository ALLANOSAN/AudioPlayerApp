import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  style?: object;
}

export function ThemeToggle({ style = {} }: ThemeToggleProps) {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }, style]}
      onPress={toggleTheme}
      accessible={true}
      accessibilityLabel={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      accessibilityHint="Toque para alternar entre tema claro e escuro"
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
        {isDark ? 'Tema Escuro' : 'Tema Claro'}
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