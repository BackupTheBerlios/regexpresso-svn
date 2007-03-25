
//////////////////////////////////////////////////////////////////////////////
// a few usefull extensions not found in other libraries



/**
	@tparam String dom_type			The type of the DOM Node
	@tparam String css_class		The CSS class
	@tparam DOMElement dom_child	The DOM Node to insert into the node
	@return a DOM Node and set some properties ; null parameters are ignored
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



//////////////////////////////////////////////////////////////////////////////
// Helper classes



/**
	This class simply holds informations about the result of a pattern match on a text.
*/
function Match()
{
	/** What was NOT matched between the last match (or the start) and this match */
	this.textBefore = "";
	/** The index of the first char of this match in the whole subject */
	this.index = -1;
	/** The matched text */
	this.text = null;
	/** A table containing the matched groups */
	this.groups = new Array();
}



/**
	This class simply holds informations about the context around a match.
*/
function Context( text, matchIndex, indexBefore, indexAfter, textBefore, textAfter )
{
	this.text = text;
	this.matchIndex = matchIndex;
	this.indexBefore = indexBefore;
	this.indexAfter = indexAfter;
	/** what's before */
	this.textBefore = textBefore;
	/** what's after */
	this.textAfter = textAfter;
}



//////////////////////////////////////////////////////////////////////////////
// The main class of this library



/**
	This class is a user friendly tool to work on regular expressions.
	It holds several instances of Match.

	@param subject a String
	@param regexp a RegExp
*/
function RegexWorker( subject, regex )
{
	// private fields

	/**
	 * stores the object itself in order to avoid any copy of its content, that may be huge.
	 * TODO : how to check that ?
	 */
	//this.domSubject = domSubject;
	//this.domPattern = domPattern;
	//this.regex = null;

	// public fields & methods

	/** An array holding the matches ; can be empty. The first cell (0) contains the matched text, the others (from 1) contain the matched groups */
	this.matches = new Array();
	/** The text that was NOT matched after the last match */
	this.tail = "";



	// computes the matches
	var results = regex.exec(subject);

	// match_index is the index of the match of the original subject
	for ( m=0, match_index=0, text_before_index=0 ; results!=null && match_index<subject.length ; m++ )
	{
		this.matches[m] = new Match();

		// updates the index to the start of the match
		match_index += results.index;

		// saves the text not matched before this match
		this.matches[m].before = subject.substring(text_before_index,match_index);

		// saves the index
		this.matches[m].index = match_index;

		// saves the match
		this.matches[m].text = results[0];

		// saves the groups
		this.matches[m].groups = new Array();
		for ( r=1 ; r<results.length ; r++ )
			this.matches[m].groups[r-1] = ( results[r] == undefined ? "" : results[r] );	// this happens when the match is empty

		// prepares match_index for the next loop
		text_before_index = match_index + results[0].length;
		if ( results[0].length > 0 )
			match_index += results[0].length;
		else
			match_index++;
		results = regex.exec( subject.substring(match_index,subject.length) );	// continue on the remaining part of the subject

		// saves the trailing text, if existing
		if ( results == null )
			this.tail = subject.substring(match_index,subject.length);
	}
}
//new RegexWorker()	// forces creation of RegexWorker.prototype



/**
	@returns The last subject used
*/
/*RegexWorker.prototype.getSubject = function()
{
	return this.subject;
}*/



/**
	@returns The last RegExp used
	TODO ? always the same because of the static behavior of the RegExp class ?
*/
/*RegexWorker.prototype.getRegExp = function()
{
	return this.regex;
}*/



RegexWorker.prototype.getContext = function( match, subject, length_before, length_after )
{
	return new Context(
		match.text,
		match.index,
		Math.max(0,match_index-length_before),
		Math.min(match_index+text.length+length_after,subject.length),
		this.subject.substring(index_before,match_index),
		this.subject.substring(Math.min(match_index+match.length,subject.length),index_after)
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
	span.appendChild( createSimpleElement("span","context_info",document.createTextNode("char. "+match_index+" : ")) );
	span.appendChild( createSimpleElement("span","context_before",document.createTextNode(context_before)) );
	span.appendChild( createSimpleElement("span","context_match",document.createTextNode(match)) );
	span.appendChild( createSimpleElement("span","context_after",document.createTextNode(context_after)) );
	return span;
}



RegexWorker.prototype.testMe = function()
{
	return "toto";
}