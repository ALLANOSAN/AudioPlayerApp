import React from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useTranslate } from '@tolgee/react';

interface TransitionViewProps {
  children?: React.ReactNode;
  message?: string;
}

export const TransitionView: React.FC<TransitionViewProps> = ({ children, message }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const { t } = useTranslate();

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children ? children : <>{message ? t(message) : t('comum.carregando')}</>}
    </Animated.View>
  );
};
