/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import * as Clarity from '@microsoft/react-native-clarity';

Clarity.initialize('xc2p8g5zzf', {
  logLevel: Clarity.LogLevel.None,
});

AppRegistry.registerComponent(appName, () => App);
