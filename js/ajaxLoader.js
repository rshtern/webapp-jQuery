'use strict';
(function(){

	$.ajax('/data/config.json', {
		success: function(response) {
			if(response){
				template(jQuery, Handlebars, response);
				main(response.notification);
			}
		},
		error: function(err){
			// UTILS.console.log(err);
			alert('error - data was not loaded or recieved from server');
		}
	});
})();