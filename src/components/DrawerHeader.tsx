import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { Menu, Bell } from 'lucide-react-native';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';

const DrawerHeader = ({ navigation, title = "Dashboard" }: any) => {

  return (
    <View style={styles.header}>


      <TouchableOpacity style={styles.headerIconWrapper} onPress={() => navigation.openDrawer()}>
        <Menu size={fp(3)} color={Colors.text_primary} strokeWidth={1.6} />
      </TouchableOpacity>


      <Text style={styles.title}>{title}</Text>


      <TouchableOpacity style={styles.headerIconWrapper}>
        <Bell size={fp(2.8)} color={Colors.text_primary} strokeWidth={1.6} />
      </TouchableOpacity>

    </View>
  );
};

export default DrawerHeader;

const styles = StyleSheet.create({
  header: {
    height: hp(7),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3.5),

    backgroundColor: '#FFFFFF',

    // shadow (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,

    // elevation (Android)
    // elevation: 4,
  },

  title: {
    fontSize: fp(2.2),
    fontFamily: Fonts.SemiBold,
    color: Colors.text_primary,
    letterSpacing: 0.5,
  },
  headerIconWrapper: { width: wp(10), height: wp(10), justifyContent: 'center', alignItems: 'center' }
});