define(function(){

	function loadTemplate ( name, success, scope ) {
		require( ['text!' + app.path + 'templates/' + name + '.html' ], function( source ){
			var template =  Handlebars.compile( source );

			if( success ){
				success.call( scope || window, template );
			}
		});
	}

	function loadTemplateData ( name, success, scope ) {

		require( ['i18n!' + app.path + 'templates-data/nls/' + name + '.js' ], function( data ){
			if( success ){
				success.call( scope || window, data );
			}
		});
	}

	function prepare ( jQueryCollection, eachSuccess, scope ) {
		$.each(
			jQueryCollection,
			function(){
				if( $(this).data('role') === 'template' ){
					var target = $(this);

					loadTemplate( target.data('template'),  function( template ){

						var data = target.data('data');
						if (data){
							target.replaceWith( $(template(data)) );

							if( eachSuccess ){
								eachSuccess.call( scope || window, null );
							}
						}
						else{
							loadTemplateData( target.data('template'), function( data ){
								target.replaceWith( $(template(data)) );

								if( eachSuccess ){
									eachSuccess.call( scope || window, null );
								}
							});
						}
					});					
				}					
			}
		);
	}

	return {
		loadTemplate : loadTemplate,
		loadTemplateData : loadTemplateData,
		prepare : prepare
	}
});