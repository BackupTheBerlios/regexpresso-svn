/**///////////////////////////////////////////////////////////////////////////
///
/// @file
/// Classes to ease the use of the RegExp object.
///
/// @requires chainedlist.js
///
/// Placed in public domain by cbonar@users.berlios.de, 2005. Share and enjoy!
///
////////////////////////////////////////////////////////////////////////////*/



//////////////////////////////////////////////////////////////////////////////
// Utility functions



/**
	Makes sure the pattern has an understandable format as per the Perl flavor of regular expressions syntax.
	@tparam String pattern The pattern to normalize
*/
function cbonar_regex_asPerlRegexPattern( pattern )
{
	var perl_pattern = pattern;

	var slashes = perl_pattern.replace(/\\\\/g,"").replace(/\\\//,"").split("/").length-1;
	//alert(slashes+" slashes");
	// the user can omit the first slash
	if ( slashes == 1 && perl_pattern.charAt(0) != "/" )
		perl_pattern = "/" + perl_pattern;
	// the user can enter no slash : he then gives only the subject to match
	else if ( slashes < 2 )
		perl_pattern = "/" + perl_pattern + "/";
	// we also allow the form : "s/search/replace" with no final slash
	else if ( new RegExp("s/.*/[^/]*","i").test(perl_pattern) && slashes < 3 )
		perl_pattern = perl_pattern + "/";

	return perl_pattern;
}



/**
	Splits a Perl pattern into different parts

	@tparam String pattern	The pattern, using Perl syntax
	@see asPerlRegexPattern
	@return an object with the following fields : { action (=function), pattern, modifiers [,replace_string] }. action is 'm' or '' (empty) for search, 's' for search & replace ; replace_string is present only if action = 's'.
*/
function cbonar_regex_explainPerlRegexPattern( pattern )
{
	var explained = new Object();
	var perl_pattern = asPerlRegexPattern(pattern);

	explained.action = perl_pattern.match(/([ms]?)\//)[1];	// we can do that because we previously added (possibly) missing slashes in asPerlRegexPattern
	switch ( explained.action )
	{
		case "s":
			var user_pattern = new RegExp("s/(.*)/(.*)/([^/]*)","i").exec(perl_pattern);
			if ( user_pattern != null )
			{
				explained.pattern = user_pattern[1];
				explained.replace_string = user_pattern[2];
				explained.modifiers = user_pattern[3];
			}
			break;

		case "":
		case "m":
			var user_pattern = new RegExp("m?/(.*)/([^/]*)","i").exec(perl_pattern);
			if ( user_pattern != null )
			{
				explained.pattern = user_pattern[1];
				explained.modifiers = user_pattern[2];
			}
			break;
	}

	return explained;
}



/**
	Makes a new RegExp as much as possible with the given pattern
	@see explainPerlRegexPattern
	@return a RegExp object, based on the given pattern or pattern itself if it's already a RegExp
*/
function cbonar_regex_asRegExp( pattern )
{
	// a bit of easy coding...
	if ( pattern && pattern.prototype && pattern.prototype == RegExp )
		return pattern;

	var roger = explainPerlRegexPattern(pattern);

	return new RegExp( roger.pattern, roger.modifiers );
}



//////////////////////////////////////////////////////////////////////////////
// Helper classes



/**
 * Holds informations about one of the matches of the result of a match() operation.
 * It's implemented as a chained-list.
 *
 * @ctor
 * Contructor
 * @tparam String textBefore	see Match#getTextBefore()
 * @tparam String textAfter	see Match#getTextAfter()
 * Other member values defaults to -1 for numbers, empty for arrays and null for others.
 */
function Match( index, text, textBefore, textAfter, groups )
{
	// ctor
	Joint.call(this);

	/**
	 * The index of the first char of this match in the whole subject
	 * @type int
	 */
	this.index = index;

	/**
	 * The matched text
	 * @type String
	 */
	this.text = text;

	/**
	 * A table containing the matched groups
	 * @type Array
	 */
	this.groups = groups ? groups : new Array();

	// private members, if they are directly modified, the corresponding accessors are not guaranteed to act as specified
	this.setTextBefore(textBefore);
	this.setTextAfter(textAfter);
}
Match.prototype = new Joint();
/** @ctor */
Match.prototype.constructor = Match;



/**
 * Makes sure the text after is the one of newNext
 * @tparam Joint newNext
 * @see Joint#insertAfter()
 */
Match.prototype.insertAfter = function( newNext )
{
	var inserted = Joint.prototype.insertAfter( newNext );
	this.setTextAfter( inserted.getTextBefore() );
	return inserted;
}



/**
 * Makes sure the text before is the one of newPrevious
 * @tparam Joint newPrevious
 * @see Joint#insertBefore()
 */
Match.prototype.insertBefore = function( newPrevious )
{
	var inserted = Joint.prototype.insertBefore( newPrevious );
	this.setTextBefore( inserted.getTextAfter() );
	return inserted;
}



/**
 * What was NOT matched between the previous match (or the start) and this match.
 * @type String
 */
Match.prototype.getTextBefore = function()
{
	if ( this.textBefore )
		return this.textBefore;
	else if ( this.previous && this.previous.getTextAfter() )
		return this.previous.getTextAfter();
	else
		return "";
}



/**
 * What was NOT matched between this match and the next match (or the end).
 * @type String
 */
Match.prototype.getTextAfter = function()
{
	if ( this.textAfter )
		return this.textAfter;
	else if ( this.next && this.next.getTextBefore() )
		return this.next.getTextBefore();
	else
		return "";
}



/**
 * Sets the value of the text that was not matched between this match and the previous one.
 * Erases at the same time the text that was not matched after the previous match since it's the same.
 * The only difference is that this object stores the text instead of the previous one.
 */
Match.prototype.setTextBefore = function( text )
{
	this.textBefore = text;
	if ( this.previous )
		this.previous.textAfter = null;
}



/**
 * Sets the value of the text that was not matched between the next match and this one.
 * Erases at the same time the text that was not matched before the next match since it's the same.
 * The only difference is that this object stores the text instead of the next one.
 */
Match.prototype.setTextAfter = function( text )
{
	this.textAfter = text;
	if ( this.next )
		this.next.textBefore = null;
}



//////////////////////////////////////////////////////////////////////////////
// The main class of this library



/**
	A user friendly tool to work on regular expressions.

	It works the following way : one build an instance around an existing RegExp and text to apply to.
	It then compute the regular expression against the given text and stores all matches so they can be accessed without further work.

	During a matching operation, the results are considered to be a sequence like :
	 - text not matched 0
	 - match 0
	 - text not matched 1
	 - match 1
	 - ...
	 - match n
	 - text not matched n+1 (= tail)
	Furthermore, each match can be made of several groups if the regular expression contains such selectors.
	What's important when working with regular expressions is to be able to identify the parts that matched.
	This is why match x is directly accessible via this.matches[x)

	@ctor
	Constructor
	@tparam String subject	The text to apply the regex to
	@tparam RegExp regexp	The regular expression or the corresponding Perl pattern
*/
function Matcher( subject, pattern )
{
	/////////////////////
	// public fields

	/** the text of the subject */
	this.subject = subject;

	/** The pattern of the regular expression or the regular expression itself depending on what's been given at construction time */
	this.pattern = pattern;

	/**
		An array holding the matches.
		Can be empty.\n
		The first cell (0) contains the matched text, the others (from 1) contain the matched groups
		@treturn Array
	*/
	this.matches = new Array();

	/**
		The text that was NOT matched after the last match.
		@type String
	*/
	this.tail = "";


	if ( !subject || !pattern )
		return;


	/////////////////////
	// initialization

	// makes sure we have an instance of RegExp
	var regex = asRegExp(pattern);

	// computes the matches
	var results = regex.exec(subject);

	// match_index is the index of the match of the original subject
	for ( m=0, match_index=0, text_before_index=0 ; results!=null && match_index<subject.length ; m++ )
	{
		this.matches[m] = new Match( this.matches[m-1] );

		// updates the index to the start of the match
		match_index += results.index;

		// saves the index
		this.matches[m].index = match_index;

		// saves the text not matched before this match
		this.matches[m].setTextBefore( subject.substring(text_before_index,match_index) );

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
			this.matches[m].setTextAfter( subject.substring(match_index,subject.length) );
	}
}

