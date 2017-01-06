/*
Copyright (C) 2014, 2017 Kano Computing Ltd.
License: http://opensource.org/licenses/MIT The MIT License (MIT)
*/

var _ = require('underscore');

function eachRecursive(obj, fn, maxDepth, depth, checked) {
    checked = checked || [];

    depth = depth || 0;

    if ((maxDepth && depth > maxDepth) || obj in checked) {
        return;
    }

    _.each(obj, function (val, key) {
        checked.push(obj);

        if (_.isObject(val)) {
            if (val in checked) {
                return;
            }

            checked.push(val);

            depth += 1;
            eachRecursive(val, fn, depth, checked);
        } else {
            fn(val, key, obj, depth);
        }
    });
}

module.exports = {
    eachRecursive: eachRecursive
};
