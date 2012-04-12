// Our only global object
var app = {
	path : window.location.href.replace(/pages\/.*?$/, '').replace('index.html',''),
	page : '',
	inited : false
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
		'pageinit' : app.path + 'js/modules/pageinit',

		'text' : app.path + 'js/requirejs-plugins/text',
		'i18n' : app.path + 'js/requirejs-plugins/i18n'
	}
});

// There is some functionality in jQuery Mobile which is not App like, we fix this in both the CSS and JS
$(document.body).live('pageinit', function (event, data){
	if(!app.inited){
		app.inited = true;

		$.mobile.changePage(app.path + 'pages/sample/index.html');
	}
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

		//alert(pageCollection);	
		require([app.path + 'pages/' + app.page + '/' + app.page + '.js'], function(page){
				$(document.body).append(pageCollection);
				page.init(pageCollection, function(){
					eventData.deferred.resolve( eventData.absUrl, eventData.options, pageCollection );
				});
			}
		);
	}, 'html');

});

$(document.body).live('pageshow', function (event, eventData){
	eventData.prevPage.remove();
});