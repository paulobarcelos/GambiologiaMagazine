define(function(){

	/**
	* Dirty hack to enhance dinamically created header and footer, as simply calling trigger('create') wont' work on them.
	* Follow progress of issue here.
	**/
	function enhanceFix ( element ) {
		var role = element.data('role');
		if( role !== 'header' && role !== 'footer'){
			return false;
		}

		element.trigger('pagecreate');

		if( element.data('position') === 'fixed' ) {
			element.addClass( 'ui-' + role + '-fixed' );
		}

		if( element.data('fullscreen') ) {
			element.addClass( 'ui-' + role + '-fullscreen' );
		}

		return true;		
	}

	return {
		enhanceFix : enhanceFix
	}
});