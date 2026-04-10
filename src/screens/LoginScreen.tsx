import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import AppInput from '@components/AppInput';
import AppButton from '@components/AppButton';
import { Colors, wp, hp, fp, Fonts } from '@utils/Constants';
import { loginUser } from '@slices/authSlice';

// Lucide Icons
import {
  Mail,
  Lock,
 
} from 'lucide-react-native';
import { useAppSelector } from '@redux/hooks';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { error } = useAppSelector((state) => state.auth);
  const { control, handleSubmit } = useForm();

  const onSubmit = (data:any) => {
    dispatch(loginUser(data) as any);
  };

  return (
    <SafeAreaView style={styles.container}>
    <StatusBar
    barStyle="light-content"
    // backgroundColor="#fff"
      />
      
       {/* <Text style={styles.title}>Sign</Text> */}
      <View style={styles.inner}>

        <Image source={require('@assets/images/logo.png')} style={{width:wp(60),marginBottom:wp(15),marginHorizontal:'auto'}} resizeMode='contain' />

        {/* 🔷 Header */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue to WeSign
        </Text>

        {/* 📧 Email */}
        <Controller
          control={control}
          name="email"
          rules={{ required: 'Email is required' }}
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

        {/* 🔒 Password */}
        <Controller
          control={control}
          name="password"
          rules={{ required: 'Password is required' }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
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

        {
          error && <Text style={styles.error}>{error}</Text>
        }
        
        {/* 🔗 Forgot Password */}
        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* 🔘 Login Button */}
        <AppButton
          title="Login"
        
          onPress={handleSubmit(onSubmit)}
        />

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.or}>OR</Text>
          <View style={styles.line} />
        </View>

        {/* 🔐 Social Login */}
        <View style={styles.socialRow}>
          
          <TouchableOpacity style={styles.socialBtn}>
            <View style={styles.socialBtnWrapper}>

           
            <Image source={require('@assets/icons/google.png')} alt='google' style={styles.socialIcon} />
              <Text style={styles.socialText}>Continue with Google</Text>
              
               </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn}>
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
          </TouchableOpacity>

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
    paddingVertical:hp(4),
    justifyContent: 'center',
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
    alignItems:'center'
  },

  socialBtn: {
    width: "100%",
    height: hp(6.5),
    borderRadius: wp(1),
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent:'center',
    backgroundColor: Colors.white,
    flexDirection: 'row',
    
  },
  socialBtnWrapper: {
    width: wp(48),
    
    flexDirection:'row',
    justifyContent: 'flex-start',
    gap:wp(3)
   
  },
  socialText: {
    color: Colors.text_primary,
    fontSize: fp(1.8),
    fontFamily:Fonts.Regular
  },

  socialIcon:{
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