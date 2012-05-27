# Roadmap

## Next up

## Scoping and context

- Multi-scope attribute value resolution using funex
- Provide a base context for a whole instance of cook through an attribute like "$global"
- "$root", "$parent", "$this" or "$global" values for targeting scope levels
- Test for multi-level "each", partial, with and other tag that create a new closure/scope

## Backlog
- Figure out a better way to bubble up "attrs" to relevant tags
- In elemTag: Todo: render element body before args are rendered, so that args can process the body
- Figure out if "bind" should be used inside a tag like "attrs", or wrap a tag from outside
- Figure out if partials should be specific to the closure they we're created in, like javascript in general
- Template inheritance ? Chained render ? "Extend" ?
- Lookup Jinja to see how feature coverage compares
- Escaping for "{" and "}"
- Allow running in "double braket" mode for less risky escaping
- register partials, helpers, tags, filters and etc through a "use" method
- resolver for external partials
- Refer to "model" instead of "data" everywhere
- Basic builtin functions to simplify the use of funex syntax

## Distribution
- Code comments and method signatures
- Clean all to-do's
- Build for frontend-use (concat, minify)
- Relevant title on all tests
- Documentation
- Samples and live tutorial
- Connectivity with major frameworks: express, flatiron, jquery, etc.
- Build command with npm
- Test command with npm and mocha
- Update Git Page
- Benchmarking
- Comparison with other libs

## Error handling

- Better error when miss-using double quotes in funex (will be common mistake)
- handle funex compilation errors
- When a tag fails to render, only this tag should be blank or contain an error message (try/catch)
- Make the error message/output configurable
- Errors should contain an output of where is has failed exactly

# Internal mechanic

- Support handlers for catching the render tree
- Event listeners on lexing, building and rendering
- api for reflection and inspection of code tree (usefull for debugging)
- The lexer should return tokens as objects instead of arrays for better inspection

#External addons:
- i18n functions
- "eval" and eval() for evaluating funex expressions on the fly (inline or from vars)
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

## Advanced features:

- Streamed renderer
- Streamed builder
- Streamed lexer
- Async
- Make sure objects supplied as model are not used "as is", but instead each member is copied.
- Figure out what to document about immutability vs mutability of model data

