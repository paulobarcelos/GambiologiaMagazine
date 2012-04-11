define(function(){

	function loadTemplate ( name, dir, success, scope ) {
		var dir = dir || 'templates';
		if( dir === '{{page}}' ){
			dir = 'pages/' + app.page;
		}

		require( ['text!' + app.path + dir +'/' + name + '.html' ], function( source ){
			var template =  Handlebars.compile( source );

			if( success ){
				success.call( scope || window, template );
			}
		});
	}

	function loadTemplateData ( name, dir, success, scope ) {

		var dir = dir || 'templates-data';
		if( dir === '{{page}}' ){
			dir = 'pages/' + app.page;
		}

		require( ['i18n!' + app.path + dir + '/nls/' + name + '.js' ], function( data ){
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

					loadTemplate( target.data('template'), target.data('templateDir'), function( template ){

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