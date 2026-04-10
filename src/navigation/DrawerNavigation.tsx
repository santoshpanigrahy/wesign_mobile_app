import React, { useEffect, useState } from 'react';

import {createDrawerNavigator} from '@react-navigation/drawer';


import { BackHandler, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomSafeAreaView from '@components/CustomSafeAreaView';
import HomeScreen from '@screens/HomeScreen';
import CustomDrawer from '@components/CustomDrawer';
import SettingScreen from '@screens/SettingScreen';
import ManageScreen from '@screens/ManageScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {


   const navigation = useNavigation();
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  useEffect(() => {
    const backAction = () => {
      // ✅ If child screen exists, just go back normally
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }

      // ✅ Root Screen → Double back to exit
      if (backPressedOnce) {
        BackHandler.exitApp();
        return true;
      }

      setBackPressedOnce(true);
      ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);

      setTimeout(() => {
        setBackPressedOnce(false);
      }, 2000);

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, [backPressedOnce, navigation]);

  return (
    <CustomSafeAreaView>
       {/* <AppOpenAdManager/> */}
      <Drawer.Navigator
        drawerContent={props => <CustomDrawer {...props} />}
        initialRouteName="Home"
        screenOptions={{headerShown: false}}>
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Manage" component={ManageScreen} />
        <Drawer.Screen name="Settings" component={SettingScreen} />
      </Drawer.Navigator>
     </CustomSafeAreaView>
  );
};

export default DrawerNavigation;
