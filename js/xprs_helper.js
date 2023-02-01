/******************************************************************************************************
 *                                             XPRS HELPER - SHARED FUNCTIONS 
 ******************************************************************************************************/

var XPRSHelper = {};
XPRSHelper.currentUser = {};


XPRSHelper.LOCAL_SERVER_PATH = "http://localhost:7000";
XPRSHelper.PRODUCTION_SERVER_PATH = "/";
XPRSHelper.RELATIVE_SERVER_PATH = "";
XPRSHelper.devMode = "PRODUCTION";
XPRSHelper.saveQueue = {"PENDING":{},"ERRED":{},"COMPLETED":{},"FUTURE":{}};
XPRSHelper.presetTypes = {
		"APPS":{"TYPE":"PROMO","NAME":"Widgets","GROUP":"SLIDESHOWS","PAGE":1},
		"FEATURES":{"TYPE":"FEATURES","NAME":"Features","GROUP":"FEATURES","PAGE":1},
		"TEAM":{"TYPE":"TEAM","NAME":"Team","GROUP":"FEATURES","PAGE":1},
		"LOGOS":{"TYPE":"LOGOS","NAME":"Logos","GROUP":"FEATURES","PAGE":1},
		"TESTIMONIALS":{"TYPE":"TESTIMONIALS","NAME":"Testimonials","GROUP":"SLIDESHOWS","PAGE":1},
		"PROJECTS":{"TYPE":"PROJECTS","NAME":"Projects","GROUP":"FEATURES","PAGE":1},
		"GALLERIES":{"TYPE":"GALLERIES","NAME":"Gallery","GROUP":"GALLERIES","PAGE":1},
		"BLOG":{"TYPE":"BLOG","NAME":"Blog","GROUP":"GALLERIES","PAGE":1},
		"STORE":{"TYPE":"STORE","NAME":"Store","GROUP":"GALLERIES","PAGE":1},
		"TEXT_BLOCK":{"TYPE":"TEXT_BLOCK","NAME":"Text Block","GROUP":"ITEMS","PAGE":1},
		"ARTICLE":{"TYPE":"ARTICLE","NAME":"Article","GROUP":"ITEMS","PAGE":1},
		"HEADER":{"TYPE":"HEADER","NAME":"Header","GROUP":"ITEMS","PAGE":1},
		"CALL_TO_ACTION":{"TYPE":"CALL_TO_ACTION","NAME":"Call to action","GROUP":"ITEMS","PAGE":1},
		"ITEMS":{"TYPE":"ITEMS","NAME":"Item","GROUP":"ITEMS","PAGE":1},
		"PROMO":{"TYPE":"PROMO","NAME":"Header","GROUP":"SLIDESHOWS","PAGE":1},
		"FORM":{"TYPE":"FORM","NAME":"Forms","GROUP":"ITEMS","PAGE":1},
		"SLIDESHOWS":{"TYPE":"SLIDESHOWS","NAME":"Slideshow","GROUP":"SLIDESHOWS","PAGE":1},
		"FOOD_MENU":{"TYPE":"FOOD_MENU","NAME":"Food Menu","GROUP":"FEATURES","PAGE":1},
		"MAPS":{"TYPE":"MAPS","NAME":"Maps","GROUP":"SLIDESHOWS","PAGE":1},
		"VIDEOS":{"TYPE":"VIDEOS","NAME":"Videos","GROUP":"SLIDESHOWS","PAGE":1},
		"RESERVATION":{"TYPE":"RESERVATION","NAME":"Reservations","GROUP":"ITEMS","PAGE":1},
		"STORIES":{"TYPE":"STORIES","NAME":"Stories","GROUP":"FEATURES","PAGE":1},
		"PRICING":{"TYPE":"PRICING","NAME":"Pricing","GROUP":"FEATURES","PAGE":1},
		"SERVICES":{"TYPE":"SERVICES","NAME":"Services","GROUP":"FEATURES","PAGE":1},
		"SOCIAL_ICONS":{"TYPE":"SOCIAL_ICONS","NAME":"Social","GROUP":"FEATURES","PAGE":1},
		"BIO_CV":{"TYPE":"BIO_CV","NAME":"Bio / Cv","GROUP":"ITEMS","PAGE":1},
		"TABLES":{"TYPE":"TABLES","NAME":"Tables","GROUP":"FEATURES","PAGE":1},
		"MENUS":{"TYPE":"MENUS","NAME":"Menu","GROUP":"MENUS","COLOR":"#6666FF"},
		"FOOTERS":{"TYPE":"FOOTERS","NAME":"Footer","GROUP":"FOOTERS","PAGE":1},
		"SELF":{"TYPE":"SELF","NAME":"Self","GROUP":"WIDGETS","PAGE":1,"COLOR":"#5D99C2"},
		//ELEMENT
		"TITLE":{"TYPE":"TITLE","NAME":"Title","GROUP":"ELEMENTS","COLOR":"#0f95ee","PAGE":2},
		"PIC":{"TYPE":"PIC","NAME":"Pic","GROUP":"ELEMENTS","COLOR":"#00cc99","PAGE":2},
		"DRAGGABLE_PIC":{"TYPE":"DRAGGABLE_PIC","NAME":"Draggable image","GROUP":"ELEMENTS","COLOR":"#00cc99","PAGE":2},
		"SUBTITLE":{"TYPE":"SUBTITLE","NAME":"Subtitle","GROUP":"ELEMENTS","COLOR":"#336667","PAGE":2},
		"VIDEO":{"TYPE":"VIDEO","NAME":"Video","GROUP":"ELEMENTS","COLOR":"#6766cc","PAGE":2},
		"BODY":{"TYPE":"BODY","NAME":"Body","GROUP":"ELEMENTS","COLOR":"#ff679a","PAGE":2},
		"QUOTE":{"TYPE":"QUOTE","NAME":"Quote","GROUP":"ELEMENTS","COLOR":"#FF9933","PAGE":2},
		"LINK":{"TYPE":"LINK","NAME":"Link","GROUP":"ELEMENTS","COLOR":"#663398","PAGE":2},
		"ICON":{"TYPE":"ICON","NAME":"Icon","GROUP":"ELEMENTS","COLOR":"#996533","PAGE":2},
		"MAP":{"TYPE":"MAP","NAME":"Map","GROUP":"ELEMENTS","COLOR":"#0099cb","PAGE":2},
		"HTML":{"TYPE":"HTML","NAME":"HTML","GROUP":"UNRESOLVED","COLOR":"#999999","PAGE":0},
		"DIVIDER":{"TYPE":"DIVIDER","NAME":"Divider","GROUP":"UNRESOLVED","COLOR":"#BDB76B","PAGE":0},
		"RAW":{"TYPE":"RAW","NAME":"Raw","GROUP":"ELEMENTS","COLOR":"#5a5a5a","PAGE":2},
		//UNRESOLVED
		"UNRESOLVED":{"TYPE":"UNRESOLVED","NAME":"","GROUP":"UNRESOLVED","COLOR":"","PAGE":0},
		"SOCIAL":{"TYPE":"SOCIAL","NAME":"","GROUP":"UNRESOLVED","COLOR":"#333","PAGE":0},
		"IMAGE":{"TYPE":"IMAGE","NAME":"Pic","GROUP":"UNRESOLVED","COLOR":"#00cc99","PAGE":0},
		"LABEL":{"TYPE":"LABEL","NAME":"Label","GROUP":"UNRESOLVED","COLOR":"#663398","PAGE":0},
		"FIELD":{"TYPE":"FIELD","NAME":"Field","GROUP":"UNRESOLVED","COLOR":"#FF9900","PAGE":0},
		"PRICE":{"TYPE":"PRICE","NAME":"PRICE","GROUP":"UNRESOLVED","COLOR":"#339966","PAGE":0}, // ECOMMERCE
		"CART":{"TYPE":"CART","NAME":"Cart","GROUP":"UNRESOLVED","COLOR":"#00CC99","PAGE":0}, // ECOMMERCE
		"QUOTE_AUTHOR":{"TYPE":"QUOTE_AUTHOR","NAME":"Quote Author","GROUP":"UNRESOLVED","COLOR":"#FF9933","PAGE":0},
		"INLINE_PIC":{"TYPE":"INLINE_PIC","NAME":"Image","GROUP":"UNRESOLVED","COLOR":"#00CC99","PAGE":0},
		"INLINE_RAW":{"TYPE":"INLINE_RAW","NAME":"HTML Box","GROUP":"UNRESOLVED","COLOR":"#3411CC","PAGE":0}
};

