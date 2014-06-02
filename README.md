# Node.js Profanity Utility

> Utility for detection, filtering and replacement / obscuration of forbidden words

## Install

`npm install profanity-util`

## API

### `profanity.check(target_string, [ forbidden_list ])`

Returns a list of forbidden words found in a string.

**Arguments**

* `target_string` - String to search
* `forbidden_list` (Optional) - Array containing forbidden terms

**Example**

```javascript
var profanity = require('profanity-util');

console.log(profanity.check('Lorem ipsum foo bar poop test poop damn dolor sit..'));
// [ 'poop', 'poop', 'damn' ]
```

### `profanity.purify(target, [ options ])`

Purifies a string or strings contained in a given object or array from forbidden words.

If an object is given as target, this method will recursively loop through its values and purify every string.

By default forbidden swearwords will be obscured in this format: `a***b`, although setting `replace` option to `true` will activate replacement mode, which replaces each forbidden word with a random entry from a small list of inoffensive words (See `DEFAULT_REPLACEMENTS` in `lib/profanity.js`). This mode could be a fun and different approach to discourage and prevent swearing on your platform / app.

The .purify method will return an array containing two values:

* `[0]` The purified String / Object / Array
* `[1]` An Array containing all swearwords obscured / replaced

**Arguments**

* `target` - Object, Array or String to purify
* `options` (Optional) - Purification options (Explained below)

**Options**

* `forbiddenList` - Array of forbidden terms to replace or obscure
* `replacementsList` - Array of replacement words (To pick randomly from)
* `obscureSymbol` - Symbol used to obscure words if `obscured` is set to true
* `replace`- If set to true it will replace forbidden words (E.g. a*****b) instead of obscuring them

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
// [ 'foo p$$p', 'poop' ]

console.log(profanity.purify('foo poop', { forbiddenList: [ 'foo', 'bar' ] }));
// [ 'f*o poop', 'foo' ]
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

Copyright (C) 2014 Kano Computing Ltd. License: [http://www.gnu.org/licenses/gpl-2.0.txt](http://www.gnu.org/licenses/gpl-2.0.txt) GNU General Public License v2