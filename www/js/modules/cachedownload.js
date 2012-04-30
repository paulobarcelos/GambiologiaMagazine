define(['util'], function( util ){

	var progress = 0;

	function get ( args ) {
		progress = 0;
		var count = 0;
		var errorCount = 0;
		var cachedFiles = [];

		args = args || {};
		args.files = args.files || [];
		args.update = args.update || function(){};
		args.error = args.error || function(){};
		args.success = args.success || function(){};
		args.fail = args.fail || function(){};
		args.context = args.context || window;

		var composedSuccess = function(){
			args.success.call(args.context, cachedFiles);
		}
		var lazySuccess = util.trigger(args.files.length, composedSuccess);

		var internalUpdate = function(){
			args.update.call(args.context);
			if( errorCount ){
				if( errorCount + count == args.files.length ){
					args.fail.call(args.context);
				}
			}
			
		}

		for (var i = args.files.length - 1; i >= 0; i--) {
			
			var closure = function(file){
				app.permanentFileSystem.root.getFile( file, {},
					function(file){
						count ++;
						progress = count / args.files.length;
						
						cachedFiles.push(file);

						internalUpdate();
						lazySuccess();
					},
					function(evt){
						var fileTransfer = new FileTransfer();
						fileTransfer.download(
							app.server + file,
							app.permanentFileSystem.root.fullPath + '/' + file,
							function(file) {
								count ++;
								progress = count / args.files.length;
								
								cachedFiles.push(file);

								internalUpdate();
								lazySuccess();
							},
							function(error) {
								errorCount ++;
								
								args.error.call( args.context, error );
								internalUpdate();								
							}
						);
					}
				);
			}
			closure.call( window, args.files[i] );					
		};		
	}

	function getProgress(){
		return progress;
	}

	return {
		get : get,
		getProgress : getProgress
	}
});