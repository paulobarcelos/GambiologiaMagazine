define(function(){

	function loadTemplate ( name, success, scope ) {
		require( ['text!' + app.path + 'templates/' + name + '.html' ], function( source ){
			var template =  Handlebars.compile( source );

			if( success ){
				success.call( scope || window, template );
			}
		});
	}

	function loadTemplateData ( name, dataDir, success, scope ) {

		var dataDir = dataDir || 'templates-data';
		if( dataDir === '{{page}}' ){
			dataDir = 'pages/' + app.page;
		}

		require( ['i18n!' + app.path + dataDir + '/nls/' + name + '.js' ], function( data ){
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
							var result = $(template(data));
							target.html( result );
							target.remove();

							if( eachSuccess ){
								eachSuccess.call( scope || window, result );
							}
						}
						else{
							loadTemplateData( target.data('template'), target.data('dataDir'), function( data ){
								var result = $(template(data));
								target.after( result );
								target.remove();

								if( eachSuccess ){
									eachSuccess.call( scope || window, result );
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