/**///////////////////////////////////////////////////////////////////////////
/// @file
///
/// Classes and functions specific to the regexpresso project.
///
/// @requires mootools
if ( MooTools == null || MooTools['version'] < 1.1 ) throw new Error("'MooTools 1.1+' is missing. Make sure the Mootools library has been correctly loaded.");
/// @requires nicommons.ie
if ( !$defined(MSInternetExplorer) ) throw new Error("Class 'MSInternetExplorer' is missing. Make sure the corresponding library has been correctly loaded.");
/// @requires Matcher
if ( !$defined(Matcher) ) throw new Error("Class 'Matcher' is missing. Make sure that the corresponding library has been correctly loaded.");
///
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
	text.length > 0 ? $('warning').show() : $('warning').hide();
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



//////////////////////////////////////////////////////////////////////////////
// extension : to the Match class for regular expressions add a context to the matches



/**
	A MatchContext is used to locate the match inside a text.
	It gathers the text before and the text after the match.
	It's not usefull to call this constructor directly, it's meant to be instanciated by RegexpressoWorker#getContext().

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
 * @treturn Array	The 'string' parts of this object : { textBefore, matchText, textAfter }
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
RegexWorker = function( subject, pattern ) {
	Matcher.apply(this,[subject,pattern]);
	console.debug("new RegexWorker(",subject,pattern,")=",this);
};
RegexWorker.prototype = new Matcher(null,null);



/**
 *  Replaces non visible characters with a visible entity / symbol.
 *
 *  Hardcoded because they are special characters that should be handle 'specially'.
 */
RegexWorker.showNonPrintable = function( text, classPrefix )
{
	var replaced = text;

	// first, the characters used down there in the replacement strings
	// if we don't do this, "<span class="toto">tutu</span>" will be broken into
	// something like "<span<span class="toto">tete</span>class="toto">tutu</span>"
	replaced = replaced.replace(/\x20/gm, "<span class='"+classPrefix+"Light' style='font-weight:bold;'>&#183;</span>" );

	// then the other caracters in any order
	replaced = replaced.replace(/\x00/gm, "<span class='"+classPrefix+"Dark'>NUL</span>" );
	replaced = replaced.replace(/\x01/gm, "<span class='"+classPrefix+"Dark'>SOH</span>" );
	replaced = replaced.replace(/\x02/gm, "<span class='"+classPrefix+"Dark'>STX</span>" );
	replaced = replaced.replace(/\x03/gm, "<span class='"+classPrefix+"Dark'>ETX</span>" );
	replaced = replaced.replace(/\x04/gm, "<span class='"+classPrefix+"Dark'>EOT</span>" );
	replaced = replaced.replace(/\x05/gm, "<span class='"+classPrefix+"Dark'>ENQ</span>" );
	replaced = replaced.replace(/\x06/gm, "<span class='"+classPrefix+"Dark'>ACK</span>" );
	replaced = replaced.replace(/\x07/gm, "<span class='"+classPrefix+"Dark'>BEL</span>" );
	replaced = replaced.replace(/\x08/gm, "<span class='"+classPrefix+"Dark'>BS</span>" );
	replaced = replaced.replace(/\t/gm, "<span class='"+classPrefix+"Light'>&rarr;</span>\t" );
	replaced = replaced.replace(/\n/gm, "<span class='"+classPrefix+"Light'>&#182;</span>\n" );
	replaced = replaced.replace(/\x0B/gm, "<span class='"+classPrefix+"Dark'>VT</span>" );
	replaced = replaced.replace(/\x0C/gm, "<span class='"+classPrefix+"Dark'>FF</span>" );
	replaced = replaced.replace(/\r/gm, "<span class='"+classPrefix+"Light'>&#8629;</span>\r" );
	replaced = replaced.replace(/\x0E/gm, "<span class='"+classPrefix+"Dark'>SO</span>" );
	replaced = replaced.replace(/\x0F/gm, "<span class='"+classPrefix+"Dark'>SI</span>" );
	replaced = replaced.replace(/\x10/gm, "<span class='"+classPrefix+"Dark'>DLE</span>" );
	replaced = replaced.replace(/\x11/gm, "<span class='"+classPrefix+"Dark'>XON</span>" );
	replaced = replaced.replace(/\x12/gm, "<span class='"+classPrefix+"Dark'>DC2</span>" );
	replaced = replaced.replace(/\x13/gm, "<span class='"+classPrefix+"Dark'>XOFF</span>" );
	replaced = replaced.replace(/\x14/gm, "<span class='"+classPrefix+"Dark'>DC4</span>" );
	replaced = replaced.replace(/\x15/gm, "<span class='"+classPrefix+"Dark'>NAK</span>" );
	replaced = replaced.replace(/\x16/gm, "<span class='"+classPrefix+"Dark'>SYN</span>" );
	replaced = replaced.replace(/\x17/gm, "<span class='"+classPrefix+"Dark'>ETB</span>" );
	replaced = replaced.replace(/\x18/gm, "<span class='"+classPrefix+"Dark'>CAN</span>" );
	replaced = replaced.replace(/\x19/gm, "<span class='"+classPrefix+"Dark'>EM</span>" );
	replaced = replaced.replace(/\x1A/gm, "<span class='"+classPrefix+"Dark'>SUB</span>" );
	replaced = replaced.replace(/\x1B/gm, "<span class='"+classPrefix+"Dark'>ESC</span>" );
	replaced = replaced.replace(/\x1C/gm, "<span class='"+classPrefix+"Dark'>FS</span>" );
	replaced = replaced.replace(/\x1D/gm, "<span class='"+classPrefix+"Dark'>GS</span>" );
	replaced = replaced.replace(/\x1E/gm, "<span class='"+classPrefix+"Dark'>RS</span>" );
	replaced = replaced.replace(/\x1F/gm, "<span class='"+classPrefix+"Dark'>US</span>" );

	return replaced;
}



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



