import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Colors, Fonts, fp, hp, wp} from '@utils/Constants';
import {

  ChevronRight,
  House,
  Settings,
  SquareChartGantt,
  X,

} from 'lucide-react-native';

import { navigate } from '@utils/NavigationUtils';


const CustomDrawer = (props: any) => {

  const { state, navigation } = props;

  // SAFETY CHECK: If state is missing, don't try to render menu items yet
  if (!state) return null;
  const activeRoute = state.routeNames[state.index];

  const DrawerItem = ({ label, Icon, route }: any) => {
    const isActive = activeRoute === route;

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(route);
          navigation.closeDrawer();
        }}
        style={[styles.drawerItem, isActive && styles.activeItem]}
      >
        {/* Left Indicator */}
        {/* {isActive && <View style={styles.activeIndicator} />} */}

        <Icon
          size={fp(2.4)}
          strokeWidth={2}
          color={isActive ? Colors.primary : Colors.text_secondary}
        />

        <Text
          style={[
            styles.drawerText,
            { color: isActive ? Colors.primary : Colors.text_primary },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.drawerWrapper}>
      
      {/* Header */}
      <View style={styles.drawerTop}>
        <Image
          source={require('@assets/images/logo.png')}
          style={styles.drawerLogo}
          resizeMode="contain"
        />

        <TouchableOpacity onPress={() => navigation.closeDrawer()}>
          <X color={Colors.text_primary} strokeWidth={1.4} />
        </TouchableOpacity>
      </View>

      {/* <View style={styles.hr} /> */}

      {/* Menu */}
      <View style={{ gap: wp(2),marginTop:wp(6) }}>
        <DrawerItem label="Home" Icon={House} route="Home" />
        <DrawerItem label="Manage" Icon={SquareChartGantt} route="Manage" />
        <DrawerItem label="Settings" Icon={Settings} route="Settings" />
      </View>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  drawerWrapper: {
    position: 'relative',
    backgroundColor: Colors.background,
    flex: 1,
    paddingHorizontal: wp(6),
  },
  
  drawerTop: {
    backgroundColor: Colors.white,
  height:hp(7),
    flexDirection: 'row',
    justifyContent:'space-between',
   alignItems:'center'
  },
  hr: {
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth, // thinnest possible line
    marginVertical: wp(6),
  },

  iconWrapper: {
    gap: wp(1),
    alignItems: 'center',
  },

  icon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
 

  benifitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    backgroundColor: Colors.white,
    padding: wp(3),
    borderRadius: wp(2),
  },
  headerText: {
    fontSize: fp(1.8),
    marginBottom: wp(3),
    fontFamily: Fonts.Medium,
  },
  drawerLogo: {
    width:wp(40)
  },
  drawerTabBtn: {
    height: hp(5.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    paddingHorizontal: wp(4),
    // backgroundColor: Colors.primary_light,
    borderRadius:wp(1)
    
  },
   drawerTabText: {
    fontSize: fp(2),
    fontFamily: Fonts.Regular,
    color: Colors.text_primary,
  },
  activeTab: {
    backgroundColor: Colors.background_light,
     
  },
  drawerItem: {
  height: hp(5.5),
  flexDirection: 'row',
  alignItems: 'center',
  gap: wp(3),
  paddingHorizontal: wp(4),
  // borderRadius: wp(2),
  position: 'relative',
},

activeItem: {
  backgroundColor: Colors.background_light,
},

activeIndicator: {
  position: 'absolute',
  left: 0,
  height: '100%',
  width: 2.5,
  backgroundColor: Colors.primary,
  // borderRadius: 2,
},

drawerText: {
  fontSize: fp(2),
  fontFamily: Fonts.Medium,
},
});
