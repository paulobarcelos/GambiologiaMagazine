define(
	["../plugins/module_loader/module_loader.js"],
	function(module_loader) {
        return {
        	init : function(){
        		module_loader.init();
        	},
            plugins : { 
            	module_loader : module_loader
            }
        }
    }
);