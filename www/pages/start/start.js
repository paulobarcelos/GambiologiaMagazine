define( ['pagecommon'], function( pagecommon ){
	
	// Top level vars, to store as soon as init is called
	var page,
	resolve;

	/**
	* Called by the "manager", will provide a pointer to the current
	* page obejct and to a resolve function that should be called as
	* soon as the page is ready to be displayed
	**/
	function init( _page, _resolve ){
		page = _page;
		resolve = _resolve;

		pagecommon.init(page,function(){
			// First thing we do is to check if we have our issues
			// data alredy stored. We do that by checking the a flag
			// in the file storage.
			var issuesStrucurePresent = window.localStorage.getItem("issuesStrucurePresent");
			if(!issuesStrucurePresent){
				// If we don't have it, we need to donwload it from the 
				// remote server...

				// Is there internet connection?
				var networkState = navigator.network.connection.type;
				if()


			}


			resolve.call();
		});
	}

	/**
	* Will be called after all the commom modules have worked on
	* the page.
	**/
	function afterCommon(){
		
	}

	return {
		init: init
	}	
	
});