define( ['pagecommon', 'util'], function( pagecommon, util ){
	
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
		pagecommon.init( page, afterCommon );
	}

	/**
	* Will be called after all the commom modules have worked on the page.
	**/
	function afterCommon(){
		// -------------------- Step 1
		/**
		* Try to get a hold on the issues data
		**/
		var loadIssuesData = function(){
			$.ajax({
				url : app.permanentFileSystem.root.fullPath +'/' + app.issuesStructureLocalPath,
				dataType: 'json',
				success : onIssuesLoadSucess,
				error : onIssuesLoadFail
			});
		}		

		// --------- 1 - A
		// If issues data can be loaded successfully from local storage
		var onIssuesLoadSucess = function(data){
			issuesData = data;

			// Now that we have the data, we will create a directory for
			// each issue. We first try to check if the first directory
			// exists; if so we know earlier that they were already created
			

			app.permanentFileSystem.root.getDirectory(
				issuesData.issues[0].id,
				{},
				function(){
					checkForDownloadedIssues( listIssues );
				},
				function(){
					console.log('Error loading first directory');

					createIssuesDirectories( function(){
						checkForDownloadedIssues( listIssues );
					} );
				}

			);

			// Will create a directory for each issue and when done, move to the
			// next step.
			var createIssuesDirectories = function( after ){
				var lazyAfter = util.trigger(issuesData.issues.length, after);

				for( issueID in issuesData.issues){					
					// Retrieve an existing directory, or create it if it does not already exist
					app.permanentFileSystem.root.getDirectory(
						issueID, 
						{create: true, exclusive: true}, 
						function(dir){													
							lazyAfter();
						},
						function(error){
							console.log('Error at createIssuesDirectories', error);
						}
					);
				}
			}

			// Check which issue was already downloaded and store that information
			// in the issuesData object.
			var checkForDownloadedIssues = function( after ){
				var lazyAfter = util.trigger(issuesData.issues.length, after);

				for( issueID in issuesData.issues){
					app.permanentFileSystem.root.getFile(
						issueID + "/_downloaded",
						{},
						function(file){
							console.log(issueID);
							lazyAfter();
						},
						function(evt){
							lazyAfter();
						}

					);

				};
			}
		}

		// --------- 1 - B
		// If issues data was not found on local storage
		var onIssuesLoadFail = function(){
			// Is there internet connection?
			var networkState = navigator.network.connection.type;
			if( networkState != Connection.NONE || networkState != Connection.UNKNOWN ){
				// Ok there is internet, let's load the file	
				$.mobile.showPageLoadingMsg(); // show the loader			
				var fileTransfer = new FileTransfer();
				fileTransfer.download(
					// URL
					app.server + app.issuesStructureRemotePath,
					// Download path
					app.permanentFileSystem.root.fullPath + '/' + app.issuesStructureLocalPath,
					// On success
					function(entry) {
						$.mobile.hidePageLoadingMsg(); // hide the loader
						// Now that we have the file, let's load it
						loadIssuesData();
					},
					// On error
					function(error) {
						$.mobile.hidePageLoadingMsg(); // hide the loader
						navigator.notification.alert(app.messages.connectionError);
						console.log("download error source " + error.source);
						console.log("download error target " + error.target);
						console.log("upload error code" + error.code);

						// We don't have the file, but let's move to the next step anyway
						listIssues();
					}
				);
			}
		}

		loadIssuesData();
	}



	/**
	* Show all the issues, or display the a message 
	* in case we couldn't access the issues data
	**/
	function listIssues(){
		// Do we have the issues data?
		// If so, display the issues, 


		//console.log(issuesData.issues)
		resolve.call();
	}

	return {
		init: init
	}	
	
});