import { Image, InteractionManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import {

  ChevronRight,
  House,
  Inbox,
  Send,
  Settings,
  SquareChartGantt,
  SquarePen,
  Trash,
  User,
  X,

} from 'lucide-react-native';
import AppButton from './AppButton';
import { useAppDispatch } from '@redux/hooks';
import { logout } from '@redux/slices/authSlice';
import { navigate, replace, resetAndNavigate } from '@utils/NavigationUtils';



const CustomDrawer = (props: any) => {

  const { state, navigation } = props;

  const dispatch = useAppDispatch();

  if (!state) return null;
  const activeRoute = state.routeNames[state.index];

  const DrawerItem = ({ label, Icon, route, count }: any) => {
    const isActive = activeRoute === route;

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(route);
          navigation.closeDrawer();
        }}
        style={[styles.drawerItem, isActive && styles.activeItem]}
      >


        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: wp(3),
        }}>
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
        </View>

        {
          count && <Text
            style={[
              styles.count,
            ]}
          >
            {count}
          </Text>
        }


      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.drawerWrapper}>


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


      <View style={{ gap: wp(2), marginTop: wp(6), flex: 1 }}>
        <DrawerItem label="Home" Icon={House} route="Home" />
        <DrawerItem label="Inbox" Icon={Inbox} route="Inbox" />
        <DrawerItem label="Sent" Icon={Send} route="Sent" />
        <DrawerItem label="Drafts" Icon={SquarePen} route="Draft" />
        {/* <DrawerItem label="Deleted" Icon={Trash} route="Deleted" /> */}
        <DrawerItem label="Profile" Icon={User} route="Profile" />
      </View>

      <View>
        <AppButton title='Logout' style={{ backgroundColor: Colors.error }} onPress={() => {
          dispatch(logout());
          navigate('Login');
        }} />
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
    paddingBottom: hp(2)
  },

  drawerTop: {
    backgroundColor: Colors.white,
    height: hp(7),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  count: {
    // width: wp(7),
    paddingHorizontal: wp(1.3),
    paddingVertical: wp(0.4),
    backgroundColor: Colors.error,
    color: Colors.white,
    fontSize: fp(1),
    borderRadius: wp(4),
    fontFamily: Fonts.Regular
  },
  hr: {
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    width: wp(40)
  },
  drawerTabBtn: {
    height: hp(5.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    paddingHorizontal: wp(4),
    // backgroundColor: Colors.primary_light,
    borderRadius: wp(1)

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
    justifyContent: 'space-between'
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
