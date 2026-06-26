import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomSafeAreaView from '@components/CustomSafeAreaView'
import { ArrowLeft, LockKeyhole, Mail, ShieldAlert } from 'lucide-react-native'
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants'
import AppButton from '@components/AppButton'
import AppInput from '@components/AppInput'
import { Controller, useForm } from 'react-hook-form'
import { goBack } from '@utils/NavigationUtils'
import { useAppDispatch } from '@redux/hooks'
import { hideLoader, showLoader } from '@redux/slices/loaderSlice'
import api from '@utils/api'
import Toast from 'react-native-toast-message'

const ForgotPasswordScreen = () => {
    const { control, handleSubmit, reset } = useForm();
    const dispatch = useAppDispatch();



    const onSubmit = async (data: any) => {
        console.log(data)
        dispatch(showLoader('Sending'))
        try {
            const res = await api.get(`/auth/forgot/password/${data?.email}`)
            console.log(res)
            if (res?.data?.status) {
                Toast.show({ type: 'success', text1: 'Reset link sent successfully' })
                reset();
                goBack();
            } else {
                Toast.show({ type: 'error', text1: res?.data?.message })
            }

        } catch (error) {
            console.log(error)

            Toast.show({ type: 'error', text1: error?.message })
        } finally {
            dispatch(hideLoader());
        }
    };

    return (
        <CustomSafeAreaView>







            <View style={styles.container} >

                <Pressable style={styles.backButton} onPress={() => goBack()}>
                    <ArrowLeft color="#333" size={wp(6)} />
                </Pressable>

                {/* <Image
                    source={require('@assets/images/logo.png')}
                    style={{
                        width: wp(60),
                        marginBottom: wp(10),
                        marginHorizontal: 'auto',
                    }}
                    resizeMode="contain"
                /> */}
                <View style={styles.header}>
                    <LockKeyhole size={fp(10)} strokeWidth={1.5} color={Colors.success} />

                    <Text style={styles.headerText}>Forgot Password</Text>
                    <Text style={styles.subHeaderText}>
                        Please enter your email address to reset your password.
                    </Text>
                </View>


                <View style={{ gap: hp(2), marginTop: hp(3) }}>
                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Please enter a valid email',
                            },
                        }}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <AppInput
                                label="Email"
                                placeholder="Enter your email"
                                value={value}
                                onChangeText={onChange}
                                error={error?.message}
                                leftIcon={Mail}
                            />
                        )}
                    />


                </View>


                <AppButton
                    title="Send Reset link"
                    style={{ marginTop: hp(3) }}
                    onPress={handleSubmit(onSubmit)}
                />
            </View>
        </CustomSafeAreaView>
    )
}

export default ForgotPasswordScreen

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', paddingHorizontal: wp(6), paddingTop: hp(14) },
    header: {
        alignItems: 'center',

    },
    headerText: {
        fontFamily: Fonts.Bold,
        fontSize: fp(3),
        color: Colors.text_primary,
        marginTop: hp(2)
    },
    subHeaderText: {
        fontFamily: Fonts.Regular,
        fontSize: fp(1.8),
        textAlign: 'center',
        color: Colors.text_secondary,
        marginTop: hp(1)
    },
    backButton: {
        padding: wp(3),
        backgroundColor: Colors.background_light,
        borderRadius: wp(10),
        position: 'absolute',
        left: wp(6),
        top: wp(3)
    },
})