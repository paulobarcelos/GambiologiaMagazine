// Our only global object
var app = {
	// this will change every time we swith page, we use to know the name of current apge
	page : '',
	// app.path will always give us the root of our app
	path : window.location.href.replace(/pages\/.*?$/, '').replace('index.html',''),
	
	// A few constants
	server : "http://gambiologia.dev/",
	issuesStructureRemotePath : "issues.json",
	issuesStructureLocalPath : "issues.json",

	// To following "constants" will be popuplates as soon as we can get a hold on them
	permanentFileSystem: {},
	permanentEntry: {},
	strings : {}
};

// Setup some modules & plguins aliases
require.config({
	locale: "pt-br", 
	paths : {
		'util' : app.path + 'js/modules/util',
		'dom' : app.path + 'js/modules/dom',
		'templating' : app.path + 'js/modules/templating',
		'jqmhacks' : app.path + 'js/modules/jqmhacks',
		'pagenav' : app.path + 'js/modules/pagenav',
		'pagecommon' : app.path + 'js/modules/pagecommon',

		'text' : app.path + 'js/requirejs-plugins/text',
		'i18n' : app.path + 'js/requirejs-plugins/i18n'
	}
});

// There is some functionality in jQuery Mobile which is not App like, we fix this in both the CSS and JS
$(document.body).live('pageinit', function (event, data){
	$('.ui-footer').removeClass('slideup'); 
	$('.ui-header').removeClass('slidedown');		
	$('.ui-page-footer-fullscreen.ui-page-header-fullscreen .ui-content').css('padding-bottom',$('.ui-page-footer-fullscreen .ui-footer').height() + 11);
});

$(document.body).live('pagebeforeload', function (event, eventData){
	// Avoid jQuery mobile to load the page
	event.preventDefault();
	
	// Load it manually
	$.get(eventData.absUrl, function(response){
		var pageCollection = $(response);
		app.page = pageCollection.attr('data-page');
	
		require([app.path + 'pages/' + app.page + '/' + app.page + '.js'], function(page){
				$(document.body).append(pageCollection);
				page.init(pageCollection, function(){
					eventData.deferred.resolve( eventData.absUrl, eventData.options, pageCollection );
				});
			}
		);
	}, 'html');

});

// Making sure to keep old pages away form the dom
$(document.body).live('pageshow', function (event, eventData){
	eventData.prevPage.remove();
});


// Here is how we hook everything to the loading of the page
$(window).load(function () {
	// After the page is fully loaded, we wait for the device to get ready
	document.addEventListener("deviceready", onDeviceReady, false);
});

// This will be called when cordova is ready
var onDeviceReady = function(){

	// ----------------- Step 1 

	// This will be called when the filesystem is ready
	var onFileSystemSuccess = function(fileSystem) {
        app.permanentFileSystem = fileSystem;
        app.permanentEntry = new DirectoryEntry({fullPath:  app.permanentFileSystem.root.fullPath});
        // Goto to step 2
        loadStrings();
    }

    // This will be called if the file system fails.
    // Currently we can't do anything about that. :P
    var onFileSystemFail = function(evt) {
    	navigator.notification.alert(
    		"Sorry, an error happened, but we don't really know how"
    		+ "to handle it... here is the error message:"
    		+ evt.target.error.code);
    }

    // Resquest the filesystem that evetually will kick in our chain initizalion
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFileSystemFail);

    // ----------------- Step 2 

   	// Load some static data to the app
    var loadStrings =  function(){
    	require( ['i18n!' + app.path + 'static/nls/strings.js' ], function( strings ){
			app.strings = strings;

			 // Goto to step 3
        	onInitComplete();
		});
    }

	// ----------------- Step 3 


    // This will be called when all initialization is complete
    // and we are ready to load our first page
    var onInitComplete = function(){
    	$.mobile.changePage(app.path + 'pages/start/index.html');
    }
}