import assert from 'node:assert';
import lodashStable from 'lodash';

describe('lodash(...) methods that return new wrapped values', () => {
    const funcs = [
        'castArray',
        'concat',
        'difference',
        'differenceBy',
        'differenceWith',
        'intersection',
        'intersectionBy',
        'intersectionWith',
        'pull',
        'pullAll',
        'pullAt',
        'sampleSize',
        'shuffle',
        'slice',
        'splice',
        'split',
        'toArray',
        'union',
        'unionBy',
        'unionWith',
        'uniq',
        'uniqBy',
        'uniqWith',
        'words',
        'xor',
        'xorBy',
        'xorWith',
    ];

    lodashStable.each(funcs, (methodName) => {
        it(`\`_(...).${methodName}\` should return a new wrapped value`, () => {
            const value = methodName === 'split' ? 'abc' : [1, 2, 3],
                wrapped = _(value),
                actual = wrapped[methodName]();

            assert.ok(actual instanceof _);
            assert.notStrictEqual(actual, wrapped);
        });
    });
});
