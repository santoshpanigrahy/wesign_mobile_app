import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Check, Sparkles } from 'lucide-react-native';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import AppButton from '@components/AppButton';

const SubscriptionSuccessModal = ({ visible, onContinue }) => {
    // If not visible, return null immediately so it doesn't block the screen
    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.overlay}
        >
            <Animated.View
                entering={ZoomIn.springify().damping(20).stiffness(200)}
                exiting={ZoomOut.duration(150)}
                style={styles.modalCard}
            >
                {/* Decorative Sparkles (Positioned absolutely inside the card) */}
                <View style={styles.sparkleLeft}>
                    <Sparkles color="#FBBF24" size={wp(6)} />
                </View>
                <View style={styles.sparkleRight}>
                    <Sparkles color="#FBBF24" size={wp(5)} />
                </View>

                {/* Premium Success Icon with Soft Halo */}
                <View style={styles.iconHalo}>
                    <View style={styles.iconCircle}>
                        <Check color={Colors.white} size={fp(4)} strokeWidth={3} />
                    </View>
                </View>

                {/* Typography */}
                <Text style={styles.title}>Subscription Active</Text>
                <Text style={styles.message}>
                    Your payment was successful. All premium tier benefits have been unlocked for your account.
                </Text>

                {/* Action Button */}
                <View style={styles.actionContainer}>
                    <AppButton
                        title="Continue"
                        onPress={onContinue}
                        style={styles.primaryButton}
                    />
                </View>
            </Animated.View>
        </Animated.View>
    );
};

export default React.memo(SubscriptionSuccessModal);

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker than standard to emphasize "Premium"
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(5),
    },
    modalCard: {
        backgroundColor: Colors.white,
        width: '100%',
        borderRadius: wp(5),
        paddingVertical: hp(4),
        paddingHorizontal: wp(6),
        alignItems: 'center',
        shadowColor: Colors.primary || '#3d6df0', // Uses your brand blue for the shadow glow
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        position: 'relative', // Allows sparkles to position relative to the card
    },
    sparkleLeft: {
        position: 'absolute',
        top: hp(3),
        left: wp(10),
        transform: [{ rotate: '-15deg' }]
    },
    sparkleRight: {
        position: 'absolute',
        top: hp(6),
        right: wp(10),
        transform: [{ rotate: '15deg' }]
    },
    iconHalo: {
        width: wp(24),
        height: wp(24),
        borderRadius: wp(12),
        backgroundColor: 'rgba(61, 109, 240, 0.15)', // Light blue translucent halo matching your gradient
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    iconCircle: {
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: '#3d6df0', // Deep premium blue
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3d6df0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontFamily: Fonts.Bold,
        fontSize: fp(2.6),
        color: Colors.text_primary,
        marginBottom: hp(1),
        textAlign: 'center',
    },
    message: {
        fontFamily: Fonts.Regular,
        fontSize: fp(1.8),
        color: Colors.text_secondary,
        textAlign: 'center',
        lineHeight: fp(2.6),
        marginBottom: hp(3.5),
        paddingHorizontal: wp(2),
    },
    actionContainer: {
        width: '100%',
    },
    primaryButton: {
        width: '100%',
        height: hp(6.5),
        borderRadius: wp(8), // Pill shape to match your pricing screen buttons
        backgroundColor: '#3d6df0',
    },
});