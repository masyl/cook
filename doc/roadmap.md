# Roadmap


## Next up

- Multi-scope attribute value resolution using funex
- Provide a base context for a whole instance of cook through an attribute like "$global"
- "$root", "$parent", "$this" or "$global" values for targeting scope levels
- Test for multi-level "each" loops

## Backlog

- using function/helpers as tags ?
- Render tag: {render "attribute", $key, $value /}
- "each" tag with a defined alias for the item
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
- Syntax for chaining tags
- Syntax for pre-filters with the "<<" markers
- Async
- "json" renderer
- "dom" renderer
- "xml" renderer
- Return complex result & bindings through a callback:
	ex.:
	cook(template)(data, function (err, result) {
		result.template // The template object used to render
		result.data // The root scope used to compile the template
		result.body // The output of the template in string format
		result.bindings // Contains the list of bindings
	})
- Bindings with bind tag and exposed bindings

