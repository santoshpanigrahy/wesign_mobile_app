import React, { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    Easing,
} from 'react-native-reanimated';

const TopSheet = ({ visible, onClose, children, height = 300 }) => {
    const [shouldRender, setShouldRender] = useState(visible);

    const progress = useSharedValue(visible ? 1 : 0);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
        }

        progress.value = withTiming(visible ? 1 : 0, {
            duration: visible ? 300 : 250,
            easing: Easing.out(Easing.cubic),
        }, (finished) => {
            if (!visible && finished) {
                runOnJS(setShouldRender)(false);
            }
        });

    }, [visible]);

    const panelStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -height * (1 - progress.value) }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
    }));

    if (!shouldRender) return null;

    return (
        <Animated.View style={[styles.overlay, overlayStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            <Animated.View style={[styles.panel, panelStyle, { height }]}>
                {children}
            </Animated.View>
        </Animated.View>
    );
};

export default TopSheet;

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 999,
        overflow: 'hidden'
    },
    panel: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        paddingVertical: 20,
    },
});