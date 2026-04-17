import React, { useCallback, useEffect, useState } from 'react';

import { createDrawerNavigator } from '@react-navigation/drawer';


import { BackHandler, ToastAndroid } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomSafeAreaView from '@components/CustomSafeAreaView';
import HomeScreen from '@screens/HomeScreen';
import CustomDrawer from '@components/CustomDrawer';
import SettingScreen from '@screens/SettingScreen';
import ManageScreen from '@screens/ManageScreen';
import SentScreen from '@screens/manage/SentScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {


  const navigation = useNavigation();
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  // useFocusEffect(
  //   useCallback(() => {
  //     let timeout;

  //     const backAction = () => {
  //       const state = navigation.getState();
  //       const currentRoute = state.routes[state.index];

  //       // ✅ If NOT Home → go back
  //       if (currentRoute.name !== 'Home') {
  //         navigation.goBack();
  //         return true;
  //       }

  //       // ✅ Double back to exit
  //       if (backPressedOnce) {
  //         BackHandler.exitApp();
  //         return true;
  //       }

  //       setBackPressedOnce(true);
  //       ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);

  //       timeout = setTimeout(() => {
  //         setBackPressedOnce(false);
  //       }, 2000);

  //       return true;
  //     };

  //     const subscription = BackHandler.addEventListener(
  //       "hardwareBackPress",
  //       backAction
  //     );

  //     return () => {
  //       subscription.remove();
  //       if (timeout) clearTimeout(timeout);
  //     };
  //   }, [backPressedOnce])
  // );

  return (
    <CustomSafeAreaView>
      {/* <AppOpenAdManager/> */}
      <Drawer.Navigator
        drawerContent={props => <CustomDrawer {...props} />}
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}>
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Manage" component={ManageScreen} />
        <Drawer.Screen name="Settings" component={SettingScreen} />
        <Drawer.Screen name="Sent" component={SentScreen} />
      </Drawer.Navigator>
    </CustomSafeAreaView>
  );
};

export default DrawerNavigation;
