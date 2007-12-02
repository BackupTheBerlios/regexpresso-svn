/**///////////////////////////////////////////////////////////////////////////
///
/// @requires ie.js
/// @file
/// Classes and functions specific to the RegexPresso project.
/// Placed in public domain by cbonar@users.berlios.de, 2005. Share and enjoy!
///
///////////////////////////////////////////////////////////////////////////*/



//////////////////////////////////////////////////////////////////////////////
// a few usefull extensions to existing objects to match the exact needs of this project



/**
	Writes a text into the tag dedicated to warnings.
	Hides this tag if text == "".
	@tparam String text	The text to write into the Warning zone
*/
function warning( text )
{
	$('warning').innerHTML = text;
	$('warning').setOpacity( text.length > 0 ? 1 : 0 );
}



/**
	@tparam String dom_type			The type of the DOM Node
	@tparam String css_class		The CSS class
	@tparam DOMElement dom_child	The DOM Node to insert into the node
	@treturn DOMElement sets some properties ; null parameters are ignored
*/
document.createSimpleElement = function( dom_type, css_class, dom_child )
{
	//console.debug("createSimpleElement("+dom_type+","+text+","+css_class+")");

	var el = document.createElement(dom_type);
	if ( css_class != null )
		el.className = css_class;
	if ( dom_child != null )
		el.appendChild(dom_child);
	return el;
}



/**
	A simple iterator on an array, looping forever.
	@tparam Array values
*/
function Loop( values )
{
	this.index = 0;
	this.values = values;
	this.next = function() { return this.values[ (this.index++) % this.values.length ]; }
}



//////////////////////////////////////////////////////////////////////////////
// extension : to the Match class for regular expressions add a context to the matches



/**
	A MatchContext is used to locate the match inside a text.
	It gathers the text before and the text after the match.
	It's not usefull to call this constructor directly, it's meant to be instanciated by RegexPressoWorker#getContext().
	@ctor
	All arguments to this constructor are just stored and can simply be accessed later as member variables.
*/
MatchContext = function( matchIndex, matchText, textBefore, textAfter )
{
	/**
	 * The position of the first character of the match in the full text
	 * @type int
	 */
	this.matchIndex = matchIndex;

	/**
	 * The text of the match
	 * @type String
	 */
	this.matchText = matchText;

	/**
	 * What's before the match
	 * @type String
	 */
	this.textBefore = textBefore;

	/**
	 * What's after the match
	 * @type String
	 */
	this.textAfter = textAfter;
}



/**
 * @treturn Array	The differents parts of this object that makes a string : { textBefore, matchText, textAfter }
 */
MatchContext.prototype.valueOf = function()
{
	return [ this.matchText, this.textBefore, this.textAfter ];
}



/**
 * @treturn String	This MatchContext as a string
 */
MatchContext.prototype.toString = function()
{
	return this.valueOf().join("");
}



/**
	The RegexWorker class is a specialized Matcher
*/
RegexWorker = function() {};
RegexWorker.prototype = new Matcher;



/**
	@tparam Match match		the match to generate the surrounding context
	@tparam String subject		the text to extract the context from
	@tparam int length_before	the number of characters to take into account before the match
	@tparam int length_after	the number of characters to take into account after the match
	@treturn Context		the context surrounding the matched text
*/
RegexWorker.prototype.getContext = function( match, subject, length_before, length_after )
{
	return new MatchContext(
		match.text,
		match.index,
		this.subject.substring( Math.max(0,match.index-length_before), match.index ),
		this.subject.substring( Math.min(match.index+match.length,subject.length), Math.min(match.index+text.length+length_after,subject.length) )
		);
}



/**
	Updates the context with dots before and after to emphasize that there's text even before and/or after.
	@return the modified context
*/
RegexWorker.prototype.getDottedContext = function( match, subject, length_before, length_after )
{
	var context = this.getContext(match,length_before,length_after);

	if ( context.index_before > 0 )
		context.text_before = "..." + context.text_before;
	if ( context.index_after < this.subject.length-1 )
		context.text_after += "...";

	return context;
}



