import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Controller } from 'react-hook-form';
import { ChevronDown, KeyRound, Info } from 'lucide-react-native';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import AppInput from './AppInput';


function AccordionItem({ isExpanded, children, duration = 300 }) {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * (isExpanded.value ? 1 : 0), { duration })
  );

  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
    opacity: interpolate(derivedHeight.value, [0, height.value || 1], [0, 1]),
  }));

  return (
    <Animated.View style={[styles.animatedView, bodyStyle]}>
      <View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={styles.wrapper}>
        {children}
      </View>
    </Animated.View>
  );
}


export default function AdvanceSecurity({ control }) {
  const open = useSharedValue(false);

  const toggleAccordion = () => {
    open.value = !open.value;
  };


  const arrowStyle = useAnimatedStyle(() => {
    const rotation = interpolate(open.value ? 1 : 0, [0, 1], [0, 180]);
    return {
      transform: [{ rotate: `${withTiming(rotation)}deg` }],
    };
  });

  return (
    <View style={styles.container}>

      <TouchableOpacity
        onPress={toggleAccordion}
        activeOpacity={0.7}
        style={styles.header}
      >
        <Text style={styles.title}>Advance Security</Text>
        <Animated.View style={arrowStyle}>
          <ChevronDown size={24} color={Colors.text_primary} />
        </Animated.View>
      </TouchableOpacity>


      <AccordionItem isExpanded={open}>
        <View style={styles.innerContent}>


          <Controller
            control={control}
            name="access_code"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <AppInput
                required={false}
                label="Access Code"
                placeholder="Enter your access code"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                leftIcon={KeyRound}
              />
            )}
          />


          <Controller
            control={control}
            name="sign_request_alert"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={styles.labelGroup}>
                  <Text style={styles.switchLabel}>Sign Request Alert</Text>
                  <Info color={Colors.text_primary} size={fp(2.3)} />
                </View>
                <TouchableOpacity onPress={() => onChange(!value)}>
                  <Image
                    source={value ? require('@assets/icons/switch_on.png') : require('@assets/icons/switch_off.png')}
                    style={styles.switchImage}
                  />
                </TouchableOpacity>
              </View>
            )}
          />


          <Controller
            control={control}
            name="completed_alert"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={styles.labelGroup}>
                  <Text style={styles.switchLabel}>Completed Alert</Text>
                  <Info color={Colors.text_primary} size={fp(2.3)} />
                </View>
                <TouchableOpacity onPress={() => onChange(!value)}>
                  <Image
                    source={value ? require('@assets/icons/switch_on.png') : require('@assets/icons/switch_off.png')}
                    style={styles.switchImage}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </AccordionItem>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: hp(2.5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontFamily: Fonts.SemiBold,
    fontSize: fp(2.3),
    color: Colors.text_primary,
  },
  animatedView: {
    width: '100%',
    overflow: 'hidden',
  },
  wrapper: {
    width: '100%',
    position: 'absolute',
  },
  innerContent: {
    gap: hp(3),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  labelGroup: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  switchLabel: {
    fontSize: 14,
    color: Colors.text_primary,
    fontFamily: Fonts.Medium
  },
  switchImage: {
    width: wp(11),
    height: wp(7)
  }
});