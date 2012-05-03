define( ['pagecommon'], function( pagecommon ){
	function init( page, urlParams, resolve ){
		console.log(urlParams)
		pagecommon.init(page,function(){
			// "Remember" this page
			window.localStorage.setItem( "lastURL", app.path + 'pages/' + app.page + '/index.html?id=' + urlParams.id);
			resolve.call();
		});
	}

	return {
		init: init
	}	
	
});