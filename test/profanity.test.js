/*
Copyright (C) 2014 Kano Computing Ltd.
License: http://opensource.org/licenses/MIT The MIT License (MIT)
*/

var should = require('should'),
    util = require('./util'),
    profanity = require('../lib/profanity');

describe('Profanity module', function () {
    describe('.validate(target)', function () {
 
        it('returns null with no swearwords found in string', function () {
            should(profanity.check('No swearwords here')).eql([]);
        });

        it('returns array of swearwords found in dirty string', function () {
            var results = profanity.check('something damn something something poo something');

            should(results).eql([
                'damn',
                'poo'
            ]);
        });

        it('doesn\'t target substrings', function () {
            var detected = profanity.check('foo ass bar'),
                notDetected = profanity.check('foo grass bar');

            should(detected).have.length(1);
            should(notDetected).have.length(0);
        });

        it('works equally for objects (Recursively) and arrays', function (done) {
            var results_obj = profanity.check({
                    foo: 'something damn',
                    bar: { test: 'something poo', bar: 'crap woooh' }
                }),
                results_arr = profanity.check([
                    'something damn',
                    [ 'something poo' ],
                    { foo: [ { bar: 'something crap' } ] }
                ]);

            should(results_obj).eql([
                'damn',
                'poo',
                'crap'
            ]);

            should(results_arr).eql([
                'damn',
                'poo',
                'crap'
            ]);

            done();
        });

    });
    describe('.purify(target)', function () {

        it('works in obscure (default) mode on a simple string', function (done) {
            var result = profanity.purify('boob damn something poo');

            result[0].should.equal('b**b d**n something p*o');
            result[1].should.eql([ 'boob', 'damn', 'poo' ]);


            done();
        });

        it('works in obscure (default) mode recursively with objects', function (done) {
            var result = profanity.purify({
                bar: { foo: 'something boob', bar: { foo: 'test poo' } },
                test: 'something damn'
            });

            result[0].should.have.keys('bar', 'test');
            result[0].bar.should.have.keys('foo', 'bar');
            result[0].bar.foo.should.equal('something b**b');
            result[0].bar.bar.should.have.keys('foo');
            result[0].bar.bar.foo.should.equal('test p*o');
            result[0].bar.foo.should.equal('something b**b');
            result[0].test.should.equal('something d**n');

            result[1].should.eql([ 'boob', 'poo', 'damn' ]);

            done();
        });

        it('works in replace mode on a simple string', function (done) {
            var result = profanity.purify('boob damn something poo', {
                replace: true
            });

            util.testPurified(result[0], '[ placeholder ] [ placeholder ] something [ placeholder ]');
            result[1].should.eql([ 'boob', 'damn', 'poo' ]);


            done();
        });

        it('works in replace mode recursively with objects', function (done) {
            var result = profanity.purify({
                bar: { foo: 'something boob', bar: { foo: 'test poo' } },
                test: 'something damn'
            }, {
                replace: true
            });

            result[0].should.have.keys('bar', 'test');
            result[0].bar.should.have.keys('foo', 'bar');
            util.testPurified(result[0].bar.foo, 'something [ placeholder ]');
            result[0].bar.bar.should.have.keys('foo');
            util.testPurified(result[0].bar.bar.foo, 'test [ placeholder ]');
            util.testPurified(result[0].bar.foo, 'something [ placeholder ]');
            util.testPurified(result[0].test, 'something [ placeholder ]');

            result[1].should.eql([ 'boob', 'poo', 'damn' ]);

            done();
        });

    });
});
