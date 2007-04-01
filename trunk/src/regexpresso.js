/**///////////////////////////////////////////////////////////////////////////
///
/// @file
/// Classes and functions specific to the RegexPresso project.
/// Placed in public domain by cbonar@users.berlios.de, 2005. Share and enjoy!
///
///////////////////////////////////////////////////////////////////////////*/



//////////////////////////////////////////////////////////////////////////////
// a few usefull extensions to existing objects to match the exact needs of this project



/**
	@tparam String dom_type			The type of the DOM Node
	@tparam String css_class		The CSS class
	@tparam DOMElement dom_child	The DOM Node to insert into the node
	@treturn DOMElement sets some properties ; null parameters are ignored
*/
document.createSimpleElement = function( dom_type, css_class, dom_child )
{
	//console.log("createSimpleElement("+dom_type+","+text+","+css_class+")");

	var el = document.createElement(dom_type);
	if ( css_class != null )
		el.className = css_class;
	if ( dom_child != null )
		el.appendChild(dom_child);
	return el;
}



/**
	A Context is used to locate the match inside a text.
	It gathers the text before and the text after the match.
	It's not usefull to call this constructor directly, it's meant to be instanciated by RegexPressoWorker#getContext().
	@ctor
	All arguments to this constructor are just stored and can simply be accessed later as member variables.
*/
function Context( matchIndex, matchText, textBefore, textAfter )
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
Context.prototype.valueOf = function()
{
	return [ this.matchText, this.textBefore, this.textAfter ];
}



/**
 * @treturn String	This Context as a string
 */
Context.prototype.toString = function()
{
	return this.valueOf().join("");
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
	return new Context(
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
	// builds the tabs around the regular expression input section
	var section_regex_tabswapper = new TabSwapper(
		{
		selectedClass: 'on',
		deselectedClass: 'off',
		tabSelector: '#regex_tabs li',
		clickSelector: '#regex_tabs li a',
		sectionSelector: '#regex_panels div',
		cookieName: 'section_regex_lasttab'
		}
	);
}


