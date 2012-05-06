define( ['pagecommon'], function( pagecommon ){
	
	function init( page, params, resolve ){
		// Get the issue data
		getData(params.id, function( data ){
			for (var i = 0; i < data.structure.chapters.length; i++) {
				data.structure.chapters[i].active = false;
			}

			var currentChapter, previousChapter, nextChapter;
			if(!params.chapter){
				currentChapter = data.structure.chapters[0];
				data.structure.chapters[0].active = true;
				previousChapter = null;
				nextChapter = (data.structure.chapters.length > 1) ? data.structure.chapters[1] : null; 
			}
			else{
				for (var i = 0; i < data.structure.chapters.length; i++) {
					if( data.structure.chapters[i].id == params.chapter ){
						data.structure.chapters[i].active = true;
						currentChapter = data.structure.chapters[i];
						previousChapter = (i > 0) ? data.structure.chapters[i-1] : null;
						nextChapter = (i != data.structure.chapters.length - 1 ) ? data.structure.chapters[i+1] : null;
						break;
					}
				}
			}
			window.localStorage.setItem( "lastURL", app.path + 'pages/' + app.page + '/index.html?id=' + params.id + '&chapter=' + currentChapter.id );

			// Provide header data
			var headerData = {
				appPath : app.path,
				title : data.info.title,
				chapters : data.structure.chapters
			};
			page.find("*:jqmData(template='viewer-header')").attr('data-data', JSON.stringify(headerData));

			// Provide footer data
			var footerData = {
				appPath : app.path,
				issueId : params.id,
				current: currentChapter,
				previous : previousChapter,				
				next : nextChapter
			};
			page.find("*:jqmData(template='viewer-footer')").attr('data-data', JSON.stringify(footerData));

			// Run the common initialization
			pagecommon.init(page,function(){
				//Provide functionality to the chapter list
				page.find('#chapter-index').on('change', function(){
					$.mobile.changePage(app.path + 'pages/viewer/index.html', {
						transition : "slide",
						data : { id : data.info.id, chapter : page.find('#chapter-index').val() }
					});
				})

				// Load the issue resources
				loadResources(data, function( style, script ){

					
					// Provide functionality to the back button, as it will need
					// exit the script and remove the style
					page.find( '#back-to-start' ).on( 'click', function(){
						script.exit();
						style.remove();
					});

					// Inject the chapter content into the page
					require(['text!'+ app.permanentFileSystem.root.fullPath + '/issues/' + data.info.id + "/resources/" + currentChapter.file], function(content){
						page.find("#chapter-content").append(content);

						// Initialize the script
						script.init();

						// Ok, now we are ready to resolve!
						resolve.call();
					})
				})				
			});
		});
	}

	/**
	* Called when JQM 'pageinit' event is fired. At this point
	* all ehancement is done and page is ready.
	**/
	function onReady(){

	}

	/**
	* Retreive an issue info and structure
	**/
	function getData(id, ready, context){
		var settings = $.parseJSON( window.localStorage.getItem( "settings" ) );
		for (var i = 0; i < settings.issues.length; i++) {
			if(settings.issues[i].id ==  id){
				require(['i18n!' + app.permanentFileSystem.root.fullPath + '/issues/' + id + '/nls/' + settings.issues[i].info ], function(info){
					require(['i18n!' + app.permanentFileSystem.root.fullPath + '/issues/' + id + '/nls/' + info.structure ], function(structure){
						ready.call(context || window, { info : info, structure : structure });
					});
				});
				break;
			}
		};
	}


	/**
	* Load the issue style and script and executes the script initialization
	*/
	function loadResources(issueData, ready, context){

		var style, script;

		var loadScript = function(){
			require([app.permanentFileSystem.root.fullPath + '/issues/' + issueData.info.id + "/resources/" + issueData.structure.script], function(loadedScript){
				script = loadedScript;

				ready.call(context || window, style, script);
			});
		}
		// Check if the stylesheet is loaded
		var styleId = 'styles-' + issueData.info.id;
		if($('#'+styleId).length){
			style = $('#'+styleId);
			loadScript();
		}
		else{
			require(['dom'], function(dom){
				dom.loadStyleSheet(
					app.permanentFileSystem.root.fullPath + '/issues/' + issueData.info.id + "/resources/" + issueData.structure.style,
					styleId, 
					function(styleLink){
						style = $(styleLink);
						loadScript();
					},
					function(error){
						console.log(error)
					}
				);

			});
		}
	}

	return {
		init: init,
		onReady: onReady
	}	
	
});