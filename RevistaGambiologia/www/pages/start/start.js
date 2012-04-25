define( ['pagecommon'], function( pagecommon ){
	
	function init( page, resolve ){

		pagecommon.init(page,function(){
			resolve.call();
		});
	}

	return {
		init: init
	}	
	
});