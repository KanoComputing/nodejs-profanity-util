/*
Copyright (C) 2014, 2017 Kano Computing Ltd.
License: http://opensource.org/licenses/MIT The MIT License (MIT)
*/

var should = require('should'),
    util = require('./util'),
    profanity = require('../lib/profanity');

describe('Profanity module', function () {
    describe('.check(target)', function () {

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

        it('does target substrings with the substrings option', function () {
            var detected = profanity.check('foo ass bar', {substrings: true}),
                alsoDetected = profanity.check('foo grass bar', {substrings: true});

            should(detected).have.length(1);
            should(alsoDetected).have.length(1);
        });

        it('substring matching is less strict with the substrings option "lite", e.g not matching "liverpool"', function () {
            var detected = profanity.check( 'foo ass bar', { substrings: "lite" } ),
                alsoDetected = profanity.check('foo grass bar liverpool grasscutta', {substrings: true}),
                notDetected = profanity.check( 'foo grass bar liverpool grasscutta', { substrings: "lite" });

            should( detected ).have.length( 1 );
            should(alsoDetected).have.length( 3 );            
            should( notDetected ).have.length( 0 );
        });

        it('works with a custom list (the legacy way)', function () {
            var string = 'something daisy something something lol woot woot something',
                list = ['daisy', 'lol', 'woot'],
                results = profanity.check(string, list);

            should(results).eql([
                'daisy',
                'lol',
                'woot',
                'woot'
            ]);
        });

        it('works with a custom list (via options)', function () {
            var string = 'something daisy something something lol woot woot something',
                list = ['daisy', 'lol', 'woot'],
                results = profanity.check(string, {forbiddenList: list});

            should(results).eql([
                'daisy',
                'lol',
                'woot',
                'woot'
            ]);
        });

        it('works equally for objects (Recursively) and arrays', function (done) {
            var results_obj = profanity.check({
                    foo: 'something damn',
                    bar: { test: 'something poo', bar: 'crap woooh' }
                }),
                results_arr = profanity.check([
                    'something damn',
                    ['something poo'],
                    { foo: [{ bar: 'something crap' }] }
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
            result[1].should.eql(['boob', 'damn', 'poo']);


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

            result[1].should.eql(['boob', 'poo', 'damn']);

            done();
        });


        it('works in obscure (default) mode on a simple string with substrings', function (done) {
            var result = profanity.purify('boob damn something poo grass5', {substrings: true});

            result[0].should.equal('b**b d**n something p*o gra*s5');
            result[1].should.eql(['boob', 'damn', 'poo', 'ass']);


            done();
        });

        it('works in replace mode on a simple string', function (done) {
            var result = profanity.purify('Boob damn something poo', {
                replace: true
            });

            util.testPurified(result[0], '[ placeholder ] [ placeholder ] something [ placeholder ]');
            result[1].should.eql(['Boob', 'damn', 'poo']);

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

            result[1].should.eql(['boob', 'poo', 'damn']);

            done();
        });

        it('works in replace mode with mapping on a simple string', function (done) {
            var result = profanity.purify('boob damn something poo|boob damn something poo', {
                replace: true,
                map: true
            }),
                parts = result[0].split('|'),
                seq = '[ placeholder ] [ placeholder ] something [ placeholder ]';

            util.testPurified(result[0], seq + '|' + seq);
            parts[0].should.eql(parts[1]);
            result[1].should.eql(['boob', 'damn', 'poo', 'boob', 'damn', 'poo']);


            done();
        });

        it('works in replace mode with mapping recursively with objects', function (done) {
            var result = profanity.purify({
                foo: { foo: 'damn something boob', bar: { foo: 'test poo damn' } },
                bar: { foo: 'damn something boob', bar: { foo: 'test poo damn' } },
                test: 'something damn boob'
            }, {
                replace: true,
                map: true
            });

            result[0].should.have.keys('foo', 'bar', 'test');

            // .foo
            result[0].foo.should.have.keys('foo', 'bar');
            util.testPurified(result[0].foo.foo, '[ placeholder ] something [ placeholder ]');
            result[0].foo.bar.should.have.keys('foo');
            util.testPurified(result[0].foo.bar.foo, 'test [ placeholder ] [ placeholder ]');

            // .bar
            result[0].bar.should.have.keys('foo', 'bar');
            util.testPurified(result[0].bar.foo, '[ placeholder ] something [ placeholder ]');
            result[0].bar.bar.should.have.keys('foo');
            util.testPurified(result[0].bar.bar.foo, 'test [ placeholder ] [ placeholder ]');

            util.testPurified(result[0].test, 'something [ placeholder ] [ placeholder ]');

            result[0].foo.should.eql(result[0].bar);

            result[1].should.eql(['damn', 'boob', 'poo', 'damn',
                                  'damn', 'boob', 'poo', 'damn',
                                  'damn', 'boob']);

            done();
        });
    });
});
