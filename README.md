# mexna [![Build Status](https://travis-ci.org/zefirka/mexna.svg?branch=master)](https://travis-ci.org/zefirka/mexna)

Mexna is string interpolator with simple signature but pretty specific abilities.
Main syntax is: `mexna(string, [options])`.
Mexna can:
 1. interpolate into string data in case of simple object with keys to interpolate,
 2. use translations instead of values of keys as is,
 3. use default values for keys right in string with simple and flexible syntax,
 4. use values of interpolants as a valid JSON with will be parsed and injected to string,
 5. interpolate data strucures as strings with `JSON.stringify`,
 6. expose out interpolants from quotes in strings,
 7. non-valid JSON as default values will be interpolated as strings.

<img src="./mexna.jpg" align="right"/>

<br><br><br><br><br><br><br><br><br><br><br><br>

## Options

 - `keys [Object]` - keys for interpolation, each key should be a `string`
 - `i18n [Object]` - translations keys
 - `translate [Boolean]` - flag to use translations instead of value
 - `exposeOut [Boolean]` - flag to pick up value from string and return parsed JSON ([look up](#exposing))
 - `delimeter` - string which is delimeter in interpolant's expression (`||` by default)
 - `regex` - regular expression to match. Must have **one group** containing `key` and optionaly `default` values for keys
 - `strict` - throws exceptions for unknown keys in the strict mode. Defaults `false`
 - `ternaryRegex` - regex to match ternaty expressions in string

## Usage

#### Simple string interpolation
You can give your own regex to match interpolants with `regex` option. By default it equals to `/${(.+?)}/g`, which matches to expressions kinda `${thisIs}`:

```js
mexna('${a} and ${b} sit on tree', {
	keys: {
		a: "Jack",
		b: "Jill"
	}
});

// -> Jack and Jill sit on tree
```

#### Interpolate translations instead of key values as is
Use `translate` option:

```js
mexna('А вот и ${a}, и ${b}', {
	keys: {
		a: 'first',
		b: 'second'
	},
	i18n: {
		first: 'первый',
		second: 'второй'
	},
	translate: true
});

// -> А вот и первый, и второй
```

or just put empty `keys` and use default values for interpolants:


```js
mexna('А вот и ${a || first}, и ${b || second}', {
	i18n: {
		first: 'первый',
		second: 'второй'
	}
});

// -> А вот и первый, и второй
```

#### Use defaults (strings)
Moreover flexible matching syntax, you can use your own `delimeter` option to define syntax for default values, by default it equals to `||` string. Which looks like: `${key || default}`. You can use valid JSON in defaults, if default value is non-valid JSON then it interpolates as string

```js
mexna('Every ${count || "12 days"} we ${action || playing}')

// -> Every 12 days we playing
```

#### Interpolate JSON
You can interpolate valid JSON into your text:

```js
mexna('Zomg teh JSON: ${json}', {
	keys: {
		json: {
			a: {
				the: 1
			},
			b: ['a','r','r','a','y']
		}
	}
});

// -> Zomg teh JSON: {"a":{"the":1},"b":["a","r","r","a","y"]}
```

or as defaults:


```js
mexna('The default: ${non || {a: [1,2,3], b: {c: 10}} }')

// -> 'The default: {a: [1,2,3], b: {c: 10} }'
```

#### Exposing
Sometimes there is a need to replace string representation into some other data type inside of given string. For example:
In string: `'{"period": "${preset || 30days}"}' (which is a part of stringified JSON) we want to pick interpolated value `preset` out of quotes: `'{"period": ["2015-12-01","2015-12-02"]}'`. Mexna can do it. You need to use `exposeOut` option:

```js
mexna('{"period": "${preset}"}', {
	exposeOut: true,
	keys: {
		preset: ['2015-12-01', '2015-12-02']
	}
});

// -> {"period": ["2015-12-01","2015-12-02"]}
```

Or with default
```js
mexna('{"period": "${preset || ["2015-12-01", "2015-12-02"]}"}', {
	exposeOut: true
});

// -> {"period": ["2015-12-01","2015-12-02"]}
```

### Ternatry expressions

In v0.2.* mexna support ternary expressions in strings:

```js
mexna('I am a ternary ${string ? #(string)# : default}', {
    keys: {
        string: 'str'
    }
})

// -> 'I am a ternary str'

mexna('I am a ternary ${string ? #(string)# : default}')

// -> 'I am a ternary default'
```
