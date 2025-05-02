import React, { memo } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { StorageService } from '../services/StorageService';

interface CachedImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  fallback?: string;
}

const storageService = StorageService.getInstance();

export const CachedImage = memo(({ uri, style, fallback }: CachedImageProps) => {
  const [imageUri, setImageUri] = React.useState<string>(uri);

  React.useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        const cachedUri = await storageService.getCachedTrack<string>(uri);
        if (isMounted) {
          setImageUri(cachedUri || fallback || uri);
        }

        if (!cachedUri) {
          await storageService.cacheTrack(uri, uri);
        }
      } catch (error) {
        console.error("Erro ao carregar imagem:", error);
        if (isMounted && fallback) {
          setImageUri(fallback);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false; // Evita atualização do estado após desmontagem
    };
  }, [uri]);

  return (
    <Image
      source={{ uri: imageUri }}
      style={style}
      defaultSource={fallback ? { uri: fallback } : undefined}
    />
  );
});

CachedImage.displayName = 'CachedImage';
