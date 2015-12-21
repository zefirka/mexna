'use strict';

const mexna = require('../mexna');

describe('examples from readme', () => {
    it('Simple string interpolation', () => {
        mexna('${a} and ${b} sit on tree', {
            keys: {
                a: "Jack",
                b: "Jill"
            }
        }).must.to.be('Jack and Jill sit on tree');
    });

    it('Interpolate translations instead of key values as is: 1', () => {
        mexna('А вот и ${a}, и ${b}', {
            keys: {
                a: 'first',
                b: 'second'
            },
            i18n: {
                first: 'первый',
                second: 'второй'
            },
            translate: true
        }).must.to.be('А вот и первый, и второй');
    });

    it('Interpolate translations instead of key values as is: 2', () => {
        mexna('А вот и ${a || first}, и ${b || second}', {
            i18n: {
                first: 'первый',
                second: 'второй'
            }
        }).must.to.be('А вот и первый, и второй');
    });

    it('Defaults', () => {
        mexna('Every ${count || "12 days"} we ${action || playing}').must.to.be('Every 12 days we playing');
    });

    it('Interpolate JSON', () => {
        mexna('Zomg teh JSON: ${json}', {
            keys: {
                json: {
                    a: {
                        the: 1
                    },
                    b: ['a','r','r','a','y']
                }
            }
        }).must.to.be('Zomg teh JSON: {"a":{"the":1},"b":["a","r","r","a","y"]}');
    });

    it('Interpolate JSON: defaults', () => {
        mexna('The default: ${non || {a: [1,2,3], b: {c: 10}} }').must.to.be('The default: {a: [1,2,3], b: {c: 10} }');
    });

    it('Exposing out', () => {
        mexna('{"period": "${preset}"}', {
            exposeOut: true,
            keys: {
                preset: ['2015-12-01', '2015-12-02']
            }
        }).must.to.be('{"period": ["2015-12-01","2015-12-02"]}');
    });

    it('Exposing out with defaults', () => {
        mexna('{"period": "${preset || ["2015-12-01", "2015-12-02"]}"}', {
            exposeOut: true
        }).must.to.be('{"period": ["2015-12-01","2015-12-02"]}');
    });
});
