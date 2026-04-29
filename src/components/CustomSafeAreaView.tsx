import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Platform,
  StatusBar,
} from 'react-native';
import React, {FC, ReactNode} from 'react';
import {Colors, wp} from '@utils/Constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface CustomSafeAreaViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

const CustomSafeAreaView: FC<CustomSafeAreaViewProps> = ({children, style}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, style]}>
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
      <SafeAreaView style={{flex: 1, paddingTop: insets.top}}>
        {children}
      </SafeAreaView>
    </View>
  );
};

export default CustomSafeAreaView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.background,
    // paddingTop: Platform.OS === 'android' ? wp(8.5) : 0,
  },
});
