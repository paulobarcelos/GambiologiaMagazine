define( ['pagecommon', 'util', 'cachedownload', 'templating'], function( pagecommon, util, cachedownload, templating ){
	
	// Top level vars, to stored as soons as they become available
	var page, resolve;

	// Get local settings
	var settings = $.parseJSON( window.localStorage.getItem( "settings" ) );
	settings = settings || { version : "0", issues : []};

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
			updateSettings( listIssues );
		} );
	}

	/**
	* Updates the settings data and download any resources needed.
	* It will check for the "updated" flag to avoid multiple
	* lookups during runtime.
	**/
	function updateSettings( ready, context ){
		ready = ready || function(){};
		context = context || window;

		// If the app is already updated, we can exit early
		if(app.updated){
			ready.call( context, settings );
			return;
		}
		// Is there internet connection?
		var networkState = navigator.network.connection.type;
		if( networkState != Connection.NONE || networkState != Connection.UNKNOWN ){

			// Get server settings
			$.mobile.showPageLoadingMsg();
			$.ajax({
				url : app.server + 'settings.json',
				dataType: 'text',
				success : function(response){
					var severSettingsText = response;
					var serverSettings = $.parseJSON( severSettingsText );

					app.updated = true; // ---------- TODO, maybe this should be moved to before the ajax call. Need to test on cases where internet is very slow, maybe it's not worth it keep updating
			
					// Compare versions					
					if( serverSettings.version !== settings.version ){
						// Server was updated, let's get the new resources
						cachedownload.get({
							files : serverSettings.resources,		
							success : function(files){
								$.mobile.hidePageLoadingMsg();
								// All the resources loaded fine, we are safe to store the new settings
								window.localStorage.getItem( "settings", severSettingsText );
								settings = serverSettings;
								ready.call( context, settings );
							},
							fail: function(){
								$.mobile.hidePageLoadingMsg();
								// Something went wrong when we tried to get the resources...
								// we can't do much now, so move on with any old local settings
								ready.call( context, settings );
							}
						});
					}
					else{
						// We are up to date with the server!
						ready.call( context, settings );
					}
					
				},
				error : function(error){
					$.mobile.hidePageLoadingMsg();
					// We couldn't get the config file from the server.
					ready.call( context, settings );
				}
			});
		}
		else {
			// Ok, no internet
			ready.call( context, settings );
		}
		
	}

	/**
	* Show all the issues, or display the a message 
	* in case we couldn't access the data
	**/
	function listIssues(){
		var templateData = {};
		templateData.app = app;


		if(settings.issues.length){

			templating.loadTemplate('issues-list', null, function( template ){
				templateData.issues = [];


				// Create a function that will apply the template, with a related
				// lazy reference so we can resolve it only when we have all the infos
				var resolveTemplate = function(){
					page.find('#issues').html( template( templateData ) );

					enhanceIssues()

					resolve.call();
				};
				var lazyResolveTemplate = util.trigger(settings.issues.length, resolveTemplate);

				// request the info of each issue
				for (var i = 0; i < settings.issues.length; i++) {
					var closure = function(){
						var index = i;
						// Get the localized info
						require(['i18n!' + app.permanentFileSystem.root.fullPath + '/issues/' + settings.issues[index].id + '/nls/' + settings.issues[index].info + '.js' ], function(info){

							// store the info
							templateData.issues[index] = info;	

							// flag if issue is active
							templateData.issues[index].available = settings.issues[index].available;

							// flag if issue was already downloaded
							templateData.issues[index].downloaded = window.localStorage.getItem( info.id + "_downloaded" );

							// if donload is in progress
							templateData.issues[index].downloadInProgress = window.localStorage.getItem( info.id + "_downloadInProgress" );

							// grid alternator
							templateData.issues[index].alternator = ( index % 2 ) ? "b" : "a";
							
							lazyResolveTemplate();
						});
					}
					closure();			
				}
			});
		}
		else{
			templating.loadTemplate('issues-empty', null, function( template ){
				page.find('#issues').html( template( templateData ) );
				resolve.call();
			});
		}
		
	}

	/**
	* Enhance the issues depending on it's status
	* Eg.: Provide download & view functionality
	**/
	function enhanceIssues(){
		// Provide the download functionality
		page.find('#issues li::not(downloaded) button').on('click', function(){
			donwloadIssue({
				id : $(this).attr('data-id')
			});
		});

	}

	/**
	* Download a issue by id and provide callbacks for progress, complete and error 
	**/
	function donwloadIssue( options ){

		options = options || {};
		options.id = options.id || "-1";
		options.update = options.update || function(){};
		options.success = options.success || function(){};
		options.error = options.error || function(){};
		options.fail = options.fail || function(){};
		options.context = options.context || window;

		var cachedownloadOptions  = {};
		cachedownloadOptions.update = options.update;
		cachedownloadOptions.error = options.error;
		cachedownloadOptions.fail = options.fail;
		cachedownloadOptions.context = options.context;

		// get the list of files
		var found = false;
		for (var i = 0; i < settings.issues.length; i++) {
			if( options.id == settings.issues[i].id ){
				cachedownloadOptions.files = settings.issues[i].resources;
				found = true;
				break;
			}
			
		};
		
		// exit eraly if id is not found
		if(!found){
			options.fail.call(options.context,  "Id not found");
			return;
		}

		// define the internal success, which will set the donwloaded flag
		cachedownloadOptions.success = function(){
			window.localStorage.getItem( options.id + "_downloaded" );
			options.success.call(options.context);
		}

		cachedownload.get(cachedownloadOptions);
	}

	return {
		init: init
	}	
	
});