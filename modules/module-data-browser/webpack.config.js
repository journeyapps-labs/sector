const { patchExportedLibrary, patchImportedLibrary } = require('@journeyapps-labs/lib-reactor-builder');
module.exports = (webpack) => {
  webpack = patchExportedLibrary({
    w: webpack,
    module: '@journeyapps/db',
    dir: __dirname,
    alias: true
  });

  webpack = patchImportedLibrary({
    w: webpack,
    module: 'react-monaco-editor'
  });

  return webpack;
};
