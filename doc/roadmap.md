# Roadmap

## Next up

## Backlog
- [HIGH] helpers: builtin functions to simplify the use of funex syntax (comparisons, math, string operations, collections, yelders)
- [HIGH] A "safe" filter for escaping html and attributes against XSS
- [HIGH] Match the list of Jinja builtin Filters
- [HIGH] Match the list of Jinja builtin Tests
- [HIGH] Match the list of Jinja builtin Global Functions (helpers)
- [MEDIUM] Use tripple brackets "{{{ lorem ipsum }}}" for output "raw" content
- [MEDIUM] Async rendering and compiling (to allow the .load handler to use .readFile() instead of .readFileSync())
- [MEDIUM] Make sure objects supplied as model are not used "as is", but instead each member is copied.
- [MEDIUM] Figure out how to make the user model immutable unless function calls or special helpers are called. The set tag should never apply itself to the model or one of it member.
- [MEDIUM] New syntax to "continue" or "break" inside an "each" tag
- [LOW] Configurable limit on recursive rendering of templates
- [LOW] Figure out a better way to bubble up "attrs" to relevant tags
- [LOW] Use quadruple brackets "{{{{ {{div /}} }}}}" for switching between a "single bracket" mode to a"double bracket" mode
- [LOW] Remove the need for the "$Array" helper by adding the feature in Funex
- [LOW] cache $body() calls and allow forcing re-parse with $body(true)

## Distribution
- Test runner for clients version on all browsers
- Travis CI Integration
- Code comments and method signatures
- Clean all to-do's
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

- [MEDIUM] api: ability to control wether errors are : thrown, returned via callback and/or printed out in the output.
- [MEDIUM] Options to ensure no errors are ever thrown by the library
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