XPRSHelper.inPresetGroup = function(presetId,presetGroup){
	if (presetId in XPRSHelper.presetTypes){
		return  (XPRSHelper.presetTypes[presetId]["GROUP"] == presetGroup);
	}
	return false;
};

XPRSHelper.getServerPath = function(){
	if ($("body").attr("data-server")){
		return $("body").attr("data-server");
	}else{
		return XPRSHelper.RELATIVE_SERVER_PATH;	
	}
};

XPRSHelper.getStaticServerPath = function(){
	return $("body").attr("data-static-server");
};


XPRSHelper.getXprsCookie = function(cookieName){
	cookieName = cookieName.replace("xprs","imxprs");
	try {
		return $.cookie(cookieName);
	} catch(err) {
		var name = cookieName + "=";
	    var ca = document.cookie.split(';');
	    for(var i = 0; i <ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) == 0) {
	            return c.substring(name.length,c.length);
	        }
	    }
	}
	
};

XPRSHelper.setXprsCookie = function(cookieName,cookieValue){
	var secure = (location.protocol == 'https:') ? ";secure;" : "" ;
	cookieName = cookieName.replace("xprs","imxprs");
	if (window.location.href.indexOf("imcreator.com") == -1){
		document.cookie = cookieName + '=' + cookieValue + '; expires=Fri, 27 Jul 2030 02:47:11 UTC; path=/' + secure;
	}else{
		document.cookie = cookieName + '=' + cookieValue + '; expires=Fri, 27 Jul 2030 02:47:11 UTC; domain=.imcreator.com; path=/';
	}
};