/**
	Formats a match in an extract of text
	@return a TextNode
*/
RegexWorker.prototype.getContextAsText = function ( match, mode )
{
	var context = this.getDottedContext( match, 10, 10 );
	return document.createTextNode( "char. " + context.match_index + " : " + context.text_before + "*" + context.text + "*" + context.text_after );
}



/**
	Formats a match in an extract of text
	@return a <span/> DOM node
*/
RegexWorker.prototype.getContextAsNode = function ( match, mode )
{
	var context = this.getDottedContext( match, 10, 10 );
	var span = document.createElement("span");
	span.appendChild( document.createSimpleElement("span","context_info",document.createTextNode("char. "+match_index+" : ")) );
	span.appendChild( document.createSimpleElement("span","context_before",document.createTextNode(context_before)) );
	span.appendChild( document.createSimpleElement("span","context_match",document.createTextNode(match)) );
	span.appendChild( document.createSimpleElement("span","context_after",document.createTextNode(context_after)) );
	return span;
}



//////////////////////////////////////////////////////////////////////////////
// RegExpresso class



/**
	This class represents the whole application and holds global functions.
	When instanciated, it initializes the application global parameters, sets default values, etc.
	Therefore, it should be instanciated only once.
*/
RegExpresso = function()
{
	// all options are gathered in this table
	this.options = {
		'accordion_opacity': true,
		'tabswapper_smooth': true,
		'autorefresh': false
	};


	// once of two, we alternate the style in order to show something has been done
	// even if the result is exactly the same
	this.desc_again = new Loop(["desc","desc_again"]);


	// Tabs have to be initialized before accordion so the accordion
	// opens with the right size when it opens itself.
	// Actually, the accordion seems to use the size of the selected tab
	// so it has to be the largest one...
	this.tabs_regex = new tabSwapper({
		initPanel: 1,
		selectedClass: "on",
		deselectedClass: "off",
		tabSelector: "#section_regex .tab",
		sectionSelector: "#section_regex .tabbed_panel",
		/*remember what the last tab the user clicked was*/
		/*cookieName: "regexpresso",*/
		/*use transitions to fade across*/
		smooth: this.options['tabswapper_smooth']
		});


	// accordion 'titles' have CSS class 'accordion_toggler'
	// accordion 'content panes' have CSS class 'accordion_stretcher'
	// active accordion title has CSS class 'on'
	this.accordion = new MultipleOpenAccordion( $$(".accordion_toggler"), $$(".accordion_stretcher"), {
		openAll: false,
		firstElementsOpen: [0,3],
		opacity: this.options['accordion_opacity'],
		onActive: function(toggler,el) { toggler.addClass("on"); },
		onBackground: function(toggler,i) { toggler.removeClass("on") }
		} );


	this.worker = null;

	// Apply common properties / methods to objects.

	// auto-select the text in the input fields when focused
	$$(".input[type=text]",".input[type=password]","textarea.input").each( function(el,p) {
		el.onfocus = function() { this.select(); };
	} );

	// registers this object as the listener to 'onchange' events on the following fields
	$$(".input").each( function(item,index) {
		var me = this;
		item.onchange = function() { me.onFieldUpdate(this); };
		item.onkeyup = item.onchange;
	}, this );
}



