define(function(){
	var privateProperties = {
		
	};
	
	return {
		init: function(){

			$.each( 
				$("a[data-module-loader='true']"),

				function(){
					var module = $(this).data('slug');

					// Modify the href attribute, or set the active style
					if( module !== app.module  ){
						$(this).attr('href',  app.path + 'modules/' + module + '/index.html' );
					}
					else{
						$(this).addClass('active, ui-btn-active');
					}
				}
			);
		}
	};
	
});