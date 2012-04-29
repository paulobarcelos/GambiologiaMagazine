define(['util'], function( util ){

	var progress = 0;

	function get ( args ) {
		progress = 0;
		var count = 0;

		args = args || {};
		args.files = args.files || [];
		args.update = args.update || function(){};
		args.success = args.success || function(){};
		args.error = args.error || function(){};
		args.context = args.context || window;

		var composedSuccess = function(){
			args.success.call(args.context, args.files);
		}
		var lazySuccess = util.trigger(args.files.length, composedSuccess);

		for (var i = args.files.length - 1; i >= 0; i--) {
			
			var closure = function(file){
				app.permanentFileSystem.root.getFile( file, {},
					function(){
						count ++;
						progress = count / args.files.length;
						
						args.update.apply(args.context);
						lazySuccess();
					},
					function(evt){
						var fileTransfer = new FileTransfer();
						fileTransfer.download(
							app.server + file,
							app.permanentFileSystem.root.fullPath + '/' + file,
							function(entry) {
								count ++;
								progress = count / args.files.length;
								
								args.update.call(args.context);
								lazySuccess();
							},
							function(error) {
								args.update.call(args.context);
								args.error.call( args.context, error );
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