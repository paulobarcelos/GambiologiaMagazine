define(
	["../plugins/moduleLoader/index.js",
    "../plugins/fragmentInjector/index.js"],
	function(moduleLoader, fragmentInjector) {
        return {
        	init : function(){
        		moduleLoader.init();
                fragmentInjector.init();
        	},
            plugins : { 
            	moduleLoader : moduleLoader,
                fragmentInjector : fragmentInjector
            }
        }
    }
);