
/**
	Adds a page to the Netscape sidebar.

	@see http://www.softwareadjuvant.com/class/introtoxml/toolscd/disk1/EditorBrowsers/Mozilla.org/
	@param sbTitle::String
		The default title of the panel
	@param sbLoc::String
		The absolute (!) URL of the page to load
*/
function netscape_addPanel( sbTitle, sbLoc )
{
	//alert("netscape_addPanel("+sbTitle+","+sbLoc+")");

	// hack: bc 2002-01-04 work around http://bugzilla.mozilla.org/show_bug.cgi?id=99808
	// @todo : what if an error happens after the user called this method ? Is this handler registered globally or only inside this function ?
	window.onerror = function()
		{ alert("An error has occured during the sidebar installation. Please make sure your sidebar panel is open and then retry."); };

	if ((typeof window.sidebar == "object") && (typeof window.sidebar.addPanel == "function"))
	{
		// this does not work if sbLoc is a local or relative URL. shit.
		/// @param 1 title of the panel
		/// @param 2 absolute location of the page embed into the panel
		/// @param 3 URL to customize (?) the panel
		window.sidebar.addPanel(sbTitle,sbLoc,"");
	}
	else
		alert('This link is intended to work only with Netscape Gecko-based browsers such as Netscape 7.x.');
}
