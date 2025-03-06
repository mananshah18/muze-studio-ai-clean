// This file is required for Parcel postcss plugin config
module.exports = {
    modules: true,
    plugins: {
        'postcss-modules': {
            globalModulePaths: [/.*nomodule.css/, /.*nomodule.scss/],
            generateScopedName: '[local]',
        },
    },
};
