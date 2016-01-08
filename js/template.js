'use strict';
function template($, Handlebars, data){
		var quickActions = data.quickActions,
			tabsList = data.tabsList,
			place = 3,
			tabData = [
					{
						'name': 'qr',
						'id': 'quick-reports',
						'frame': '1',
						'describe': 'quickReports',
						'url': '', // or taken from json
						'popup': []						
					},
					{
						'id': 'fmy-folders',
						'frame': '2',
						'describe': 'myFolders',
						'url': '' // or taken from json
					},
					{
						'name': 'mtf',
						'id': 'my-team-folders',
						'frame': '3',
						'describe': 'myTeamFolders',
						'url': '', // or taken from json
						'popup': []
					},
					{
						'name': '',
						'id': 'public-folders',
						'frame': '4',
						'describe': 'publicFolders',
						'url': '' // or taken from json
					}
			],
		 	navTemplate = $("#nav-template").html(),
			tabTemplate = $("#tab-template").html(),
			template = Handlebars.compile(navTemplate),
			result = template(quickActions);

		for(var i = 0; i<tabsList.length; i++){
			if(tabsList[i].options.url !== undefined){
				tabData[i].url = tabsList[i].options.url;
			}
		};
		for(var i =0; i<tabData.length; i++){
			if(tabData[i].popup){
				for(var j=0; j<place; j++){
					tabData[i].popup.push({
						'place': j+1,
						'id': tabData[i].name,
						'name': 'name',
						'url': 'url'
					})
				}
			}
		}

	 // nav template handlebar magic here
	$('nav').append(result);
	$('#nav-template').remove();

	 // tab template handlebars magic here
	 template = Handlebars.compile(tabTemplate);
	 result = template(tabData);
	$('.tabs').append(result);
	$('#tab-template').remove();

};
