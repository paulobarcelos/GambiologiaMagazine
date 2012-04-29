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

		// Init the common modules
		pagecommon.init( page, getIssuesData );
	}

	/**
	* Will be called after all the commom modules have worked on the page.
	**/
	function getIssuesData( success, context ){
		success = success || function(){};
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
					cachedownload.get({
						files : data.resources,		
						success : function(files){
							$.mobile.hidePageLoadingMsg();
							for (var i = files.length - 1; i >= 0; i--) {
								if(files[i].name === data.settings){
									var reader = new FileReader();
								    reader.onloadend = function( evt )
										success.call( context, $.parseJSON( evt.target.result ) );
								    };
								    reader.readAsText( files[i] );
									break;
								}
							};
						},
						fail: function(){
							$.mobile.hidePageLoadingMsg();
							success.call( context );
						}
					});

					/*

					// Check if we already have the current settings
					app.permanentFileSystem.root.getFile( data.settings, {},
						function( file ){
							// We have this settings already! so let's read it it...
							
						},
						function(evt){
							// We don't have these settings, we need to donwload the resources!
							$.mobile.showPageLoadingMsg();
							cachedownload.get({
								files : data.resources,		
								success : function(files){
									$.mobile.hidePageLoadingMsg();
									console.log(files);
								},
								fail: function(){
									$.mobile.hidePageLoadingMsg();
									success.call( context );
								}
							});
						}
					);
					*/
				},
				error : function(error){
					$.mobile.hidePageLoadingMsg();
					// We couldn't get the config file from the server.
					// Move on but don't notify the user...
					success.call( context )
				}
			});
		}
		else {
			// No internet, show an alert and the move on to list issues
			navigator.notification.alert(app.strings.noInternet);
			success.call( context );
		}
		
	}



	/**
	* Show all the issues, or display the a message 
	* in case we couldn't access the issues data
	**/
	function listIssues(){
		
		/*if(issuesData){
			templating.loadTemplate('issues-list', null, function( template ){
				var data = { issues : [], strings : app.strings };
				for( issueID in issuesData.issues){	
					var issue = issuesData.issues[issueID];
					issue.id = issueID;
					data.issues.push(issue);
				}

				$('#issues').append( template( data ) );
				resolve.call();
			});
		}
		else{
			templating.loadTemplate('issues-empty', null, function( template ){
				var data = { strings : app.strings };
				$('#issues').append( template( data ) );
				resolve.call();
			});
		}*/
		
		
	}

	return {
		init: init
	}	
	
});