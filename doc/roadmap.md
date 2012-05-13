## Doing now...

Bug: binding paths keep growing during iteration

## Roadmap

- Multi-level scope resolution
- Provide a base context for a whole instance of cook through an attribute like "global"
- Render tag: {render "attribute", $key, $value /}
- Test for multi-level "each" loops

## Bindings Release

- Return complex result & bindings through a callback:
	ex.:
	cook(template)(data, function (err, result) {
		result.template // The template object used to render
		result.data // The root scope used to compile the template
		result.body // The output of the template in string format
		result.bindings // Contains the list of bindings
	})
- Bindings with bind tag and exposed bindings

## Advanced Syntax

- Syntax for chaining tags
- Syntax for pre-filters with the "<<" markers
- "each" tag with a defined alias for the item

## Error handling
- Better error when miss-using double quotes in funex (will be common mistake)
- handle funex compilation errors
- When a tag fails to render, only this tag should be blank or contain an error message (try/catch)
- Make the error message/output configurable
- Errors should contain an output of where is has failed exactly

## More

- Api to register filters, and functions in the global scope
- "root", "parent", "this" or "global" values for targeting scope levels
- Test descriptions in the fixture templates
- Support handlers for catching the render tree
- Event listeners on lexing, building and rendering
- Code comments and method signatures
- Clean all to-do's
- "json" renderer
- "dom" renderer
- "xml" renderer
- register helpers, tags, filters and etc through a "use" method
- The lexer should return tokens as objects instead of arrays for better inspection
- Refactoring: getPartial() should removed. partial should be a single call and not chained calls
- Escaping for "{" and "}" 

 ## Advanced features:
- Stream template output
- Async
- reusing partials as functions
- "eval" and eval() for evaluating funex expressions on the fly (inline or from vars)
- Allow running in "bouble braket" mode for outputting json
