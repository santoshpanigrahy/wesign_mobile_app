
import {
  responsiveWidth as wp,
  responsiveHeight as hp,
  responsiveFontSize as fp,
} from 'react-native-responsive-dimensions';

export {wp, hp, fp};

export const BOTTOM_TAB_HEIGHT = 90;

export const Colors = {
  // 🌟 Brand Colors
  primary: '#2563EB',        // main light blue
  primary_dark: '#1C7ED6',   // for buttons / pressed state
  primary_light: '#EFF6FF',  // backgrounds / highlights

  // 🧾 Text Colors
  text_primary: '#1A1A1A',
  text_secondary: '#5F6B7A',
  placeholder: '#9AA4B2',

  // 🎨 Backgrounds
  background: '#FFFFFF',
  background_light: '#F7F9FC',

  // 🔲 Borders & UI
  border: '#E3E8EF',
  divider: '#EEF2F6',

  // 🔘 States
  success: '#16A34A',
  error: '#EF4444',
  warning: '#F59E0B',
  prefilled:"#FFC300",

  // 🧩 Extras
  white: '#FFFFFF',
  black: '#000000',
};

export enum Fonts {
  Regular = 'Inter-Regular',
  Medium = 'Inter-Medium',
  SemiBold = 'Inter-SemiBold',
  Bold = 'Inter-Bold',
}

export const lightColors = [
  'rgba(255,255,255,1)',
  'rgba(255,255,255,0.9)',
  'rgba(255,255,255,0.7)',
  'rgba(255,255,255,0.6)',
  'rgba(255,255,255,0.5)',
  'rgba(255,255,255,0.4)',
  'rgba(255,255,255,0.003)',
];

export const darkWeatherColors = [
  'rgba(54, 67, 92, 1)',
  'rgba(54, 67, 92, 0.9)',
  'rgba(54, 67, 92, 0.8)',
  'rgba(54, 67, 92, 0.2)',
  'rgba(54, 67, 92, 0.0)',
];

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString('en-US', {month: 'short'});
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};

export const formatNumber = (num:any) => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
};