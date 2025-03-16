import axios from 'axios';

// Configuração do Crowdin
const CROWDIN_API_URL = 'https://api.crowdin.com/api/v2'; // URL base da API
const PROJECT_ID = '771937'; // Insira o ID do seu projeto
const API_TOKEN = '7b37d0562b066ed676a38f50e8f2c7dd3ae475099f523070ec07659efcd798fc48c7b01c082e4cf5'; // Insira seu token da API

const axiosInstance = axios.create({
  baseURL: CROWDIN_API_URL,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Função para baixar traduções
export const downloadTranslations = async () => {
  try {
    // 1. Gera um arquivo ZIP com traduções
    const exportResponse = await axiosInstance.post(`/projects/${PROJECT_ID}/translations/exports`);
    const fileUrl = exportResponse.data.data.url;

    // 2. Faz o download do arquivo ZIP com traduções
    const downloadResponse = await axios.get(fileUrl, { responseType: 'blob' });

    // Descompacte o arquivo e organize suas traduções (pode usar bibliotecas como JSZip)
    console.log('Traduções baixadas com sucesso!', downloadResponse.data);
  } catch (error) {
    console.error('Erro ao baixar traduções:', error.response?.data || error.message);
  }
};

// Função para fazer upload de arquivos de origem
export const uploadSourceFiles = async (filePath, fileName) => {
  try {
    const fileContent = await fetch(filePath).then((res) => res.blob());

    // Envia o arquivo para o Crowdin
    const response = await axiosInstance.post(
      `/projects/${PROJECT_ID}/files`,
      {
        storageId: fileContent,
        name: fileName,
      }
    );

    console.log('Arquivo enviado com sucesso!', response.data);
  } catch (error) {
    console.error('Erro ao enviar arquivo:', error.response?.data || error.message);
  }
};
