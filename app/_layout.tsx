import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </LanguageProvider>
    </ThemeProvider>
  );
} 