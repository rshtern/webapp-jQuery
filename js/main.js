'use strict';

function main(dataFromJSON){

	// --- global variables ---

	// ajax variables
	var notification = $('.notifications'),
		quickActions = {},
		tabsList = {},
		formSearch = $('form.search-box'),
		search = $('input[type="search"]'),
		message = '',
	// jsonContentToHTML variables
		nav = $('nav'), 
		navSection = $('.nav-section'),		
		iframes = $('iframe.frame'),
	// tabEvents and frameEvents variables
		tabs = $('.tabs'),
		buttons = $('.buttons li'),
		frames = $('[frame]'),
		re = /\#\S*/g, // select only the hash string from the '#'
		tabHash = '', 
	// url validation regular expression was taken from jQuery url validation
		urlRegExValidate = /^(https?|ftp):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
		popUpMenu = $('.popup-menu'),
		popUpQr = $('.popup-menu[data="qr"]'),
		popUpMtf = $('.popup-menu[data="mtf"]'),
		expandButtons = $('.expand'),
		inputs = $('.popup-menu input[type="text"]'),
		emptyFields, // test variable for verifing empty input fields
		inputValueTest = [],
		inputValueForm = [],
		dropDowns = $('.drop-down'),
		dropDownQr = $('.drop-down[data="qr"]'),
		dropDownMtf = $('.drop-down[data="mtf"]'),
		frameInputData = {
			qr: {	name: ['','',''],
					url: ['','','']
					},
			mtf: {	name: ['','',''],
					url: ['','','']
					},
			lastHash: ''
		},

		// validation variables
		// using regex to clip the id into array of form name, form type, and place
		matchRe = /\w[a-zA-Z]*/g,
		targetObj = {
			formName: [],
			formType: [],
			storePlace: [],
			formData: [],
			lastHash: ''
		},
		iframeWindows = $('iframe.frame'),

	// webApp content here
	webApp = {

		//---------------------//
		// main functions here
		//---------------------//

	    init: function(){
	    	//this.ajaxCall();
	    	this.startUp();
	    	this.keyboardEvents();
	    	this.tabEvents();
	    	this.frameEvents();
	      	this.searchBox();
	    }, // end of init

	    startUp: function(){
	    	if(dataFromJSON !== null){
	    		notification.removeClass('hidden');
				notification.html(dataFromJSON);
	    	} else {
	    		notification.removeClass('hidden');
				notification.html('error - data was not loaded or recieved from server');

	    	}
	    	function dataCheck(){
	    		if(window.localStorage){
	    			var data = JSON.parse(localStorage.getItem('data'));
	    			return data;
	    		} else {
	    			var data = webApp.cookieHandler.check();
	    			return data;
	    		}
	    	}

	    	function webAppRestoreData(restoredData){
	    		// check incoming data and set webapp according to data
	    		var objectData = restoredData(),
	    			fullHash = '',
	    			hashData = '',
	    			lastTab = '',
	    			lastFrame = '',
	    			lastUrl = '',
	    			lastQr = '', 
	    			lastMtf = '';
		    		// set tab from last hash or defualt
	    			// if i have previous data
		    		if(objectData !== null && objectData.lastHash.length>0){
		    			fullHash = objectData.lastHash;
		    			webApp.hashHelper(fullHash);
		    			hashData = location.hash.split('/');
		    			lastTab = $('a[href="' + hashData[0] + '"]');
		    			lastFrame = hashData[1];

		    			// check last url was on or or mtf? and under what name?
		    			if(lastTab.attr('data') === 'qr'){
		    				for(var i = 0; objectData.qr.name.length>i; i++){
		    					if(objectData.qr.name[i].indexOf(lastFrame)>-1){
		    						lastUrl = objectData.qr.url[i];
		    					}
		    				}
		    			}
		    			if(lastTab.attr('data') === 'mtf'){
		    				for(var i = 0; objectData.mtf.name.length>i; i++){
		    					if(objectData.mtf.name[i].indexOf(lastFrame)>-1){
		    						lastUrl = objectData.mtf.url[i];
		    					}
		    				}
		    			}

		    			// hide popup if there is data
		    			if(objectData.qr.name.length>0 && objectData.mtf.name.length>0 ){
		    				if(!popUpQr.css('display', 'hidden')){
	    						popUpQr.hide();
		    				}  
		    				if(!popUpMtf.css('display', 'hidden')){
	    						popUpMtf.hide();
		    				}									
		    			} else {
		    				webApp.hidePopUp(lastTab);
		    			}
		    			// fill input fields with data from storage
		    			// than build and show dropdowns
		    			webApp.inputsNDropdowns(objectData);

	    				// set iframes
	    				webApp.setIframe(lastTab, lastUrl, lastQr, lastMtf);
	    				// set expand buttons
	    				webApp.setExpand(lastTab, lastUrl, lastQr, lastMtf);

		    		} else {
		    		// if no previous data revert to defualt
		    			webApp.hashHelper('#quick-reports');
		    			lastTab = $('a[href="#quick-reports"]');
		    			lastFrame = null;
		    			inputs[0].focus();

		    		}
	    			webApp.tabSelect(lastTab, lastTab[0].href);

	    	}
	    	webAppRestoreData(dataCheck);

	    }, // end of startup function

	    // this function here takes control of tab navigation through the middle dropdown menu
	    // with the right behaivour and animations
	    keyboardEvents: function(){
	    	// 2 cases 1> anchor link 2> div.menu-hint
	    	nav.on('keyup', function(e){

	    		var target = $(e.target);

	    		// case 1> here - if im on an anchor clear all hover effects and hide all menus but show target menu
				if(target[0].tagName.toLowerCase() === 'a'){
					target.on('focus', function(){
						if(!$(target.parents('.nav-section')).hasClass('hover')){
							for(var i = 0; i<navSection.length; i++){
								navSection.eq(i).removeClass('hover');
							}
							$(target.parents('.nav-section')).addClass('hover');
						}
					});
				}

	    		// case 2> here - if not anchor clear all menus but set current menu
	    		// and when target blurs clear all menus but set current menu
	    		if(target[0].tagName.toLowerCase() === 'div' && target.hasClass('menu-hint')){
	    			target.on('blur', function(){
						for(var i = 0; i<navSection.length; i++){
							navSection.eq(i).removeClass('hover');
						}
						target.parents('.nav-section').addClass('hover');
					});
				}

	    	});

	    	tabs.on('keyup', function(e){
		    	clearNav();
		    	var target = e.target,
		    	targetMatch = target.id.match(matchRe);
		    	if (e.keyCode === 27){
		    		if(targetMatch[0] === 'qr'){
		    			//console.log('esc clicked in qr');
		    			popUpQr.hide();
		    		} 
		    		if(targetMatch[0] === 'mtf'){
		    			//console.log('esc clicked in mtf');
		    			popUpMtf.hide();
		    		}
		    	}	
	    	});

	    	search.on('keyup', clearNav);
	    	
	    	function clearNav(){
	    		for(var i = 0; i<navSection.length; i++){
					navSection.eq(i).removeClass('hover');
				}	
	    	}
	    }, // end of keyboard events function

	    searchBox: function(){
	    	formSearch.on('submit', function(e){
	    		e.preventDefault();
	    		
	    		// if results found than:
	    		if (webApp.resultFound(search.value)) {
	    			notification.text('Showing results for: ' + search.value);	
	    		} else {
	    			notification.text('Nothing was found for: ' + search.value);
	    		}
	    		// else show error message
	    	}, false);
	    }, // end of search box function

	    resultFound: function(searchValue){
	    	var queryIndex = [];
	    	function reportQuery(query, inputName){
	    		var str = searchValue.toLowerCase();
		    	for(var i = 0; i < frameInputData[query][inputName].length; i++){
		    		if(frameInputData[query][inputName][i].toLowerCase().indexOf(str)>-1) {
		    			console.log('result for: ' + searchValue + ' found on ' + query + " on " + inputName + " " + i);
		    			queryIndex = [true, query, i];
		    			return true; // [if true] and [query = qr or mtf] and [i = index of select dropdown]
		    		}
		    	}
	    	}

	    	// case 1 qr name
	    	// case 2 qr url
	    	// case 3 mtf name
	    	// case 4 mtf url
	    	if(reportQuery('qr', 'name') || reportQuery('qr', 'url') || reportQuery('mtf', 'name') || reportQuery('mtf', 'url')){
			// change to selected tab and frame (make active and hide all the other tabs)
			// change to the selected dropdown value
			// hide popup for selected tab

				// reset all active li's
		        webApp.resetClass(buttons, 'active', '');
		        webApp.resetClass(frames, 'active', 'hidden');
		        
		        // set active frames, tabs, frames and buttons
		        if(queryIndex[1] === 'qr'){
		        	buttons.eq(0).addClass('active');
		        	webApp.multiAddClass(frames, 'hidden');
		        	frames.eq(0).removeClass('hidden');
		        	popUpQr.hide();
		        	for(var i = 0; i< dropDownQr.options.length; i++){
		        		dropDownQr.options[i].removeAttr('selected');	
		        	}
		        	dropDownQr.options[queryIndex[2]].attr('selected', 'selected');
		        	expandButtons.eq(0).href = dropDownQr.options[queryIndex[2]].value;
		        	iframes.eq(0).src = dropDownQr.options[queryIndex[2]].value;
		        	location.hash = searchValue + "?=/" + tabHash + '/' + dropDownQr.options[queryIndex[2]].text;
		        } else if (queryIndex[1] === 'mtf'){
		        	buttons.eq(2).addClass('active');
		        	webApp.multiAddClass(frames, 'hidden');
		        	frames.eq(2).removeClass('hidden');
		        	popUpMtf.hide();
		        	for(var i = 0; i< dropDownMtf.options.length; i++){
		        		dropDownMtf.options[i].removeAttr('selected');	
		        	}
		        	dropDownMtf.options[queryIndex[2]].attr('selected', 'selected');
		        	expandButtons.eq(2).href = dropDownMtf.options[queryIndex[2]].value;
		        	iframes.eq(2).src = dropDownMtf.options[queryIndex[2]].value;
		        	location.hash = searchValue + "?=/" + tabHash + '/' + dropDownMtf.options[queryIndex[2]].text;
		        }

				return true;	    		
	        }
	    	
	    }, // end of resultFound function for top search box form

	    tabEvents: function(){
		
	      tabs.children('ul').on('click', function(e){
	      	e.preventDefault();
	        var target = $(e.target),
	        	theHref = target[0].href;

	        if(target[0].tagName.toLowerCase() === 'a'){
				// change hash according to the current tab href value
				//helper to prevent hash jump
				webApp.hashHelper(theHref);
				webApp.tabSelect(target, theHref);	        	
	        }

	      }); 
	    }, // end of tab events
   		
   		tabSelect: function(elm, elmHref){
			if(elm[0].tagName.toLowerCase() === 'a'){

		        // reset all active li's
		        webApp.resetClass(buttons, 'active', '');
		        webApp.resetClass(frames, 'active', 'hidden');

		        // set current tab to be active and change to current frame based on hash
		        $(elm.parent()).addClass('active');

		        for(var i = 0; i<frames.length; i++){
		        	// if the frame id if like the window hash or it was loaded from stored data (elmHref.match(re)[0]) 
		        	// --> the [0] is becuase match returns an array and we only want the first child of that array
					if('#'+frames[i].id === elmHref.match(re)[0] || '#'+frames[i].id === location.hash){
						$(frames[i]).addClass('active').removeClass('hidden');
						tabHash = '#'+frames[i].id; // store temporary hash
						// set focus on first input here if the frame has popup-menu
						if(frames[i].firstElementChild.lastElementChild.classList[0] === 'popup-menu'){
							frames[i].firstElementChild.lastElementChild.children[0][1].focus();
						}
					}
				}
			}
		}, // end of tabSelect function 

	    frameEvents: function(){
			
	    	tabs.children('div').on('click', function(e){
		        // [1] reset all frames to defualt on init and set first defualt frame
		        // [2] check local storage or cookies for stored data and update fields and menus

		        e.preventDefault();
		        var target = $(e.target),
		        	parentOfTarget = target.parent(),

					
					// expand button actions - popup href to blank page
					expandButton = function(){
						if(parentOfTarget[0].tagName.toLowerCase() === 'a' && parentOfTarget.hasClass('expand')){
							var windowObjectReferance;
							var blankPage = 'target = "_blank"';
							function openRequestedPopup (url){
								windowObjectReferance = window.open(url, blankPage);
							}
							openRequestedPopup(parentOfTarget[0].href);
						}
					}, // end of expand button

					// cancel button actions - hide the form
			        cancelButton = function(){
					    if(target.hasClass('popup-button') && target[0].type === 'reset'){
					    	if(target.attr('data') === 'qr'){
					    		popUpQr.hide();	
					    	} else if(target.attr('data') === 'mtf'){
					    		popUpMtf.hide();
					    	}
					    }
			        }, // end of cancel button

		        	// settings button action = toggle form visibility
			        settingsButton = function(){
					    // when user clicks the setting he clicks an image and that is why we need to check that the 
					    // parent is an 'a' tag with the class of 'toggle'
				        if (parentOfTarget[0].tagName.toLowerCase() === 'a' && parentOfTarget.hasClass('toggle')){
				        	if(parentOfTarget.attr('data') === 'qr'
				        	&& popUpQr.attr('data') === parentOfTarget.attr('data')){
				        		popUpQr.toggle();
				        	} else if (parentOfTarget.attr('data') === 'mtf' 
				        		&& popUpMtf.attr('data') === parentOfTarget.attr('data')){
				        		popUpMtf.toggle();
				        	}
				        }
			        }, // end of settings button

			        saveButton = function(){

						// [1] check if all fields are valid - V
						// [2] if OK save data to localStorage or cookies and build dropDown menu with names and links - V
						// [3] open in iframe the last report in each tab - V
						// [4] hide popup-menu - V
						// [5] add expand icon to current frame with current window href to target new webpage - V

						// look on inputs and if all filled inputs have valid class than all is ok
						// if there is an invalid class or more dont save and focus on the first invalid input field
						var invalidInputs = $('.invalid'),
							validInputs = $('.valid');
			        	if(target.hasClass('popup-button') && target[0].value === 'save'){
			        		console.log('save button clicked');
					    	for(var i = 0; i< popUpMenu.length; i++){
					    		if(popUpMenu.eq(i).attr('data') === target.attr('data')){
					    			
					    			// if there is a input with error log error and focus on the first input field with an error
					    			if(invalidInputs.length > 0){
					    				//console.log('some input fields have errors');
					    				invalidInputs[0].focus();

					    			} else {
					    				// if all valid than 		[1] hide the form - V
					    				// 							[2] show expand button - V
					    				//							[3] build dropdown menu - v
					    				//							[4] set iframe - V
					    				//							[5] save data to local storage or cookies
					    				
					    				// when all fields are valid hide the popup menu
					    				popUpMenu.eq(i).hide();
					    				
					    				// show drop down menu according to valid popup menu data
					    				
					    				if(popUpMenu.eq(i).attr('data') === 'qr'){
					    					if(dropDownQr.css('display', 'none')){
					    						dropDownQr.show();
					    						//console.log('removed hidden class from dropdown');
					    					}
					    				} else if(popUpMenu.eq(i).attr('data') === 'mtf'){
					    					if(dropDownMtf.css('display', 'none')){
												dropDownMtf.show();
											}
					    				} 
					    									    				
					    				// if qr dropdown chlidern exist remove and update
					    				if(dropDownQr.children().length > 0){
					    					// rough dropdown clear here
					    					dropDownQr.html('');
					    					webApp.buildDropDown('qr', frameInputData);
					    				} else if(dropDownQr.children().length === 0){
					    					webApp.buildDropDown('qr', frameInputData);
					    				}
					    				// if mtf dropdown chlidern exist remove and update
					    				if(dropDownMtf.children().length > 0){
											// rough dropdown clear here
					    					dropDownMtf.html('');
					    					webApp.buildDropDown('mtf', frameInputData);
					    				} else if(dropDownMtf.children().length === 0){
					    					webApp.buildDropDown('mtf', frameInputData);
					    				}

					    				// save data
					    				// set hash according to target object data
					    				if(target.attr('data') === 'qr'){
					    					// check last filled name and put it to hash
					    					var select = $('.drop-down[data="qr"]');
					    					for(var i=0; select.children().length>i; i++){
					    						if(select.eq(i).selected){
					    							frameInputData.lastHash = location.hash + '/' + select.eq(i).text();
					    						}
					    					}
					    				} else if(target.attr('data') === 'mtf'){
					    					// check last filled name and put it to hash
					    					var select = $('.drop-down[data="mtf"]');
											for(var i=0; select.children().length>i; i++){
					    						if(select.eq(i).selected){
					    							frameInputData.lastHash = location.hash + '/' + select.eq(i).text();
					    						}
					    					}					    				
					    				}
					    				console.log(frameInputData.lastHash);
					    				var dataString = JSON.stringify(frameInputData);

					    				if(window.localStorage){
					    					// if older data exist clear it and write new data
				    						var data = localStorage.getItem('data');
				    						//console.log(data !== null);		
									    	if(data !== null){
										    	localStorage.removeItem('data');
  										    	localStorage.setItem('data', dataString);
										    	console.log('Local Storage data updated');
									    	} else {
									    		localStorage.setItem('data', dataString);
									    		console.log('data stored to Local Storage');
									    	}
									    	// after data saved update hash to last selection
									    	webApp.hashHelper(frameInputData.lastHash);
									    } else {
									    	//UTILS.cookieHandler.check();
									    	var data = webApp.cookieHandler.check();
									    	// if there is data on cookie than data === cookie data
									    	if(data !== null){
									    		webApp.cookieHandler.set('data', dataString, 365);
									    		console.log('Cookie data updated');
									    	} else {
									    	// if no cookie than data === false
									    		webApp.cookieHandler.set('data', dataString, 365);
									    		console.log('data stored to Cookie');
									    	}
									    	// after data saved update hash to last selection
									    	webApp.hashHelper(frameInputData.lastHash);
									    }
									  
					    			}
					    		}
					    	}
					    }
					    
			        }; // end of save button

			    cancelButton();
			    settingsButton();
			    expandButton();
			    saveButton();
	     	}); // end of click event
			
			// change event listener
			tabs.on('change', function(e){
				var target = $(e.target),
					targetId = target[0].id,
					parentOfTarget = target.parent();

				// if change occord on dropdowns
				if(target[0].tagName.toLowerCase() === 'select'){
					// set the expand button href link occording to the dropdown value
					for(var i = 0; i<expandButtons.length; i++){
						if(expandButtons.eq(i).attr('data') === target.attr('data')){
							expandButtons.eq(i)[0].href = target.value;
						}
					}
					// set the iframe src occording to the dropdown value
					for(var i = 0; i<iframeWindows.length; i++){
						if(iframeWindows.eq(i).attr('data') === target.attr('data')){
							iframeWindows.eq(i).src = target.value;
						}
					}
					// set hash according to selected dropdown
					var selectedOption = $.text(target[0].options[target[0].selectedIndex]);
					location.hash = tabHash + "/" + selectedOption;
					// store last tab and report to localstorage
					frameInputData.lastHash = location.hash;
					console.log(frameInputData.lastHash);
					//localStorage.removeItem('data');
			    	localStorage.setItem('data', JSON.stringify(frameInputData));
		    	
				}

				// if change occord on inputs
				if(target[0].tagName.toLowerCase() === 'input'){

					// store data from the input fields to a temporary object - targetObj
					// targetObj has 4 objects inside
					// [1] formName - the form name - qr or mtf
					// [2] formType - is it a name or a url
					// [3] storePlace - what is its place/order (0, 1, 2)
					// [4] formData - data value to store - this needs to be checked and be valid 
					// 	   (valid name (length > 0) and valid url (copy regex from internet))
					// 
					// after name and url validation need to check if both places are filled 
					// if not mark in red outline

					targetObj.formName = targetId.match(matchRe)[0]; // qr or mtf
					targetObj.formType = targetId.match(matchRe)[1]; // name or url
					targetObj.storePlace = targetId.match(matchRe)[2]; // place in form 1,2,3?
					targetObj.formData = target[0].value; // written data

					// check validation of name and url and than
					function validateForm(){
						
						// validate name
						if(targetObj.formType === 'name'){
							// if name has more than 0 characters and does not
							// start with a non character than the name is valid
							// (non latin) hebrew characters verified
							if(targetObj.formData.length>0 && targetObj.formData.substr(0,1).match(/[0-9a-zA-Z\u0590-\u05fe]/)){
								// if the name is valid hide error message
								target.next().hide();
								// and add a green border for valid name! :)
								target.attr('class', 'valid');
								
								// store data to object frameInputData
								frameInputData[targetObj.formName]
											  [targetObj.formType]
											  [targetObj.storePlace-1] = targetObj.formData;
							} else {
								// color border and put error message
								// if the name is invalid show error message
								target.next().show().text("Please fill a correct name");
								// add red border for invalid name! :(
								target.attr('class', 'invalid').focus();
							}						
							if(targetObj.formData.length === 0 && !target.next().css('display', 'none')){
								// if input value is empty remove error message and border
								target.next().hide();
								target.attr('class', '');
							}

						// validate url
						} else if(targetObj.formType === 'url') {
							// if url has more than 0 characters
							if(targetObj.formData.length>0) {
								// check if the url hasn't got 'http://' in the start of the url string 
								// and adds the http:// to the start of the url string if required
								if(targetObj.formData.indexOf('http://', 0) === -1){
									targetObj.formData = 'http://' + targetObj.formData;
									// add the http:// to the target value - the url input box (if the user didnt add  http://)
									target[0].value = targetObj.formData;
									
									if(urlRegExValidate.test(targetObj.formData)){
										// if the url is valid hide message
										target.next().hide();
										// add green border for valid url! :)
										target.attr('class', 'valid');
										// update the input box after check and add http:// to the url

										// store data to object frameInputData
										frameInputData[targetObj.formName]
													  [targetObj.formType]
													  [targetObj.storePlace-1] = targetObj.formData;
									} else {
										// color border and show error message
										// if the url is invalid show message
										// add red border for invalid url! :(
										target.attr('class', 'invalid').focus();
										target.next().show().text("Please fill a correct URL");
									}		
								}
								
							} else {
								// color border and show error message
								// if the url is valid hide it with the help of the class hidden
								target.next().show();
								// add red border for invalid url! :(
								target.attr('class', 'invalid').focus();
							} 
							if(targetObj.formData.length===0 && !target.next().css('display', 'none')){
								// if input value is empty remove error message and border
								target.next().hide();
								target.attr('class', '');
							}
						}
						return true;
					}

					// checks if entered field is valid and if its sibling field is valid
					function validatePlace(){
						
						if(validateForm()){
							// reset the emptyfields tester
							emptyFields = [];
							// check to see if both fields are filled

							if(targetObj.formType === 'name'){
								removeBoth();
								// check if the url sibling is filled (using the element id tag)
								if($('#' + targetObj.formName + '-url' + targetObj.storePlace)[0].value !== ''){
									// url is filled and also name
									if(!$('#' + targetObj.formName + '-name' + targetObj.storePlace).hasClass('invalid') 
										|| !$('#' + targetObj.formName + '-url' + targetObj.storePlace).hasClass('invalid')){
										removeBoth();
										emptyFields = ''; // clear tester
									}
									// check url has error - if true focus on it
									if(!$('#' + targetObj.formName + '-url' + targetObj.storePlace).next().css('display', 'none')){
										$('#' + targetObj.formName + '-url' + targetObj.storePlace).focus();
									}
								} else {
									// url is not filled

									// set focus on input with error message
									$('#' + targetObj.formName + '-url' + targetObj.storePlace).focus();
									// show error message
									$('#' + targetObj.formName + '-url' + targetObj.storePlace).next().show().text("Please fill in a URL");
								}
								if(targetObj.formData === '' && $('#' + targetObj.formName + '-url' + targetObj.storePlace)[0].value === ''){
									// name and url are empty - remove url message
									$('#' + targetObj.formName + '-url' + targetObj.storePlace).next().hide();
									$('#' + targetObj.formName + '-url' + targetObj.storePlace).removeClass('invalid');
									$('#' + targetObj.formName + '-name' + targetObj.storePlace).removeClass('invalid');
										// remove both url and name values from object
										//console.log('before: ' + frameInputData[targetObj.formName]['name'][targetObj.storePlace-1]);
										frameInputData[targetObj.formName]['name'][targetObj.storePlace-1] = '';
										//console.log('before: ' + frameInputData[targetObj.formName]['url'][targetObj.storePlace-1]);
										frameInputData[targetObj.formName]['url'][targetObj.storePlace-1] = '';
										// console.log(' name and url empty - update object too');
										emptyFields = 'empty';

								} else if(targetObj.formData === '' && $('#' + targetObj.formName + '-url' + targetObj.storePlace)[0].value !== '') {
									// name empty but url filled - show name error message
									$('#' + targetObj.formName + '-name' + targetObj.storePlace).next().show().text("Please fill in a name");
									emptyFields = ''; // clear tester
								}

							} else if(targetObj.formType === 'url'){
								removeBoth();
								// check if the name sibling is filled (using the element id tag)

								if($('#' + targetObj.formName + '-name' + targetObj.storePlace)[0].value !== ''){
									// name is filled and also url
									if(!$('#' + targetObj.formName + '-name' + targetObj.storePlace).hasClass('invalid') 
										|| !$('#' + targetObj.formName + '-url' + targetObj.storePlace).hasClass('invalid')){
										removeBoth();
										emptyFields = ''; // clear tester
									}
									// check name has error - if true focus on it
									if(!$('#' + targetObj.formName + '-name' + targetObj.storePlace).next().css('display', 'none')){
										$('#' + targetObj.formName + '-name' + targetObj.storePlace).focus();
									}
								} else {
									// name is not filled
									
									// set focus on input with error message
									$('#' + targetObj.formName + '-name' + targetObj.storePlace).focus();
									// show error message
									$('#' + targetObj.formName + '-name' + targetObj.storePlace).next().show().text("Please fill in a name");
								}
								if(targetObj.formData === '' && $('#' + targetObj.formName + '-name' + targetObj.storePlace)[0].value === ''){
									// name and url are empty - remove name message
									$('#' + targetObj.formName + '-name' + targetObj.storePlace).next().hide();
									$('#' + targetObj.formName + '-url' + targetObj.storePlace).removeClass('invalid');
									$('#' + targetObj.formName + '-name' + targetObj.storePlace).removeClass('invalid');
										// remove both url and name values from object
										//console.log('before: ' + frameInputData[targetObj.formName]['name'][targetObj.storePlace-1]);
										frameInputData[targetObj.formName]['name'][targetObj.storePlace-1] = '';
										//console.log('before: ' + frameInputData[targetObj.formName]['url'][targetObj.storePlace-1]);
										frameInputData[targetObj.formName]['url'][targetObj.storePlace-1] = '';
										
										//console.log('name and url empty update object too');
										emptyFields = 'empty';

								} else if(targetObj.formData === '' && $('#' + targetObj.formName + '-name' + targetObj.storePlace)[0].value !== '') {
									// url empty but name filled - show url error message
									$('#' + targetObj.formName + '-url' + targetObj.storePlace).next().show().text("Please fill in a URL");
									emptyFields = ''; // clear tester
								}
							}

						}
						return emptyFields; // return test resualt -> '' or 'empty'

					} // end of validate form

					function removeBoth(){
						$('#' + targetObj.formName + '-name' + targetObj.storePlace).removeClass('both');
						$('#' + targetObj.formName + '-url' + targetObj.storePlace).removeClass('both');
					};
										
					// run validation on keyboard change event
					webApp.inputsClearTest(validatePlace());

				}
			});
	    }, //end of frameEvents


//-----------------------//
// helper functions here
//-----------------------//

		hidePopUp: function(popUp){
			var popUpRef = popUp.href.match(re)[0];
			if(popUpRef === '#quick-reports'){
				popUpQr.hide();
			} else if(popUpRef === '#my-team-folders'){
				popUpMtf.hide();
			}
		}, // end of hide popup

		setIframe: function(lastTab, lastUrl, lastQr, lastMtf){
	    	for(var i=0; iframeWindows.length>i; i++){
	    		// [1] get url data from object and set both frames
    			console.log(iframeWindows.eq(i).parent()[0].id);
	    		if(iframeWindows.eq(i).parent()[0].id === 'quick-reports' && lastQr !== ''){
	    			iframeWindows.eq(i)[0].src = lastQr;
	    		} else if(iframeWindows.eq(i).parent()[0].id === 'my-team-folders'  && lastMtf !== ''){
	    			iframeWindows.eq(i)[0].src = lastMtf;
	    		}
	    		// [2] if lastFrame exists replace last index src with lastFrame src lick
	    		if(('#' + iframeWindows.eq(i).parent().id) === lastTab[0].href.match(re)[0]){
	    			iframeWindows.eq(i)[0].src = lastUrl;
	    		}
	    	}
	    }, // end of set iframe

	    setExpand: function(lastTab, lastUrl, lastQr, lastMtf){
	    	for(var i=0; expandButtons.length>i; i++){
	    		// [1] get url data from object and set both frames
	    		if(expandButtons.eq(i).attr('data') === 'qr' && lastQr !== ''){
	    			expandButtons.eq(i)[0].href = lastQr;
	    			expandButtons.eq(i).show();
	    		} else if(expandButtons.eq(i).attr('data') === 'mtf'  && lastMtf !== ''){
	    			expandButtons.eq(i)[0].href = lastMtf;
	    			expandButtons.eq(i).show();
	    		}
	    		// [2] if lastFrame exists replace last index src with lastFrame src lick
	    		if(expandButtons.eq(i).attr('data') === lastTab.attr('data')){
	    			expandButtons.eq(i)[0].href = lastUrl;
	    		}
	    	}
	    }, // end of set iframe
	    
	    inputsNDropdowns: function(restoredData){
	    	// fill inputs loop here
	    	for(var i = 0; inputs.length>i; i++){
	    		// if the id matches the object than put name value 
	    		// in right place and url value in the other place
	    		// check if object empty and dont insert data in empty input

	    		targetObj.formName = inputs[i].id.match(matchRe)[0]; // qr or mtf
				targetObj.formType = inputs[i].id.match(matchRe)[1]; // name or url
				targetObj.storePlace = inputs[i].id.match(matchRe)[2]; // place in form 1,2,3?
				targetObj.formData = restoredData[targetObj.formName][targetObj.formType][targetObj.storePlace-1];
				// fill input with the right data from the restored object 
				inputs[i].value = targetObj.formData;

				// fill frame inputs data so storage wont clear on dropdown change
				frameInputData[targetObj.formName]
							  [targetObj.formType]
							  [targetObj.storePlace-1] = targetObj.formData;
	    	}

	    	// build dropdowns here
	    	// if qr dropdown chlidern exist remove and update
			if(dropDownQr.children().length === 0){
				webApp.buildDropDown('qr', restoredData);
				if(dropDownQr.hasClass('hidden')){
					dropDownQr.removeClass('hidden');
				}
			}
			// if mtf dropdown chlidern exist remove and update
			if(dropDownMtf.children().length === 0){
				webApp.buildDropDown('mtf', restoredData);
				if(dropDownMtf.hasClass('hidden')){
					dropDownMtf.removeClass('hidden');
				}
			}

	    }, // end of inputs and dropdowns function

	    expendAndIframeSettings: function(formName, url){
			// show the expand button
			for(var j = 0; j < expandButtons.length; j++){
				//console.log(expandButtons);
				if(expandButtons.eq(j).attr('data') === formName){
					//console.log(expandButtons[j]);
					expandButtons.eq(j).show();
					// add last report link to the expand button
					expandButtons.eq(j)[0].href = url;
				}
			}

			// set last report url to iframe
			for(var j = 0; j < iframeWindows.length; j++){
				if(iframeWindows.eq(j).attr('data') === formName){
					// add last report link to the iframe
					iframeWindows.eq(j).src = url;
				}
			}
		}, // end of expand button and iframe settings function

		buildDropDown: function(formName, dataObject){
			if(formName){
				for(var i = 0; i < dataObject[formName].name.length; i++){
					if(dropDownQr.attr('data') === formName){
						//console.log('building qr dropdown');
						webApp.dropDownBuildProccess(dropDownQr, formName, i, dataObject);
					} else if(dropDownMtf.attr('data') === formName){
						//console.log('building mtf dropdown');
						webApp.dropDownBuildProccess(dropDownMtf, formName, i, dataObject);
					}
				}

				if(formName === 'qr'){
					// set selected to last element with content
					for(var i = dropDownQr.children().length-1; i >= 0; i--){
						if(dropDownQr[0].children[i].textContent !== ''){
							dropDownQr[0].children[i].setAttribute('selected', 'selected');
							webApp.expendAndIframeSettings('qr', dropDownQr[0].children[i].value);
							// set hash to form name and selected report
							if(dataObject.lastHash === ''){
								location.hash = tabHash + '/' + dropDownQr[0].children[i].textContent;
								frameInputData.lastHash = location.hash; // store hash to object
							}
							return;
						}
					}
				} 
				if(formName === 'mtf'){
					// set selected to last element with content
					for(var i = dropDownMtf.children().length-1; i >= 0; i--){
						if(dropDownMtf[0].children[i].textContent !== ''){
							dropDownMtf[0].children[i].setAttribute('selected', 'selected');
							webApp.expendAndIframeSettings('qr', dropDownMtf[0].children[i].value);
							// set hash to form name and selected report
							if(dataObject.lastHash === ''){
								location.hash = tabHash + '/' + dropDownMtf[0].children[i].textContent;
								frameInputData.lastHash = location.hash; // store hash to object
							}
							return;
						}
					}
				}
			}
		}, // end of build drop down menu function

		dropDownBuildProccess: function(dropDownElm, form, inc, dataObject){
			var opText = dataObject[form].name[inc],
				opVal = dataObject[form].url[inc];
			dropDownElm.append($('<option value='+opVal+'>'+opText+'</option>'));
		}, // end of dropdown נbuild proccess function

		inputsClearTest: function(test){
			// reset value container array
			inputValueTest = [];
			inputValueForm = [];
			var qrCount = 0, 
				mtfCount = 0;
			// check if all field are empty and reset dropdown and local storage
			if(test === 'empty'){
				for(var i = 0; i<inputs.length; i++){
					inputValueTest.push(inputs[i].value); // insert all values to array
					inputValueForm.push(inputs[i].id.match(matchRe)[0]); // insert form name to array
				}
				//console.log(inputValueTest);
				//console.log(inputValueForm);
				for(var i = 0; i<inputValueTest.length; i++){
					if(inputValueTest[i] !== ''){
						//console.log(inputValueForm[i] + ' form not empty');
						if(inputValueForm[i] === 'qr'){
							qrCount++;
						} else if(inputValueForm[i] === 'mtf'){
							mtfCount++;
						}
					}
					
				}

				/*****
						frameInputData = {
							qr: {	name: ['','',''],
									url: ['','','']
									},
							mtf: {	name: ['','',''],
									url: ['','','']
									}
				*****/

				// case 1 - qr fields all empty
				if(qrCount === 0){
					//console.log('qr all empty update object');
					// clear all data from object frameInputData on qr
					frameInputData.qr.name = ['','',''];
					frameInputData.qr.url = ['','',''];
					
					$('.expand[data="qr"]').hide();
					$('.expand[data="mtf"]')[0].href = '';
					$('iframe[data="qr"]').src = '';

				} 
				// case 2 - mtf fields all empty
				else if(mtfCount === 0){
					//console.log('mtf all empty update object');
					// clear all data from object frameInputData on mtf
					frameInputData.mtf.name = ['','',''];
					frameInputData.mtf.url = ['','',''];

					$('.expand[data="mtf"]').hide();
					$('.expand[data="mtf"]')[0].href = '';
					$('iframe[data="mtd"]').src = '';
					
				}
				// case 3 - all empty
				if(inputValueTest.toString() === ''){
					console.log('all inputs are clear');
				}
			}
		}, // end of inputs clear test

        resetClass: function(elm, className, classChange){
            for(var i = 0; i < elm.length; i++){
                // if li has class active remove and set the selected li to be active
                if(elm.eq(i).attr('class') === className){
                    elm.eq(i).attr('class', classChange);
                }
            }
        }, // end of has class helper
        multiAddClass: function(elm, addedClass){
            for(var i=0; i<elm.length; i++){
                elm.eq(i).attr('class', elm.attr('class') + " " + addedClass);      
            }
        },
        multiRemoveClass: function(elm, removedClass){
            for(var i=0; i<elm.length; i++){
                elm.eq(i).removeClass(removedClass);      
            }
        },

		// a simple workaround to prevent hash jump by Lea Verou: 
        // http://lea.verou.me/2011/05/change-url-hash-without-page-jump/
        hashHelper : function(hashChange){
            if(history.pushState) {
                history.pushState(null, null, hashChange);
            }
            else {
                location.hash = hashChange;
            }
        }, // end of hash helper

		cookieHandler: (function(){
            return {
                set: function(cookieName, cookieVal, expDate){
                    var d = new Date();
                    d.setTime(d.getTime() + (expDate*24*60*60*1000));
                    var expires = 'expires=' + d.toUTCString();
                    document.cookie = cookieName + '=' + cookieVal + '; ' + expires;        
                },
                get: function(cookieName){
                    var name = cookieName + "=",
                    cookieData = document.cookie.split(';');

                    for(var i=0; i<cookieData.length; i++) {
                        var c = cookieData[i];
                        while (c.charAt(0)==' ') c = c.substring(1);
                        if (c.indexOf(name) == 0) {
                            console.log(c.substring(name.length, c.length));
                            return JSON.parse(c.substring(name.length, c.length));
                        }
                    }
                    return null;
                },
                check: function(){
                    var data = this.get('data');
                    if (data !== null) {
                        return data;
                    } else {
                        // if no data set return null
                        return null;
                    }
                }
            }
        })() // end of cookieHandler

	}; // end of webApp
	webApp.init();
};