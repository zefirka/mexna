'use strict';

var _ = require('lodash');

module.exports = mexna;

var DEFAULT_PRIMARY_REGEX = /\$\{(.+?)\}/g;
var DEFAULT_SECONDARY_REGEX = /"!<(.+?)>!"/g;

function mexna(str, options) {
    options = _.extend({
        regex: DEFAULT_PRIMARY_REGEX,
        secondaryRegex: DEFAULT_SECONDARY_REGEX,
        keys: {},
        i18n: {},
        translateStrings: false
    }, options);

    var primaryRegex = _.constant(options.regex);
    var isExposeOut = false;

    var replaceValue = str.replace(primaryRegex(), function (match, expression) {
        var key = expression;
        var hasDefaultValue = false;
        var defaultValue = null;
        var value = null;
        var keys = options.keys;
        var useDefaultValue = false;

        if (_.contains(expression, '||')) {
            hasDefaultValue = true;

            var parts = expression.split('||');
            if (parts.length !== 2) {
                throw new Error('Syntax Error: ' + expression + ' has no valid default value');
            }

            var defaultValueExpression = _.trim(parts.pop().trim());
            key = _.trim(parts.pop());

            if (!options.keys[key]) {
                useDefaultValue = true;
                try {
                    defaultValue = JSON.parse(defaultValueExpression);
                    if (options.translateStrings) {
                        defaultValue = options.i18n[defaultValue];
                    }
                } catch (e) {
                    if (!/^"(.+?)"$/.test(defaultValueExpression)) {
                        defaultValue = defaultValueExpression;
                    }
                }
            }
        }

        value = keys[key] || defaultValue;

        if (typeof value === 'function') {
            value = value(key);
        }

        if (options.translateStrings && typeof value === 'string') {
            value = options.i18n[value];
        }

        if (options.exposeOut && JSON.stringify(str) === '"' + match + '"' && useDefaultValue) {
            isExposeOut = true;
        }

        if (typeof value !== 'string') {
            return JSON.stringify(value);
        } else {
            return value;
        }
    });

    if (isExposeOut) {
        return JSON.parse(replaceValue);
    } else {
        return replaceValue;
    }
}