/**
	Only usefull with replace
*/
RegexWorker.prototype.asRawText = function()
{
	var string = "";

	for ( var m=0 ; m<this.matches.length ; m++ )
	{
		var match = this.matches[m];
		var before = match.getTextBefore();
		var after = match.getTextAfter();

		if ( before != null )
		{
			string += before;
		}

		string += match.text;

		if ( after != null )
		{
			string += after;
		}
	}

	if ( this.tail != null )
	{
		string += this.tail;
	}

	return string;
}



/**
 *  @return the whole matches as an HTML bloc
 *  @tparam dictionary of options 
 */
RegexWorker.prototype.asRawHTML = function( options )
{
	var string = "";

	for ( var m=0 ; m<this.matches.length ; m++ )
	{
		var match = this.matches[m];
		var before = match.getTextBefore();
		var after = match.getTextAfter();

		if ( before != null )
		{
			string += options.showNonPrintable ? RegexWorker.showNonPrintable(before,options.classPrefixNonPrintable) : before;
		}

		string += "<span class='" + options.classMatched + "'>";

		if ( options.showIndexes )
		{
			string += "<span class='" + options.classIndexes + "'>" + match.index + "</span>";
		}

		string += (options.showNonPrintable ? RegexWorker.showNonPrintable(match.text,options.classPrefixNonPrintable) : match.text);

		if ( options.showBackreferences && match.groups.length>0 )
		{
			for ( g=0 ; g<match.groups.length ; g++ )
			{
				var group = match.groups[g];
				string += "<span class='" + options.classBackref + "'>"
					+ (options.showNonPrintable ? RegexWorker.showNonPrintable(group,options.classPrefixNonPrintable) : group )
					+ "</span>";
			}
		}

		string += "</span>";

		if ( after != null )
		{
			string += options.showNonPrintable ? RegexWorker.showNonPrintable(after,options.classPrefixNonPrintable) : after;
		}
	}

	if ( this.tail != null )
	{
		string += options.showNonPrintable ? RegexWorker.showNonPrintable(this.tail,options.classPrefixNonPrintable) : this.tail;
	}

	return string;
}



//////////////////////////////////////////////////////////////////////////////
// Regexpresso class : the application



