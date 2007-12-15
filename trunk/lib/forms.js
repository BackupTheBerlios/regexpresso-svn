/**///////////////////////////////////////////////////////////////////////////
/// @file
///
/// Widgets to deal with forms' inputs
///
/// @requires mootools
if ( MooTools == null || MooTools['version'] < 1.1 ) throw new Error("'MooTools 1.1+' is missing. Make sure the Mootools library has been correctly loaded.");
/// @requires html_entity_decode
if ( !$defined(html_entity_decode) ) throw new Error("html_entity_decode function is missing. Make sure the corresponding library has been loaded.");
///
/// Placed in public domain by cbonar@users.berlios.de, 2005. Share and enjoy!
///
///////////////////////////////////////////////////////////////////////////*/



/**
	A graphical checkbox.
	 
	It is build by replacing an existing element and acts as a 'facade' to a real checkbox.
*/
var ImgCheckBox = new Class({

	options: {
		srcOn: null,	// the img src when it's checked
		srcOff: null,	// the img src when it's unchecked
		classOn: null,	// the class when it's checked (removed when unckecked) : will be applied only to the picture (not the checkbox)
		img: {},	// the attributes to add to the generated img
		href: "javascript:void('toggles the checkbox');"	// the default href if the element replaced is an anchor
	},

	/**
	 * selMe single or multi-selector for the element to replace
	 * selInput single selector fot the real checkbox
	 */
	initialize: function( selMe, selInput, options ) {

		console.debug(this,".initialize(",selMe,selInput,options,")");

		this.setOptions(options);
		this.input = $(selInput);
		var mes = $$(selMe)

		// if the first arg leads to more than one result, simply build graphic checkboxes on the same real checkbox
		if ( $defined(mes) )
		{
			if ( mes.length > 1 )
			{
				var chks = [];
				for ( var m=0 ; m<mes.length ; m++ )
				{
					chks.push( new ImgCheckBox(mes[m],selInput,options) );
				}
				return chks;
			}
			else
			{
				var me = mes.length == 1 ? mes[0] : $(selMe);

				// the ImgCheckBox wants to be notified of any change of the checkbox it's monitoring
				var classOn = this.options.classOn;
				this.input.addEvent( "change", function(){ /*this.toggleClass(classOn);*/ me.updateSrc();} );
	
				// if the element is not an image, we add one
				if ( me.getTag() == "img" )
				{
					this.img = me;
				}
				else
				{
					this.img = new Element("img",$merge(this.options.img,{/*'src':this.getCurrentSrc(),*/'style':"border:none;"}));
					this.img.injectInside(me);
				}
	
				// if it's an anchor, make sure it doesn't triggers another action
				// except if it has already an anchor
				if( me.href == "" )
				{
					me.href = this.options.href;
				}
	
				$extend(me,this);
	
				// makes sure the initial state is synchronized with the checkbox
				this.updateSrc();
			
				return me;
			}
		}
		else
		{
			throw new Error("ImgCheckBox::No element was found for selector "+selMe);
		}
	}

});
ImgCheckBox.implement(new Options, new Events);



/**
 * Changes the source of the image depending on the current state of the checkbox
 */
ImgCheckBox.prototype.updateSrc = function()
{
	if ( this.input.checked )
	{
		this.img.src = html_entity_decode(this.options.srcOn);
		this.img.addClass(this.options.classOn);
	}
	else
	{
		this.img.src = html_entity_decode(this.options.srcOff);
		this.img.removeClass(this.options.classOn);
	}
}



ImgCheckBox.prototype.onclick = function()
{
	this.input.click();
}


