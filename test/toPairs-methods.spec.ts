import assert from 'node:assert';
import lodashStable from 'lodash';
import { _ } from './utils';

describe('toPairs methods', () => {
    lodashStable.each(['toPairs', 'toPairsIn'], (methodName) => {
        const func = _[methodName],
            isToPairs = methodName === 'toPairs';

        it(`\`_.${methodName}\` should create an array of string keyed-value pairs`, () => {
            const object = { a: 1, b: 2 },
                actual = lodashStable.sortBy(func(object), 0);

            assert.deepStrictEqual(actual, [
                ['a', 1],
                ['b', 2],
            ]);
        });

        it(`\`_.${methodName}\` should ${
            isToPairs ? 'not ' : ''
        }include inherited string keyed property values`, () => {
            function Foo() {
                this.a = 1;
            }
            Foo.prototype.b = 2;

            const expected = isToPairs
                    ? [['a', 1]]
                    : [
                          ['a', 1],
                          ['b', 2],
                      ],
                actual = lodashStable.sortBy(func(new Foo()), 0);

            assert.deepStrictEqual(actual, expected);
        });

        it(`\`_.${methodName}\` should convert objects with a \`length\` property`, () => {
            const object = { '0': 'a', '1': 'b', length: 2 },
                actual = lodashStable.sortBy(func(object), 0);

            assert.deepStrictEqual(actual, [
                ['0', 'a'],
                ['1', 'b'],
                ['length', 2],
            ]);
        });

        it(`\`_.${methodName}\` should convert maps`, () => {
            if (Map) {
                const map = new Map();
                map.set('a', 1);
                map.set('b', 2);
                assert.deepStrictEqual(func(map), [
                    ['a', 1],
                    ['b', 2],
                ]);
            }
        });

        it(`\`_.${methodName}\` should convert sets`, () => {
            if (Set) {
                const set = new Set();
                set.add(1);
                set.add(2);
                assert.deepStrictEqual(func(set), [
                    [1, 1],
                    [2, 2],
                ]);
            }
        });

        it(`\`_.${methodName}\` should convert strings`, () => {
            lodashStable.each(['xo', Object('xo')], (string) => {
                const actual = lodashStable.sortBy(func(string), 0);
                assert.deepStrictEqual(actual, [
                    ['0', 'x'],
                    ['1', 'o'],
                ]);
            });
        });
    });
});
