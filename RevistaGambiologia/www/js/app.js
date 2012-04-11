// Our only global object
var app = {
	path : window.location.href.replace(/pages\/.*?$/, '').replace('index.html',''),
	page : ''
};

// Setup some modules & plguins aliases
require.config({
	locale: "pt-br", 
	paths : {
		'util' : app.path + 'js/modules/util',
		'dom' : app.path + 'js/modules/dom',
		'templating' : app.path + 'js/modules/templating',

		'text' : app.path + 'js/requirejs-plugins/text',
		'i18n' : app.path + 'js/requirejs-plugins/i18n'
	}
});

// There is some functionality in jQuery Mobile which is not App like, we fix this in both the CSS and JS
$(document.body).live('pageinit', function(){
	$('.ui-footer').removeClass('slideup'); 
	$('.ui-header').removeClass('slidedown');		
	$('.ui-page-footer-fullscreen.ui-page-header-fullscreen .ui-content').css('padding-bottom',$('.ui-page-footer-fullscreen .ui-footer').height() + 11);
});

// Load each page script
$(document.body).live('pagechange', function (event, eventData) {
	app.page = $(eventData.toPage).attr('data-page');			
	require(
		[app.path + 'pages/' + app.page + '/' + app.page + '.js'],
		function(page){
			page.init(eventData);
		}
	);			
});
