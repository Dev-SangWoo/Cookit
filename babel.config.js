module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'module:react-native-dotenv', // 이 플러그인이 꼭 있어야 함
      ['module-resolver', {
        alias: {
          '@': './',
        },
      }],
    ],
  };
};