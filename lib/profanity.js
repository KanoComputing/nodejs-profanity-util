/*
Copyright (C) 2014 Kano Computing Ltd.
License: http://opensource.org/licenses/MIT The MIT License (MIT)
*/

var swearwords = require('./swearwords.json'),
    util = require('./util');

var DEFAULT_REPLACEMENTS = [
        'bunnies',
        'butterfly',
        'kitten',
        'love',
        'gingerly',
        'flowers',
        'puppy',
        'joyful',
        'rainbows',
        'unicorn'
    ],
    DEFAULT_REGEX = getListRegex(swearwords);

function getListRegex (list) {
  // we want to treat all characters in the word as literals, not as regex specials (e.g. shi+)
  function escapeRegexChars(word) { return word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); };
  return new RegExp('\\b(' + list.map(escapeRegexChars).join('|') + ')\\b', 'gi');
}

function check (target, forbiddenList) {
    var targets = [],
        regex = forbiddenList ? getListRegex(forbiddenList) : DEFAULT_REGEX;

    if (typeof target === 'string') {
        targets.push(target);
    } else if (typeof target === 'object') {

        util.eachRecursive(target, function (val) {
            if (typeof val === 'string') {
                targets.push(val);
            }
        });
    }

    return targets.join(' ').match(regex) || [];
}

function purifyString (str, options) {
    options = options || {};

    var matches = [],
        purified,
        forbiddenList = options.forbiddenList || null,
        replacementsList = options.replacementsList || DEFAULT_REPLACEMENTS,
        regex = forbiddenList ? getListRegex(forbiddenList) : DEFAULT_REGEX,
        replace = options.replace || false,
        obscureSymbol = options.obscureSymbol || '*';

    purified = str.replace(regex, function (val) {
        matches.push(val);

        if (replace) {
            return replacementsList[Math.floor(Math.random() * replacementsList.length)];
        }

        var str = val.substr(0, 1);

        for (var i = 0; i < val.length - 2; i += 1) {
            str += obscureSymbol;
        }

        return str + val.substr(-1);
    });

    return [ purified, matches ];
}

function purify (target, options) {
    options = options || {};

    var matches = [],
        fields = options.fields || ( target instanceof Object ? Object.keys(target) : [] ),
        result;

    if (typeof target === 'string') {

        return purifyString(target, options);

    } else if (typeof target === 'object') {
        fields.forEach(function (field) {

            // TODO: Use better recursive checking, make DRYer
            if (typeof target[field] === 'string') {

                result = purifyString(target[field], options);
                target[field] = result[0];
                matches = matches.concat(result[1]);

            } else if (typeof target[field] === 'object') {
                util.eachRecursive(target[field], function (val, key, root) {

                    if (fields && fields.indexOf(key) === -1) {
                        return;
                    }

                    if (typeof val === 'string') {
                        result = purifyString(val, options);
                        root[key] = result[0];
                        matches = matches.concat(result[1]);
                    }

                });
            }
        });

        return [ target, matches ];
    }
}

module.exports = {
    check: check,
    purify: purify
};