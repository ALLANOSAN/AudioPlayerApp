module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',
  
  plugins: [
    require.resolve("prettier-plugin-tailwindcss"),
    require.resolve("@prettier/plugin-xml")
  ],
  
  tailwindAttributes: ["className"],
  
  overrides: [
    {
      files: "*.xml",
      options: {
        tabWidth: 2,
        xmlSelfClosingSpace: true,
        xmlSortAttributesByKey: false
      }
    }
  ]
};
