'use strict';

var _ = require('lodash');

module.exports = mexna;

var DEFAULT_PRIMARY_REGEX = /\$\{(.+?)\}/g;
var DEFAULT_SECONDARY_REGEX = /"!<(.+?)>!"/g;
var DELIMETER = '||';
var EXPOSE_OUT_REGEX = /"?<!(.+?)!>"?/g;

/**
 * @public
 * @param {string} str
 * @param {object} options
 * @return {string}
 */
function mexna(str, options) {
    options = _.extend({
        regex: DEFAULT_PRIMARY_REGEX,
        secondaryRegex: DEFAULT_SECONDARY_REGEX,
        delimeter: DELIMETER,
        keys: {},
        i18n: {},
        translate: false
    }, options);

    if (_.isEmpty(options.keys) && !_.isEmpty(options.i18n)) {
        options.translate = true;
    }

    var primaryRegex = _.constant(options.regex);
    var isExposeOut = false;

    var replaceValue = str.replace(primaryRegex(), function (match, expression) {
        var key = expression;
        var hasDefaultValue = false;
        var defaultValue = null;
        var value = null;
        var keys = options.keys;
        var useDefaultValue = false;

        if (_.contains(expression, options.delimeter)) {
            hasDefaultValue = true;

            var parts = expression.split(options.delimeter);
            if (parts.length !== 2) {
                throw new Error('Syntax Error: ' + expression + ' has no valid default value');
            }

            var defaultValueExpression = _.trim(parts.pop().trim());
            key = _.trim(parts.pop());

            if (options.keys[key] === undefined) {
                useDefaultValue = true;
                try {
                    defaultValue = JSON.parse(defaultValueExpression);
                    if (options.translate) {
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

        if (options.translate && typeof value === 'string') {
            value = options.i18n[value] || value;
        }

        if (options.exposeOut) {
            if (typeof value !== 'string') {
                value = '<!' + JSON.stringify(value) + '!>';
            }
            isExposeOut = true;
        }

        if (typeof value !== 'string') {
            return JSON.stringify(value);
        } else {
            return value;
        }
    });

    return isExposeOut ?
        replaceValue.replace(EXPOSE_OUT_REGEX, _exposeOutReplacer) :
        replaceValue;
}

/**
 * @private
 * @param {string} match
 * @param {key} match
 * @return {string}
 */
function _exposeOutReplacer(match, key) {
    return key;
}
