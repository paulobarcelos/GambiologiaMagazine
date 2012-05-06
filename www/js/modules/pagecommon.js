define( ['templating', 'pagenav'], function( templating, pagenav ){
	function init( page, ready, scope ){

		// Enhance the page navigation
		pagenav.enhance( page.find("*:jqmData(role='pagenav')") );

		// Enhance all elements that flag for a template
		templating.enhance(
			page.find("*:jqmData(role='template')"),

			function( eachResult ){
				// Make sure to also enhance the page navigation for loaded elements
				pagenav.enhance( eachResult.find( "*:jqmData(role='pagenav')" ) );		
			},
			function(){
				// Call when are are done!
				ready.apply(scope||window);
			}	
		);
	}

	return {
		init: init
	}	
	
});