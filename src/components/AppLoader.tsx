import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

import { Colors, wp, hp, fp, Fonts } from '@utils/Constants';
import { useAppSelector } from '@redux/hooks';

const AppLoader = () => {
  const { loading, text } = useAppSelector((state:any) => state.loader);

  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator size="small" color={Colors.primary} />
        
        {text ? (
          <Text style={styles.text}>{text}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default AppLoader;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  box: {
    backgroundColor: Colors.white,
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(6),
   
    flexDirection:'row',
      alignItems: 'center',
    gap:wp(3),
    elevation: 5,
  },

  text: {
   
    fontSize: fp(1.8),
    color: Colors.text_primary,
    fontFamily: Fonts.Medium,
  },
});