/**
	This function handles all 'onchange' events, that happens when an input field is being modified.
	It's a clearer view than to have it in every object.
	@tparam Element el	The field (or its id)
*/
RegExpresso.prototype.onFieldUpdate = function( el )
{
	var input_regex = $('input_regex');
	var oldval = input_regex.value;

	// updates the regex with the value of the current tab
	switch( $(el).id )
	{
		case 'regex_search_a':
		case 'regex_search_mod_i':
		case 'regex_search_mod_g':
		case 'regex_search_mod_m':
			var modifiers = ( $('regex_search_mod_i').checked ? 'i' : '' ) + ( $('regex_search_mod_g').checked ? 'g' : '' ) + ($('regex_search_mod_m').checked ? 'm' : '' );
			input_regex.value = "/" + $('regex_search_a').value + "/" + modifiers;
			$('regex_expert_a').value = input_regex.value;	// see comment on 'regex_expert'
			break;

		case 'regex_replace_a':
		case 'regex_replace_b':
		case 'regex_replace_mod_i':
		case 'regex_replace_mod_g':
		case 'regex_replace_mod_m':
			var modifiers = ( $('regex_replace_mod_i').checked ? 'i' : '' ) + ( $('regex_replace_mod_g').checked ? 'g' : '' ) + ($('regex_replace_mod_m').checked ? 'm' : '' );
			input_regex.value = "s/" + $('regex_replace_a').value + "/" + $('regex_replace_b').value + "/" + modifiers;
			$('regex_expert_a').value = input_regex.value;	// see comment on 'regex_expert'
			break;

		// expert mode works differently than 'easy' modes : it reuses the regex that was set by the other modes
		// because it's expected users will come to this mode after having tried in simple modes first
		// This also enables to observe how to compose a regular expression in expert mode
		case 'regex_expert_a':
			input_regex.value = $('regex_expert_a').value;
			break;
	}

	// updates the result if needed
	if ( this.options['autorefresh'] && input_regex.value != oldval )
	{
		this.onSubmit();
	}
}



/**
	Updates the result
	@tparam Element input_subject	The input field containing the subject to apply the regex to
	@tparam Element input_regex	The input field containing the regular expression pattern to apply to the subject
	@throws Exception		If any occured and couldn't be catched
*/
RegExpresso.prototype.onSubmit = function( output, input_subject, input_regex )
{
	console.debug('onSubmit(',output,input_subject,input_regex,')');
	var dom_output = $(output);
	try
	{
		// the following operation can take time if the input text is big
		this.worker = new RegexWorker( $(input_subject).value, $(input_regex).value );
		switch ( cbonar_regex_explainPerlRegexPattern(this.worker.pattern).action )
		{
			case 'm':
			case '':
			{
				// first, prints the number of matches
				var howmany_text = "No match.";
				if ( this.worker.matches.length() > 0 )
				{
					if ( this.worker.matches.length() == 1 )
						howmany_text = "1 match :";
					else
						howmany_text = this.worker.matches.length() + " matches :";
				}
				dom_output.innerHTML = document.createSimpleElement("div",this.desc_again.next(), document.createTextNode(howmany_text));

				// then outputs the different kind of available representations
				// the following operations can take time if the input text is big
				if ( this.worker.matches.length() > 0 )
				{
					dom_output.addTab( "output_text", this.worker.asHTML() );
					dom_output.addTab( "output_table", this.worker.asTable() );
				}
			}
			break;

			case 's':
			{
				// first, prints the number of matches
				var howmany_text = this.worker.matches.length() > 0 ? this.worker.matches.length() + " replaced :" : "Nothing was replaced.";
				dom_output.innerHTML = document.createSimpleElement("div",this.desc_again.next(), document.createTextNode(howmany_text));

				// then outputs the different kind of available representations
				// the following operations can take time if the input text is big
				dom_output.addTab( "output_text", this.worker.asHTML() );
				dom_output.addTab( "output_text", this.worker.asText() );
			}
			break;
		}
	}
	catch ( e )
	{
		console.debug(e);

		// @see http://msdn.microsoft.com/library/default.asp?url=/library/en-us/script56/html/js56jslrfJScriptErrorsTOC.asp
		if ( cbonar_ie_version() > 0 )
		{
			switch ( e.number & 0xFFFF )
			{
				case 5017:	// Syntax error in regular expression
				case 5018:	// Unexpected quantifier
				case 5019:	// Expected ']' in regular expression
				case 5020:	// Expected ')' in regular expression
				case 5021:	// Invalid range in character set
					dom_output.appendChild( createSimpleElement("pre","error",document.createTextNode(e.description)) );
					break;
				default:
					throw e;
					break;
			}
		}
		else if ( e instanceof SyntaxError )
		{
			dom_output.innerHTML = document.createSimpleElement("pre","error",document.createTextNode(e.message));
		}
		else
		{
			//throw e;
			return false;	// disable this line when debug is finished
		}
	}

	return false;	
}

