# Aplicativo de Reprodução de Áudio

Um aplicativo de reprodução de áudio desenvolvido com React Native, que permite aos usuários navegar e reproduzir suas músicas favoritas.

## Funcionalidades

- Navegação por músicas, álbuns e artistas
- Reprodução de áudio com controles de reprodução
- Busca de músicas, álbuns e artistas
- Suporte a temas claro e escuro
- Internacionalização (suporte a múltiplos idiomas)
- Armazenamento local de preferências do usuário

## Tecnologias Utilizadas

- React Native
- React Navigation
- React Native Fast Image
- Async Storage
- Last.fm API para metadados

## Abordagem para Metadados de Áudio

Em vez de usar bibliotecas como `music-metadata` que podem ter problemas de compatibilidade com React Native, o aplicativo utiliza uma abordagem híbrida:

1. **Extração básica de informações dos nomes de arquivos**:
   - Nomes de músicas são extraídos dos nomes dos arquivos
   - Álbuns são identificados pelos diretórios que contêm os arquivos
   - Artistas são obtidos através da API Last.fm

2. **Integração com Last.fm API**:
   - Busca de informações detalhadas sobre músicas, álbuns e artistas
   - Obtenção de imagens de capas de álbuns e fotos de artistas
   - Enriquecimento dos metadados básicos extraídos dos arquivos

3. **Fallbacks para casos sem metadados**:
   - Exibição de placeholders visuais para capas ausentes
   - Nomes padrão para artistas e álbuns desconhecidos
   - Contagem de músicas por artista e álbum

Esta abordagem oferece uma boa experiência ao usuário sem depender de bibliotecas nativas que podem causar problemas de compatibilidade.

## Instalação

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Execute o aplicativo: `npx react-native run-android` ou `npx react-native run-ios`

## Configuração

Para usar a API Last.fm, você precisa obter uma chave de API em [Last.fm API](https://www.last.fm/api/account/create).

## Licença

MIT 