XPRSHelper.removeXprsCookie = function(cookieName){
	cookieName = cookieName.replace("xprs","imxprs");
	if (window.location.href.indexOf("imcreator.com") == -1){
		document.cookie = cookieName + '=invalid; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
	}else{
		document.cookie = cookieName + '=invalid; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.imcreator.com; path=/';
	}
};

XPRSHelper.getUrlParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

XPRSHelper.updateParent = function(msg) {
	XPRSHelper.getParentWindow().postMessage(msg, '*');
};


XPRSHelper.GET = function(getPath, params, callbackFunc,responseType, errorCallback){
	if (getPath == "SKIP"){
		if (typeof callbackFunc != "undefined"){
			callbackFunc({});
		}
		return;
	}
	if (typeof EditorHelper != "undefined"){
		params["root_id"] = EditorHelper.getRootId();
		params["page_id"] = EditorHelper.getPageId();
	}else if (typeof SpimeDualView != "undefined"){
		params["root_id"] = SpimeDualView.getRootId();
	}
	$.get(XPRSHelper.getServerPath() + getPath, params, function(data) {
		if (typeof callbackFunc != "undefined"){
			callbackFunc(data);
		}
	},responseType).fail(function(xhr, textStatus, errorThrown) {
		try{
			if (typeof errorCallback != "undefined"){
				errorCallback();
			}
			XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":getPath,"ajax_params":JSON.stringify(params)});
		    window.console.error(text);
		}catch (ex) {}
	 });
};

XPRSHelper.GETCORS = function(postPath, params, callbackFunc,responseType){
	$.ajax({
		  type: "GET",
		  url: XPRSHelper.getServerPath() + postPath,
		  data: params,
		  xhrFields: {
	           withCredentials: true
	      },
	      crossDomain: true,
		  success: function(data) {
				if (typeof callbackFunc != "undefined"){
					callbackFunc(data);
				}
		  },
		  dataType: responseType
		}).fail(function(xhr, textStatus, errorThrown) {
			try{
				XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":getPath,"ajax_params":JSON.stringify(params)});
			    window.console.error(text);
			}catch (ex) {}
		 });
};


XPRSHelper.POST = function(postPath, params, callbackFunc,responseType,callbackOnly){
	if (callbackOnly){
		if (typeof callbackFunc != "undefined"){
			callbackFunc();
		} 
		return;
	}
	if (typeof EditorHelper != "undefined"){
		params["root_id"] = EditorHelper.getRootId();
		params["page_id"] = EditorHelper.getPageId();	
	}else if (typeof SpimeDualView != "undefined"){
		params["root_id"] = SpimeDualView.getRootId();
	}
	return $.ajax({
		  type: "POST",
		  url: XPRSHelper.getServerPath() + postPath,
		  data: params,
		  success: function(data) {
				if (typeof callbackFunc != "undefined"){
					callbackFunc(data);
				}
		  },
		  dataType: responseType
		}).fail(function(xhr, textStatus, errorThrown) {
			try{
				XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":getPath,"ajax_params":JSON.stringify(params)});
			    window.console.error(text);
			}catch (ex) {}
		 });
};

XPRSHelper.POSTCORS = function(postPath, params, callbackFunc,responseType){
	$.ajax({
		  type: "POST",
		  xhrFields: {
	           withCredentials: true
	      },
	      crossDomain: true,
		  url: XPRSHelper.getServerPath() + postPath,
		  data: params,
		  success: function(data) {
				if (typeof callbackFunc != "undefined"){
					callbackFunc(data);
				}
		  },
		  dataType: responseType
		}).fail(function(xhr, textStatus, errorThrown) {
			try{
				XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":getPath,"ajax_params":JSON.stringify(params)});
			    window.console.error(text);
			}catch (ex) {}
		 });
};


XPRSHelper.SAFEPOST = function(url,params,saveKey,saveName,callbackFunc,callbackOnly){
	if (callbackOnly){
		if (typeof callbackFunc != "undefined"){
			callbackFunc();
		} 
		return;
	}
	if (XPRSHelper.pendingActionExists(saveKey) || XPRSHelper.futureQueueSize(saveKey) > 0){
		if (XPRSHelper.pendingActionExists(saveKey)){
		}else if (XPRSHelper.futureQueueSize(saveKey) > 0){
		}
		XPRSHelper.addToFutureQueue(saveKey,url,saveName,params,callbackFunc);
		return;
	}else{
		XPRSHelper.markAsPending(saveKey);
	}
	if (typeof EditorHelper != "undefined"){
		params["root_id"] = EditorHelper.getRootId();
		params["page_id"] = EditorHelper.getPageId();
	}else if (typeof SpimeDualView != "undefined"){
		params["root_id"] = SpimeDualView.getRootId();
	}
	$.ajax({
		  type: "POST",
		  url: XPRSHelper.getServerPath() + url,
		  data: params,
		  success: function(result) {
			  if (result.response == "SUCCESS"){
				  XPRSHelper.updateSaveQueue(saveKey,"PENDING","COMPLETED",result);
				  XPRSHelper.updateParent({"deliver_to":"parent","action":"saved"});
				  if (typeof callbackFunc != "undefined"){
						callbackFunc(result);
				  }
				  if (typeof XPRSUndo != "undefined"){
					  XPRSUndo.pushHistoryEntry({"key":saveKey,"url":url,"name":saveName,"params":params});
				  }
			  }else{
				  //handle error!!
				  console.log("got error for key " + saveKey + " with result " + JSON.stringify(result));
				  XPRSHelper.updateSaveQueue(saveKey,"PENDING","ERRED",result);
			  }
		  },
		  dataType: "json"
		}).fail(function(xhr, textStatus, errorThrown) {
			try{
				XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":url,"ajax_params":JSON.stringify(params)});
			    window.console.error(text);
			}catch (ex) {}
		 }).always(function(){
			 if (XPRSHelper.futureQueueSize(saveKey) > 0){
				var nextAction = XPRSHelper.getNextSaveAction(saveKey);
				if (nextAction != null){
					console.log("found a new action, for key "  + saveKey + " calling future action")
					setTimeout(function(){
						XPRSHelper.SAFEPOST(nextAction.url,nextAction.params,nextAction.saveKey,nextAction.saveName,nextAction.callback);	
					},1000)
					
				}
			}
		 });
	
};


