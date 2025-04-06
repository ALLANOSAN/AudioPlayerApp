import React from 'react';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';

interface TransitionViewProps {
  children: React.ReactNode;
}

export const TransitionView: React.FC<TransitionViewProps> = ({ children }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};
