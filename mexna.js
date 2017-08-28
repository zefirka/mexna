import {includes, isEmpty, extend, trim} from 'lodash'

const DELIMETER = '||'
const REGEX = /\${(.+?)}/g
const EXPOSE_OUT_REGEX = /"?<!(.+?)!>"?/g
const TERNARY_REGEX = /(.+)\s*\?\s*(.+)\s*:\s*(.+)/g

/**
 * @public
 * @param {string} defaultStr
 * @param {object} options
 * @return {string}
 */
export default function mexna(defaultStr, opt) {
    const options = extend({
        regex: REGEX,
        delimeter: DELIMETER,
        ternaryRegex: TERNARY_REGEX,
        keys: {},
        i18n: {},
        translate: false
    }, opt)

    if (isEmpty(options.keys) && !isEmpty(options.i18n)) {
        options.translate = true
    }

    let isExposeOut = false

    const strReplace = (str) => {
        return str.replace(options.regex, function (match, expression) {
            const {keys} = options
            let key = expression
            let defaultValue
            let value

            if (options.ternaryRegex.test(str)) {
                const prop = key.split('?')[0].trim()
                let [expandable, nonExpandable] = key.split('?')[1].split(':')
                expandable = expandable.replace('#(', '${').replace(')#', '}')

                if (!options.keys[prop]) {
                    return nonExpandable
                } else {
                    return strReplace(expandable)
                }
            }

            if (includes(expression, options.delimeter)) {
                const parts = expression.split(options.delimeter)
                if (parts.length !== 2) {
                    throw new Error('Syntax Error: ' + expression + ' has no valid default value')
                }

                const defaultValueExpression = trim(parts.pop().trim())
                key = trim(parts.pop())

                if (options.keys[key] === undefined) {
                    try {
                        defaultValue = JSON.parse(defaultValueExpression)
                        if (options.translate) {
                            defaultValue = options.i18n[defaultValue]
                        }
                    } catch (e) {
                        if (!_isString(defaultValueExpression)) {
                            defaultValue = defaultValueExpression
                        }
                    }
                }
            }

            if (options.strict && !options.keys.hasOwnProperty(key) && !defaultValue) {
                throw new Error('Range Error: `' + key + '` is not defined. '
                    + 'Consider adding it to the `keys` option or turning off the strict mode.')
            }

            const keyValue = keys[key]
            value = keyValue === '' ? keyValue : (keyValue || defaultValue || '')

            if (typeof value === 'function') {
                value = value(key)
            }

            if (value && options.translate && typeof value === 'string') {
                value = options.i18n[value] || value
            }

            if (options.exposeOut) {
                if (typeof value !== 'string') {
                    value = '<!' + JSON.stringify(value) + '!>'
                }
                isExposeOut = true
            }

            return typeof value !== 'string' ?
                JSON.stringify(value) :
                value
        })
    }

    const replaceValue = strReplace(defaultStr)
    return isExposeOut ?
        replaceValue.replace(EXPOSE_OUT_REGEX, _exposeOutReplacer) :
        replaceValue
}

/**
 * @private
 * @param {string} match
 * @param {key}    key
 * @return {string}
 */
function _exposeOutReplacer(match, key) {
    return key
}

/**
 * @private
 * @param {string} str
 * @return {boolean}
 */
function _isString(str) {
    return /^"(.+?)"$/.test(str)
}