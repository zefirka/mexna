'use strict';

const mexna = require('../mexna');

describe('main functionality', () => {
    
    describe('interpolation of strings:', () => {
        const simpleString = 'I am a simple ${what}';
        const simpleStringWithDefault = 'I am a simple ${what || "string"}';
        const multipleString = 'I am a multiple with ${first} and ${second}';
        const multipleStringWithDefault = 'I am a multiple ${first || "first"} and ${second || "second"}';

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
    })
    
    describe('interpolation of types', () => {
        const strArr = 'I am ${array || [1,2,3]}';
        const strBool = 'I am ${boolean || false}';
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
});
