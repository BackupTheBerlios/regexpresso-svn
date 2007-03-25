/**
	This library contains classes that ease the use of the RegExp object.
	Placed in public domain by cbonar@users.berlios.de, 2005. Share and enjoy!
*/



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

	@tparam String subject
	@tparam subject regex
*/
function RegexWorker( subject, regex )
{
	/////////////////////
	// public fields

	/** An array holding the matches ; can be empty. The first cell (0) contains the matched text, the others (from 1) contain the matched groups */
	this.matches = new Array();

	/** The text that was NOT matched after the last match */
	this.tail = "";



	/////////////////////
	// initialization

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



/**
	@param match				the match to generate the surrounding context
	@param subject				the text to extract the context from
	@param length_before		the number of characters to take into account before the match
	@param length_after			the number of characters to take into account after the match
	@type Context
*/
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

