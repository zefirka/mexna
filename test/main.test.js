'use strict';

const mexna = require('../mexna');

describe('mexna', () => {
    
    describe('interpolation of strings:', () => {
        const simpleString = 'I am a simple ${what}';
        const simpleStringWithDefault = 'I am a simple ${what || "string"}';
        const multipleString = 'I am a multiple with ${first} and ${second}';
        const multipleStringWithDefault = 'I am a multiple ${first || "first" and ${second || "second"}';

        it('with one value, no default', function() {
            mexna(simpleString, {
                keys: {
                    what: 'string'
                }
            }).must.to.be('I am simple string');
        });

        it('with one value, with default and given', function() {
            mexna(simpleStringWithDefault, {
                keys: {
                    what: 'test'
                }
            }).must.to.be('I am simple test');
        });

        it('with one value, with default and empty', function() {
            mexna(simpleStringWithDefault).must.to.be('I am simple string');
        });

        it('with different multiple value, no default', function() {
            mexna(multipleString, {
                keys: {
                    first: 'first',
                    second: 'second'
                }
            }).must.to.be('I am a multiple with first and second');
        });

        it('with different multiple, with default and given', function() {
            mexna(multipleStringWithDefault, {
                keys: {
                    first: 'a',
                    second: 'b'
                }
            }).must.to.be('I am simple test');
        });

        it('with different multiple, with default and empty', function() {
            mexna(multipleStringWithDefault).must.to.be('I am a multiple with first and second');
        });        
    })
    
});
