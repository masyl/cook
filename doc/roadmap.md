# Roadmap

## Next up

## Backlog

- [HIGH] Figure out if "bind" should be used inside a tag like "attrs", or wrap a tag from outside
- [HIGH] Figure out if partials should be specific to the closure they we're created in, like javascript in general
- [HIGH] Template inheritance ? Chained render ? "Extend" ?
- [HIGH] Simplification: Enable html escaping by default, with option/tag do disable it
- [HIGH] Tests for recursive rendering using partials
- [HIGH] Tests for closures, context and frames
- [MEDIUM] In elemTag: Todo: render element body before args are rendered, so that args can process the body
- [MEDIUM] Test: Output a template containing {} using a raw tag
- [MEDIUM] register partials, helpers, tags, filters and etc through a "use" method
- [MEDIUM] resolver for external partials
- [MEDIUM] Figure out a better and more extensible syntax for instructions (such as $removeWhitespaces with the @)
- [MEDIUM] Simplification: Firgure out a better way to control whitespace (better than $removeWhitespaces on the $root frame)
- [MEDIUM] Ability to control wether errors are : thrown, returned via callback and/or printed out in the output.
- [MEDIUM] Mechanism for resolving external "partials"
- [MEDIUM] Mechanism for "importing" the partials and variables inside a partial without rendering it (see jinja import)
- [MEDIUM] Basic builtin functions to simplify the use of funex syntax (comparisons, math, string operations, collections, yelders)
- [MEDIUM] Syntax/tag to "continue" or "break" inside an "each" tag
- [MEDIUM] Match the list of Jinja builtin Filters
- [MEDIUM] Match the list of Jinja builtin Tests
- [MEDIUM] Match the list of Jinja builtin Global Functions (helpers)
- [LOW] Allow running in "double braket" mode for less risky escaping
- [LOW] Figure out a better way to bubble up "attrs" to relevant tags
- [LOW] Find a faster/better way of escaping curly brackets


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