XPRSHelper.pendingActionExists = function(saveKey){
	return (saveKey in XPRSHelper.saveQueue["PENDING"]);
};

XPRSHelper.markAsPending = function(saveKey){
	XPRSHelper.saveQueue["PENDING"][saveKey] = true;
};



XPRSHelper.addToFutureQueue = function(saveKey,url,saveName,params,callback){
	var action = {};
	action.url = url;
	action.params = params;
	action.saveKey = saveKey;
	action.saveName = saveName;
	action.callback = callback;
	if (!(saveKey in XPRSHelper.saveQueue["FUTURE"])){
		XPRSHelper.saveQueue["FUTURE"][saveKey] = [];
	}
	XPRSHelper.saveQueue["FUTURE"][saveKey].push(action);
};

XPRSHelper.futureQueueSize = function(saveKey){
	var size = 0;
	if (saveKey in XPRSHelper.saveQueue["FUTURE"]){
		size = XPRSHelper.saveQueue["FUTURE"][saveKey].length
	}
	return size;
};

XPRSHelper.updateSaveQueue = function(saveKey,fromState,toState,result){
	XPRSHelper.saveQueue[toState][saveKey] = true;
	delete XPRSHelper.saveQueue[fromState][saveKey];
};

XPRSHelper.getNextSaveAction = function(saveKey){
	var nextAction = null;
	if (saveKey in XPRSHelper.saveQueue["FUTURE"]){
		var nextAction = XPRSHelper.saveQueue["FUTURE"][saveKey].pop();
		if (XPRSHelper.saveQueue["FUTURE"][saveKey].length == 0){
			delete XPRSHelper.saveQueue["FUTURE"][saveKey];
		}
	}
	return nextAction;
};

XPRSHelper.localServer = function(){
	try{
		return (XPRSHelper.getParentWindow().location.href.indexOf("localhost") != -1);
	}catch(err){};
};

XPRSHelper.clonePrefix = function() {
	return 'xxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};

XPRSHelper.onCssTransitionFinish = function(obj,callbackFunc){
		if (typeof callbackFunc != "undefined"){
			callbackFunc();
		}
};

XPRSHelper.signout = function(labelName){
	XPRSHelper.removeXprsCookie("xprs_user");
	XPRSHelper.removeXprsCookie("xprs_root");
	XPRSHelper.removeXprsCookie("xprs_session");
	XPRSHelper.removeXprsCookie("xprs_email");
	XPRSHelper.updateParent({"deliver_to":"parent","action":"remove_navigation_confirmation"});
	if (typeof labelName != "undefined" && labelName == "bricksite"){
		XPRSHelper.getParentWindow().location.href = "https://admin.bricksite.net/logout.php";
	}else{
		XPRSHelper.getParentWindow().location.href = "/";
	}
};


XPRSHelper.getCurrentUser = function(callbackFunc){
	XPRSHelper.GET("/get_loggedin_user",{},function(userObj){
		XPRSHelper.currentUser = userObj;
		if (typeof callbackFunc != "undefined"){
			callbackFunc();
		}
	},"json");
};



XPRSHelper.trackEvent = function(eventName, category, label, eventValue, skipBi){
	if (typeof YSBApp == "undefined"){
		if (typeof eventValue == "undefined"){
			eventValue = 0;
		}
		if (typeof ga != "undefined"){
			if (typeof ANALYTICS_CODES != "undefined"){
				for (i in ANALYTICS_CODES){
						var analyticsName = ANALYTICS_CODES[i]["name"];
			  		ga('send', {
						  'hitType': 'event',          // Required.
						  'eventCategory': category,   // Required.
						  'eventAction': eventName,      // Required.
						  'eventLabel': label,
							'eventValue':eventValue
					});
					ga('send', 'pageview', {
						  'page': eventName,
						  'title':eventName
					});
				}
			}
			
		}
		try{
			if (typeof IMOS != "undefined"){
				var ourGoals = {"Registration":true,"Premium":true,"Whitelabel Premium":true};
				if (eventName in ourGoals){
					//will be tracked from the goal function
					try{
						if (typeof ga != "undefined"){
							if (eventName != "Registration"){
								ga('ecommerce:addTransaction', {
									'id': eventName,                     // Transaction ID. Required.
									'revenue': eventValue             // Grand Total.
								});
								ga('ecommerce:addItem', {
									'id': label,                     // Transaction ID. Required.
									'name': label,    // Product name. Required.
									'price': eventValue,                 // Unit price.
									'quantity': '1'                   // Quantity.
								});
								ga('ecommerce:send');
							}
						}
					} catch(e){
						console.log(e)
					}
					  
				}else{
					IMOS.trackEvent(eventName);	
				}
			}
			if (typeof Intercom != "undefined"){
				if (eventName.indexOf("-Publish") == -1 && eventName.indexOf("-Pay") == -1 && eventName.indexOf("-Select") == -1){
					Intercom('trackEvent', eventName, {value:label});
				}
				if (eventName == "clicked become a reseller"){
					if (typeof Intercom != "undefined"){
						Intercom('update', {"visited whitelabel form": true});
					}
				}
			}

			if (typeof imosSdk != "undefined"){
				imosSdk.customEvent(eventName);
			}
		} catch (err){
			console.log("failed to track imos");
		}
	}
	if (!skipBi){
		XPRSHelper.POST("/track_user_action", {"event_name":eventName,"url":window.location.href,"extra_data":label});
	}
};


XPRSHelper.getParentWindow = function(){
	if (typeof SpimeDualView != "undefined"){
		return window.self
	}
	try { 
		if (window.parent.location.href){
			return window.parent;
		}
	}catch (err){
		return window.self;
	}
};


XPRSHelper.changeHash = function(newHash){
	XPRSHelper.getParentWindow().location.hash = newHash;
};


XPRSHelper.imagePreloader = function(arrayOfImages,containingFolder,suffix) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = containingFolder + "/" + this + "." + suffix;
    });
};



