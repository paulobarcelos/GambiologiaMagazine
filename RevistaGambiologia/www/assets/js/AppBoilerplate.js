var app = function(){
	var privateProperties = {
		
	};

	var getDevice = function(){
		//Sniff the OS, (naughty but necessary for some functionality)
		if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
			app.device.os = 'iOS';
			app.device.type = 'phone';
		}
		
		if((navigator.userAgent.match(/iPad/i))) {
			app.device.os = 'iOS';
			app.device.type = 'tablet';
		}
	
		if((navigator.userAgent.match(/Android/i))) {
			app.device.os = 'Android';
			if((navigator.userAgent.match(/Mobile/i))) {
				app.device.type = 'phone';
			}
			else{
				app.device.type = 'tablet';
			}
		}
		
		if((navigator.userAgent.match(/Windows Phone OS/i))) {
			app.device.os = 'Windows Mobile';
			app.device.type = 'phone'; //Assume is phone as I cant see any Windows Mobile phones on market
		}	
	};
	
	var styleFix = function(){
		//There is some functionality in jQuery Mobile which is not App like, we fix this in both the CSS and JS
		$('.ui-footer').removeClass('slideup');	
		$('.ui-header').removeClass('slidedown');
		
		$('.ui-page-footer-fullscreen.ui-page-header-fullscreen .ui-content').css('padding-bottom',$('.ui-page-footer-fullscreen .ui-footer').height() + 11);
	}
	
	var loadStyleSheet = function( path, id, fn, scope ) {
	   var head = document.getElementsByTagName( 'head' )[0], // reference to document.head for appending/ removing link nodes
	       link = document.createElement( 'link' );           // create the link node
		   link.setAttribute( 'href', path );
		   link.setAttribute( 'rel', 'stylesheet' );
		   link.setAttribute( 'type', 'text/css' );
		   link.setAttribute( 'id', id);
	
	   var sheet, cssRules;
	// get the correct properties to check for depending on the browser
	   if ( 'sheet' in link ) {
	      sheet = 'sheet'; cssRules = 'cssRules';
	   }
	   else {
	      sheet = 'styleSheet'; cssRules = 'rules';
	   }
	
	   var interval_id = setInterval( function() {                    // start checking whether the style sheet has successfully loaded
	          try {
	             if ( link[sheet] && link[sheet][cssRules].length ) { // SUCCESS! our style sheet has loaded
	                clearInterval( interval_id );                     // clear the counters
	                clearTimeout( timeout_id );
	                fn.call( scope || window, true, link );           // fire the callback with success == true
	             }
	          } catch( e ) {} finally {}
	       }, 10 ),                                                   // how often to check if the stylesheet is loaded
	       timeout_id = setTimeout( function() {       // start counting down till fail
	          clearInterval( interval_id );            // clear the counters
	          clearTimeout( timeout_id );
	          head.removeChild( link );                // since the style sheet didn't load, remove the link node from the DOM
	          fn.call( scope || window, false, link ); // fire the callback with success == false
	       }, 15000 );                                 // how long to wait before failing
	
	   head.appendChild( link );  // insert the link node into the DOM and start loading the style sheet
	
	   return link; // return the link node;
	}
	
	return {
		path : '',
		device : {'os':'','type':''},
		module : '',

		pageinit : function(){
			// Fix some jQuery Mobile problems
			styleFix();
		},
		
		pagechange: function(event, eventData){
			//console.log('pagechange',event, eventData)
			
			//Initialise the application page
			app.module = $(eventData.toPage).attr('data-module');

			if(app.path === ''){
				app.path = window.location.href.replace(/modules\/.*?$/, '').replace('index.html','');
			}
			
			// Update device information
			getDevice();	
			
			//Each module should have a javascript file, we pull this in here
			require(
				[app.path + 'plugins/plugins.js',
				app.path + 'modules/' + app.module + '/index.js'],
				function(plugins, module){
					plugins.init();
					module.init(eventData);
				}
			);
			
		},

		loadStyleSheet : loadStyleSheet
	};
		
}();

$(document.body).live('pageinit', app.pageinit);
$(document.body).live('pagechange', app.pagechange);
$( document ).bind( "mobileinit", function() {
	// Make your jQuery Mobile framework configuration changes here!
	$.mobile.allowCrossDomainPages = true;
	$.support.cors = true;
});



