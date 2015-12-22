'use strict';

var _ = require('lodash');
var isEmpty = _.isEmpty;

module.exports = mexna;

var DELIMETER = '||';
var REGEX = /\$\{(.+?)\}/g;
var EXPOSE_OUT_REGEX = /"?<!(.+?)!>"?/g;

/**
 * @public
 * @param {string} str
 * @param {object} options
 * @return {string}
 */
function mexna(str, options) {
    options = _.extend({
        regex: REGEX,
        delimeter: DELIMETER,
        keys: {},
        i18n: {},
        translate: false
    }, options);

    if (isEmpty(options.keys) && !isEmpty(options.i18n)) {
        options.translate = true;
    }

    var isExposeOut = false;

    var replaceValue = str.replace(options.regex, function (match, expression) {
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
                    if (!_isString(defaultValueExpression)) {
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

        return typeof value !== 'string' ?
            JSON.stringify(value) :
            value;
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

/**
 * @private
 * @param {string} str
 * @return {boolean}
 */
function _isString(str) {
    return /^"(.+?)"$/.test(str);
}
