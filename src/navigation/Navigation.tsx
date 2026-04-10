import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';


import SplashScreen from '@screens/SplashScreen';
import {navigationRef} from '@utils/NavigationUtils';
import LoginScreen from '@screens/LoginScreen';
import DrawerNavigation from './DrawerNavigation';
import UploadScreen from '@screens/UploadScreen';
import BottomSheetDemo from '@components/Demo';
import AddRecipientScreen from '@screens/AddRecipientScreen';
import CanvasScreen from '@screens/canvas/CanvasScreen';



const Stack = createNativeStackNavigator();
const Navigation = () => {



  return (
    <NavigationContainer ref={navigationRef}>
      

      
     
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{headerShown: false}}>
         
        
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
           <Stack.Screen name="Drawer" component={DrawerNavigation} />
           <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Recipient" component={AddRecipientScreen} />
          <Stack.Screen name="Canvas" component={CanvasScreen} />
        
           <Stack.Screen name="Demo" component={BottomSheetDemo} />
         
         
        </Stack.Navigator>
       
    </NavigationContainer>
  );
};

export default Navigation;
