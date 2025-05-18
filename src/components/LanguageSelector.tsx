import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
// Importar useTranslate de @tolgee/react e o hook customizado e tipo Language de i18n.tsx
import { useTranslate } from '../i18n'; // Importa o useTranslate re-exportado de i18n.tsx
import { useTolgeeInstance, Language as ImportedTolgeeLanguage } from '../i18n';
import { useTheme } from '../contexts/ThemeContext'; // Supondo que você tenha um ThemeContext
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Supondo que você use este ícone

interface LanguageSelectorProps {
  style?: object; // Permite estilização customizada do container principal
}

// Define a estrutura para os itens da lista de idiomas
interface LanguageItem {
  code: ImportedTolgeeLanguage;
  name: string;
  icon: string; // Nome do ícone (ex: MaterialIcons)
}

export function LanguageSelector({ style = {} }: LanguageSelectorProps) {
  const { t } = useTranslate(); // Hook para traduções
  const { theme } = useTheme(); // Hook para o tema
  const [modalVisible, setModalVisible] = useState(false);

  // Usar o hook customizado para acessar o estado e funções do Tolgee
  const { currentLang, changeLanguage, loading: tolgeeLoading } = useTolgeeInstance();

  const languages: LanguageItem[] = [
    { code: 'pt-BR', name: t('idiomas.portugues', 'Português'), icon: 'flag' },
    { code: 'en', name: t('idiomas.ingles', 'English'), icon: 'flag' },
    { code: 'es', name: t('idiomas.espanhol', 'Español'), icon: 'flag' },
  ];

  // Se o Tolgee ainda estiver carregando, pode mostrar um placeholder ou desabilitar o seletor
  if (tolgeeLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card, opacity: 0.7 }, style]}>
        <View style={styles.content}>
            <MaterialIcons name="language" size={24} color={theme.secondaryText} style={styles.icon} />
            <View style={styles.textContainer}>
                <Text style={[styles.label, { color: theme.secondaryText }]}>{t('idioma.titulo', 'Idioma')}</Text>
                <Text style={[styles.selectedLanguage, { color: theme.secondaryText }]}>
                {t('geral.carregando', 'Carregando...')}
                </Text>
            </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={theme.secondaryText} />
      </View>
    );
  }

  const getCurrentLanguageName = () => {
    const lang = languages.find((l) => l.code === currentLang);
    // O nome já deve vir traduzido da array 'languages'
    return lang ? lang.name : t('idiomas.portugues', 'Português'); // Fallback
  };

  const handleLanguageSelect = async (languageCode: ImportedTolgeeLanguage) => {
    await changeLanguage(languageCode); // Chama a função do contexto
    setModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: LanguageItem }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        { backgroundColor: item.code === currentLang ? theme.background : theme.card },
      ]}
      onPress={() => handleLanguageSelect(item.code)}
      accessible={true}
      accessibilityLabel={item.name}
      accessibilityRole="button"
      accessibilityState={{ selected: item.code === currentLang }}
      >
      <Text style={[styles.languageName, { color: theme.text }]}>{item.name}</Text>
      {item.code === currentLang && <MaterialIcons name="check" size={20} color={theme.primary} />}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.card }, style]}
        onPress={() => setModalVisible(true)}
        disabled={tolgeeLoading} // Desabilita se estiver carregando
        accessible={true}
        accessibilityLabel={t('idioma.seletor', 'Seletor de idioma')}
        accessibilityHint={t('idioma.dica', 'Toque para mudar o idioma')}
        accessibilityRole="button">
        <View style={styles.content}>
          <MaterialIcons name="language" size={24} color={theme.primary} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: theme.text }]}>{t('idioma.titulo', 'Idioma')}</Text>
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
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)} // Fecha ao clicar fora
        >
          <View style={[styles.modalContent, { backgroundColor: theme.background }]} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t('idioma.selecione', 'Selecione o Idioma')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} accessibilityLabel={t('geral.fechar', 'Fechar')}>
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
        </TouchableOpacity>
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
    // marginVertical: 8, // Adicione margem se necessário
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16, // Aumentado para melhor espaçamento
  },
  textContainer: {
    // flex: 1, // Removido para permitir que o chevron-right fique próximo
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    // marginBottom: 2, // Ajustado
  },
  selectedLanguage: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Modal aparece de baixo
    backgroundColor: 'rgba(0,0,0,0.6)', // Overlay mais escuro
  },
  modalContent: {
    borderTopLeftRadius: 20, // Bordas mais arredondadas
    borderTopRightRadius: 20,
    paddingTop: 20, // Padding aumentado
    paddingBottom: 30, // Padding para safe area (se necessário)
    paddingHorizontal: 16,
    maxHeight: '60%', // Altura máxima do modal
    shadowColor: '#000', // Sombra para elevação
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Espaçamento aumentado
    paddingHorizontal: 8, // Padding horizontal para o header
  },
  modalTitle: {
    fontSize: 20, // Título maior
    fontWeight: 'bold',
  },
  languageList: {
    // marginTop: 8, // Removido, o header já tem margin bottom
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18, // Padding vertical aumentado
    paddingHorizontal: 12, // Padding horizontal
    borderRadius: 10, // Bordas mais arredondadas
    marginBottom: 10, // Espaçamento entre itens
  },
  languageName: {
    fontSize: 17, // Fonte maior
  },
  // Estilos para texto desabilitado (exemplo)
  disabledText: {
      color: '#999999', // Cor para texto desabilitado
  }
});