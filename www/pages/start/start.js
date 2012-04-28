define( ['pagecommon', 'util', 'templating'], function( pagecommon, util, templating ){
	
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

			// Create a "lazy" callback to the next step
			var lazyListIssues = util.trigger(issuesData.length, listIssues);

			// Check if the issues directories exists, if so check if issue
			// was already downloaded. If not, create the issue directory
			for( issueID in issuesData.issues){				
				var closure = function(id){
					app.permanentFileSystem.root.getDirectory(
						id, 
						{create: true, exclusive: true}, 
						function(dir){
							// directory don't exist, we can flag early
							issuesData.issues[id].downloaded = false;
							lazyListIssues();
						},
						function(error){
							// Flags as downloaded
							app.permanentFileSystem.root.getFile(
								id + "/_downloaded",
								{},
								function(file){
									// Issue was donwloaded
									issuesData.issues[id].downloaded = true;
									lazyListIssues();
								},
								function(evt){
									// Issue was not downloaded
									issuesData.issues[id].downloaded = false;
									lazyListIssues();
								}
							);
						}
					);
				}
				closure(issueID);
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
						navigator.notification.alert(app.strings.connectionError);
						console.log("download error source " + error.source);
						console.log("download error target " + error.target);
						console.log("upload error code" + error.code);

						// We don't have the file, but let's move to the next step anyway
						listIssues();
					}
				);
			}
			else{
				// No internet, show an alert and the move on to list issues
				navigator.notification.alert(app.strings.noInternet);
				listIssues();
			}
		}

		loadIssuesData();
	}



	/**
	* Show all the issues, or display the a message 
	* in case we couldn't access the issues data
	**/
	function listIssues(){
		
		if(issuesData){
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
		}
		
		
	}

	return {
		init: init
	}	
	
});