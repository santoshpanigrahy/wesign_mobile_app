module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [

      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@assets': './src/assets',
            '@features': './src/features',
            '@navigation': './src/navigation',
            '@components': './src/components',
            '@unistyles': './src/unistyles',
            '@services': './src/services',
            '@redux': './src/redux',
            '@slices': './src/redux/slices',
            '@states': './src/states',
            '@utils': './src/utils',
            '@screens': './src/screens',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin'
    ],
  };
};
