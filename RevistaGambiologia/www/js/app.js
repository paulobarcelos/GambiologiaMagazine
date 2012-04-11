var app = function(){
	var privateProperties = {
		
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
		path : window.location.href.replace(/pages\/.*?$/, '').replace('index.html',''),
		page : '',

		pageinit : function(){
			// Fix some jQuery Mobile problems
			styleFix();
		},
		
		pagechange: function(event, eventData){
			
			//Initialise the application page
			app.page = $(eventData.toPage).attr('data-page');

			/*if(app.path === ''){
				app.path = window.location.href.replace(/pages\/.*?$/, '').replace('index.html','');
			}*/		
			
			//Each page should have a javascript file, we pull this in here
			require(
				[app.path + 'pages/' + app.page + '/index.js'],
				function(page){
					page.init(eventData);
				}
			);
			
		},

		loadStyleSheet : loadStyleSheet
	};
		
}();

require.config({
	paths : {
		utils : app.path + 'js/modules/utilsjs' 
	}
});

$(document.body).live('pageinit', app.pageinit);
$(document.body).live('pagechange', app.pagechange);
