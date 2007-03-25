/*	Script: element.cnet.js
Extends the <Element> object.

Dependancies:
	 mootools - <Moo.js>, <String.js>, <Array.js>, <Function.js>, <Element.js>, <Dom.js>

Author:
	Aaron Newton, <aaron [dot] newton [at] cnet [dot] com>
	
Class: Element
		This extends the <Element> prototype.
	*/
Element.extend({
/*	Property: getDimensions
		Returns width and height for element; if element is not visible the element is
		cloned off screen, shown, measured, and then removed.
		
		Returns:
		An object with .width and .height defined as integers.
		
		Example:
		>$(id).getDimensions()
		> > {width: #, height: #}
	*/
	getDimensions: function() {
		var w = 0;
		var h = 0;
		try { //safari sometimes crashes here, so catch it
			w = this.getStyle('width').toInt();
			h = this.getStyle('height').toInt();
		}catch(e){}
		if((w == 0 || $type(w) != 'number')||(h == 0 || $type(h) != 'number')){
			var holder = new Element('div').setStyles({
				'position':'absolute',
				'top':'-1000px',
				'left':'-1000px'
			}).injectAfter(this);
			var clone = this.clone().injectInside(holder).show();
			w = clone.offsetWidth;
			h = clone.offsetHeight;
			holder.remove();
		}
		return {width: w, height: h, x: w, y: h};
	},
/*	Property: setPosition
		Sets the location of an element relative to another (defaults to the document body).
		
		Note:
		The element must be absolutely positioned (if it isn't, this method will set it to be);
		
		Arguments:
		options - a key/value object with options
		
		Options:
		relativeTo - (element) the element relative to which to position this one; defaults to document.body.
		position - (string) the aspect of the relativeTo element that this element should be positioned. Options are 'upperRight', 'upperLeft', 'bottomLeft', 'bottomRight', and 'center' (the default). With the exception of center, all other options will make the upper right corner of the positioned element = the specified corner of the relativeTo element. 'center' will make the center point of the positioned element = the center point of the relativeTo element.
		offset - (object) x/y coordinates for the offset (i.e. {x: 10, y:100} will move it down 100 and to the right 10). Negative values are allowed.
		smoothMove - (boolean) move the element to the new position using <Fx.Styles>; defaults to false.
		effectOptions - (object) options object for <Fx.Styles>, optional
		returnPos - (boolean) don't move the element, but instead just return the position object ({top: '#', left: '#'}); defaults to false
		
	*/
	setPosition: function(options){
		options = $merge({
			relativeTo: document.body,
			position: 'center',
			offset: {x:0,y:0},
			smoothMove: false,
			effectOptions: {},
			returnPos: false
		}, options);
		this.setStyle('position', 'absolute');
		var rel = $(options.relativeTo);
		var top = (rel == document.body)?window.getScrollTop():rel.getTop();
		if (top < 0) top = 0;
		var left = (rel == document.body)?window.getScrollLeft():rel.getLeft();
		if (left < 0) left = 0;
		var dim = this.getDimensions();
		var pos = {};
		var prefY = options.offset.y.toInt();
		var prefX = options.offset.x.toInt();
		switch(options.position) {
			case 'upperLeft':
				pos = {
					'top':(top + prefY) + 'px',
					'left':(left + prefX) + 'px'
				};
				break;
			case 'upperRight':
				pos = {
					'top':(top + prefY) + 'px',
					'left':(left + prefX + rel.offsetWidth) + 'px'
				};
				break;
			case 'bottomLeft':
				pos = {
					'top':(top + prefY + rel.offsetHeight) + 'px',
					'left':(left + prefX) + 'px'
				};
				break;
			case 'bottomRight':
				pos = {
					'top':(top + prefY + rel.offsetHeight) + 'px',
					'left':(left + prefX + rel.offsetWidth) + 'px'
				};
				break;
			default: //center
				var finalTop = top + (((rel == document.body)?window.getHeight():rel.offsetHeight)/2) - (dim.height/2) + prefY;
				var finalLeft = left + (((rel == document.body)?window.getWidth():rel.offsetWidth)/2) - (dim.width/2) + prefX;
				pos = {
					'top': ((finalTop >= 0)?finalTop:0) + 'px',
					'left': ((finalLeft >= 0)?finalLeft:0) + 'px'
				};
				break;
		}
		if(options.returnPos) return pos;
		if(options.smoothMove && this.effects) this.effects(options.effectOptions).start(pos);
		else this.setStyles(pos);
		return this;
	},

/*	Property: visible
		Returns a boolean; true = visible, false = not visible.
		
		Example:
		>$(id).visible()
		> > true | false	*/
	visible: function() {
		return this.getStyle('display') != 'none';
	},
/*	Property: toggle
		Toggles the state of an element from hidden (display = none) to 
		visible (display = what it was previously or else display = block)
		
		Example:
		> $(id).toggle()
	*/
	toggle: function() {
		return this[this.visible() ? 'hide' : 'show']();
	},
/*	Property: hide
		Hides an element (display = none)
		
		Example:
		> $(id).hide()
		*/
	hide: function() {
		this.originalDisplay = this.getStyle('display'); 
		this.setStyle('display','none');
		return this;
	},
/*	Property: smoothHide
		Transitions the height, opacity, padding, and margin (but not border) from their current height to zero, then set's display to none and resets the height, opacity, etc. back to their original values.

		Arguments:
		effectOptions - options object to be passed along to Fx.Styles.
	*/
	smoothHide: function(effectOptions){
		if(this.getStyle('display') != 'none'){
			var styles = this.getStyles('padding-top', 'padding-bottom', 'margin-top', 
				'margin-bottom', 'border-top-width', 'border-bottom-width');
			var startStyles = {};
			$each(styles, function(style, name){ 
				if(style.toInt && $type.isNumber(style.toInt())) startStyles[name] = style.toInt(); 
			});
			startStyles.height = this.offsetHeight-sumObj(startStyles, ['padding-top','padding-bottom','border-top-width','border-bottom-width'])+"px";
			var zero = {height: '0px', opacity: 0};
			$each(startStyles, function(style, name){ zero[name] = 0; });
			this.effects(effectOptions||{}).start(zero).chain(function(){
				this.setStyles(startStyles).setStyle('display','none');
			}.bind(this));
		}
	},
/*	Property: smoothShow
		Sets the display of the element to opacity: 0 and display: block, then transitions the height, opacity, padding, and margin (but not border) from zero to their proper height.
		
		Arguments:
		effectOptions - options object to be passed along to Fx.Styles.
		heightOverride - transition to this heigh instead of the offsetHeight of the element.
	*/
	smoothShow: function(effectOptions, heightOverride){
		if(this.getStyle('display') == "none" || 
			 this.getStyle('visiblity') == "hidden" || 
			 this.getStyle('opacity')==0){
			//toggle display, but hide it
			this.setStyles({ 'display':'block', 'opacity':0 });
			var h = heightOverride || this.offsetHeight;
			var styles = Object.extend({opacity: 1},
				this.getStyles('padding-top', 'padding-bottom', 'margin-top', 
					'margin-bottom', 'border-top-width', 'border-bottom-width'));
			var startStyles = {};
			$each(styles, function(style, name){
				if(style.toInt && $type.isNumber(style.toInt())) startStyles[name] = style.toInt(); 
			});
			startStyles.height = h-sumObj(startStyles, ['padding-top','padding-bottom','border-top-width','border-bottom-width'])+"px";
			var zero = { height: '0px', opacity: 0 };
			$each(startStyles, function(style, name){ zero[name] = 0; });
			this.setStyles(zero).effects(effectOptions||{}).start(startStyles);
		}
	},
/*	Property: show
		Shows an element (display = what it was previously or else display = block)
		
		Example:
		>$(id).show() */
	show: function(display) {
		this.originalDisplay = (this.originalDisplay=="none")?'block':this.originalDisplay;
		this.setStyle('display',(display || this.originalDisplay || 'block'));
		return this;
	},
/*	Property: cleanWhitespace
		Removes all empty text nodes from an element and its children
		
		Example:
		> $(id).cleanWhitespace()	*/
	cleanWhitespace: function() {
		$A(this.childNodes).each(function(node){
			if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) node.parentNode.removeChild(node);
		});
		return this;
	},
/*	Property: find
		Returns an element from the node's array (such as parentNode), deprecated (left over from Prototype.lite).
		
		Arguments:
		what - the value you wish to find (such as 'parentNode')

		Example:
		> $(id).find(parentNode)
	*/
	find: function(what) {
		var element = this[what];
		while (element.nodeType != 1) element = element[what];
		return element;
	},
/*	Property: replace
		Replaces an html element with the html passed in.
		
		Arguments:
		html - the html with which to replace the node.
		evalScripts - (boolean; optional) evaluate javascript in the new node. defaults to true.
		
		Example:
		>$(id).replace(myHTML) */
	replace: function(html, evalScripts) {
		if (this.outerHTML) {
			this.outerHTML = html.stripScripts();
		} else {
			var range = this.ownerDocument.createRange();
			range.selectNodeContents(this);
			this.parentNode.replaceChild(
				range.createContextualFragment(html.stripScripts()), this);
		}
		if($pick(evalScripts, true)) html.evalScripts.delay(10, html);
	},
/*	Property: empty
		Returns a boolean: true = the Node is empty, false, it isn't.
		
		Example:
		> $(id).empty
		> true (the node is empty) | false (the node is not empty)
	*/
	empty: function() {
		return !!this.innerHTML.match(/^\s*$/);
	},
	/*	Property: getOffsetHeight
			Returns the offset height of an element, deprecated.
			You should instead use <Element.getStyle>('height')
			or just Element.offsetHeight.
			
			Example:
			> $(id).getOffsetHeight()
		*/
	getOffsetHeight: function(){ return this.offsetWidth; },
	/*	Property: getOffsetWidth
			Returns the offset width of an element, deprecated.
			You should instead use <Element.getStyle>('width')
			or just Element.offsetWidth.
			
			Example:
			> $(id).getOffsetWidth()
		*/
	getOffsetWidth: function(){ return this.offsetWidth; }
});

