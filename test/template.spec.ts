import assert from 'node:assert';
import lodashStable from 'lodash';
import { numberTag, stubString, stubTrue, stubFalse } from './utils';
import template from '../src/template';
import templateSettings from '../src/templateSettings';

describe('template', () => {
    it('should escape values in "escape" delimiters', () => {
        const strings = ['<p><%- value %></p>', '<p><%-value%></p>', '<p><%-\nvalue\n%></p>'],
            expected = lodashStable.map(
                strings,
                lodashStable.constant('<p>&amp;&lt;&gt;&quot;&#39;/</p>'),
            ),
            data = { value: '&<>"\'/' };

        const actual = lodashStable.map(strings, (string) => template(string)(data));

        assert.deepStrictEqual(actual, expected);
    });

    it('should not reference `_.escape` when "escape" delimiters are not used', () => {
        const compiled = template('<%= typeof __e %>');
        assert.strictEqual(compiled({}), 'undefined');
    });

    it('should evaluate JavaScript in "evaluate" delimiters', () => {
        const compiled = template(
            '<ul><%\
      for (var key in collection) {\
        %><li><%= collection[key] %></li><%\
      } %></ul>',
        );

        const data = { collection: { a: 'A', b: 'B' } },
            actual = compiled(data);

        assert.strictEqual(actual, '<ul><li>A</li><li>B</li></ul>');
    });

    it('should support "evaluate" delimiters with single line comments (test production builds)', () => {
        const compiled = template(
                '<% // A code comment. %><% if (value) { %>yap<% } else { %>nope<% } %>',
            ),
            data = { value: true };

        assert.strictEqual(compiled(data), 'yap');
    });

    it('should support referencing variables declared in "evaluate" delimiters from other delimiters', () => {
        const compiled = template('<% var b = a; %><%= b.value %>'),
            data = { a: { value: 1 } };

        assert.strictEqual(compiled(data), '1');
    });

    it('should interpolate data properties in "interpolate" delimiters', () => {
        const strings = ['<%= a %>BC', '<%=a%>BC', '<%=\na\n%>BC'],
            expected = lodashStable.map(strings, lodashStable.constant('ABC')),
            data = { a: 'A' };

        const actual = lodashStable.map(strings, (string) => template(string)(data));

        assert.deepStrictEqual(actual, expected);
    });

    it('should support "interpolate" delimiters with escaped values', () => {
        const compiled = template('<%= a ? "a=\\"A\\"" : "" %>'),
            data = { a: true };

        assert.strictEqual(compiled(data), 'a="A"');
    });

    it('should support "interpolate" delimiters containing ternary operators', () => {
        const compiled = template('<%= value ? value : "b" %>'),
            data = { value: 'a' };

        assert.strictEqual(compiled(data), 'a');
    });

    it('should support "interpolate" delimiters containing global values', () => {
        const compiled = template('<%= typeof Math.abs %>');

        try {
            var actual = compiled();
        } catch (e) {}

        assert.strictEqual(actual, 'function');
    });

    it('should support complex "interpolate" delimiters', () => {
        lodashStable.forOwn(
            {
                '<%= a + b %>': '3',
                '<%= b - a %>': '1',
                '<%= a = b %>': '2',
                '<%= !a %>': 'false',
                '<%= ~a %>': '-2',
                '<%= a * b %>': '2',
                '<%= a / b %>': '0.5',
                '<%= a % b %>': '1',
                '<%= a >> b %>': '0',
                '<%= a << b %>': '4',
                '<%= a & b %>': '0',
                '<%= a ^ b %>': '3',
                '<%= a | b %>': '3',
                '<%= {}.toString.call(0) %>': numberTag,
                '<%= a.toFixed(2) %>': '1.00',
                '<%= obj["a"] %>': '1',
                '<%= delete a %>': 'true',
                '<%= "a" in obj %>': 'true',
                '<%= obj instanceof Object %>': 'true',
                '<%= new Boolean %>': 'false',
                '<%= typeof a %>': 'number',
                '<%= void a %>': '',
            },
            (value, key) => {
                const compiled = template(key),
                    data = { a: 1, b: 2 };

                assert.strictEqual(compiled(data), value, key);
            },
        );
    });

    it('should support ES6 template delimiters', () => {
        const data = { value: 2 };
        assert.strictEqual(template('1${value}3')(data), '123');
        assert.strictEqual(template('${"{" + value + "\\}"}')(data), '{2}');
    });

    it('should support the "imports" option', () => {
        const compiled = template('<%= a %>', { imports: { a: 1 } });
        assert.strictEqual(compiled({}), '1');
    });

    it('should support the "variable" options', () => {
        const compiled = template(
            '<% _.each( data.a, function( value ) { %>' + '<%= value.valueOf() %>' + '<% }) %>',
            { variable: 'data' },
        );

        const data = { a: [1, 2, 3] };

        try {
            assert.strictEqual(compiled(data), '123');
        } catch (e) {
            assert.ok(false, e.message);
        }
    });

    it('should support custom delimiters', () => {
        lodashStable.times(2, (index) => {
            const settingsClone = lodashStable.clone(templateSettings);

            const settings = lodashStable.assign(index ? templateSettings : {}, {
                escape: /\{\{-([\s\S]+?)\}\}/g,
                evaluate: /\{\{([\s\S]+?)\}\}/g,
                interpolate: /\{\{=([\s\S]+?)\}\}/g,
            });

            const expected = '<ul><li>0: a &amp; A</li><li>1: b &amp; B</li></ul>',
                compiled = template(
                    '<ul>{{ _.each(collection, function(value, index) {}}<li>{{= index }}: {{- value }}</li>{{}); }}</ul>',
                    index ? null : settings,
                ),
                data = { collection: ['a & A', 'b & B'] };

            assert.strictEqual(compiled(data), expected);
            lodashStable.assign(templateSettings, settingsClone);
        });
    });

    it('should support custom delimiters containing special characters', () => {
        lodashStable.times(2, (index) => {
            const settingsClone = lodashStable.clone(templateSettings);

            const settings = lodashStable.assign(index ? templateSettings : {}, {
                escape: /<\?-([\s\S]+?)\?>/g,
                evaluate: /<\?([\s\S]+?)\?>/g,
                interpolate: /<\?=([\s\S]+?)\?>/g,
            });

            const expected = '<ul><li>0: a &amp; A</li><li>1: b &amp; B</li></ul>',
                compiled = template(
                    '<ul><? _.each(collection, function(value, index) { ?><li><?= index ?>: <?- value ?></li><? }); ?></ul>',
                    index ? null : settings,
                ),
                data = { collection: ['a & A', 'b & B'] };

            assert.strictEqual(compiled(data), expected);
            lodashStable.assign(templateSettings, settingsClone);
        });
    });

    it('should use a `with` statement by default', () => {
        const compiled = template(
                '<%= index %><%= collection[index] %><% _.each(collection, function(value, index) { %><%= index %><% }); %>',
            ),
            actual = compiled({ index: 1, collection: ['a', 'b', 'c'] });

        assert.strictEqual(actual, '1b012');
    });

    it('should use `_.templateSettings.imports._.templateSettings`', () => {
        const lodash = templateSettings.imports._,
            settingsClone = lodashStable.clone(lodash.templateSettings);

        lodash.templateSettings = lodashStable.assign(lodash.templateSettings, {
            interpolate: /\{\{=([\s\S]+?)\}\}/g,
        });

        const compiled = template('{{= a }}');
        assert.strictEqual(compiled({ a: 1 }), '1');

        if (settingsClone) {
            lodashStable.assign(lodash.templateSettings, settingsClone);
        } else {
            delete lodash.templateSettings;
        }
    });

    it('should fallback to `_.templateSettings`', () => {
        const lodash = templateSettings.imports._,
            delimiter = templateSettings.interpolate;

        templateSettings.imports._ = { escape: lodashStable.escape };
        templateSettings.interpolate = /\{\{=([\s\S]+?)\}\}/g;

        const compiled = template('{{= a }}');
        assert.strictEqual(compiled({ a: 1 }), '1');

        templateSettings.imports._ = lodash;
        templateSettings.interpolate = delimiter;
    });

    it('should ignore `null` delimiters', () => {
        const delimiter = {
            escape: /\{\{-([\s\S]+?)\}\}/g,
            evaluate: /\{\{([\s\S]+?)\}\}/g,
            interpolate: /\{\{=([\s\S]+?)\}\}/g,
        };

        lodashStable.forOwn(
            {
                escape: '{{- a }}',
                evaluate: '{{ print(a) }}',
                interpolate: '{{= a }}',
            },
            (value, key) => {
                const settings = { escape: null, evaluate: null, interpolate: null };
                settings[key] = delimiter[key];

                const expected = '1 <%- a %> <% print(a) %> <%= a %>',
                    compiled = template(`${value} <%- a %> <% print(a) %> <%= a %>`, settings),
                    data = { a: 1 };

                assert.strictEqual(compiled(data), expected);
            },
        );
    });

    it('should work without delimiters', () => {
        const expected = 'abc';
        assert.strictEqual(template(expected)({}), expected);
    });

    it('should work with `this` references', () => {
        const compiled = template('a<%= this.String("b") %>c');
        assert.strictEqual(compiled(), 'abc');

        const object = { b: 'B' };
        object.compiled = template('A<%= this.b %>C', { variable: 'obj' });
        assert.strictEqual(object.compiled(), 'ABC');
    });

    it('should work with backslashes', () => {
        const compiled = template('<%= a %> \\b'),
            data = { a: 'A' };

        assert.strictEqual(compiled(data), 'A \\b');
    });

    it('should work with escaped characters in string literals', () => {
        let compiled = template('<% print("\'\\n\\r\\t\\u2028\\u2029\\\\") %>');
        assert.strictEqual(compiled(), "'\n\r\t\u2028\u2029\\");

        const data = { a: 'A' };
        compiled = template('\'\n\r\t<%= a %>\u2028\u2029\\"');
        assert.strictEqual(compiled(data), '\'\n\r\tA\u2028\u2029\\"');
    });

    it('should handle \\u2028 & \\u2029 characters', () => {
        const compiled = template('\u2028<%= "\\u2028\\u2029" %>\u2029');
        assert.strictEqual(compiled(), '\u2028\u2028\u2029\u2029');
    });

    it('should work with statements containing quotes', () => {
        const compiled = template(
            '<%\
      if (a === \'A\' || a === "a") {\
        %>\'a\',"A"<%\
      } %>',
        );

        const data = { a: 'A' };
        assert.strictEqual(compiled(data), '\'a\',"A"');
    });

    it('should work with templates containing newlines and comments', () => {
        const compiled = template(
            '<%\n\
      // A code comment.\n\
      if (value) { value += 3; }\n\
      %><p><%= value %></p>',
        );

        assert.strictEqual(compiled({ value: 3 }), '<p>6</p>');
    });

    it('should tokenize delimiters', () => {
        const compiled = template('<span class="icon-<%= type %>2"></span>'),
            data = { type: 1 };

        assert.strictEqual(compiled(data), '<span class="icon-12"></span>');
    });

    it('should evaluate delimiters once', () => {
        const actual = [],
            compiled = template('<%= func("a") %><%- func("b") %><% func("c") %>'),
            data = {
                func: function (value) {
                    actual.push(value);
                },
            };

        compiled(data);
        assert.deepStrictEqual(actual, ['a', 'b', 'c']);
    });

    it('should match delimiters before escaping text', () => {
        const compiled = template('<<\n a \n>>', { evaluate: /<<(.*?)>>/g });
        assert.strictEqual(compiled(), '<<\n a \n>>');
    });

    it('should resolve nullish values to an empty string', () => {
        let compiled = template('<%= a %><%- a %>'),
            data = { a: null };

        assert.strictEqual(compiled(data), '');

        data = { a: undefined };
        assert.strictEqual(compiled(data), '');

        data = { a: {} };
        compiled = template('<%= a.b %><%- a.b %>');
        assert.strictEqual(compiled(data), '');
    });

    it('should return an empty string for empty values', () => {
        const values = [, null, undefined, ''],
            expected = lodashStable.map(values, stubString),
            data = { a: 1 };

        const actual = lodashStable.map(values, (value, index) => {
            const compiled = index ? template(value) : template();
            return compiled(data);
        });

        assert.deepStrictEqual(actual, expected);
    });

    it('should parse delimiters without newlines', () => {
        const expected = '<<\nprint("<p>" + (value ? "yes" : "no") + "</p>")\n>>',
            compiled = template(expected, { evaluate: /<<(.+?)>>/g }),
            data = { value: true };

        assert.strictEqual(compiled(data), expected);
    });

    it('should support recursive calls', () => {
        const compiled = template('<%= a %><% a = _.template(c)(obj) %><%= a %>'),
            data = { a: 'A', b: 'B', c: '<%= b %>' };

        assert.strictEqual(compiled(data), 'AB');
    });

    it('should coerce `text` to a string', () => {
        const object = { toString: lodashStable.constant('<%= a %>') },
            data = { a: 1 };

        assert.strictEqual(template(object)(data), '1');
    });

    it('should not modify the `options` object', () => {
        const options = {};
        template('', options);
        assert.deepStrictEqual(options, {});
    });

    it('should not modify `_.templateSettings` when `options` are given', () => {
        const data = { a: 1 };

        assert.ok(!('a' in templateSettings));
        template('', {}, data);
        assert.ok(!('a' in templateSettings));

        delete templateSettings.a;
    });

    it('should not error for non-object `data` and `options` values', () => {
        template('')(1);
        assert.ok(true, '`data` value');

        template('', 1)(1);
        assert.ok(true, '`options` value');
    });

    it('should expose the source on compiled templates', () => {
        const compiled = template('x'),
            values = [String(compiled), compiled.source],
            expected = lodashStable.map(values, stubTrue);

        const actual = lodashStable.map(values, (value) => lodashStable.includes(value, '__p'));

        assert.deepStrictEqual(actual, expected);
    });

    it('should expose the source on SyntaxErrors', () => {
        try {
            template('<% if x %>');
        } catch (e) {
            var source = e.source;
        }
        assert.ok(lodashStable.includes(source, '__p'));
    });

    it('should not include sourceURLs in the source', () => {
        const options = { sourceURL: '/a/b/c' },
            compiled = template('x', options),
            values = [compiled.source, undefined];

        try {
            template('<% if x %>', options);
        } catch (e) {
            values[1] = e.source;
        }
        const expected = lodashStable.map(values, stubFalse);

        const actual = lodashStable.map(values, (value) =>
            lodashStable.includes(value, 'sourceURL'),
        );

        assert.deepStrictEqual(actual, expected);
    });

    it('should work as an iteratee for methods like `_.map`', () => {
        const array = ['<%= a %>', '<%- b %>', '<% print(c) %>'],
            compiles = lodashStable.map(array, template),
            data = { a: 'one', b: '"two"', c: 'three' };

        const actual = lodashStable.map(compiles, (compiled) => compiled(data));

        assert.deepStrictEqual(actual, ['one', '&quot;two&quot;', 'three']);
    });
});
