/**///////////////////////////////////////////////////////////////////////////
/// @file
///
/// The Joint class is used to build chained lists.
///
/// Placed in public domain by cbonar@users.berlios.de, 2005. Share and enjoy!
///
////////////////////////////////////////////////////////////////////////////*/



/**
 * Links several Joint to make a chained list.
 * @ctor
 * Contructor
 * @tparam Joint previous	The previous Joint in the chain (or null if none)
 * @tparam Joint next		The next Joint in the chain (or null if none)
 */
Joint = function( previous, next )
{
	/**
	 * Access the Joint before this one
	 * @type Joint
	 */
	this.previous = previous;

	/**
	 * Access the Joint after this one
	 * @type Joint
	 */
	this.next = next;
}



/**
 * BEWARE : Loops forever if this chain has a loop !
 * @treturn Joint The first Joint of the chain, including this one
 */
Joint.prototype.getFirst = function()
{
	var f = this;
	while( f && f.previous )
		f = f.previous
	return f;
}



/**
 * BEWARE : Loops forever if this chain has a loop !
 * @treturn Joint The last Joint of the chain, including this one
 */
Joint.prototype.getLast = function()
{
	var l = this;
	while ( l && l.next )
		l = l.next;
	return l;
}



/**
 * @tparam Joint newNext	A Joint to insert after this one. If this Joint is the head of a chain, inserts all the chain.
 * @treturn Joint the inserted Joint (so that it's possible to code-chain like : j1.insertAfter(new Joint()).insertAfter(new Joint()) )
 */
Joint.prototype.insertAfter = function( newNext )
{
	var newNext_end = newNext.getLast();
	newNext.previous = this;
	newNext_end.next = this.next;
	if ( this.next )
		this.next.previous = newNext_end;
	this.next = newNext;
	return newNext;
}



/**
 * @tparam Joint newPrevious	A Joint to insert before this one. If this Joint is the head of a chain, inserts all the chain.
 * @treturn Joint the inserted Joint (so that it's possible to code-chain like : var j2 = j1.insertBefore(new Joint()) )
 */
Joint.prototype.insertBefore = function( newPrevious )
{
	var newPrevious_end = newPrevious.getLast();
	newPrevious.previous = this.previous;
	newPrevious_end.next = this;
	if ( this.previous )
		this.previous.next = newPrevious;
	this.previous = newPrevious_end;
	return newPrevious;
}



/**
 * Removes this Joint from the chain, attaching the one before to the one after (if any).
 * @treturn Joint	This Joint, previous and next references unchanged
 */
Joint.prototype.remove = function()
{
	if ( this.previous )
		this.previous.next = this.next;
	if ( this.next )
		this.next.previous = this.previous;
	return this;
}


