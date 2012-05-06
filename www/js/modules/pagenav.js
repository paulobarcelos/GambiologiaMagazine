define(function(){

	function enhance ( jQueryCollection ) {
		$.each(
			jQueryCollection,
			function(){
				if( $(this).data('role') === 'pagenav' && $(this).data('page')){
					var target = $(this);
					var page = target.data('page');

					// Modify the href attribute, or set the active style
					if( page !== app.page  ){
						target.attr('href',  app.path + 'pages/' + page + '/index.html');
					}
					else{
						target.addClass('active ui-btn-active');
					}				
				}					
			}
		);
	}

	return {
		enhance : enhance
	}
});