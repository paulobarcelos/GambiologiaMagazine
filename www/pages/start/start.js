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

		cachedownload.get({
			files : ['gmb1.png','gmb2.png','gmb3.png','gmb4.png','covers/test.png'],
			update : function(){
				console.log("update");
				console.log(cachedownload.getProgress());
			},
			success : function(files){
				console.log("success");
				console.log(files);
			},
			error: function(error){
				console.log('error');
				console.log(error)
			}
		});

		// Init the common modules
		pagecommon.init( page, afterCommon );
	}

	/**
	* Will be called after all the commom modules have worked on the page.
	**/
	function afterCommon(){
		
		// Load the config
		$.ajax({
			url : app.server + 'config.json',
			type : 'json',
			success : function(data){

			},
			error : function(error){
			}
		});
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