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

interface CustomSafeAreaViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

const CustomSafeAreaView: FC<CustomSafeAreaViewProps> = ({children, style}) => {
  return (
    <View style={[styles.container, style]}>
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
     <SafeAreaView style={{ flex: 1 }}>
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
