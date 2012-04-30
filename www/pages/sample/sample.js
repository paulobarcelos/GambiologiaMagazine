define( ['pagecommon'], function( pagecommon ){
	function init( page, resolve ){
		pagecommon.init(page,function(){
			// "Remember" this page
			window.localStorage.setItem( "lastPage", app.page );
			resolve.call();
		});
	}

	return {
		init: init
	}	
	
});