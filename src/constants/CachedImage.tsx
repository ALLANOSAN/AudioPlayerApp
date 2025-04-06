import React, { memo } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { StorageService } from '../services/StorageService';

interface CachedImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  fallback?: string;
}

export const CachedImage = memo(({ uri, style, fallback }: CachedImageProps) => {
  const [imageUri, setImageUri] = React.useState<string>(uri);
  const storageService = StorageService.getInstance();

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        const cachedUri = await storageService.getCachedTrack<string>(uri);
        if (cachedUri) {
          setImageUri(cachedUri);
        } else {
          await storageService.cacheTrack(uri, uri);
        }
      } catch (error) {
        if (fallback) {
          setImageUri(fallback);
        }
      }
    };

    loadImage();
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