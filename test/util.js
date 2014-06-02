/*
Copyright (C) 2014 Kano Computing Ltd.
License: http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
*/

var defaultExp = '(bunnies|butterfly|kitten|love|gingerly|flowers|puppy|joyful|rainbows|unicorn)';

function testPurified (str, format, exp) {
    exp = exp || defaultExp;

    var regex = new RegExp('^' + format.replace(/(\[ placeholder \])/g, exp) + '$');
    if (!regex.test(str)) {
        throw new Error('\'' + str + '\'' + ' doesn\'t match the format \'' + format + '\'');
    }
}

module.exports = {
    testPurified: testPurified
};