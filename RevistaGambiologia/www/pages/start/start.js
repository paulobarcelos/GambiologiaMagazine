define( ['templating', 'jqmhacks'], function( templating, jqmhacks ){

	
	function init( eventData ){

		// Load prapare any template that might embeded in the code
		templating.prepare($("div[data-role='template']"), function( eachResult ){
			// Enhance the raw markup, unfortunatelly we need to run a hack to make sure header and footer will be enhaced			
			if( !jqmhacks.enhanceFix(eachResult) ){
				eachResult.trigger( "create" );
			}
		});

	}

	return {
		init: init
	}	
	
});