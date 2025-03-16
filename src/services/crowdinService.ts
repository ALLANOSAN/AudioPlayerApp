const BASE_URL = 'https://api.crowdin.com/api/v2';
const TOKEN = '7b37d0562b066ed676a38f50e8f2c7dd3ae475099f523070ec07659efcd798fc48c7b01c082e4cf5'; // Substitua pelo token gerado no Crowdin
const PROJECT_ID = '771937'; // Substitua pelo ID do projeto no Crowdin

// Função para upload de arquivos de tradução
export const uploadTranslations = async (fileContent: string) => {
  try {
    // Primeiro, faça o upload do conteúdo para o armazenamento do Crowdin
    const storageResponse = await fetch(`${BASE_URL}/storages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: fileContent,
    });

    if (!storageResponse.ok) {
      throw new Error(`Erro ao enviar para o armazenamento: ${storageResponse.statusText}`);
    }

    const { id: storageId } = await storageResponse.json();

    // Agora, envie o arquivo armazenado para o projeto
    const fileResponse = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storageId,
        fileName: 'common.json', // Nome do arquivo
      }),
    });

    if (!fileResponse.ok) {
      throw new Error(`Erro ao enviar arquivo para o projeto: ${fileResponse.statusText}`);
    }

    console.log('Arquivo enviado com sucesso!');
  } catch (error) {
    console.error('Erro durante o upload:', error);
  }
};

// Função para download de arquivos de tradução
export const downloadTranslations = async (languageCode: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/projects/${PROJECT_ID}/languages/${languageCode}/translations`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao baixar traduções: ${response.statusText}`);
    }

    const translationFile = await response.json();
    console.log(`Arquivo traduzido para ${languageCode}:`, translationFile);

    // Aqui, você pode salvar o arquivo localmente ou atualizar o app com as traduções
    return translationFile;
  } catch (error) {
    console.error('Erro durante o download:', error);
  }
};
