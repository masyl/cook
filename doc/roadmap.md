# Roadmap

## Next up

## Scoping and context

- Multi-scope attribute value resolution using funex
- Provide a base context for a whole instance of cook through an attribute like "$global"
- "$root", "$parent", "$this" or "$global" values for targeting scope levels
- Test for multi-level "each" loops

## Backlog

- "$" prefix for non-expressions:
	$set, $partial $each, $with, $if, $print, $filter, $div, $tag, $ul, $uppercase, $decodeURI
	Anything that doesnt start with a "$" is an expression, otherwise it is
	resolved as a tag, helper, partial, or html tag

- Default behavior on nameless tags:

	"$each" on arrays:
		{dogs, 'dog' >> $div >> dog.name /}

	"$with" on objects:
		{$ul >> dog}
			name: {$li >> name /}
			weight: {$li >> weight /}
		{/}

	"$if" on true, false, null, undefined:
		{dog.isDead}
			Dog is dead!
		{/}
	
	"$print" on strings:
		{dog /}
	
	"$filter" on functions: 
		{$uppercase >> dog.name /}

- HTML Tags with attributes:
	{$ul $class('someClassName'), $id('25534') /}
	{$ul $attr('class', 'name'), $attr('id', '253') /}

- Passing variables to partials for template renderin:
	{$partial 'i18n', 'label'} {label /} {i18n}
	{$partial 'person'}
		{if name >> li >> div}
			{if email}
				<a href="mailto:{print email /}"> {label /} </a>
			{/}
			{else >> span >> label /}
			{if bio >> div >> bio /}
			{else >> div >> $i18n 'No bio available' /}
		{/}
	{/}
	{$ul >> friends, 'friend' >> $person}
		{$set 'name', friend.name /}
		{$set 'email', friend.email /}
		{$set 'bio'}
			{$p >> $print friend.bioIntro /}
			{$p >> $print friend.bioDetails /}
		{/}
	{/}
- Template inheritance ? Chained render ?
- Break up library in multiple packages
- Build for frontend-use (concat, minify)
- Api to register filters, and functions in the global scope
- Test descriptions in the fixture templates
- Support handlers for catching the render tree
- Event listeners on lexing, building and rendering
- Code comments and method signatures
- Clean all to-do's
- register helpers, tags, filters and etc through a "use" method
- The lexer should return tokens as objects instead of arrays for better inspection
- Escaping for "{" and "}" 
- "eval" and eval() for evaluating funex expressions on the fly (inline or from vars)
- Allow running in "bouble braket" mode for outputting json
- How could filter/call behave like a .map on collections ?


## Error handling

- Better error when miss-using double quotes in funex (will be common mistake)
- handle funex compilation errors
- When a tag fails to render, only this tag should be blank or contain an error message (try/catch)
- Make the error message/output configurable
- Errors should contain an output of where is has failed exactly


## Advanced features:

- Streamed renderer
- Streamed builder
- Streamed lexer
- Async
- "json" renderer
- "dom" renderer
- "xml" renderer
- Make sure objects supplied as model are not used "as is", but instead each member is copied.
- Figure out what to document about immutability vs mutability of model data
- Refer to "model" instead of "data" everywhere
- Return complex result & bindings through a callback:
	ex.:
	cook(template)(data, function (err, result) {
		result.template // The template object used to render
		result.data // The root scope used to compile the template
		result.body // The output of the template in string format
		result.bindings // Contains the list of bindings
	})
- Bindings with bind tag and exposed bindings

