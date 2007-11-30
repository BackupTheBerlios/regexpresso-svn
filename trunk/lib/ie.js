
function cbonar_ie_version()
{
	var ua = window.navigator.userAgent
	// Dans le cas d'un autre navigateur, renvoie 0
	var msie = ua.indexOf ( "MSIE " )
	if ( msie > 0 )
		return parseInt (ua.substring (msie+5, ua.indexOf (".", msie )));
	else
		return 0;
}
 
