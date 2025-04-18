module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: ['nativewind/babel']
      },
      development: {
        plugins: ['nativewind/babel']
        ['module:react-native-dotenv', { moduleName: '@env', path: '.env' }]
      }
    }
  };
};