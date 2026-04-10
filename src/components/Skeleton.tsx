import { useShimmer } from "@utils/shimmer";
import { View } from "react-native";
import Animated from "react-native-reanimated";

const Skeleton = ({ style }) => {
  const shimmer = useShimmer();

  return (
    <View
      style={{
       ...style,
       
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            width: "40%",
            height: "100%",
            backgroundColor: "#F3F4F6",
            opacity: 0.6,
          },
          shimmer,
        ]}
      />
    </View>
  );
};

export default Skeleton;
