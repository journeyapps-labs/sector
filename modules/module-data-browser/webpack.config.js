const { patchExportedLibrary } = require('@journeyapps-labs/lib-reactor-builder');
module.exports = (webpack) => {
  return patchExportedLibrary({
    w: webpack,
    module: '@journeyapps/db',
    dir: __dirname,
    alias: true
  });
};
