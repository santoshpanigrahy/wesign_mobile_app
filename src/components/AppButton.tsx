import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors, wp, hp, fp, Fonts } from '@utils/Constants';

const AppButton = ({
  title,
  onPress,
  variant = 'filled',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  style,
  textStyle,
}: any) => {
  const isFilled = variant === 'filled';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isFilled ? styles.filled : styles.outlined,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isFilled ? Colors.white : Colors.primary}
        />
      ) : (
        <View style={styles.content}>

          {LeftIcon && (
            <LeftIcon
              size={fp(2)}
              color={isFilled ? Colors.white : Colors.primary}
              style={styles.icon}
            />
          )}

          <Text
            style={[
              styles.text,
              isFilled ? styles.filledText : styles.outlinedText,
              textStyle,
            ]}
          >
            {title}
          </Text>

          {RightIcon && (
            <RightIcon
              size={fp(2)}
              color={isFilled ? Colors.white : Colors.primary_dark}
              style={styles.icon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    height: hp(6.5),
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filled: {
    backgroundColor: Colors.primary_dark,
  },

  outlined: {
    borderWidth: 1,
    borderColor: Colors.primary_dark,
    backgroundColor: 'transparent',
  },

  disabled: {
    opacity: 0.6,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    fontSize: fp(1.8),
    fontFamily: Fonts.SemiBold,
  },

  filledText: {
    color: Colors.white,
  },

  outlinedText: {
    color: Colors.primary_dark,
  },

  icon: {
    marginHorizontal: wp(1.5),
  },
});