# Node.js Profanity Utility

[![Build Status](https://travis-ci.org/KanoComputing/nodejs-profanity-util.svg?branch=master)](https://travis-ci.org/KanoComputing/nodejs-profanity-util)

> Utility for detection, filtering and replacement / obscuration of forbidden words

The original list of swearwords used by default was taken from [here](https://gist.github.com/jamiew/1112488).

**Please note:** This small utility module is written to prevent or monitor the use of certain words in your content without keeping context in account. An improper use may compromise the meaning of your content. Keep in account when using.

## Install

`npm install profanity-util`

## API

### `profanity.check(targetString, [ options ])`

Returns a list of forbidden words found in a string.

**Arguments**

* `targetString` - String to search
* `options` (Optional) - Listed below

**Options**

* `forbiddenList` - Array containing forbidden terms
* `substrings: [ true | "lite" ]` - If set will match substrings as well (default `false`).
* `subStringList`: If the `substrings` property is set to `"lite"` a second, less strict word list can be passed in for use in the substring profanity filter.

The `"lite"` option is intended to reduce false positives in substring matching, where you may wish to use substring matching but allow terms such as "liverpool" or "classic". __PLEASE NOTE__ This may become the default setting for substring matching in future versions.

**Example**

```javascript
var profanity = require('profanity-util');

console.log(profanity.check('Lorem ipsum foo bar poop test poop damn dolor sit..'));
// [ 'poop', 'poop', 'damn' ]

// With substring matching
var profanity = require( 'profanity-util', { substring: true } );

console.log(profanity.check('Lorem ipsum liverpool foo bar poop test classic damn dolor sit..'));
// [ 'poo' 'poop', 'ass', 'damn' ]

// With substring matching set to "lite"
var profanity = require( 'profanity-util', { substring: "lite" } );

console.log(profanity.check('Lorem ipsum liverpool foo bar poop test classic damn dolor sit..'));
// [ 'poop', 'damn' ]
```
Note the [default word list](lib/sub_string_words.json) for "lite" substring matching still returns a match for the ["Seven Dirty Words"](https://en.wikipedia.org/wiki/Seven_dirty_words) and their cousins.

### `profanity.purify(target, [ options ])`

Purifies a string or strings contained in a given object or array from forbidden words.

If an object is given as target, this method will recursively loop through its values and purify every string.

By default forbidden swearwords will be obscured in this format: `a***b`, although setting `replace` option to `true` will activate replacement mode, which replaces each forbidden word with a random entry from a small list of inoffensive words (See `DEFAULT_REPLACEMENTS` in `lib/profanity.js`). This mode could be a fun and different approach to discourage and prevent swearing on your platform / app.

The .purify method will return an Array containing two values:

1. The purified String / Object / Array
2. An Array containing all swearwords obscured / replaced

**Arguments**

* `target` - Object, Array or String to purify
* `options` (Optional) - Purification options (Explained below)

**Options**

* `forbiddenList` - Array of forbidden terms to replace or obscure
* `replacementsList` - Array of replacement words (To pick randomly from)
* `obscureSymbol` - Symbol used to obscure words if `obscured` is set to true
* `replace` - If set to true it will replace forbidden words (e.g., `poop -> rainbows`) instead of obscuring them
* `map` - If true, reoccurring forbidden words will always be replaced by the same substitute (e.g., all `poop -> unicorn` and all `damn -> rainbows`). This only works in conjunction with `replace`.
* `substrings` - If true, match substrings as well (false by default).

**Examples**

**Obscure mode (default)**

```javascript
var profanity = require('profanity-util');

console.log(profanity.purify('lorem ipsum foo damn bar poop'));
// [ 'lorem ipsum foo d**n bar p**p, [ 'damn', 'poop' ] ]

console.log(profanity.purify({
	foo: 'poop',
	bar: { nested: 'damn', arr: [ 'foo', 'poop' ] }
}));
// [ { foo: 'p**p', bar: { nested: 'd**n', arr: [ 'foo', 'p**p' ] } }, [ 'poop', 'damn', 'poop' ] ]
```

**Obscure mode, custom options**

```javascript
var profanity = require('profanity-util');

console.log(profanity.purify('foo poop', { obscureSymbol: '$' }));
// [ 'foo p$$p', ['poop'] ]

console.log(profanity.purify('foo poop', { forbiddenList: [ 'foo', 'bar' ] }));
// [ 'f*o poop', ['foo'] ]
```

**Replace mode (`{ replace: true }`)**

```javascript
var profanity = require('profanity-util');

console.log(profanity-util.purify('lorem ipsum foo damn bar poop'));
// [ 'lorem ipsum foo gingerly bar rainbows', [ 'damn', 'poop' ] ]

console.log(profanity-util.purify({
	foo: 'poop',
	bar: { nested: 'damn', arr: [ 'foo', 'poop' ] }
}));
// [ { foo: 'kitten', bar: { nested: 'unicorn', arr: [ 'foo', 'puppy' ] } }, [ 'poop', 'damn', 'poop' ] ]
```

## Contribute

All contributions are welcome as long as tests are written.

## License

Copyright (c) 2014, 2017 Kano Computing Ltd. - Released under The MIT License.
