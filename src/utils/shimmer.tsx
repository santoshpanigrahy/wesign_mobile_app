import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const useShimmer = () => {
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(300, { duration: 1200 }),
      -1
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return shimmerStyle;
};
