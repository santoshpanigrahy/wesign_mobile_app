import AppLoader from '@components/AppLoader';
import Navigation from '@navigation/Navigation';

import { store } from '@redux/store';

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalProvider } from '@gorhom/portal';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['CountryModal: Support for defaultProps']);


const App = () => {

  

 


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider>

     
    <Provider store={store}>
       <SafeAreaProvider>
        <AppLoader/>
        <Navigation />

      </SafeAreaProvider>
      </Provider>
      
      
      
        <Toast />
         </PortalProvider>
    </GestureHandlerRootView>
  );
};

export default App;
