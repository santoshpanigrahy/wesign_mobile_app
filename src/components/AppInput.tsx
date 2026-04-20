import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';



import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, Fonts } from '@utils/Constants';

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
          >
            {hidePassword ? (
              <EyeOff size={20} color={Colors.placeholder} />
            ) : (
              <Eye size={20} color={Colors.placeholder} />
            )}
          </TouchableOpacity>
        ) : RightIcon ? (
          <TouchableOpacity onPress={props.onRightIconPress}>
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
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
  },

  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.text_primary,
    fontFamily: Fonts.Regular,

  },

  leftIcon: {
    marginRight: 8,
  },

  error: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});