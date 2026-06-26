import AppLoader from '@components/AppLoader';
import Navigation from '@navigation/Navigation';

import { store } from '@redux/store';

import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalProvider } from '@gorhom/portal';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['CountryModal: Support for defaultProps']);
import { MenuProvider } from 'react-native-popup-menu';
import * as Clarity from '@microsoft/react-native-clarity';
const App = () => {

  useEffect(() => {
    Clarity.initialize('xc2p8g5zzf', {
      logLevel: Clarity.LogLevel.None,
    });
  }, []);




  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider>


        <Provider store={store}>
          <SafeAreaProvider>
            <MenuProvider>


              <AppLoader />

              <Navigation />
            </MenuProvider>

          </SafeAreaProvider>
        </Provider>



        <Toast />
      </PortalProvider>
    </GestureHandlerRootView>
  );
};

export default App;
