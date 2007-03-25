/**
	HTTP/URL utility functions.
*/

/**
	@returnval the value of an argument of the URL
	@returnval value of the 'notfound' parameter if not found or no regex support
	@returnval "" if the param was found but empty
	@param location
		A Location object (like in window.location).
	@param name
		The (case insensitive) name of the param.
	@param notfound
		The default value to return if the parameter was not found
*/
function cbonar_http_getParam( location, name, notfound )
{
	if ( window.RegExp )
	{
		var result = new RegExp("[\\?&]"+name+"=([^&]*)&?","i").exec(location.search);
		if ( result != null && result[1] != null )
			// should work 100% with text/urlencoded only
			// with text/plain, the '+' signs will be converted to spaces, even if they were real '+'
			return unescape(result[1].replace(/\+/g," "));
		else
			return notfound;
	}
	else
		return notfound;
}


