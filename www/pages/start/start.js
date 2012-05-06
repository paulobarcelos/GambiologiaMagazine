define( ['pagecommon', 'util', 'cachedownload', 'templating'], function( pagecommon, util, cachedownload, templating ){
	
	// Top level vars, to stored as soons as they become available
	var page, urlParams, resolve;

	// Get local settings
	var settings = $.parseJSON( window.localStorage.getItem( "settings" ) );
	settings = settings || { version : "0", issues : []};

	/**
	* Called by the "manager", will provide a pointer to the current
	* page obejct and to a resolve function that should be called as
	* soon as the page is ready to be displayed
	**/
	function init( _page, _urlParams, _resolve ){
		// Store as top level vars
		page = _page;
		urlParams = _urlParams;
		resolve = _resolve;

		// "Remember" this page
		window.localStorage.setItem( "lastURL", app.path + 'pages/' + app.page + '/index.html' );

		// Init the common modules
		pagecommon.init( page, function(){
			updateSettings( listIssues );
		} );
	}

	/**
	* Called when JQM 'pageinit' event is fired. At this point
	* all ehancement is done and page is ready.
	**/
	function onReady(){

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
								window.localStorage.setItem( "settings", severSettingsText );
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

			templating.loadTemplate('issue-list', null, function( template ){
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
						require(['i18n!' + app.permanentFileSystem.root.fullPath + '/issues/' + settings.issues[index].id + '/nls/' + settings.issues[index].info ], function(info){

							// store the info
							templateData.issues[index] = info;	

							// flag if issue is active
							templateData.issues[index].available = settings.issues[index].available;

							// flag if issue was already downloaded
							templateData.issues[index].downloaded = window.localStorage.getItem( info.id + "_downloaded" );

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
			templating.loadTemplate('issue-list-empty', null, function( template ){
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
		// Provide the download functionality for issues issues that have
		// the download button
		var onClickForDownload = function(){
			var networkState = navigator.network.connection.type;
			if( networkState != Connection.NONE || networkState != Connection.UNKNOWN ){
				var self = $(this);
				self.off('click');

				var id = self.attr('data-id');

				var progressBar = $('<div class="issue-progress-bar"><div/></div>');
				self.append(progressBar);

				self.addClass('downloading');
				donwloadIssue({
					id : id,
					update : function( progress ){
						progressBar.html( Math.round(progress * 100) + "%" );
					},
					fail : function(error){
						navigator.notification.alert(app.strings.issueDownloadError);
						self.on( 'click', onClickForDownload );
						self.removeClass('downloading');
						progressBar.remove();
					},
					error: function(error) {
						console.log(error)
					},
					success : function(){
						// The magazine is downloaded!
						progressBar.remove();
						self.addClass('downloaded')
						self.removeClass('downloading');
						window.localStorage.setItem( id + "_downloaded", true );
						viewIssue(id);
					}
				});
			}
			else{
				navigator.notification.alert(app.strings.noInternet);
			}
		}

		// Provide view functionality for issues that have been downloaded
		var onClickForView = function(){
			viewIssue($(this).attr('data-id'));	
		}


		page.find( '.issue.available.not-downloaded' ).on( 'click', onClickForDownload );
		page.find( '.issue.downloaded' ).on( 'click', onClickForView );
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

	/**
	* Open the issue viewer for the desired issue
	**/
	function viewIssue( id ){

		id = id || "-1";

		// get the list of files
		var found = false;
		for (var i = 0; i < settings.issues.length; i++) {
			if( id == settings.issues[i].id ){
				found = true;
				break;
			}
		};

		if(!found) return;
		
		$.mobile.changePage(app.path + 'pages/viewer/index.html', {
			transition : "flow",
			data : { id : id }
		});
	}

	return {
		init: init,
		onReady : onReady
	}	
	
});