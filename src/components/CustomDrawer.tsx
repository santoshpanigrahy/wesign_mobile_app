import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView
} from 'react-native';
import React from 'react';
import { Colors, Fonts, fp, hp, wp } from '@utils/Constants';
import {
  Headset,
  HeartHandshake,
  House,
  Inbox,
  LogOut,
  Send,
  SquarePen,
  User,
  X,
} from 'lucide-react-native';
import { useAppDispatch } from '@redux/hooks';
import { logout } from '@redux/slices/authSlice';
import { navigate } from '@utils/NavigationUtils';

const CustomDrawer = (props: any) => {
  const { state, navigation } = props;
  const dispatch = useAppDispatch();

  const handleOpenPolicy = (type: string) => {
    if (type === 'term') {
      Linking.openURL('https://wesign.com/terms');
    } else if (type === 'privacy') {
      Linking.openURL('https://wesign.com/privacy-policy');
    }
  };

  if (!state) return null;
  const activeRoute = state.routeNames[state.index];


  const DrawerItem = ({ label, Icon, route, count, link = null }: any) => {
    const isActive = activeRoute === route;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (link) {
            Linking.openURL(link);
          } else {
            navigation.navigate(route);
            navigation.closeDrawer();

          }
        }}
        style={[styles.drawerItem, isActive && styles.activeItem]}
      >

        {isActive && <View style={styles.activeIndicator} />}

        <View style={styles.itemContent}>
          <Icon
            size={fp(2.4)}
            strokeWidth={isActive ? 2.5 : 2}
            color={isActive ? Colors.primary : Colors.text_secondary}
          />

          <Text
            style={[
              styles.drawerText,
              {
                color: isActive ? Colors.primary : Colors.text_primary,
                fontFamily: isActive ? Fonts.SemiBold : Fonts.Medium
              },
            ]}
          >
            {label}
          </Text>
        </View>

        {count && (
          <View style={styles.badgeContainer}>
            <Text style={styles.count}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.drawerWrapper}>


      <View style={styles.drawerTop}>
        <Image
          source={require('@assets/images/logo.png')}
          style={styles.drawerLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.closeDrawer()}
        >
          <X color={Colors.text_primary} strokeWidth={2} size={fp(2.6)} />
        </TouchableOpacity>
      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SectionHeader title="MAIN" />
        <DrawerItem label="Home" Icon={House} route="Home" />
        <DrawerItem label="Profile" Icon={User} route="Profile" />

        <View style={styles.separator} />

        <SectionHeader title="MAILBOX" />
        <DrawerItem label="Inbox" Icon={Inbox} route="Inbox" />
        <DrawerItem label="Sent" Icon={Send} route="Sent" />
        <DrawerItem label="Drafts" Icon={SquarePen} route="Draft" />

        <View style={styles.separator} />

        <SectionHeader title="SUPPORT" />
        <DrawerItem label="Contact Us" Icon={Headset} link='https://wesign.com/contact' />
        <DrawerItem label="Help Center" Icon={HeartHandshake} link='https://wesign.com/articles/' />
      </ScrollView>


      <View style={styles.drawerFooter}>


        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.logoutBtn}
          onPress={() => {
            dispatch(logout());
            navigate('Login');
          }}
        >
          <LogOut size={fp(2.4)} strokeWidth={2} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>


        <View style={styles.policyWrapper}>
          <Pressable style={styles.policyBtn} onPress={() => handleOpenPolicy('term')}>
            <Text style={styles.policyBtnText}>Terms & Conditions</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.policyBtn} onPress={() => handleOpenPolicy('privacy')}>
            <Text style={styles.policyBtnText}>Privacy Policy</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  drawerWrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  drawerTop: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50',
  },
  drawerLogo: {
    width: wp(35),
    height: hp(4),
  },
  closeButton: {
    padding: wp(1),
    backgroundColor: Colors.background_light,
    borderRadius: wp(2),
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  sectionHeader: {
    fontSize: fp(1.4),
    fontFamily: Fonts.Bold,
    color: Colors.text_secondary,
    letterSpacing: 1,
    marginLeft: wp(4),
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  drawerItem: {
    height: hp(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    marginBottom: hp(0.5),
    borderRadius: wp(3),
    position: 'relative',
    overflow: 'hidden',
  },
  activeItem: {
    backgroundColor: Colors.background_light,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '15%',
    height: '70%',
    width: wp(1),
    backgroundColor: Colors.primary,
    borderTopRightRadius: wp(1),
    borderBottomRightRadius: wp(1),
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3.5),
  },
  drawerText: {
    fontSize: fp(1.8),
  },
  badgeContainer: {
    backgroundColor: Colors.error,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.2),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    color: Colors.white,
    fontSize: fp(1.2),
    fontFamily: Fonts.SemiBold,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border + '40',
    // marginVertical: hp(0),
    marginHorizontal: wp(4),
  },
  drawerFooter: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(4),
    borderTopWidth: 1,
    borderTopColor: Colors.border + '50',
    backgroundColor: Colors.white,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    paddingVertical: hp(1.5),
    marginBottom: hp(2),
    borderRadius: wp(3),
    backgroundColor: Colors.error + '10',
  },
  logoutText: {
    fontSize: fp(1.8),
    fontFamily: Fonts.SemiBold,
    color: Colors.error,
  },
  policyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(3),
  },
  policyBtn: {
    paddingVertical: hp(0.5),
  },
  policyBtnText: {
    fontFamily: Fonts.Medium,
    fontSize: fp(1.4),
    color: Colors.text_secondary,
  },
  divider: {
    height: hp(1.5),
    width: 1,
    backgroundColor: Colors.border,
  },
});