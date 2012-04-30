define(['util'], function( util ){
	var db;

	var init = function ( success, error, context, name, version, displayName, size ){
		success = success || function(){};
		error = error || function(){};
		context = context || window; 
		name = name || "database";
		version = version || "1.0";
		displayName = displayName || "Database";
		size = size || 20000000;

		db = window.openDatabase(name, version, displayName, size);

		console.log(db)

		var structure = function(tx){
			tx.executeSql('CREATE TABLE IF NOT EXISTS APP (key unique, value)');
		}
		var onError = function(){
			error.call(context);
		}
		var onSuccess = function(){
			success.call(context);
		}

		db.transaction(structure, onError, onSuccess);
	}

	var get = function( key, success, error, context ){
		key = key || '0';
		success = success || function(){};
		error = error|| function(){};
		context = context || window;

		if(!db){
			error.call(context, { message:"Databse not initialized" });
			return;
		}

		var onQuery = function(tx){
			tx.executeSql('SELECT ' + key + ' FROM APP', [], onSuccess, onError);
		}

		var onSuccess = function(tx, results){
			success.call(context, results);
		}

		var onError = function(err){
			error.call(context, err);
		}

		db.transaction(onQuery, onError);
	}

	var set = function ( key, value, success, error, context ){
		key = key || '0';
		value = value || '';
		success = success || function(){};
		error = error || function(){};
		context = context || window;

		if(!db){
			error.call(context, { message:"Databse not initialized" });
			return;
		}

		var onQuery = function(tx){
			tx.executeSql('INSERT INTO APP (key, value) VALUES (' + key + ', ' + value + ')');
		}

		var onSuccess = function(tx, results){
			success.call(context, results);
		}

		var onError = function(err){
			error.call(context, err);
		}

		db.transaction(onQuery, onError);
	}

	return {
		init : init,
		get : get,
		set : set
	};

});