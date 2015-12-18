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
    // var secondaryRegex = _.constant(options.secondaryRegex);
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
                    throw e;
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

        if (options.parse && JSON.stringify(str) === '"' + match + '"' && useDefaultValue) {
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

/*
Usage for:


setTitle
================================
mexna(title, {
    keys: params,
    translateStrings: true,
    i18n: {
        7 days: BEM.I18N('a-statistics-links', 'd;sd;sld')
    }
})

getDefaultCaption
================================
mexna(caption, {
    keys: {
        period: getReportLabelByPeriod
    }
})

_replaceReportTemplate
================================

Not ready

function _replaceReportTemplate(reportSettingsTemplate, reportParams) {
    return reportSettingsTemplate.replace(/\${(.+?)}/g, (match, key) => {
        let defaultValue = match;

        if (contains(key, '||')) {
            let keyValue = key.split('||');
            defaultValue = keyValue.pop() || defaultValue;
            key = keyValue.pop();
        }

        let value = reportParams[key] || defaultValue;

        // если это массив, то создаем еще один плейсхолдер
        // который реплейситься в следующем вызове
        // суть такова:
        // 'a,b'     -->     !<["a","b"]!>     -->     ["a","b"]
        if (contains(value, ',')) {
            let arrayString = value.split(',').map(i => `"${i}"`);
            return `!<[${arrayString}]>!`;
        } else {
            return value;
        }
    }).replace(/"!<(.+?)>!"/g, (match, array) => {
        return array;
    });
}
*/
