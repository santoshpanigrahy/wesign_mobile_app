import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Check, Mail, User, X } from 'lucide-react-native';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import AppButton from '@components/AppButton'; // Assuming you have this from previous files
import AppInput from './AppInput';
import { Controller, useForm } from 'react-hook-form';

const IamSignerRecipientModal = ({ visible, onClose, onSave, editData }) => {


    const { control, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm({
        defaultValues: editData || {
            recepient_email: '',
            recepient_name: '',
        }
    });

    const onSubmit = (data) => {
        onSave(data);

        reset()
    }

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

                <View style={styles.modalheaderWrapper}>
                    <Text style={styles.modalHeader}>
                        Add Recipient
                    </Text>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <X color={Colors.text_secondary} size={fp(2)} />
                    </Pressable>
                </View>


                <View style={{ gap: hp(1.5) }}>

                    <Controller control={control} name="recepient_name" rules={{
                        required: 'Full name is required'
                    }} render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <AppInput label="Full Name" placeholder="Enter full name" value={value} onChangeText={onChange} error={error?.message} leftIcon={User} />
                    )} />

                    <Controller control={control} name="recepient_email" rules={{
                        required: 'Email is required', pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email address'
                        }
                    }} render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <AppInput label="Email" placeholder="Enter email" value={value} onChangeText={onChange} error={error?.message} leftIcon={Mail} />
                    )} />

                </View>

                <View style={styles.actionContainer}>
                    <AppButton
                        title="Submit"
                        onPress={handleSubmit(onSubmit)}
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

export default React.memo(IamSignerRecipientModal);

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
        paddingVertical: hp(3),
        paddingHorizontal: wp(6),
        // alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
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
        marginTop: hp(4)

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
    },
    modalheaderWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between", marginBottom: hp(3)
    },
    modalHeader: {
        fontFamily: Fonts.SemiBold,
        fontSize: fp(2.2),

    },
    closeButton: {
        width: wp(6),
        height: wp(6),
        borderRadius: wp(4),
        backgroundColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center'
    },
});