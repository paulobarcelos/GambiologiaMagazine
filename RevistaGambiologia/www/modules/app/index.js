define(function(){
	var privateProperties = {
		
	};

	return {
		init: function(app){

			$.mobile.changePage("modules/newsStand/index.html", {
				data: 'Send message to bootstrap from the sample page'
			});
			
		}
	};
	
});