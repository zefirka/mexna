'use strict';

var _ = require('lodash');
var includes = _.includes;
var isEmpty = _.isEmpty;

module.exports = mexna;

var DELIMETER = '||';
var REGEX = /\$\{(.+?)\}/g;
var EXPOSE_OUT_REGEX = /"?<!(.+?)!>"?/g;
var TERNARY_REGEX = /(.+)\s*\?\s*(.+)\s*:\s*(.+)/g;

/**
 * @public
 * @param {string} defaultStr
 * @param {object} options
 * @return {string}
 */
function mexna(defaultStr, options) {
    options = _.extend({
        regex: REGEX,
        delimeter: DELIMETER,
        ternaryRegex: TERNARY_REGEX,
        keys: {},
        i18n: {},
        translate: false
    }, options);

    if (isEmpty(options.keys) && !isEmpty(options.i18n)) {
        options.translate = true;
    }

    var isExposeOut = false;

    var strReplace = function(str) {
        return str.replace(options.regex, function (match, expression) {
            options.ternaryRegex.lastIndex = 0;
            var key = expression;
            var defaultValue = null;
            var value = null;
            var keys = options.keys;
            var keyValue;
            var isTernary = options.ternaryRegex.test(expression);
            if (isTernary) {
                var prop = key.split('?')[0].trim();
                var splitted = key.split('?')[1].split(':');
                var expandable = splitted[0].trim();
                var nonExpandable = splitted[1].trim();
                expandable = expandable.replace('#(', '${').replace(')#', '}');
                if (!options.keys[prop]) {
                    return nonExpandable;
                } else {
                    return strReplace(expandable);
                }
            }

            if (includes(expression, options.delimeter)) {
                var parts = expression.split(options.delimeter);
                if (parts.length !== 2) {
                    throw new Error('Syntax Error: ' + expression + ' has no valid default value');
                }

                var defaultValueExpression = _.trim(parts.pop().trim());
                key = _.trim(parts.pop());

                if (options.keys[key] === undefined) {
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

            if (options.strict && !options.keys.hasOwnProperty(key) && !defaultValue) {
                throw new Error('Range Error: `' + key + '` is not defined. '
                    + 'Consider adding it to the `keys` option or turning off the strict mode.');
            }

            keyValue = keys[key];
            value = keyValue === '' ? keyValue : (keyValue || defaultValue || '');

            if (typeof value === 'function') {
                value = value(key);
            }

            if (value && options.translate && typeof value === 'string') {
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
    };

    var replaceValue = strReplace(defaultStr);

    return isExposeOut ?
        replaceValue.replace(EXPOSE_OUT_REGEX, _exposeOutReplacer) :
        replaceValue;
}

/**
 * @private
 * @param {string} match
 * @param {key}    key
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