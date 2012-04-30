define( ['pagecommon', 'util', 'cachedownload', 'templating'], function( pagecommon, util, cachedownload, templating ){
	
	// Top level vars, to stored as soons as they become available
	var page,
	resolve,
	issuesData;

	/**
	* Called by the "manager", will provide a pointer to the current
	* page obejct and to a resolve function that should be called as
	* soon as the page is ready to be displayed
	**/
	function init( _page, _resolve ){
		// Sotre as top level vars
		page = _page;
		resolve = _resolve;

		// "Remember" this page
		window.localStorage.setItem( "lastPage", app.page );

		// Init the common modules
		pagecommon.init( page, function(){
			getSettings( listIssues );
		} );
	}

	/**
	* Returns the most recent issues data and download any necessary
	* resources needed.
	**/
	function getSettings( ready, context ){
		ready = ready || function(){};
		context = context || window;

		// Is there internet connection?
		var networkState = navigator.network.connection.type;
		if( networkState != Connection.NONE || networkState != Connection.UNKNOWN ){
			// Load the config
			$.mobile.showPageLoadingMsg();
			$.ajax({
				url : app.server + 'config.json',
				dataType: 'json',
				success : function(data){
					// Ok, now that we have the config, let's compare agains the one
					// in localStorage. If the server ver is different, download the
					// resources.
					var version = window.localStorage.getItem("version");
					version = version || "0";

					if( data.version !== version ){
						// Ok, let's get the new resources
						cachedownload.get({
							files : data.resources,		
							success : function(files){
								$.mobile.hidePageLoadingMsg();
								// Great, all the resources loaded fine, so all we have
								// to do now is to loop through the list of resources and
								// find the one that matches the setting file. 

								for (var i = files.length - 1; i >= 0; i--) {
									if(files[i].name === data.settings){
										var reader = new FileReader();
									  	reader.onloadend = function( evt ){
									  		window.localStorage.setItem( "settings", evt.target.result );
											var settings = $.parseJSON( window.localStorage.getItem("settings") );
											ready.call( context, settings );
									    };
									    reader.readAsText( files[i] );
										break;
									}
								};
							},
							fail: function(){
								$.mobile.hidePageLoadingMsg();
								// Something went wrong when we tried to get the resources...
								// we can't do much now, so let's just try to load it from
								// local storage and move on with whatever we have.
								var settings = $.parseJSON( window.localStorage.getItem("settings") );
								ready.call( context, settings );
							}
						});
					}
					else{
						// The server version is the same, so let's just load the
						// stored settings;
						var settings = $.parseJSON( window.localStorage.getItem("settings") );
						ready.call( context, settings );
					}
					
				},
				error : function(error){
					$.mobile.hidePageLoadingMsg();
					// We couldn't get the config file from the server.
					// Try to get the settigns from local storage (if any),
					// move on but don't notify the user...
					var settings = $.parseJSON( window.localStorage.getItem("settings") );
					ready.call( context, settings );
				}
			});
		}
		else {
			// Ok, no internet, so try to load the issues data from local storage
			var settings = $.parseJSON( window.localStorage.getItem("settings") );
			ready.call( context, settings );
		}
		
	}



	/**
	* Show all the issues, or display the a message 
	* in case we couldn't access the data
	**/
	function listIssues( data ){
		if(data){
			templating.loadTemplate('issues-list', null, function( template ){
				// we add alias to the app iteself, as the data might need to access globals, strings, etc
				data.app = app;
				for (var i = 0; i < data.issues.length; i++) {
					// flag if issue was already downloaded
					data.issues[i].downloaded = window.localStorage.getItem( data.issues[i].id + "_downloaded " );
					// grid alternator
					data.issues[i].alternator = (i%2) ? "b" : "a";
				}

				$('#issues').html( template( data ) );
				resolve.call();
			});
		}
		else{
			templating.loadTemplate('issues-empty', null, function( template ){
				data = { app : app };
				$('#issues').append( template( data ) );
				resolve.call();
			});
		}
		
	}

	return {
		init: init
	}	
	
});