/**
	This class represents the whole application and holds global functions.
	When instanciated, it initializes the application global parameters, sets default values, etc.
	Therefore, it should be instanciated only once.
*/
var Regexpresso = new Class({

	options: {
		// default values for user-exposed options
		debug: true,
		smoothTransitions: true,
		autorefresh: false,
		showResults: true,
		showNonPrintable: true, 
		showIndexes: true,
		showBackreferences: true,
		renderer: "text",
	},

	initialize: function(options) {

		console.debug("new Regexpresso(",options,")");

		this.setOptions(options);

		// output div : where to print the results
		this.dom_output_count = $(this.options.output[0]);
		this.dom_results_menus = this.options.output[1];
		this.dom_output_result = $(this.options.output[2]);

		// exact input values from which to compute the results
		this.dom_subject = $(this.options['subject'][0]);
		this.dom_subject.makeResizable({
			handle: $(this.options['subject'][1]),
			modifiers:{x: false, y:'height'} /*limit the sizing to vertical*/
		});
		this.dom_regex = $(this.options['regex'][0]);

		// widgets to help the user to type the regular expression in input
		this.widget_search = {
			0: $(this.options['search'][0]),
			'i': $(this.options['search'][1]),
			'g': $(this.options['search'][2]),
			'm': $(this.options['search'][3])
		};
		this.widget_replace = {
			0: $(this.options['replace'][0]),
			1: $(this.options['replace'][1]),
			'i': $(this.options['replace'][2]),
			'g': $(this.options['replace'][3]),
			'm': $(this.options['replace'][4])
		};
		this.widget_expert = {
			0: $(this.options['expert'][0])
		};

		// the div where to print the options
		this.dom_options = $(this.options['options'][0]);

		// Tabs have to be initialized before accordion so the accordion
		// opens with the right size when it opens itself.
		// Actually, the accordion seems to use the size of the selected tab
		// so it has to be the largest one...
		this.tabs_regex = new tabSwapper({
			initPanel: 0,
			selectedClass: "on",
			deselectedClass: "off",
			tabSelector: "#section_regex .tab",
			sectionSelector: "#section_regex .tabbed_panel",
			/*remember which tab the user clicked last*/
			/*cookieName: "regexpresso",*/
			/*use transitions to fade across*/
			smooth: this.options['smoothTransitions']
			});


		// accordion 'titles' have CSS class 'accordion_toggler'
		// accordion 'content panes' have CSS class 'accordion_stretcher'
		// active accordion title has CSS class 'on'
		this.accordion = new MultipleOpenAccordion( $$(".accordion_toggler"), $$(".accordion_stretcher"), {
			openAll: false,
			firstElementsOpen: [0,3],
			opacity: this.options['smoothTransitions'],
			onActive: function(toggler,el) { toggler.addClass("on"); },
			onBackground: function(toggler,i) { toggler.removeClass("on") }
			} );


		this.worker = null;

		// Apply common properties / methods to objects.

		// what follows is more or less a patch for IE to simulate ':hover' with the class '.hover'
		// it enables the retractible menu to work with IE
		// note : *[hover=on] doesn't work, but div[hover=on] does, so I choosed .hover as the selector
		$$(".hoverme").each( function(item,index) {
		item.addEvent( "mouseenter", function(){ this.addClass("hover") } );
		item.addEvent( "mouseleave", function(){ this.removeClass("hover") } );
		} );

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

	} // end of initialize
});
Regexpresso.implement(new Options, new Events);



/**
	This function handles all 'onchange' events, that happens when an input field is being modified.
	It's a clearer view than to have it in every object.
	@tparam Element el	The field (or its id)
*/
Regexpresso.prototype.onFieldUpdate = function( el )
{
	var oldval = this.dom_regex.value;

	// updates the regex with the value of the current tab
	switch( $(el).id )
	{
		case this.widget_search[0].id:
		case this.widget_search['i'].id:
		case this.widget_search['g'].id:
		case this.widget_search['m'].id:
			var modifiers = ( this.widget_search['i'].checked ? 'i' : '' ) + ( this.widget_search['g'].checked ? 'g' : '' ) + (this.widget_search['m'].checked ? 'm' : '' );
			this.dom_regex.value = "/" + this.widget_search[0].value + "/" + modifiers;
			this.widget_expert[0].value = this.dom_regex.value;	// see comment on 'regex_expert'
			break;

		case this.widget_replace[0].id:
		case this.widget_replace[1].id:
		case this.widget_replace['i'].id:
		case this.widget_replace['g'].id:
		case this.widget_replace['m'].id:
			var modifiers = ( this.widget_replace['i'].checked ? 'i' : '' ) + ( this.widget_replace['g'].checked ? 'g' : '' ) + (this.widget_replace['m'].checked ? 'm' : '' );
			this.dom_regex.value = "s/" + this.widget_replace[0].value + "/" + this.widget_replace[1].value + "/" + modifiers;
			this.widget_expert[0].value = this.dom_regex.value;	// see comment on 'regex_expert'
			break;

		// expert mode works differently than 'easy' modes : it reuses the regex that was set by the other modes
		// because it's expected users will come to this mode after having tried in simple modes first
		// This also enables to observe how to compose a regular expression in expert mode
		case this.widget_expert[0].id:
			this.dom_regex.value = this.widget_expert[0].value;
			break;
	}

	// updates the result if needed
	if ( this.options['autorefresh'] && this.dom_regex.value != oldval )
	{
		this.onSubmit();
	}
}



// filters the action icons to show depending on the current state
Regexpresso.prototype.filterMenu = function( allowedActions )
{
	var menu = $$(this.dom_results_menus)[0];
	menu.getChildren().each(
		function(action,a){
			if ( allowedActions.contains(action.id) )
			{
				action.show();
				action.style.display = "inline";
			}
			else
				action.hide();
		}
	);
	return menu;
}



// duplicates the menu after the results to gain accessibility
Regexpresso.prototype.duplicateMenu = function()
{
	var menu = $$(this.dom_results_menus)[0];
	$$(this.dom_results_menus).each(
		function(item,index){
			if( index > 0 ) {
				$(item).empty().adopt(menu.clone());
			}
			if ( this.options.showResults && this.worker.matches.length > 0 )
				item.show();
			else
				item.hide();
		},
		this);
}