XPRSHelper.renderTip = function(tipIndex){
	tooltTips = [
		     		{
			     		"category":"Adding Sections",
			     		"title":"Add a new section to your page",
			     		"content":"Click to add  text, pictures, gallery, slideshow, contact form and more.",
			     		"direction":"bottom-left",
			     		"selector":"#add-stripe",
			     		"container_selector":".master.item-box:visible:not(.force-transparency):not(.element-box):not(.header-box) + .control-handle:eq(0) .add-stripe-holder",
			     		"frame":"viewer",
			     		"circle_offset_left":38,
			     		"circle_offset_top":40//,
			     	},
		     		{
			     		"category":"Editing Content",
			     		"title":"Click & edit any element",
			     		"content":"Click any element and insert your own content: text, pictures and more.",
			     		"direction":"bottom-right",
			     		"selector":".text-element",
			     		"container_selector":".master.item-box:not(.header-box)",
			     		"frame":"viewer",
			     		"circle_offset_left":0,
			     		"circle_offset_top":37
			     	},
		     		{
			     		"category":"Adding Pages",
			     		"title":"Add a new page to your site",
			     		"content":"Click to add a new page: about, blog, gallery, contact and more",
			     		"direction":"top-right",
			     		"selector":"#pages-menu-btn, .pages-dropdown",
			     		"container_selector":"#control-panel-left, #control-panel .left-side",
			     		"frame":"dual",
			     		"circle_offset_left":15,
			     		"circle_offset_top":29
		     		},
		     		{
			     		"category":"Responsive",
			     		"title":"Preview on all devices",
			     		"content":"See how your website looks on tablets and mobile phones",
			     		"direction":"top-right",
			     		"selector":"#preview-menu-btn, .preview-dropdown",
			     		"container_selector":"#control-panel-right, #control-panel .right-side",
			     		"frame":"dual",
			     		"circle_offset_left":8,
			     		"circle_offset_top":27
			     	},
		     		{
			     		"category":"Publish",
			     		"title":"Publish your site",
			     		"content":"When you finish editing your site, click Publish to connect to a domain and share your site with the world.",
			     		"direction":"top-right",
			     		"selector":"#publish-btn, .topbar-publish",
			     		"container_selector":"body",
			     		"frame":"dual",
			     		"circle_offset_left":-19,
			     		"circle_offset_top":28
					 },
		     		{
			     		"category":"History",
			     		"title":"Undo certain actions",
			     		"content":"Undo 'delete', 'add' and 'order' actions",
			     		"direction":"bottom-left",
			     		"selector":"#undo-btn",
			     		"container_selector":"body",
			     		"frame":"dual",
			     		"circle_offset_left":40,
			     		"circle_offset_top":28
			     	}
		     	];
	tipObj = tooltTips[tipIndex];
	if (!tipObj){
		return;
	}
	var tooltipWrapper = $("<div class='tooltip-wrapper tooltip-ui tooltip-ui"+ tipIndex +"'  />");
	var tooltipHolder = $("<div class='tooltip-holder' />");
	var availableContainers = $(tipObj.container_selector);
	var tooltipRefrenceContainer = availableContainers.first();
	
	
	

	
	var tooltipRefrenceElement = tooltipRefrenceContainer.find(tipObj.selector).first();
	if (tooltipRefrenceElement.length == 0){
		if (availableContainers.length > 1){
			tooltipRefrenceContainer = availableContainers.eq(1);
			tooltipRefrenceElement = tooltipRefrenceContainer.find(tipObj.selector);
		}
	}
	var lastTip = false;
	var nextTipIndex = tipIndex + 1;
	if (nextTipIndex == tooltTips.length){
		lastTip = true;
	}
	//No such reference element, skip
	if (tooltipRefrenceElement.length == 0){
		XPRSHelper.renderTip(nextTipIndex);
		console.log("didn't find")
		return;
	}
	var tooltipcategory = $("<div class='tooltip-category t-t' />").text(tipObj.category);
	var tooltipTitle = $("<div class='tooltip-title t-t' />").text(tipObj.title);
	var tooltipContent = $("<div class='tooltip-content t-t' />").html(tipObj.content);
	
	nextBtnText = (lastTip) ? "got it" : "next";
	
	var tooltipNextTip = $("<div class='tooltip-next tooltip-btn t-t' />").text(nextBtnText);
	var tooltipHideTip = $("<div class='tooltip-hide tooltip-btn t-t' />").text("hide");
	
	tooltipNextTip.unbind("click").bind("click",function(e){
		e.stopPropagation();
		$(".tooltip-ui" + tipIndex).remove();
		if (tipObj.generate_click){
			tooltipRefrenceElement.trigger("click");
		}
		XPRSHelper.updateParent({"deliver_to":"viewer","action":"remove-tooltips", "tooltip_index":tipIndex});
		if ( !lastTip ){
			XPRSHelper.renderTip(nextTipIndex);
		}else{
			XPRSHelper.updateParent({"deliver_to":"parent","action":"remove-tooltips", "tooltip_index":tipIndex});
		}
	});
	
	var tooltipCircle = $("<div class='tooltip-circle tooltip-ui tooltip-ui"+ tipIndex +"'' />");
	
	tooltipCircle.unbind("click").bind("click",function(event) {
		event.stopPropagation();
		XPRSHelper.updateParent({"deliver_to":"parent","action":"remove-tooltips"});
		tooltipRefrenceElement.click();
	});
	
	if (tipObj.generate_click){
		setTimeout(function(){
			tooltipRefrenceElement.trigger("click");
		},1500)
	}
	
	tooltipHideTip.unbind("click").bind("click",function(e){
		e.stopPropagation();
		XPRSHelper.updateParent({"deliver_to":"viewer","action":"remove-tooltips", "tooltip_index":tipIndex});
		XPRSHelper.updateParent({"deliver_to":"parent","action":"remove-tooltips", "tooltip_index":tipIndex});
	});
	
	
	
	tooltipHolder.append(tooltipcategory).append(tooltipTitle).append(tooltipContent).append(tooltipHideTip).append(tooltipNextTip);
	tooltipWrapper.append(tooltipHolder);
	
	tooltipRefrenceContainer.append(tooltipCircle);
	tooltipRefrenceContainer.append(tooltipWrapper);

	if (tipObj.frame == "dual"){
		tooltipWrapper.css("position", "fixed");
		tooltipCircle.css("position", "fixed");
	}else{
		tooltipWrapper.css("position", "");
		tooltipCircle.css("position", "");
	}
	var scrollOffset = 0;
	scrollOffset = $('.main-page').scrollTop();

	tooltipCircle.offset({ top: tooltipRefrenceElement.offset().top - tipObj.circle_offset_top, left: tooltipRefrenceElement.offset().left - tipObj.circle_offset_left});
	
	

	
	var preferredDirection = tipObj.direction;
	var calculatedLeft = 0;
	var calculatedTop = 0;
	if (preferredDirection.indexOf("bottom") != -1){
		calculatedTop = tooltipCircle.position().top - tooltipWrapper.innerHeight() + 40;
	}else{
		calculatedTop = tooltipCircle.position().top + tooltipCircle.innerHeight() - 40;
	}
	
	if (preferredDirection.indexOf("left") != -1){
		calculatedLeft = tooltipCircle.position().left + tooltipCircle.innerWidth() - 40;
	}else{
		calculatedLeft = tooltipCircle.position().left - tooltipWrapper.innerHeight();
	}
	
	if (calculatedTop < 0 && preferredDirection.indexOf("bottom") != -1 && tipObj.selector != "#add-stripe"){
		preferredDirection = preferredDirection.replace("bottom","top");
		calculatedTop = tooltipCircle.position().top + tooltipCircle.innerHeight() - 40;
	}
	
	if (calculatedLeft < 0 && preferredDirection.indexOf("right") != -1 ){
		preferredDirection = preferredDirection.replace("right","left");
		calculatedLeft = tooltipCircle.position().left + tooltipCircle.innerWidth() - 40;
	}else if(calculatedLeft +  tooltipWrapper.width() > parseInt($("document").width()) && preferredDirection.indexOf("left") != -1){
		preferredDirection = preferredDirection.replace("right","left");
		calculatedLeft = tooltipCircle.position().left - tooltipWrapper.innerHeight();
	}
	
	tooltipWrapper.css("left",calculatedLeft);
	tooltipWrapper.css("top",calculatedTop );
	tooltipWrapper.addClass(preferredDirection);
	
	
	if (tipObj.frame == "viewer"){
		var topmostComponent = Math.min(tooltipCircle.offset().top,tooltipWrapper.offset().top);
		var scrollto = topmostComponent - $('.main-page').offset().top + $('.main-page').scrollTop();
		
	    var offset = tooltipCircle.offset().top;
	    var visibleAreaStart = $(window).scrollTop();
	    var visibleAreaEnd = visibleAreaStart + window.innerHeight;
	    if(offset < visibleAreaStart || offset > visibleAreaEnd){
	         // Not in view so scroll to it
	    	$('body,html').animate({scrollTop:scrollto},2000,'easeOutQuart');
	    }
	}
	
	XPRSTranslator.translateDom(tooltipWrapper);
	
	setTimeout(function(){
		tooltipRefrenceContainer.addClass("tip-highlight");
	},500);

};


