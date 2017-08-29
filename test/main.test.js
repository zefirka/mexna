'use strict';

const mexna = require('../mexna');

describe('main functionality', () => {

    describe('interpolation of strings:', () => {
        const simpleString = 'I am a simple ${what}';
        const simpleStringWithDefault = 'I am a simple ${what || "string"}';
        const multipleString = 'I am a multiple with ${first} and ${second}';
        const multipleStringWithDefault = 'I am a multiple ${first || "first"} and ${second || "second"}';
        const ternaryString = 'I am a ternary ${string ? #(string)# : default}';
        const ternaryMultipleString = 'I am a multiple ternary ${first ? #(first)# : firstDefault} and ${second ? #(second)# : secondDefault}';

        it('with no value of key', () => {
            mexna(simpleString).must.to.be('I am a simple ');
        });

        it('with value of key equals to null', () => {
            mexna(simpleString, {
                keys: {
                    what: null
                }
            }).must.to.be('I am a simple ');
        });

        it('with one value, no default', () => {
            mexna(simpleString, {
                keys: {
                    what: 'string'
                }
            }).must.to.be('I am a simple string');
        });

        it('with one value, with default and given', () => {
            mexna(simpleStringWithDefault, {
                keys: {
                    what: 'test'
                }
            }).must.to.be('I am a simple test');
        });

        it('with one value, with default and empty', () => {
            mexna(simpleStringWithDefault).must.to.be('I am a simple string');
        });

        it('with value as empty string, no default', () => {
            mexna(simpleString, {
                keys: {
                    what: ''
                }
            }).must.to.be('I am a simple ');
        });

        it('with different multiple value, no default', () => {
            mexna(multipleString, {
                keys: {
                    first: 'first',
                    second: 'second'
                }
            }).must.to.be('I am a multiple with first and second');
        });

        it('with different multiple, with default and given', () => {
            mexna(multipleStringWithDefault, {
                keys: {
                    first: 'a',
                    second: 'b'
                }
            }).must.to.be('I am a multiple a and b');
        });

        it('with different multiple, with default and empty', () => {
            mexna(multipleStringWithDefault).must.to.be('I am a multiple first and second');
        });

        describe('ternary strings:', () => {
            it('with value', () => {
                mexna(ternaryString, {
                    keys: {
                        string: 'str'
                    }
                }).must.to.be('I am a ternary str')
            });

            it('without value, with default', () => {
                mexna(ternaryString).must.to.be('I am a ternary default')
            });

            it('with different multiple, with default and given', () => {
                mexna(ternaryMultipleString, {
                    keys: {
                        first: 'F',
                        second: 'S'
                    }
                }).must.to.be('I am a multiple ternary F and S');
            });

            it('with different multiple, with default and without given', () => {
                mexna(ternaryMultipleString).must.to.be('I am a multiple ternary firstDefault and secondDefault');
            });
        });
    });

    describe('interpolation of types', () => {
        const strArr = 'I am ${array || [1,2,3]}';
        const strArrOut = '${array || [1, 2, 3]}';

        it('array out', () => {
            mexna(strArrOut, {
                exposeOut: true
            }).must.to.eql("[1,2,3]");
        });

        it('array out: with value', () => {
            mexna(strArrOut, {
                keys: {
                    array: 'test'
                },
                exposeOut: true
            }).must.to.eql('test');
        });

        it('array in', () => {
            mexna(strArr, {
                exposeOut: true
            }).must.to.be('I am [1,2,3]');
        });
    });

    describe('strings and defaults', () => {
        const query = '{"period":"${period||30days}"';
        const caption = 'hello ${id} and hello ${test||"trans"}';
        const params = {};

        it('should paste defaults', () => {
            mexna(query, {
                keys: params,
                exposeOut: true
            }).must.to.be('{"period":"30days"')
        });

        it('should paste values if has not translations', () => {
            mexna(caption, {
                keys: {
                    id: 1,
                    test: '0'
                },
                translateString: true
            }).must.to.be('hello 1 and hello 0');
        });

        it('should expose out of string', () => {
            mexna(query, {
                keys: {
                    'period': ['2015-11-03', '2015-12-21']
                },
                exposeOut: true
            }).must.to.be('{"period":["2015-11-03","2015-12-21"]');
        });
    });

    describe('strict mode', () => {
        it('should throw an exception for the undefined key', () => {
            (() => mexna('${missing_key}', {
                keys: {},
                strict: true
            })).must.throw(Error, /^Range Error: `missing_key`/);
        });

        it('shouldn\'t throw an exception for the undefined key with default value', () => {
            mexna('${missing_key || "yo"}', {
              keys: {},
              strict: true
            }).must.to.be('yo');
        });
    });
});
