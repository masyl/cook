# Roadmap

## Next up

- [HIGH] import tag for importing the partials and globals of another template without rendering it (is it same as void?)

## Backlog
- [HIGH] Tests for recursive rendering using partials
- [HIGH] Tests for closures, context and frames
- [MEDIUM] api: register partials, helpers, tags, filters and etc through a "use" method
- [MEDIUM] api: resolver for external partials
- [MEDIUM] api: ability to control wether errors are : thrown, returned via callback and/or printed out in the output.
- [MEDIUM] helpers: builtin functions to simplify the use of funex syntax (comparisons, math, string operations, collections, yelders)

Backlog for 1.0
- [MEDIUM] A "safe" tag for escaping html and attributes against XSS
- [MEDIUM] Match the list of Jinja builtin Filters
- [MEDIUM] Match the list of Jinja builtin Tests
- [MEDIUM] Match the list of Jinja builtin Global Functions (helpers)
- [MEDIUM] Syntax/tag to "continue" or "break" inside an "each" tag
- [LOW] Allow running in "double braket" mode for less risky escaping
- [LOW] Figure out a better way to bubble up "attrs" to relevant tags
- [LOW] Find a faster/better way of escaping curly brackets
- [LOW] A "raw" tag for outputing raw and unescaped output including {} brackets


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