XPRSHelper.xprsAlert = function(msg,params){
	if (typeof swal == "undefined"){
		console.error("XPRS Error: " + msg + " " + JSON.stringify(params));
		return;
	}
	
	if (typeof params == "undefined"){
		params = {};
		params["title"] = "_";
	}
	params["confirmButtonColor"]="#0099CC";
	params["customClass"] = "xprs-alert";
	if (params && !params["do_not_translate"]){
		msg = XPRSTranslator.translateText(msg);
	params["title"] = XPRSTranslator.translateText(params["title"]);
	}
	
	params["confirmButtonText"] = XPRSTranslator.translateText(params["confirmButtonText"]);
	params["cancelButtonText"] = XPRSTranslator.translateText(params["cancelButtonText"]);
	params["text"] = msg;
	var existingAlert = ($(".sweet-alert.visible").length == 1);
	swal(params,params["callbackfunc"]);
	if (typeof params.report_error != "undefined"){
		XPRSHelper.reportError(msg,params);
	}
	
	$(".sweet-overlay").unbind("click").bind("click",function(e){
		e.stopPropagation();
		if (params && params["cancelFunc"]){
			params["cancelFunc"]();
		}
		swal.close();
	});
};


XPRSHelper.reportError = function(errorMsg,params){
	try{
		$.ajax({
			  type: "POST",
			  url: XPRSHelper.getServerPath() + "/log",
			  data: {"log_info":errorMsg,"stack_trace":Error().stack,"url":window.location.href,"ajax_url":params["ajax_url"],"ajax_params":params["ajax_params"]}
		});
	}catch (ex) {}
};


