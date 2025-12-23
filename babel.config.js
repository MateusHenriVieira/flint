module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ADICIONE ESTA LINHA (Deve ser sempre a última da lista)
      'react-native-reanimated/plugin',
    ],
  };
};