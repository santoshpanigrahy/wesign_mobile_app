import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate,
    runOnJS
} from 'react-native-reanimated';
import { HandMetal, ArrowLeftRight, ArrowLeft, ArrowRight, Hand } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';

const SwipeHint = ({ setShowHint }) => {
    const movement = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(500, withTiming(1, { duration: 800 }));

        movement.value = withDelay(
            1200,
            withSequence(
                withTiming(1, {
                    duration: 1000,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }),
                withTiming(0, {
                    duration: 1000,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }),
                withTiming(1, {
                    duration: 1000,
                    easing: Easing.bezier(0.4, 0, 0.2, 1),
                }),
                withTiming(
                    0,
                    {
                        duration: 1000,
                        easing: Easing.bezier(0.4, 0, 0.2, 1),
                    },
                    (finished) => {
                        if (finished) {
                            runOnJS(setShowHint)(false);
                        }
                    }
                ),
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        // Translate the whole component horizontally
        const translateX = interpolate(movement.value, [0, 1], [-40, 40]);

        return {
            opacity: opacity.value,
            transform: [{ translateX }],
        };
    });

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View style={[styles.hintWrapper, animatedStyle]}>

                {/* Modern Background Glow */}
                {/* <LinearGradient
                    colors={['rgba(99, 102, 241, 0.2)', 'rgba(236, 72, 153, 0.2)']}
                    style={styles.glowCircle}
                /> */}

                {/* Top Icons Layer */}
                <View style={styles.iconLayer}>
                    <ArrowLeft color="#ffff" size={30} strokeWidth={1} />
                    <View style={styles.handContainer}>
                        <Image source={require('@assets/icons/select.png')} resizeMode='contain' style={{ width: wp(15) }} />
                    </View>

                    <ArrowRight color="#fff" size={30} strokeWidth={1} />

                </View>

            </Animated.View>

            <Text style={{ fontFamily: Fonts.SemiBold, color: Colors.white, marginTop: hp(7), fontSize: fp(2) }}>Swipe Pages</Text>

            {/* <Pressable style={{ borderWidth: 1, borderColor: "#fff", borderRadius: wp(5), paddingHorizontal: wp(7), paddingVertical: hp(1), marginTop: hp(5) }}>
                <Text style={{ color: Colors.white, fontFamily: Fonts.Regular }}>Skip</Text>
            </Pressable> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    hintWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 100,
    },
    glowCircle: {
        position: 'absolute',
        width: 200,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    iconLayer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row', gap: wp(4)
    },
    handContainer: {
        // position: 'absolute',
        // top: 10,
        marginTop: hp(7),
        // Slight shadow to make the hand "pop"
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default SwipeHint;