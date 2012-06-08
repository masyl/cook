Author: Mathieu Sylvain
License: Public Domain


- - -


	
#The Cook Templating Language

	
*Cook* is a very flexible templating language built for rendering web content.

- - -


	
##Documentation in progress

	
		
The documentation is still a work in progress.

		
#Completed

		
- [The Tag Syntax](#TheTagSyntax)

		
#Still Missing...

		
- Funex Expressions Syntax
- Summary of attributes and features of Cook
- API Usage and Options
- Extending Cook with middleware
- Definition and signature of each Tags
- Advanced templating: inheritance, recursivity
- Function helpers
- Global values
- The Stack and Closures
- Description of the main classes and how the lexer, builder is build
- Unit tests
- Build process (building cook with cook!)

	
- - -

[][TheTagSyntax]

#Tag Based Syntax



	
##The Syntax

	
		
The core syntax of *Cook* is very simple. Templates
are built by adding tags to some existing text.
This text can be html, xml, css or any other text
based document.

		
Tags are composed of:

		
- An opening curly bracket
- A tag name
- A series of comma separated expressions
- Either a closing or self closing slash and brackets

		
Here is an example of a self closing tag:

		
    
    Hi {write name /}, and welcome!
    		

		
And here is an example of a tag which contains an html link:

		
    
    {if user.isAdmin}
        &lt;a href="/admin"&gt;Admin Panel&lt;/a&gt;
    {/if}
    		

	
- - -


	
##Closing Tags

	
		
In *Cook* closing tags don't need to mention the
tag names. It simply closes the current tag.

		
For example, this tag is valid:

		
    
    {if true}It' true!{/}
    		

		
Actually, what you write inside a closing tag will
never be parsed. If your aim is to provide
easier to read code, you can put a relevant tag name,
but note that if you put a wrong tag name it might
break at syntax validation.

	
- - -


	
##Tag Arguments

	
		
Following the tags name, you can specify a list of comma separated arguments. These arguments can be
simple variable names or more complex functional expressions. The syntax and library used to evaluate these
expressions is called "Funex".

		
Funex expressions might look like Javascript, which makes the syntax simply to remember, but it is
much more limited. Funex is
limited to expressing basic data types, accessing deep objects and doing function calls. If does not
support logical operators, statements or complex types like arrays and literal object notation.

		
Read the section below for a more detailed description of the Funex syntax.

		
What each tag argument means depends on each tag. An in some cases, such as when defining custom templates,
you can define what these argument do yourself.

		
Here is an example of a `set` tag with it's two arguments tht are used as a key and value pair:

		
    
    {set 'name', 'John Doe' /}
    		

		
And here is an example of a `set` tag with a more complex funex expression as argument:

		
    
    {set 'name', $uppercase(datasource.sessions["current"].currentUser().name) /}
    		

		
As you can see, it looks very much like Javascript, but it only does function calls and still contains
no actual statements or operators.

	
- - -


	
##Tag Body

	
		
Like with most tag based languages, a tag can contain more tags. But wether a tag's body is parsed
and how it is parsed depends on each tag. Behaviors can vary greatly.

		
An `if` tag will only parse it's content if it get a true statement,
a `write` tag filter it body if given a function as a first argument, a `void` tag will parse but not
write the output and a `raw` tag will simply output it's content without parsing it.			

		
You can obtain and use a tags body with the `$body()` function when writing Funex expressions.
This allows you to do some very fancy reuse scenarios.

		
Here is an example:

		
    
    {set 'authKey', $GenerateHash($lowercase($trim($body())))}
        {write appSecret /}-{write userSecret /}
    {/}
    		

		
Note that using the `$body()` function multiple time will actually parse the template and all contained
expressions multiple times.

	
- - -



	
##Escaping curly brackets

	
		
Typically, when your template is parsed, ALL curly brackets are parsed and used to
 figure out where tags start and end. This means that rendering things like JSON or
 similar text that relies on the same curly brackets will confuse the Cook parser.

		
To solve this, you must escape the curly brackets you want to ouput by writting two
consecutive brackets for every bracket your want to output.

		
For example:

		
    
    &lt;script&gt; user = {{name: "{write user.name/}"}}&lt;/script&gt;
    		

		
Which would output something like this this:

		
    
    &lt;script&gt; user = {name: "John Doe" }&lt;/script&gt;
    		

		
Note that upcoming versions of *Cook* will support simpler ways to output whole blocks of languages
that relies heavily on curly brackets such as json.

	
- - -


	
##Chaining Tags

	
		
One very nifty feature of *Cook* is that you can chain tags to make you syntax more compact.

		
For example, this code:

		
    
    {if user.isLoggedIn &gt;&gt; elem div &gt;&gt; elem a &gt;&gt; write $uppercase &gt;&gt; write user.name /}
    		

		
Outputs pretty much the same thing as this code:

		
    
    {if user.isLoggedIn}
        &lt;div&gt;
            &lt;a&gt;
                {write $uppercase}
                    {write user.name /}
                {/write}
            &lt;/a&gt;
        &lt;/div&gt;
    {/if}
    		

		
Note that the last element in the tag chain will receive the tags content. In this example, the tag body
will be parsed as belonging to the `write $uppercase` tag:

		
    
    {if user.isLoggedIn &gt;&gt; elem div &gt;&gt; elem a &gt;&gt; write $uppercase}
        Hi {write user.name /}, and welcome!
    {/}
    		

		
When chaining tags, it makes your code more compact, which is itself a matter of
preference. Some prefer readability, some prefer getting less lines of code. No matter
which style you adopt, it will not affect the rendering performance.

	
- - -


	
##The "elem" Tag and Unknown Tag Fallback

	
		
Whenever the *Cook* parser finds an unknown tag, it will not raise any error, but instead it will
generate an element with the same name.

		
For example, this template:

		
    
    {div}
        {span}
            Lorem Ipsum!
        {/}
    {/}
    		

		
Would output this:

		
    
    &lt;div&gt;
        &lt;span&gt;
            Lorem Ipsum!
        &lt;/span&gt;
    &lt;/div&gt;
    		

		
This approach has two advantages. First it prevents templates to crash when some typos or unforseen
conditions occure, and secondly it allows you to generate most html syntax with some of the advantages of
the *Cook* syntax.

		
For example, this would still output valid html:

		
    
    {section &gt;&gt; ul &gt;&gt; li &gt;&gt; span &gt;&gt; strong &gt;&gt; write user.name /}
    		

    
- - -


	
##Automatic Tags Deduction

	
		
Instead of specifying a tag name for every tag, you can use the equal sign `=` as a way
of asking *Cook* to guess what to do according to what the first argument is.

		
The simplest example of this is to write values without using the `write` tag. Like so:

		
    
    {=user.fullName/}
    		

		
But it also works for values other than strings. Here is how each value types will be "guessed":

		
- Boolean : will behave like a `if` tag
- Number, String : will behave like a `write` tag
- Array : will behave like a `each` tag
- Literal Object : will behave like a `with` tag
- Boolean : will behave like a `if` tag

		
Anything else (such as prototyped objects) will be coerced into a string out handler with the
`write` tag. This also implies that objects would be converted with their default or custom
`.toString()` function.

		
For example, if you wish to output an html list of the credentials of a user if they are a member.

		
You can write it like this:

		
    
    { =isMember &gt;&gt; ul &gt;&gt; =credentials &gt;&gt; li &gt;&gt; =$loop.value.label /}
    		

		
Instead of:

		
    
    {if isMember &gt;&gt; elem ul &gt;&gt; each credentials &gt;&gt; elem li &gt;&gt; write $loop.value.label /}
    		

		
Which is already a compact equivalent of this:

		
    
    {if isMember}
        &lt;ul&gt;
            {each credentials}
                &lt;li&gt;
                    {write $loop.value.label /}
                &lt;/li&gt;
            {/each}
        &lt;/ul&gt;
    {/if}
    		

	
- - -


	
##Commenting Out Tags

	
		
You can use the poung sign `#` to comment out a tag. This allows you to comment out both a tag and
its body.

		
You can use it to leave comment in your code:

		
    
    {#
        Some notes that will not be parsed!
    /}
    		

		
Or to hide portions of your code during development:

		
    
    {#write 'Lorem ipsum dolor sit amet' /}
    		

		
Or on a tag with a body:

		
    
    {#if user.isMember}
        {=user.fullName/}
    {/}
    		

		
Note that commenting out a tag does not only prevent it from outputing anything,
it also prevent its arguments from being evaluated and even from being parsed at all during
compilation.

	
- - -


	
##Finer Points of Syntax

	
		Todo: Describe where whitespace is tolerated, the possible site effect of named closing tags when chaining, etc.
	
- - -


