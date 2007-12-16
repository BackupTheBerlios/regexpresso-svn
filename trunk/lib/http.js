/**
	HTTP/URL utility functions.
*/

/**
	@returnval the value of an argument of the URL
	@returnval value of the 'notfound' parameter if not found or no regex support
	@returnval "" if the param was found but empty
	@param name
		The (case insensitive) name of the param.
	@param notfound
		The default value to return if the parameter was not found
*/
String.prototype.getURIParam( name, notfound )
{
	var params = this.parseSearch();
	return params && params[name] ? params[name] : notfound;
}



/**
 * Fixed from mootols : accepts multi-valued parameters
 */
String.prototype.parseQuery = function() {
	var couples = this.split("&");
	var rs = {};
	if ( couples.length )
	{
		couples.each( function(couple){
			var keyval = couple.split("=");
			if (keyval.length && keyval.length == 2)
			{
				// should work 100% with text/urlencoded only
				// with text/plain, the '+' signs will be converted to spaces, even if they were real '+'
				var key = unescape(keyval[0].replace(/\+/g," "));
				var val = unescape(keyval[1].replace(/\+/g," "));
				// if already defined, store as an array
				if ( rs[key] != null )
				{
					// if it's not an array, transform it into an array
					if ( ! rs[key] instanceof Array )
					{
						rs[key] = [ rs[key] ];
					}
					rs[key].push(val);
				}
				else
				{
					rs[key] = val;
				}
			}
		});
	}
	return rs;
};



/**
 * Same as parseQuery, but ignores the leading '?' if any, as it exists in document.location.search
 */
String.prototype.parseSearch = function() {

	var queryString = this;

	var x = /\??(.*)/.exec(this);
	if ( x != null && x.length == 2 )
	{
		queryString = x[1];	// it's the captured group
	}

	return queryString;
}