/*	internal function used for smoothShow and smoothHide
		used to add up the values of a bunch of styles
		
		obj - the styles object
		keys - the keys in the styles object to sum (optional)
	*/
function sumObj(obj, keys){
	var sum = 0;
	$each(obj, function(val, key){
		if(keys && keys.test(key) && val.toInt && $type.isNumber(val.toInt()))sum+=val.toInt();
	});
	return sum;
};
/*	legacy support for $S	*/
var $S = $$;
/* do not edit below this line */   
/* Section: Change Log 

$Source: /cvs/main/flatfile/html/rb/js/global/cnet.global.framework/mootools.extended/element.cnet.js,v $
$Log: element.cnet.js,v $
Revision 1.16  2007/03/08 23:32:14  newtona
strict javascript warnings cleaned up

Revision 1.15  2007/03/01 00:50:35  newtona
type.isNumber now returns false for NaN
element.smoothshow/hide now works (in IE specifically) when there are no values for border

Revision 1.14  2007/02/27 19:37:56  newtona
element.show now enforces that the original display was not 'none'

Revision 1.13  2007/02/22 21:05:35  newtona
smoothHide now checks that the element is not already hidden

Revision 1.12  2007/02/21 00:21:22  newtona
added legacy support for $S

Revision 1.11  2007/02/08 22:14:04  newtona
added border widths to smoothshow/hide

Revision 1.10  2007/02/08 01:30:58  newtona
tweaking element.setPosition, now can use effects

Revision 1.9  2007/02/07 20:52:34  newtona
added Element.position

Revision 1.8  2007/02/06 18:13:13  newtona
added element.smoothShow and smoothHide; depends on latest svn of mootools

Revision 1.7  2007/02/03 01:40:05  newtona
fixed a typo bug

Revision 1.6  2007/01/26 06:06:13  newtona
element.replace now takes a 2nd argument to eval scripts or not
element.getDimensions now returns w & h for hidden elements

Revision 1.5  2007/01/05 19:45:48  newtona
made getDimensions capable of discovering dimensions of hidden elements

Revision 1.4  2006/12/06 20:14:59  newtona
carousel - improved performance, changed some syntax, actually deployed into usage and tested
cnet.nav.accordion - improved css selectors for time
multiple accordion - fixed a typo
dbug.js - added load timers
element.cnet.js - changed syntax to utilize mootools more effectively
function.cnet.js - equated $set to $pick in preparation for mootools v1

Revision 1.3  2006/11/27 17:59:32  newtona
small change to replace and the way it uses timeouts

Revision 1.2  2006/11/02 21:34:00  newtona
Added cvs footer


*/
