define( ['templating'], function( templating ){

	
	function init( eventData ){

		templating.prepare($("div[data-role='template']"));

	}

	return {
		init: init
	}	
	
});