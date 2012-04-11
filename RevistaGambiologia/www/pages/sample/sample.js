define( ['templating', 'pagenav', 'jqmhacks'], function( templating, pagenav, jqmhacks ){

	
	function init( eventData ){

		pagenav.enhance( $("*:jqmData(role='pagenav')") );

		templating.enhance( $("*:jqmData(role='template')"), function( eachResult ){	
			
			if( !jqmhacks.enhanceFix(eachResult) ){
				eachResult.trigger( "create" );
			}

			pagenav.enhance( eachResult.find( "*:jqmData(role='pagenav')" ) );
		});

	}

	return {
		init: init
	}	
	
});