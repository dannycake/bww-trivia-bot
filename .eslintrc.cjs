module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
    },
    'extends': 'google',
    'overrides': [],
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
    },
    'rules': {
        'max-len': ['error', {'code': 140}],
        'require-jsdoc': 'error',
        'quotes': ['error', 'single'],
        'indent': ['error', 4],
        'linebreak-style': ['error', 'windows'],
    },
};
