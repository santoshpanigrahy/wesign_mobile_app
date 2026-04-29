import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';



import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';

const AppInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,

  required = true,
  ...props
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  return (
    <View style={styles.container}>

      {label && <Text style={styles.label}>{label}{required && <Text style={{ color: Colors.error }}>*</Text>}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? Colors.error
              : isFocused
                ? Colors.primary_dark
                : Colors.text_secondary,

          },
          (secureTextEntry || RightIcon) && { paddingRight: 0 }
        ]}
      >

        {LeftIcon && (
          <LeftIcon
            size={20}
            color={error
              ? Colors.error
              : isFocused
                ? Colors.primary_dark
                : Colors.text_secondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidePassword}

          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />


        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={styles.securityPassword}
          >
            {hidePassword ? (
              <EyeOff size={20} color={Colors.placeholder} />
            ) : (
              <Eye size={20} color={Colors.placeholder} />
            )}
          </TouchableOpacity>
        ) : RightIcon ? (
          <TouchableOpacity style={styles.securityPassword} onPress={props.onRightIconPress} >
            <RightIcon size={20} color={Colors.text_secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default AppInput;

const styles = StyleSheet.create({
  container: {
    // marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: Colors.text_primary,
    fontFamily: Fonts.Medium,
    marginBottom: 6,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 3,
    height: hp(5.7),
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
  },

  input: {
    flex: 1,

    fontSize: fp(1.9),
    color: Colors.text_primary,
    fontFamily: Fonts.Regular,

  },

  leftIcon: {
    marginRight: 8,
  },
  securityPassword: { height: '100%', width: wp(12), justifyContent: 'center', alignItems: 'center' },

  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});