import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    runOnJS,
    Easing,
} from 'react-native-reanimated';

const TopSheet = ({ visible, onClose, children }) => {
    const [shouldRender, setShouldRender] = useState(visible);

    // 1. Move height measurement to a Shared Value (Bypasses JS Thread)
    const contentHeight = useSharedValue(0);
    const progress = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            // Only trigger if we already have the height cached
            // Otherwise, onLayout will trigger it instantly once measured
            if (contentHeight.value > 0) {
                // 2. Use Spring for opening (feels significantly smoother)
                progress.value = withSpring(1, {
                    damping: 20,
                    stiffness: 200,
                    mass: 0.8
                });
            }
        } else {
            // Use Timing for closing (predictable and fast exit)
            progress.value = withTiming(0, {
                duration: 250,
                easing: Easing.out(Easing.cubic),
            }, (finished) => {
                if (finished) {
                    runOnJS(setShouldRender)(false);
                }
            });
        }
    }, [visible]);

    const handleLayout = (event) => {
        const h = event.nativeEvent.layout.height;
        if (h > 0 && contentHeight.value !== h) {
            contentHeight.value = h;

            // 3. If the sheet is supposed to be open, but was waiting for measurement,
            // fire the animation directly from the UI thread measurement event.
            if (visible && progress.value === 0) {
                progress.value = withSpring(1, {
                    damping: 20,
                    stiffness: 200,
                    mass: 0.8
                });
            }
        }
    };

    const panelStyle = useAnimatedStyle(() => {
        // Keep hidden while measuring
        if (contentHeight.value === 0) {
            return {
                transform: [{ translateY: -9999 }],
                opacity: 0,
            };
        }

        return {
            transform: [{ translateY: -contentHeight.value * (1 - progress.value) }],
            opacity: 1,
        };
    });

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
    }));

    if (!shouldRender) return null;

    return (
        <Animated.View style={[styles.overlay, overlayStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            {/* The animation and measurement now happen completely off the JS thread */}
            <Animated.View style={[styles.panel, panelStyle]} onLayout={handleLayout}>
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