XPRSHelper.invokeLogin = function(callbackFunc, form, cancelCallback, options){
	XPRSHelper.getCurrentUser(function(){
		var nextUrl = XPRSHelper.getUrlParameterByName("requested_url");
		var forceDialog = false;
		if (form && form.indexOf("force-") != -1){
			form = form.replace("force-","");
			forceDialog = true;
		}
		if (typeof LABEL_CONFIG != "undefined" && "SETTINGS" in LABEL_CONFIG && LABEL_CONFIG.SETTINGS.USER_PROFILE == "login_only"){
			form = "login";
		}
		if (nextUrl == "/themes" && XPRSHelper.currentUser["type"] == "USER"){
			return;
		}
		if (XPRSHelper.currentUser["type"] == "GUEST" || nextUrl != "" || forceDialog){
			if (typeof YSBApp != "undefined"){
				YSBApp.send({"action": "session-expired", "appid": "ywebsite"});
				return;
			}
			if (typeof ExternalLogin != "undefined"){
				if (typeof SpimeDualView != "undefined"){
					SpimeDualView.handleNavigationConfirmation = false;
				}
				if (form == "login"){
					window.location.href = ExternalLogin.loginUrl;
				}else{
					window.location.href = ExternalLogin.registerUrl;
				}
				return
			}
			if (typeof LoginModule == "undefined"){
			 var login_css = $("<link>");
			 login_css.attr({ 
			      rel:  "stylesheet",
			      type: "text/css",
			      href: XPRSHelper.getServerPath() + "/css/login.css?v=147"
			    });
			 $("head").append(login_css);
			 
			 
			 $.ajax({
				  url: XPRSHelper.getServerPath() + "/js/login.js?v=147",
				  dataType: 'script',
				  success: function(){
					  setTimeout(function(){
						  LoginModule.popLogin(callbackFunc, form, cancelCallback, options);
					  },250); 
				  },
				  cache: true
				  //async: false
				});
		}else{
				LoginModule.popLogin(callbackFunc, form, cancelCallback, options);
			}
		}else{
			if (typeof callbackFunc != "undefined"){
				callbackFunc();
			}
		}
	});
};


XPRSHelper.checkBrowserSupport = function(){
	var currentBrowser = XPRSHelper.getBrowser();
	if (currentBrowser.toLowerCase().indexOf("chrome") == -1){
		//We does not support your browser for the time being please download chrome
	}
};

