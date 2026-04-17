
import { CheckCheck, Clock, ClockArrowUp } from 'lucide-react-native';
import {
  responsiveWidth as wp,
  responsiveHeight as hp,
  responsiveFontSize as fp,
} from 'react-native-responsive-dimensions';

export { wp, hp, fp };

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
  prefilled: "#FFC300",

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
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};

export const formatNumber = (num: any) => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
};

export const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    color: "#2ecc71",
    icon: CheckCheck
  },
  pending: {
    label: "Pending",
    color: "#f39c12",
    icon: Clock// orange
  },
  in_progress: {
    label: "In Progress",
    color: "#3498db",
    icon: ClockArrowUp
  },
};


export const RECIPIENT_COLORS = [
  { recepient_color: "#e7baf5", recepient_border_color: "#c99cd7" },
  { recepient_color: "#98edff", recepient_border_color: "#7acfe1" },
  { recepient_color: "#c1f8ac", recepient_border_color: "#a3da8e" },
  { recepient_color: "#b58fd2", recepient_border_color: "#9771b4" },
  { recepient_color: "#9ed8e5", recepient_border_color: "#80bac7" },
  { recepient_color: "#f9ca95", recepient_border_color: "#dbac77" },
  { recepient_color: "#ead8bf", recepient_border_color: "#ccbaa1" },
  { recepient_color: "#eacaae", recepient_border_color: "#ccac90" },
  { recepient_color: "#dcc0c3", recepient_border_color: "#bea2a5" },
  { recepient_color: "#e597bb", recepient_border_color: "#c7799d" },
  { recepient_color: "#fdb3b9", recepient_border_color: "#df959b" },
  { recepient_color: "#b0f6d3", recepient_border_color: "#92d8b5" },
  { recepient_color: "#f5a5d2", recepient_border_color: "#d787b4" },
  { recepient_color: "#91feb1", recepient_border_color: "#73e093" },
  { recepient_color: "#f9cda4", recepient_border_color: "#dbaf86" },
  { recepient_color: "#d8e6dc", recepient_border_color: "#bac8be" },
  { recepient_color: "#b7ac84", recepient_border_color: "#998e66" },
  { recepient_color: "#87f9ef", recepient_border_color: "#69dbd1" },
  { recepient_color: "#9c90e1", recepient_border_color: "#7e72c3" },
  { recepient_color: "#ddc0bf", recepient_border_color: "#bfa2a1" },
  { recepient_color: "#aab5c6", recepient_border_color: "#8c97a8" },
  { recepient_color: "#a5b1d7", recepient_border_color: "#8793b9" },
  { recepient_color: "#faf5d0", recepient_border_color: "#dcd7b2" },
  { recepient_color: "#a1a8c5", recepient_border_color: "#838aa7" },
  { recepient_color: "#8a9ba5", recepient_border_color: "#6c7d87" },
  { recepient_color: "#abf5b7", recepient_border_color: "#8dd799" },
  { recepient_color: "#b3f6ff", recepient_border_color: "#95d8e1" },
  { recepient_color: "#a2d3c8", recepient_border_color: "#84b5aa" },
  { recepient_color: "#a2acb5", recepient_border_color: "#848e97" },
  { recepient_color: "#b3e3e7", recepient_border_color: "#95c5c9" },
  { recepient_color: "#cc8dcc", recepient_border_color: "#ae6fae" },
  { recepient_color: "#e4edc0", recepient_border_color: "#c6cfa2" },
  { recepient_color: "#a4f0d2", recepient_border_color: "#86d2b4" },
  { recepient_color: "#a59b86", recepient_border_color: "#877d68" },
  { recepient_color: "#9fad9e", recepient_border_color: "#818f80" },
  { recepient_color: "#abefa6", recepient_border_color: "#8dd188" },
  { recepient_color: "#81dda3", recepient_border_color: "#63bf85" },
  { recepient_color: "#d9d9c5", recepient_border_color: "#bbbba7" },
  { recepient_color: "#d3e0b6", recepient_border_color: "#b5c298" },
  { recepient_color: "#a2c2ed", recepient_border_color: "#84a4cf" },
  { recepient_color: "#f4d7e6", recepient_border_color: "#d6b9c8" },
  { recepient_color: "#dde995", recepient_border_color: "#bfcb77" },
  { recepient_color: "#cadb90", recepient_border_color: "#acbd72" },
  { recepient_color: "#c7ac8e", recepient_border_color: "#a98e70" },
  { recepient_color: "#f68ce4", recepient_border_color: "#d86ec6" },
  { recepient_color: "#d3d7c7", recepient_border_color: "#b5b9a9" },
  { recepient_color: "#b692a3", recepient_border_color: "#987485" },
  { recepient_color: "#b8c8a0", recepient_border_color: "#9aaa82" },
  { recepient_color: "#93d79c", recepient_border_color: "#75b97e" },
  { recepient_color: "#d29da6", recepient_border_color: "#b47f88" },
  { recepient_color: "#a0b0d9", recepient_border_color: "#8292bb" },
  { recepient_color: "#f4b9ba", recepient_border_color: "#d69b9c" },
  { recepient_color: "#e8fd81", recepient_border_color: "#cadf63" },
  { recepient_color: "#dc8feb", recepient_border_color: "#be71cd" },
  { recepient_color: "#f9b2c6", recepient_border_color: "#db94a8" },
  { recepient_color: "#cfdff3", recepient_border_color: "#b1c1d5" },
  { recepient_color: "#88fea7", recepient_border_color: "#6ae089" },
  { recepient_color: "#b4a095", recepient_border_color: "#968277" },
  { recepient_color: "#b2a5d2", recepient_border_color: "#9487b4" },
  { recepient_color: "#e483b5", recepient_border_color: "#c66597" },
  { recepient_color: "#f5a888", recepient_border_color: "#d78a6a" },
  { recepient_color: "#e4c68f", recepient_border_color: "#c6a871" },
  { recepient_color: "#c1dac8", recepient_border_color: "#a3bcaa" },
  { recepient_color: "#81bb9e", recepient_border_color: "#639d80" },
  { recepient_color: "#9c91ac", recepient_border_color: "#7e738e" },
  { recepient_color: "#9098ef", recepient_border_color: "#727ad1" },
  { recepient_color: "#bcfae1", recepient_border_color: "#9edcc3" },
  { recepient_color: "#90dda1", recepient_border_color: "#72bf83" },
  { recepient_color: "#ca90e0", recepient_border_color: "#ac72c2" },
  { recepient_color: "#b9a7c1", recepient_border_color: "#9b89a3" },
  { recepient_color: "#94e087", recepient_border_color: "#76c269" },
  { recepient_color: "#8583fd", recepient_border_color: "#6765df" },
  { recepient_color: "#9de79a", recepient_border_color: "#7fc97c" },
  { recepient_color: "#97b2d1", recepient_border_color: "#7994b3" },
  { recepient_color: "#c5d9a4", recepient_border_color: "#a7bb86" },
  { recepient_color: "#c3f793", recepient_border_color: "#a5d975" },
  { recepient_color: "#cceaa1", recepient_border_color: "#aecc83" },
  { recepient_color: "#e7ddce", recepient_border_color: "#c9bfb0" },
  { recepient_color: "#cd9bf3", recepient_border_color: "#af7dd5" },
  { recepient_color: "#c4e794", recepient_border_color: "#a6c976" },
  { recepient_color: "#e2aab1", recepient_border_color: "#c48c93" },
  { recepient_color: "#df868b", recepient_border_color: "#c1686d" },
  { recepient_color: "#a09c90", recepient_border_color: "#827e72" },
  { recepient_color: "#ddf0e1", recepient_border_color: "#bfd2c3" },
  { recepient_color: "#ffb6f6", recepient_border_color: "#e198d8" },
  { recepient_color: "#80a3b1", recepient_border_color: "#628593" },
  { recepient_color: "#cbd9f8", recepient_border_color: "#adbbda" },
  { recepient_color: "#a3ebe5", recepient_border_color: "#85cdc7" },
  { recepient_color: "#80acd3", recepient_border_color: "#628eb5" },
  { recepient_color: "#b990ef", recepient_border_color: "#9b72d1" },
  { recepient_color: "#8ce0b7", recepient_border_color: "#6ec299" },
  { recepient_color: "#d285e5", recepient_border_color: "#b467c7" },
  { recepient_color: "#e18180", recepient_border_color: "#c36362" },
  { recepient_color: "#829cc9", recepient_border_color: "#647eab" },
  { recepient_color: "#ade5eb", recepient_border_color: "#8fc7cd" },
  { recepient_color: "#bbbfb7", recepient_border_color: "#9da199" },
  { recepient_color: "#c18bd7", recepient_border_color: "#a36db9" },
  { recepient_color: "#f0cf92", recepient_border_color: "#d2b174" },
  { recepient_color: "#90d8d2", recepient_border_color: "#72bab4" },
  { recepient_color: "#8eaeed", recepient_border_color: "#7090cf" },
];