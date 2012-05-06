define( ['pagecommon'], function( pagecommon ){
	function init( page, urlParams, resolve ){

		pagecommon.init(page,function(){
			// "Remember" this page
			window.localStorage.setItem( "lastURL", app.path + 'pages/' + app.page + '/index.html?id=' + urlParams.id);
			resolve.call();
		});
	}

	function onReady(){

	}

	return {
		init: init,
		onReady : onReady
	}	
	
});