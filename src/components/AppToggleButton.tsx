import { Fonts, fp } from "@utils/Constants";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

const AppToggleButton = ({
  value = false,
  onToggle,
  label,
  size = 50,
  containerStyle = {}
}) => {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 250 });
  }, [value]);


  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#ccc", "#1b84ec"]
    );

    return {
      backgroundColor,
    };
  });


  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: (progress.value * (size - size / 2) + (progress.value ? 0 : 2)),
        },
      ],
    };
  });

  return (
    <Pressable onPress={() => onToggle(!value)} style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Animated.View
        style={[
          styles.track,
          {
            width: size,
            height: (size / 2) + 2,
            borderRadius: size - 2,
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: (size / 2) - 2,
              height: (size / 2) - 2,
              borderRadius: size,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

export default AppToggleButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    fontSize: fp(1.9),
    color: "#333",
    fontFamily: Fonts.Medium

  },
  track: {
    justifyContent: "center",
    // padding: 2,
  },
  thumb: {
    backgroundColor: "#fff",
    elevation: 3,

  },
});