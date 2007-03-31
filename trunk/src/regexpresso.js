/**
	This library contains code specific to the RegexPresso project.
	Placed in public domain by cbonar@users.berlios.de, 2005. Share and enjoy!
*/



//////////////////////////////////////////////////////////////////////////////
// a few usefull extensions to existing objects to match the exact needs of this project



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


