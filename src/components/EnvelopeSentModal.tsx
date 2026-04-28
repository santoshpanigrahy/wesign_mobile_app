import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Check, X } from 'lucide-react-native';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import AppButton from '@components/AppButton'; // Assuming you have this from previous files

const EnvelopeSentModal = ({ visible, onClose, onGoToDashboard }) => {
    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.overlay}
        >
            {/* Backdrop press closes the modal */}
            {/* <Pressable style={StyleSheet.absoluteFill} onPress={onClose} /> */}

            <Animated.View
                entering={ZoomIn.springify().damping(20).stiffness(200)}
                exiting={ZoomOut.duration(150)}
                style={styles.modalCard}
            >
                {/* Optional Top-Right Close Button */}
                {/* <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X color={Colors.text_secondary} size={fp(2.5)} />
                </TouchableOpacity> */}

                {/* Success Icon with Soft Halo */}
                <View style={styles.iconHalo}>
                    <View style={styles.iconCircle}>
                        <Check color={Colors.white} size={fp(4)} strokeWidth={3} />
                    </View>
                </View>

                {/* Typography */}
                <Text style={styles.title}>Sent Successfully!</Text>
                <Text style={styles.message}>
                    Envelope being processed. It may take few minutes to notify recipients.
                </Text>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <AppButton
                        title="Go to Dashboard"
                        onPress={onGoToDashboard}
                        style={styles.primaryButton}
                    />
                    {/* <TouchableOpacity onPress={onClose} style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Close</Text>
                    </TouchableOpacity> */}
                </View>
            </Animated.View>
        </Animated.View>
    );
};

export default React.memo(EnvelopeSentModal);

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(5),
    },
    modalCard: {
        backgroundColor: Colors.white,
        width: '100%',
        borderRadius: wp(4),
        paddingVertical: hp(4),
        paddingHorizontal: wp(6),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: hp(2),
        right: wp(4),
        padding: wp(1),
    },
    iconHalo: {
        width: wp(24),
        height: wp(24),
        borderRadius: wp(12),
        backgroundColor: 'rgba(76, 175, 80, 0.15)', // Light green translucent halo
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    iconCircle: {
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: '#4CAF50', // Standard Success Green (or use Colors.success)
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
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
        gap: hp(1.5),
    },
    primaryButton: {
        width: '100%',
        height: hp(6),
        borderRadius: wp(2),
    },
    secondaryButton: {
        width: '100%',
        height: hp(6),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(2),
    },
    secondaryButtonText: {
        fontFamily: Fonts.Medium,
        fontSize: fp(1.8),
        color: Colors.text_secondary,
    }
});