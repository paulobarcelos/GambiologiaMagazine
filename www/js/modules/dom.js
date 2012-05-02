define('util', function( util ){
	
	function Element(tag, properties) {
		var props = properties || {},
			styles = props.styles || {},
			el = document.createElement(tag);

		if (props.html) {
			el.innerHTML = props.html;
		}
		if (props.text) {
			el.textContent = props.text;
		}

		util.merge(el, props || {});
		util.merge(el.style, styles);
		return el;
	}

	function Event(name, bubble, cancelable, type) {
		var ev = document.createEvent(type || "Event");
		ev.initEvent(name, bubble || false, cancelable || false);

		this.dispatch = function(target) {
			target.dispatchEvent(ev);
			return this;
		};
	}

	function listen(el, name, handler, capture) {
		el.addEventListener(name, handler, capture);
		return el;
	}

	function listenOnce(el, name, handler, capture) {
		var proxy = function(e) {
			handler(e);
			el.removeEventListener(name, proxy, capture);
		};
		return listen(el, name, proxy, capture);
	}

	function query(selector, context) {
		return idMap((context || document).querySelectorAll(selector));
	}

	function queryOne(selector, context) {
		return (context || document).querySelector(selector);
	}

	function adopt(/*el1, el2, ...*/) {
		var elements = idMap(arguments),
			parent = elements.shift();

		if (0 === elements.length) {
			return parent;
		}

		elements.forEach(parent.appendChild.bind(parent));
		return parent;
	}

	function prepend(parent, child) {
		parent.insertBefore(child, parent.firstChild);
		return parent;
	}

	/**
	 * Empty a node of all it's children
	 */
	function empty(node) {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
		return node;
	}

	/**
	 * Remove a node from the dom
	 */
	function destroy(node) {
		if (!node || !node.parentNode) return;
		node.parentNode.removeChild(node);
	}

	/**
	 * Inject a node into the dom relative to another node
	 */
	function inject(node, relative, mode) {
		switch (mode) {
			case 'before':
				relative.parentNode.insertBefore(node, relative);
				break;
			case 'after':
				relative.parentNode.insertBefore(node, relative.nextSibling);
				break;
			case 'top': // Injects at the top of given relative node
				relative.insertBefore(node, relative.firstChild);
				break;
			default: // Injects at the bottom of given relative node
				relative.appendChild(node);
		}
		return node;
	}

	/**
	 * Get size of an element
	 */
	function getSize(node) {
		return {x: node.offsetWidth, y: node.offsetHeight};
	}

	/**
	 * Get position of an element (reletive to parent)
	 */
	function getPosition(node) {
		return {x: node.offsetLeft, y: node.offsetTop};
	}

	/**
	 * Scroll parent to reveal child
	 * @param {Node} parent
	 * @param {Node} child
	 * @return {Node}
	 */
	function reveal(parent, child) {
		var st = parent.scrollTop;
		var ot1 = parent.offsetTop;
		var oh1 = parent.offsetHeight;
		var ot2 = child.offsetTop;
		var oh2 = child.offsetHeight;
		if (st + oh1 + ot1 < ot2 + oh2) {
			parent.scrollTop = ot2 + oh2 - oh1 - ot1;
		} else if (0 !== st && st > ot2 - ot1) {
			parent.scrollTop = ot2 - ot1;
		}
		return child;
	}

	/**
	 * Shorthand function to get an element by id.
	 * @param  {String} id Element id
	 * @return {[type]}
	 */
	function id(idTag) {
		return document.getElementById(idTag);
	}

	/**
	 * Check if element has child elements
	 */
	function hasChildElements(parent) {
		var hasChild = false;
		for (var child = parent.firstChild; child; child = child.nextSibling) {
			if (child.nodeType === 1) {
				hasChild = true;
				break;
			}
		}
		return hasChild;
	}

	/**
	 * Replaces an existing element in the dom with a new one
	 */
	function replace(oldNode, newNode) {
		if (!oldNode || !newNode) {
			return oldNode;
		}
		return oldNode.parentNode.replaceChild(newNode, oldNode);
	}

	/**
	 * Loads a stylesheet and provides a callback when ready or fail
	 */
	function loadStyleSheet( path, id, success, fail, context ) {
		success = success || function(){};
		fail = fail || function(){};
		context = context || window;

		if(!path){
			fail.call(context, "You need to specify a path");
		}

		var head = document.getElementsByTagName( 'head' )[0], // reference to document.head for appending/ removing link nodes
			link = document.createElement( 'link' );			  // create the link node
			link.setAttribute( 'href', path );
			link.setAttribute( 'rel', 'stylesheet' );
			link.setAttribute( 'type', 'text/css' );
			if(id) link.setAttribute( 'id', id);
	
		var sheet, cssRules;
		// get the correct properties to check for depending on the browser
		if ( 'sheet' in link ) {
		  sheet = 'sheet'; cssRules = 'cssRules';
		}
		else {
		  sheet = 'styleSheet'; cssRules = 'rules';
		}
	
		var interval_id = setInterval( function() {						  // start checking whether the style sheet has successfully loaded
			  try {
				 if ( link[sheet] && link[sheet][cssRules].length ) { // SUCCESS! our style sheet has loaded
					clearInterval( interval_id );							// clear the counters
					clearTimeout( timeout_id );
					success.call( context, link );			  // fire the callback with success == true
				 }
			  } catch( e ) {} finally {}
			}, 10 ),																	// how often to check if the stylesheet is loaded
			timeout_id = setTimeout( function() {		 // start counting down till fail
			  clearInterval( interval_id );				// clear the counters
			  clearTimeout( timeout_id );
			  head.removeChild( link );					 // since the style sheet didn't load, remove the link node from the DOM
			  fail.call( context, link ); // fire the callback with success == false
			}, 15000 );											// how long to wait before failing
	
		head.appendChild( link );  // insert the link node into the DOM and start loading the style sheet
	
		return link; // return the link node;
	}

	return {
		Element: Element,
		Event: Event,
		adopt: adopt,
		listen: listen,
		listenOnce: listenOnce,
		prepend: prepend,
		query: query,
		queryOne: queryOne,
		empty: empty,
		destroy: destroy,
		inject: inject,
		getSize: getSize,
		getPosition: getPosition,
		reveal: reveal,
		id: id,
		hasChildElements: hasChildElements,
		replace: replace,
		loadStyleSheet : loadStyleSheet
	}
});