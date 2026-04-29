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
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useDispatch} from 'react-redux';

import AppInput from '@components/AppInput';
import AppButton from '@components/AppButton';
import {Colors, wp, hp, fp, Fonts} from '@utils/Constants';
import {loginUser, setUser, updateToken, updateUser} from '@slices/authSlice';

import {Mail, Lock} from 'lucide-react-native';
import {useAppSelector} from '@redux/hooks';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import api from '@utils/api';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {useFocusEffect} from '@react-navigation/native';
import {hideLoader, showLoader} from '@redux/slices/loaderSlice';

// GoogleSignin.configure({
//   scopes: ['https://www.googleapis.com/auth/drive.readonly'],
//   webClientId: '396564745764-disnuci9msclu3j7i3r9knke7b9qtr9f.apps.googleusercontent.com',

// });

const LoginScreen = () => {
  const dispatch = useDispatch();
  const {error} = useAppSelector(state => state.auth);
  const {control, handleSubmit} = useForm();

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => subscription.remove();
    }, []),
  );

  const onSubmit = (data: any) => {
    dispatch(loginUser(data) as any);
  };

  const signInWithGoogle = async () => {
    // try {
    //   await GoogleSignin.hasPlayServices();
    //   const userInfo = await GoogleSignin.signIn();
    //   const idToken = userInfo?.data?.idToken;
    //   if (!idToken) return;
    //   loginWithGoogle(idToken);
    // } catch (error) {
    //   console.log('Google Login Error:', error);
    //   Toast.show({ type: 'error', text1: error?.message });
    // }
  };

  const loginWithGoogle = async idToken => {
    dispatch(showLoader('Loading'));
    try {
      const requestData = {
        token: idToken,
      };

      const response = await api.post(`/auth/google/verify`, requestData);

      const data = response.data;

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
          dispatch(updateToken(data.token));

          // setTimeout(() => {
          navigate('Drawer');
          // }, 100);

          // Navigate Dashboard
        } else {
          Toast.show({type: 'error', text1: 'User not logged in'});
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        // backgroundColor="#fff"
      />

      {/* <Text style={styles.title}>Sign</Text> */}
      <View style={styles.inner}>
        <Image
          source={require('@assets/images/logo.png')}
          style={{
            width: wp(60),
            marginBottom: wp(15),
            marginHorizontal: 'auto',
          }}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to WeSign</Text>

        <View style={{gap: hp(2)}}>
          <Controller
            control={control}
            name="email"
            rules={{required: 'Email is required'}}
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
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {/* <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity> */}

        <AppButton
          title="Login"
          style={{marginTop: hp(3)}}
          onPress={handleSubmit(onSubmit)}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.or}>OR</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} onPress={signInWithGoogle}>
            <View style={styles.socialBtnWrapper}>
              <Image
                source={require('@assets/icons/google.png')}
                alt="google"
                style={styles.socialIcon}
              />
              <Text style={styles.socialText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.socialBtn}>
            <View style={styles.socialBtnWrapper}>
              <Image source={require('@assets/icons/apple.png')} alt='apple' style={styles.socialIcon} />
              <Text style={styles.socialText}>Continue with Apple</Text>
            </View>


          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn}>
            <View style={styles.socialBtnWrapper}>

              <Image source={require('@assets/icons/linkedin.png')} alt='linkedin' style={styles.socialIcon} />
              <Text style={styles.socialText}>Continue with Linkedin</Text>
            </View>
          </TouchableOpacity> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary_dark,
    justifyContent: 'flex-end',
  },

  inner: {
    flex: 1,
    // height:hp(80),
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
    paddingTop: hp(10),
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
    marginVertical: hp(3),
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
