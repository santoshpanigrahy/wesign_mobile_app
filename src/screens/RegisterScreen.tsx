import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  BackHandler,
  InteractionManager,
  Platform,
  Keyboard,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useDispatch} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import AppInput from '@components/AppInput';
import AppButton from '@components/AppButton';
import {Colors, wp, hp, fp, Fonts} from '@utils/Constants';
import {
  loginUser,
  setSubscription,
  setUser,
  updateToken,
  updateUser,
} from '@slices/authSlice';

import {Mail, Lock, User} from 'lucide-react-native';
import {useAppSelector} from '@redux/hooks';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import api from '@utils/api';
import {navigate, goBack, resetAndNavigate} from '@utils/NavigationUtils';
import {useFocusEffect} from '@react-navigation/native';
import {hideLoader, showLoader} from '@redux/slices/loaderSlice';
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import CustomSafeAreaView from '@components/CustomSafeAreaView';

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  webClientId:
    '396564745764-disnuci9msclu3j7i3r9knke7b9qtr9f.apps.googleusercontent.com',
  iosClientId:
    '396564745764-pg61tt1q905j1sol45agoj7kb1htc28a.apps.googleusercontent.com',
});

const RegisterScreen = () => {
  const dispatch = useDispatch();
  const {error} = useAppSelector(state => state.auth);
  const {control, handleSubmit, watch} = useForm();

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In Success:', userInfo);
      const idToken = userInfo?.data?.idToken;
      if (!idToken) return;
      loginWithGoogle(idToken);
    } catch (error) {
      console.log('Google Login Error:', error);
      Toast.show({type: 'error', text1: error?.message});
    }
  };

  async function onAppleButtonPress() {
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      // Note: it appears putting FULL_NAME first is important, see issue #293
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );
    // console.log(
    //   'Apple Credential State:',
    //   appleAuthRequestResponse.identityToken,
    // );
    console.log('Apple Credential State:', appleAuthRequestResponse);
    const idToken = appleAuthRequestResponse?.identityToken;
    if (!idToken) return;
    loginWithApple(idToken);
  }

  const loginWithGoogle = async idToken => {
    dispatch(showLoader('Loading'));
    try {
      const requestData = {
        token: idToken,
      };

      const response = await api.post(`/auth/google/verify`, requestData);

      const data = response.data;
      console.log('Google Login API Response:', data);
      if (data.status === true) {
        await GoogleSignin.signOut();

        if (data.is_user_registered) {
          const loginSuccessResponse = {
            user: data.user,
            token: data.token,
            subscription: data.subscription,
          };

          console.log(data.user, data.token);

          dispatch(setUser(data.user));
          dispatch(setSubscription(data?.subscription));

          console.log('Subscription ========> ', data?.subscription);
          dispatch(updateToken(data.token));
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          await AsyncStorage.setItem('token', data.token);
          // setTimeout(() => {
          navigate('Drawer');
          // }, 100);

          // Navigate Dashboard
        } else {
          const deviceId = await DeviceInfo.getUniqueId();

          const registerData = {
            first_name: data?.response?.given_name,
            last_name: data?.response?.family_name,
            email: data?.response?.email,
            isGoogleRegister: true,
            isLinkedinRegister: false,
            isAppleRegister: false,
            device_fingerprint: deviceId,
          };

          await createAccount(registerData);
        }
      } else {
        Toast.show({type: 'error', text1: data.message});
      }
    } catch (error) {
      console.log('Login API Error:', error);
      Toast.show({type: 'error', text1: 'Something went wrong'});
    } finally {
      dispatch(hideLoader());
    }
  };

  const loginWithApple = async idToken => {
    dispatch(showLoader('Loading'));
    try {
      const requestData = {
        token: idToken,
      };

      const response = await api.post(`/auth/apple/verify/mobile`, requestData);

      const data = response.data;
      console.log('Apple Login API Response:', data);
      if (data.status === true) {
        console.log('Apple Login', data.is_user_registered);
        if (data.is_user_registered) {
          const loginSuccessResponse = {
            user: data.user,
            token: data.token,
            subscription: data.subscription,
          };

          console.log(data.user, data.token);

          dispatch(setUser(data.user));
          dispatch(setSubscription(data?.subscription));

          console.log('Subscription ========> ', data?.subscription);
          console.log('171');
          dispatch(updateToken(data.token));
          console.log('173');
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          await AsyncStorage.setItem('token', data.token);
          // setTimeout(() => {
          navigate('Drawer');
          // }, 100);

          // Navigate Dashboard
        } else {
          console.log('179');
          const deviceId = await DeviceInfo.getUniqueId();
          const registerData = {
            first_name: data?.response?.given_name,
            last_name: data?.response?.family_name,
            email: data?.response?.email,
            isGoogleRegister: false,
            isLinkedinRegister: false,
            isAppleRegister: true,
            apple_user_id: data?.response?.user_id, // Apple user ID
            device_fingerprint: deviceId,
            // device_fingerprint: deviceId
          };

          await createAccount(registerData);
        }
      } else {
        Toast.show({type: 'error', text1: data.message});
      }
    } catch (error) {
      console.log('Login API Error:', error, error.response?.data);
      Toast.show({type: 'error', text1: 'Something went wrong'});
    } finally {
      dispatch(hideLoader());
    }
  };

  const createAccount = async (requestData: any) => {
    console.log('Submitted Data=========> ', requestData);

    try {
      dispatch(showLoader('Loading'));

      const response = await api.post('/auth/create/customer', requestData);
      console.log(response?.data);

      const res = response?.data;

      if (res?.status && res?.status_code === 200) {
        dispatch(setUser(res?.user_details));
        dispatch(updateToken(res?.token));

        await AsyncStorage.setItem('user', JSON.stringify(res?.user_details));
        // if (Platform.OS === 'ios') {
        //   resetAndNavigate('Payment', {fromLogin: true});
        // } else {
        await AsyncStorage.setItem('token', res.token);

        resetAndNavigate('Pricing', {fromRegister: true});
        // }
      } else {
        Toast.show({type: 'error', text1: res?.message});
      }
    } catch (error) {
      Toast.show({type: 'error', text1: error?.message});
    } finally {
      dispatch(hideLoader());
    }
  };

  const onSubmit = async (data: any) => {
    const {first_name, last_name, email, password} = data;

    const deviceId = await DeviceInfo.getUniqueId();

    try {
      dispatch(showLoader('Loading'));
      const requestData = {
        first_name,
        last_name,
        email,
        password,
        device_fingerprint: deviceId,
      };

      const response = await api.post('/auth/create/customer', requestData);

      const res = response?.data;

      if (res?.status && res?.status_code === 200) {
        dispatch(setUser(res?.user_details));
        Keyboard.dismiss();
        await AsyncStorage.setItem('user', JSON.stringify(res?.user_details));
        // if (Platform.OS === 'ios') {
        //   resetAndNavigate('Payment', {fromLogin: true});
        // } else {
        resetAndNavigate('Pricing', {fromRegister: true});
        // }
      } else {
        Toast.show({type: 'error', text1: res?.message});
      }
    } catch (error) {
      Toast.show({type: 'error', text1: error?.message});
    } finally {
      dispatch(hideLoader());
    }
  };

  const password = watch('password');
  console.log('274');
  return (
    <CustomSafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        // backgroundColor="#fff"
      />

      {/* <Text style={styles.title}>Sign</Text> */}
      <View style={{flex: 1}}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          enableOnAndroid={true}
          showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            {/* <Image
              source={require('@assets/images/logo.png')}
              style={{
                width: wp(60),
                marginBottom: wp(10),
                // marginTop: hp(3),
                marginHorizontal: 'auto',
              }}
              resizeMode="contain"
            /> */}

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to continue to WeSign</Text>

            {/* Social Login Icons */}
            <View style={styles.socialIconsContainer}>
              <TouchableOpacity
                style={styles.socialIconBtn}
                onPress={signInWithGoogle}>
                <Image
                  source={require('@assets/icons/google.png')}
                  alt="google"
                  style={styles.socialIconLarge}
                />
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.socialIconBtn}
                  onPress={() => onAppleButtonPress()}>
                  <Image
                    source={require('@assets/icons/apple.png')}
                    alt="apple"
                    style={styles.socialIconLarge}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.or}>OR</Text>
              <View style={styles.line} />
            </View>

            <View style={{gap: hp(1.5)}}>
              <Controller
                control={control}
                name="first_name"
                rules={{required: 'First name is required'}}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <AppInput
                    label="First name"
                    placeholder="Enter first name"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    leftIcon={User}
                  />
                )}
              />

              <Controller
                control={control}
                name="last_name"
                rules={{required: 'Last name is required'}}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <AppInput
                    label="Last name"
                    placeholder="Enter last name"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    leftIcon={User}
                  />
                )}
              />

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
                render={({field: {onChange, value}, fieldState: {error}}) => (
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

              <Controller
                control={control}
                name="password"
                rules={{required: 'Password is required'}}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <AppInput
                    label="Password"
                    placeholder="Enter password"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    secureTextEntry
                    leftIcon={Lock}
                  />
                )}
              />

              <Controller
                control={control}
                name="c_password"
                rules={{
                  required: 'Confirm Password is required',
                  validate: value =>
                    value === password || 'Passwords do not match',
                }}
                render={({field: {onChange, value}, fieldState: {error}}) => (
                  <AppInput
                    label="Confirm Password"
                    placeholder="Enter confirm password"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    secureTextEntry
                    leftIcon={Lock}
                  />
                )}
              />
            </View>

            <AppButton
              title="Create"
              style={{marginTop: hp(3)}}
              onPress={handleSubmit(onSubmit)}
            />

            <TouchableOpacity
              onPress={() => goBack()}
              style={{marginTop: hp(4)}}>
              <Text style={{textAlign: 'center', fontFamily: Fonts.Regular}}>
                Already have an account?{' '}
                <Text style={{color: Colors.primary, fontFamily: Fonts.Medium}}>
                  Sign In
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </CustomSafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: "#fff",
  //   // justifyContent: 'flex-end',
  // },

  inner: {
    flex: 1,
    // height:hp(80),
    paddingHorizontal: wp(6),
    paddingVertical: hp(5),
    // paddingTop: hp(8),
    // justifyContent: 'center',
    backgroundColor: Colors.background,
    // borderTopLeftRadius: wp(5),
    // borderTopRightRadius:wp(5)
  },

  title: {
    fontSize: fp(3),
    fontFamily: Fonts.Bold,
    color: Colors.text_primary,
    // marginBottom: hp(1),
  },

  subtitle: {
    fontSize: fp(1.8),
    color: Colors.text_secondary,
    marginBottom: hp(3),
    fontFamily: Fonts.Regular,
  },

  forgot: {
    alignSelf: 'flex-end',
    marginBottom: hp(2),
  },

  forgotText: {
    fontSize: fp(1.6),
    color: Colors.primary,
    fontFamily: Fonts.Medium,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(2),
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },

  or: {
    marginHorizontal: wp(2),
    color: Colors.placeholder,
    fontSize: fp(1.6),
  },

  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(4),
    marginTop: hp(2),
  },

  socialIconBtn: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  socialIconLarge: {
    width: wp(7),
    height: wp(7),
  },

  socialRow: {
    // flexDirection: 'row',
    gap: wp(3),
    alignItems: 'center',
  },

  socialBtn: {
    width: '100%',
    height: hp(6.5),
    borderRadius: wp(1),
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    flexDirection: 'row',
  },
  socialBtnWrapper: {
    width: wp(48),

    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: wp(3),
  },
  socialText: {
    color: Colors.text_primary,
    fontSize: fp(1.8),
    fontFamily: Fonts.Regular,
  },

  socialIcon: {
    width: wp(5),
    height: wp(5),
  },
  error: {
    color: Colors.error,
    fontSize: 14,
    fontFamily: Fonts.Regular,
    // textAlign:'center',
    // marginTop: 4,
  },
});
