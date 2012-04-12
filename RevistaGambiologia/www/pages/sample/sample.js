define( ['pageinit'], function( pageinit ){
	function init( page, resolve ){

		pageinit.init(page,function(){
			resolve.call();
		});
	}

	return {
		init: init
	}	
	
});