/**
	Updates the result
	@throws Exception		If any occured and couldn't be catched
*/
Regexpresso.prototype.onSubmit = function()
{
	console.debug(this,".onSubmit()");

	// makes sure the pattern used will be the one in the current tab even if its content has not changed
	console.debug("switch(",this.tabs_regex.tabs[this.tabs_regex.now],")");
	switch ( this.tabs_regex.now )
	{
		case 0:
			this.onFieldUpdate( this.widget_search[0] );
			this.onFieldUpdate( this.widget_search['i'] );
			this.onFieldUpdate( this.widget_search['g'] );
			this.onFieldUpdate( this.widget_search['m'] );
			break;
		case 1:
			this.onFieldUpdate( this.widget_replace[0] );
			this.onFieldUpdate( this.widget_replace[1] );
			this.onFieldUpdate( this.widget_replace['i'] );
			this.onFieldUpdate( this.widget_replace['g'] );
			this.onFieldUpdate( this.widget_replace['m'] );
			break;
		case 2:
			this.onFieldUpdate(this.widget_expert);
			break;
	}

	try
	{
		// the following operation can take time if the input text is big
		this.worker = new RegexWorker( this.dom_subject.value, this.dom_regex.value );

		// displays the results depending on the requested operation
		switch ( RegExp.explainPerlRegexPattern(this.worker.pattern).action )
		{
			case 'm':
			case '':
			{
				// first, prints the number of matches
				var howmany_text = "no match.";
				if ( this.worker.matches.length > 0 )
				{
					if ( this.worker.matches.length == 1 )
						howmany_text = "1 match";
					else
						howmany_text = this.worker.matches.length + " matches";
				}
				this.dom_output_count.setText(" (" + howmany_text + ")");
				this.dom_output_count.toggleClass("alt");

				// then the menus
				if ( this.options.showResults && this.worker.matches.length > 0 )
				{
					// builds the icons menu and displays/hides all of its clones
					this.filterMenu(['asText','asTable','showIndexes','showBackrefs','showNonPrintable']);
				}
				this.duplicateMenu();

				// then outputs one of the available views
				// the following operations can take time if the input text is big
				if ( this.options.showResults )
				{
					if ( this.worker.matches.length > 0 )
					{
						this.dom_output_result.removeClass("empty");
						this.dom_output_result.innerHTML = "<pre>" + this.worker.asRawHTML(this.options) + "</pre>";
					}
					else
					{
						this.dom_output_result.addClass("empty");
						this.dom_output_result.innerHTML = "No result.";
					}
					this.dom_output_result.show();
				}
				else
				{
					this.dom_output_result.hide();
				}
			}
			break;

			case 's':
			{
				// first, prints the number of matches
				var howmany_text = this.worker.matches.length > 0 ? this.worker.matches.length + " replaced" : "nothing was replaced";
				this.dom_output_count.setText(" (" + howmany_text + ")");
				this.dom_output_count.toggleClass("alt");

				// builds the icons menu and displays/hides all of its clones
				if ( this.options.showResults && this.worker.matches.length > 0 )
				{
					this.filterMenu(['asText','showNonPrintable','copy']);
				}
				this.duplicateMenu();

				// then outputs one of the available views
				// the following operations can take time if the input text is big
				if ( this.options['showResults'] )
				{
					this.dom_output_result.innerHTML = "<pre>" + this.worker.asRawHTML(this.options) + "</pre>";
					this.dom_output_result.removeClass("empty");
					this.dom_output_result.show();
				}
				else
				{
					this.dom_output_result.hide();
				}
			}
			break;
		}

		// in all cases, make sure to show the results
		this.accordion.showSection(1);
	}
	catch ( e )
	{
		if( $defined(console) )
			console.debug(e);

		if ( this.options.debug )
		{
			warning(e.description+" "+e.message);
			new ObjectBrowser($('warning'), { data:e });
		}

		// @see http://msdn.microsoft.com/library/default.asp?url=/library/en-us/script56/html/js56jslrfJScriptErrorsTOC.asp
		if ( MSInternetExplorer.version() > 0 )
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
					if ( this.options.debug )
						return false
					else
						throw e;
			}
		}
		else if ( e instanceof SyntaxError )
		{
			this.dom_output.innerHTML = document.createSimpleElement("pre","error",document.createTextNode(e.message));
		}
		else
		{
			if ( this.options.debug )
				return false
			else
				throw e;
		}
	}

	// to signal the form should not be submitted
	return false;
}



/**
	Copies the current results into the clipboard
*/
Regexpresso.prototype.copy = function()
{
	switch( this.options.renderer )
	{
		case "text":
			// copies as raw text
			Clipboard.copy(this.worker.asRawText());
			break;
		case "table":
			// copies as CSV
			break;
	}
}
