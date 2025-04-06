import React, { memo, useCallback } from 'react';
import { FlatList, ViewStyle, ListRenderItemInfo } from 'react-native';
import { Song } from '../types/song';
import { Album } from '../types/album';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  cover?: string;
}

interface OptimizedListProps<T> {
  data: T[];
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement;
  style?: ViewStyle;
  onEndReached?: () => void;
  onRefresh?: () => void;
  ListHeaderComponent?: React.ComponentType<any>;
  ListFooterComponent?: React.ComponentType<any>;
}

export const OptimizedList = memo(<T extends Song | Album | Playlist>(props: OptimizedListProps<T>) => {
  const {
    data,
    renderItem,
    style,
    onEndReached,
    onRefresh,
    ListHeaderComponent,
    ListFooterComponent
  } = props;

  const keyExtractor = useCallback((item: T) => item.id, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: 72,
    offset: 72 * index,
    index,
  }), []);

  const onEndReachedHandler = useCallback(() => {
    if (onEndReached) {
      onEndReached();
    }
  }, [onEndReached]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={8}
      windowSize={5}
      onEndReached={onEndReachedHandler}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={false}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      style={style}
      showsVerticalScrollIndicator={false}
      bounces={true}
      overScrollMode="never"
    />
  );
});
