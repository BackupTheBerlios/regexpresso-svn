/**///////////////////////////////////////////////////////////////////////////
/// @file
///
/// Widgets to deal with forms' inputs
///
/// @requires mootools
if ( MooTools == null || MooTools['version'] < 1.1 ) throw new Error("'MooTools 1.1+' is missing. Make sure the Mootools library has been correctly loaded.");
///
/// Placed in public domain by cbonar@users.berlios.de, 2005. Share and enjoy!
///
///////////////////////////////////////////////////////////////////////////*/



/**
	Replaces an existing checkbox with an image.
	It acts as a 'facade' to the real checkbox.
*/
var ImgCheckBox = new Class({

	options: {
		srcOn: null,
		srcOff: null,
		classOn: null,
		img: {},
		tips: { hideDelay:150, maxOpacity: .9 },
		href: "javascript:void('toggles the checkbox');"
	},

	initialize: function( selAnchor, selInput, options ) {

		this.setOptions(options);
		this.input = $(selInput);
		var a = $(selAnchor);

		// the ImgCheckBox wants to be notified of any change of the checkbox it's monitoring
		var classOn = this.options.classOn;
		this.input.addEvent( "change", function(){ this.toggleClass(classOn); a.updateSrc();} );

		this.img = new Element("img",$merge(this.options.img,{'src':this.getCurrentSrc(),'style':"border:none;"}));
		var title = $defined(this.options.title) ? this.options.title : $defined(a.title) ? a.title : null;
		if ( $defined(title) )
			this.img.title = title;
		a.title = "";
		this.img.injectInside(a);

		if( a.href == "" )
			a.href = this.options.href;

		new Tips($(a).getElements("img"),$merge(this.options.tips,{maxTitleChars:title.length}));

		$extend(a,this);

		return a;
	}

});
ImgCheckBox.implement(new Options, new Events );



ImgCheckBox.prototype.updateSrc = function()
{
	this.img.src = this.getCurrentSrc();
	this.toggleClass(this.options.classOn);
}



ImgCheckBox.prototype.getCurrentSrc = function()
{
	console.debug(this,".getCurrentSrc() : ",this.input.checked,this.options.srcOn,this.options.srcOff);
	return this.input.checked ? this.options.srcOn : this.options.srcOff;
}



ImgCheckBox.prototype.onclick = function()
{
	console.debug(this,".onclick() : ",this.input);
	this.input.click();
}


