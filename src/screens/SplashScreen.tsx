
import { useAppDispatch } from "@redux/hooks";
import { loadUser } from "@redux/slices/authSlice";
import { Fonts, fp, hp, wp } from "@utils/Constants";
import { resetAndNavigate } from "@utils/NavigationUtils";

import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";







const SplashScreen = () => {

  const dispatch = useAppDispatch();
   const checkLogin = async () => {
      const res: any = await dispatch(loadUser() as any);

      if (res.payload && res.payload.user) {
        resetAndNavigate('Canvas');
      } else {
        resetAndNavigate("Login")
      }
    };
  
const [animationFinished, setAnimationFinished] = React.useState(false);

  const logoScale = useSharedValue(0);
  // const bgScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(5);
  const logoTranslateY = useSharedValue(0);

  const next = () => {
    setAnimationFinished(true)
  }

  

 useEffect(() => {
  // Background expand (faster + smoother)
  // bgScale.value = withTiming(MAX_SCALE, {
  //   duration: 900,
  //   easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  // });

  // Logo entrance
  logoScale.value = withSequence(
    withTiming(1.2, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    }),
    withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.exp),
    })
  );

  logoTranslateY.value = withTiming(-8, {
    duration: 800,
    easing: Easing.out(Easing.cubic),
  });

  // Title fade + rise (earlier start, smoother)
  textOpacity.value = withDelay(
    900,
    withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    }, (finished) => {
      if (finished) {
        runOnJS(next)();
      }
    })
  );

  textTranslateY.value = withDelay(
    900,
    withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    })
  );

}, []);


  const logoStyle = useAnimatedStyle(() => ({
    transform: [
    { translateY: logoTranslateY.value },
    { scale: logoScale.value },
  ],
  }));



  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const hasNavigated = useRef(false);

 


   useEffect(() => {
  if (!animationFinished) return;
 
  if (hasNavigated.current) return;

  hasNavigated.current = true;

  const timeout = setTimeout(async() => {
    await checkLogin();
  }, 300); 

  return () => clearTimeout(timeout);
}, [animationFinished]);
  return (
    <View style={styles.container}>
     

     
      <Animated.View style={[styles.gradientCircle,
      
      ]}>
        <LinearGradient
          colors={["#1C7ED6", "#1C7ED6"]}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

     
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={require("@assets/images/new-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

       
      </Animated.View>

   
      <Animated.Text style={[styles.title, textStyle]}>
        WESIGNDOC
      </Animated.Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  gradientCircle: {
    position: "absolute",
    width: wp(100),
    height: hp(100),
    // borderRadius: CIRCLE_SIZE / 2,
    overflow: "hidden",
  },

  gradient: {
    width: "100%",
    height: "100%",
  },

  logoContainer: {
    width: 100,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    zIndex: 10,
    // marginTop:-wp(6)
    
  },

  logo: {
    width: "60%",
    height: "60%",
  },

  title: {
   
    fontSize: fp(3),
   
    marginTop:wp(3),
    color: "#fff",
    letterSpacing: 1,
    fontFamily:Fonts.Bold
  },

  
});
