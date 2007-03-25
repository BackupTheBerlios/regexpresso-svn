
//////////////////////////////////////////////////////////////////////////////
// RegExpresso class



/**
	This class represents the whole application and holds global functions.
	It should be instanciated only once.
	At instanciation time, it initializes the application global parameters, sets default values, etc.
*/
RegExpresso = function()
{
	console.log("initialize()");

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


