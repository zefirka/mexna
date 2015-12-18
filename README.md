# mexna

<img src="./mexna.jpg" align="right" style='display: block; z-index: 32323; position: relative;'/>

Mexna is string interpolator. Mexna can interpolate string and use translations, moreover you can use default values as valid JSON. Mexna can pick out data structures from strings and return parsed JSON. 

## Options

 - `keys [Object]` - keys for interpolation, each key should be a `string`
 - `i18n [Object]` - translations keys
 - `useTranslations [Boolean]` - flag to use translations instead of value
 - `exposeOut [Boolean]` - flag to puck up value from string and return parsed JSON 

## Usage 

Simple interpolation of string

```js
mexna('${jack} and ${jill || "Jill"} sit on tree', {
	keys: {
		jack: "Jack"
	}
});

// -> Jack and Jill sit on tree
```

With translations

```js
mexna('Строка с ${trans} и с ${withDefault || "translation with ending"}', {
	keys: {
		trans: 'translation'
	},
	i18n: {
		'translation': 'переводом',
		'translation with ending': 'с переводом (и значением по умолчанию)'
	}
});

// -> Строка с переводом и с переводом (и значением по умолчанию)
```