XPRSHelper.getBrowser = function(){
	var ua= navigator.userAgent, tem, 
	M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if(/trident/i.test(M[1])){
	    tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
	    return 'IE '+(tem[1] || '');
	}
	if(M[1]=== 'Chrome'){
	    tem= ua.match(/\bOPR\/(\d+)/);
	    if(tem!= null) return 'Opera '+tem[1];
	}
	M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
	return M.join(' ');
};



XPRSHelper.slugify = function(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

XPRSHelper.isChrome = function(){
	var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	var isChrome = !!window.chrome && !isOpera;     // Chrome 1+ 
	return isChrome;
}


XPRSHelper.handleDevicePreview = function(params, callbackFunc){
	var deviceSizeTable = {
		"cellphone":{"font-size":"0.7px","width":320,"height":550,"border_top":"55px","border_bottom":"55px","margin":"110px auto","add_class":"shadowed"},
		"tablet":{"font-size":"0.9px","width":768,"height":1024,"border_top":"25px","border_bottom":"55px","margin":"80px auto","add_class":"shadowed"},
		"desktop":{"font-size":"","width":"100%","height":"100%","margin":"initial","add_class":""},"editor":{"width":"100%","height":"100%","margin":"initial","add_class":""}};
	var deviceObj = deviceSizeTable[params.device_type];
	$("html").css({"width":deviceObj.width,"height":deviceObj.height,"margin":deviceObj.margin});
	if (params.device_type == "cellphone" || params.device_type == "tablet"){
		$("html").addClass("showing-preview");
	}else{
		$("html").removeClass("showing-preview");
	}
	EditorHelper.handleDevicePreview({"device_type":params.device_type}, callbackFunc);
};

XPRSHelper.restoreBox = function(rootId,dateStamp){
	var controlPanel =$("#control-panel");
	var autoBackupOnly = controlPanel.find("#backup-menu-dropdown").hasClass("auto-backup");
	XPRSHelper.xprsAlert("Please wait, this operation may take several minutes",{title: "Restoring website", showCancelButton: false,closeOnConfirm:false,confirmButtonText:"Yes, Save a copy",cancelButtonText:"No, Thanks","callbackfunc":function(isConfirm){}});
	$(".sweet-overlay").unbind("click");
	$(".xprs-alert button.confirm").addClass("animated-color").css({"background-image":"url('/images/x_loader.gif')","background-repeat":"no-repeat","background-position":"center","background-size":"50px 50px","color":"rgba(0,0,0,0)"}).unbind("click")
	controlPanel.find("#backup-btn").addClass("loading-state");
	XPRSHelper.GET("/restore_box",{"vbid":rootId,"date_stamp":dateStamp, "backup_type":(autoBackupOnly)?"S3_AUTOBACKUP_BUCKET":"S3_BACKUP_BUCKET"},function(){
		location.reload();
	});
};

XPRSHelper.clickedImos = function(callbackFunc){
	var controlPanel =$("#control-panel");
	XPRSHelper.invokeLogin(function(){
		XPRSHelper.GET("/imos_user",{"root_id":EditorHelper.rootId}, function(res){
			controlPanel.find("#imos-btn").removeClass("loading-state");
			if (res.error){
				if (res.error == "Must be logged in"){

				}else{
					XPRSHelper.xprsAlert(res.error, {title: "Something went wrong", showCancelButton: false,closeOnConfirm:true,confirmButtonText:"OK","callbackfunc":function(isConfirm){

					}});
				}
				return;
			}
			if (typeof callbackFunc != "undefined"){
				callbackFunc(res.propertyId);
			}
			var imosInstalled = res.imos_installed;
			var propertyId = res.propertyId;
			var authToken = res.authToken;
			if (!imosInstalled){
				XPRSHelper.xprsAlert("In order to be able to see traffic using IMOS please publish the website",{title: "Publish site to see traffic", showCancelButton: true,closeOnConfirm:true,confirmButtonText:"Publish",cancelButtonText:"Maybe later","callbackfunc":function(isConfirm){
					if(isConfirm){
						controlPanel.find("#publish-btn").click();
						controlPanel.find("#imos-btn .option-text").text("Open IM Chat")
						if (typeof VueEditor != "undefined"){
							VueEditor._router.push("/website/publish");
						}
					}
				}});
			}else{
				var win = window.open("https://im-os.com/partner/imcreator/property/"+propertyId+"?secret="+authToken, '_blank');
				if ($("#free-url-placeholder").text() != "Please wait, creating url..."){
					if (window.location.href.indexOf("imcreator.com") == -1){
						window.open($("#free-url-placeholder").text().replace(location.host, ""), '_blank');
					}else{
						window.open("https://" + $("#free-url-placeholder").text(), '_blank');
					}
				}
				win.focus();
			}
		},"json", function(){
			controlPanel.find("#imos-btn").removeClass("loading-state");
			XPRSHelper.xprsAlert("Operation failed", {title: "Something went wrong", showCancelButton: false,closeOnConfirm:true,confirmButtonText:"OK","callbackfunc":function(isConfirm){
				callbackFunc(null);
			}});
		});
	},"register");
}