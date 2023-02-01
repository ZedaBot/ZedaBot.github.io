/******************************************************************************************************
 *                                             SPIME ENGINE 
 ******************************************************************************************************/

var SpimeEngine = {};

/******************************************************************************************************
 *                                               GLOBALS 
 ******************************************************************************************************/
SpimeEngine.debugMode = false; //When set to true console logs will be shown
SpimeEngine.arrangers = {}; // An array of all the arrangers in the page
SpimeEngine.layouts = {}; //An array of all the layouts in the page
SpimeEngine.captchaKey = (document.location.hostname == "127.0.0.1" || document.location.hostname == "localhost") ? "6LdmEiUUAAAAAJBHO4Pb7MdtE5Et1jN1Wk4wjOBr" : "6Lc2KCUUAAAAAGP2G2L0bhHTq_hcnbo_we19MIXA";
SpimeEngine.YTPlayers = {};
SpimeEngine.Geocoder = {};
SpimeEngine.GoogleMaps = {};
SpimeEngine.ecommerceSolution = "";
SpimeEngine.stripePaymentHandler = {};
SpimeEngine.stripePaymentParams = {};
SpimeEngine.scrollEnabled = true;
SpimeEngine.finishedLoading = false;

/******************************************************************************************************
 *                                               MAIN
 *                                  called from body onLoad func    
 ******************************************************************************************************/
SpimeEngine.start = function(){
	$(document).ready(function() {
		SpimeEngine.updateParent({"deliver_to":"parent","action":"finished-loading"});
		SpimeEngine.finishedLoading = true;
	});
	try{ 
		SpimeEngine.BeforeInit();
		SpimeEngine.InitMaster();
		var c = 0
		SpimeEngine.getAllHolders().each(function(){
			var currentHolder = $(this);
			// setTimeout(function(){
				SpimeEngine.InitHolder(currentHolder);	
			// },10 *c )
			c++;
		});
		SpimeEngine.initForms();
		LightBox.initLinks();
		SpimeEngine.initVideos();
		if(typeof window["EditorHelper"] != "undefined"){
			SpimeEngine.initMaps();
		}else{//MAPSFIX
			SpimeEngine.initMapsEmbed();
		}
		SpimeEngine.initDynamicStripes();
		SpimeEngine.AttachHelperIfNeeded();
		SpimeEngine.AfterInit();
		SpimeEngine.initAnchors();
		SpimeEngine.initProducts();//ECOMMERCE
		setTimeout(function(){
			SpimeEngine.loadHighResImages();	
		},1500);
		SpimeEngine.initRawHTMLs();
		var hasScrollEffects = $(".master.container").hasClass("scroll-effects");
		var hasItemEnterEffects = $(".master.item-box.items-enter-effects").length > 0;
		//first init of sections visibility
		if (hasScrollEffects || hasItemEnterEffects || typeof window["EditorHelper"] != "undefined"){
			SpimeEngine.handleScrollEffects();
		}
		if (getParameterByName("show_site")){
			$('body,html').animate({
					scrollTop: $(document).height()
				}, 4000);
			setTimeout(function(){
				$('body,html').animate({
						scrollTop: 0
					}, 2000);
			},4500)
		}
		}catch(err){
			console.log(err);
			console.trace();
			console.error("something went wrong... (Engine) " + err)
			var errorMessage = $("#error").html();
			$("#content").html(errorMessage);
		}
};

/******************************************************************************************************
 *                                               INIT
 *                                 The following methods are only called once
 ******************************************************************************************************/

SpimeEngine.BeforeInit = function(){
	SpimeEngine.UpdateDeviceClass();
	var scrollingContainer = $(document);
	var hasScrollEffects = $(".master.container").hasClass("scroll-effects");
	var hasItemEnterEffects = $(".master.item-box.items-enter-effects").length > 0;
	SpimeEngine.handleParallax();
	scrollingContainer.unbind("scroll").bind("scroll",function(event){
		if (SpimeEngine.scrollEnabled){
			if(typeof window["EditorHelper"] != "undefined"){
				EditorHelper.handleScroll(event);
			}
			if ("menu" in SpimeEngine.layouts){
				if (typeof SpimeEngine.layouts["menu"].handleScroll != "undefined"){
					SpimeEngine.layouts["menu"].handleScroll($("[data-preset-type-id='MENUS']"),$(this).scrollTop());
				}
			}
			SpimeEngine.handleParallax();
			if (hasScrollEffects || hasItemEnterEffects || typeof window["EditorHelper"] != "undefined"){
				SpimeEngine.handleScrollEffects();
			}
		}
		if (typeof popupStripeAppOnScroll == 'function') { 
			setTimeout(function(){
				popupStripeAppOnScroll(); 
			},300);
		}
	});
};

SpimeEngine.disableScroll= function(){
	SpimeEngine.scrollEnabled = false;
	$("body").addClass("no-scroll");
};

SpimeEngine.enableScroll= function(){
	SpimeEngine.scrollEnabled = true;
	$("body").removeClass("no-scroll");
};

SpimeEngine.handleParallax = function(){
	if ($("#xprs").is(".tablet-mode") || $("#xprs").is(".phone-mode")){
		return;
	}
	$(".parallax50-bg").each(function( index ) {
		var relevant_bg_img = $(this);
		var relevant_bg = relevant_bg_img.closest(".master.item-box");
		relevant_bg_top = relevant_bg.offset().top;
		relevant_bg_bottom = relevant_bg_top + relevant_bg.height();
		if ( (window.scrollY + $(window).height()) >  relevant_bg_top ) {
			if ( window.scrollY < relevant_bg_bottom ) {
				var pospos = (relevant_bg_top + relevant_bg.height()/2) -  (window.scrollY + $(window).height()/1.2);
				pospos = pospos/3;
				relevant_bg_img.css("background-position-y", pospos+"px");
			}
		}
	});
}

SpimeEngine.handleScrollEffects = function(){
	SpimeEngine.getAllHolders().filter(":visible").not(".header-box, #empty-stripe, .element-box").each(function(){
		var currentStripe = $(this);
		var bufferChecker = Math.min(0.3 * $(this).outerHeight(), 150)
        var top_of_object = currentStripe.offset().top + bufferChecker;
        var bottom_of_window = $(window).scrollTop() + $(window).height();
        /* If the object is completely visible in the window, fade it it */
        if( bottom_of_window > top_of_object ){
        	currentStripe.addClass("visible-section");
        	currentStripe.removeClass("hidden-section");
        } else {
        	currentStripe.removeClass("visible-section");
        	currentStripe.addClass("hidden-section");
        }
	});
};
var width = $(window).width(), height = $(window).height();
SpimeEngine.AfterInit = function(){
	$("#loading").remove();
	$(".master.container").css("visibility","visible");
	var resizeFlag = "off";
	window.onresize = function(event) {
		if(typeof event != "undefined" && event.target === window) {
			if($(window).width() == width || $(window).height() != height){
				if(typeof window["EditorHelper"] == "undefined"){
					return;
				}
			}
			if (resizeFlag == "off"){
				resizeFlag = "waiting";
				setTimeout(function(){ 
					SpimeEngine.ArrangeAll();
					resizeFlag = "off"
				}, 1500);
			}
			SpimeEngine.UpdateDeviceClass();
			if(typeof window["EditorHelper"] != "undefined"){
				EditorHelper.adjustUI();
			}
			$(".master.item-box").each(function(index) {
				var win = $(window);
				var viewport = {
						top : win.scrollTop(),
						left : win.scrollLeft()
					};
				viewport.bottom = viewport.top + win.height();
				viewport.right = viewport.left + win.width();
				if ( ($(this).position().top > (viewport.bottom)) || ($(this).position().bottom < (viewport.top)) ){
				} else {
					SpimeEngine.ArrangeHolder($(this))
				}
				
				
			});
		}
	};
	window.addEventListener("orientationchange", function() {
		setTimeout(function(){
			SpimeEngine.UpdateDeviceClass();
			SpimeEngine.ArrangeAll();
		}, 50);
	}, false);
	SpimeEngine.handleUnarranged();
	if (SpimeEngine.ecommerceSolution == ""){
		SpimeEngine.ecommerceSolution = $("body").attr("data-ecommerce-solution");
	}
	if (SpimeEngine.ecommerceSolution == "DISABLED" || SpimeEngine.ecommerceSolution == "NONE"){
		return;
	}
	if (typeof StripeCheckout == "undefined"){
		var imosServer = $("body").attr("data-imos-server");
		XPRSHelper.GET(imosServer + "/api/pk", {"osid":$("body").attr("data-osid")}, function(pk){
			if (pk == "None"){
				pk =  (document.location.hostname == "localhost")? 'pk_test_QSMNJ1sezwb2M4OzwzXm9MNU' : 'pk_live_GN5B7PU5wgoCY6JWtxrIcuQr';
			}
			$.getScript( "https://checkout.stripe.com/checkout.js", function( data, textStatus, jqxhr ) {
				SpimeEngine.stripePaymentHandler =  StripeCheckout.configure({
					key:pk,
					locale: 'auto',
					token: function(token,args) {
						for( ar in args){
							SpimeEngine.stripePaymentParams[ar] = args[ar]
						}
						SpimeEngine.stripePaymentParams["stripeToken"] = token.id;
						SpimeEngine.stripePaymentParams["buyer_email"] = token.email;
						var splittedDomain = SpimeEngine.splitHostname(window.location.hostname);
						SpimeEngine.stripePaymentParams["domain"] = splittedDomain.domain + "." + splittedDomain.type;
						SpimeEngine.stripePaymentParams["subdomain"] = splittedDomain.subdomain;
						SpimeEngine.stripePaymentParams["store_name"] = $("body").attr("data-store-name").substring(0,22);
						XPRSHelper.POST(imosServer + "/api/payment", SpimeEngine.stripePaymentParams, function(result){
							try{
								if (typeof IMOS != "undefined"){
									IMOS.trackGoal("Premium",{"offer_name":SpimeEngine.stripePaymentParams["description"],"amount":SpimeEngine.stripePaymentParams["amount"],"email":token.email});
								}
								if (typeof imosSdk != "undefined"){
									imosSdk.addPurchase(SpimeEngine.stripePaymentParams["description"], SpimeEngine.stripePaymentParams["amount"]);
								}
							}catch(err){}
						}, "json")
					},
					closed: function () {
					}
					});
					$(window).on('popstate', function() {
						handler.close();
					});
			});
		});
	}
};

SpimeEngine.UpdateDeviceClass = function(){
	var currentWinWidth = $("body").width();
	var deviceClass = "desktop-mode";
	var disableScrollEffects = false;
	if(currentWinWidth < 800){
		deviceClass = "tablet-mode desktop-mode";
		disableScrollEffects = true;
	}
	if (currentWinWidth < 500){
		deviceClass = "phone-mode tablet-mode desktop-mode";
	}
	var xprsHolder = $("#xprs");
	xprsHolder.removeClass("desktop-mode tablet-mode phone-mode");
	xprsHolder.addClass(deviceClass);
	var mainPage = xprsHolder.find(".main-page");
	var forceDisable = mainPage.attr("data-force-disable");
	if (mainPage.hasClass("disable_effects") && !disableScrollEffects && !forceDisable){
		mainPage.removeClass("disable_effects");
	}
	if (!mainPage.hasClass("disable_effects") && disableScrollEffects){
		mainPage.addClass("disable_effects");
	}
};

SpimeEngine.handleUnarranged = function(){
	if ($(".rearrange").length > 0){
		setTimeout(function(){
			$(".rearrange").each(function(){
				$(this).removeClass("rearrange");
				SpimeEngine.ArrangeHolder($(this));
			});
			SpimeEngine.handleUnarranged();
		},200);
	}
};

SpimeEngine.loadHighResImages = function(){
	SpimeEngine.loadHighResImage($(".stripe_popup_app_hide .load-high-res").not("#no-image"),1600);
	var c = 0;
	$(".load-high-res").not(".from-feed").not("#no-image").each(function(){
		var currentImg = $(this);
		setTimeout(function(){
			SpimeEngine.loadHighResImage(currentImg);
		},10 *c )
		c++;
	});
};

SpimeEngine.loadHighResImage = function(imgDiv,forceNewRes){
	if (imgDiv.length == 0){
		return;
	}
	imgDiv.removeClass("load-high-res")
	var currentSrc = imgDiv.css("background-image");
	var currentWidth = imgDiv.width();
	var currentHeight = imgDiv.height();
	var newRes = Math.max(currentWidth,currentHeight);
	newRes = Math.min(newRes,1600);
	if(typeof window["EditorHelper"] != "undefined"){
		newRes = 1600;
	}
	if (isNaN(newRes)){
		newRes = 1200;
	}
	if (forceNewRes){
		newRes = forceNewRes;
	}
	var backgroundZoom = imgDiv.css("background-size");
	if (typeof backgroundZoom != "undefined"){
		if (backgroundZoom.indexOf("%") != -1){
			if (parseInt(backgroundZoom) > 100){
				newRes = 1600;
			}
		}else if(backgroundZoom == "cover"){
			var tempRes = Math.max(currentWidth,currentHeight);
			if (forceNewRes){
				tempRes = forceNewRes;
			}
			tempRes*=2;
			tempRes = Math.min(tempRes,1600);
			newRes = tempRes;
		}
	}
	var newSrc = currentSrc.replace("=s300","=s"+newRes);
	var finalSrc =  newSrc + "," +currentSrc
	imgDiv.css("background-image",finalSrc);
	setTimeout(function() {
		SpimeEngine.removeLowResimg(imgDiv);
	}, 1000);
};

SpimeEngine.removeLowResimg = function(imgDiv) {
	var oldBg = imgDiv.css("background-image");
	var bgArray = oldBg.split(',');
	if (bgArray.length>1) {
		imgDiv.css("background-image", bgArray[0]);
	}
}

SpimeEngine.initRawHTMLs = function(){
	$(".main-page:not(.disable-raw-html) .raw-container, .main-page:not(.disable-raw-html) .preview-raw-container").not(".disable-raw-html").each(function() {
		SpimeEngine.initRawHTML($(this));
	});
};

SpimeEngine.initRawHTML = function(htmlContainer,forceLoad, callback){
	if(typeof window["EditorHelper"] != "undefined"){
		if(htmlContainer.closest(".raw-wrapper").find(".page-app").length > 0) {
			htmlContainer.closest(".raw-wrapper").css({"min-height":"0px"});
		}
	}
	if (htmlContainer.attr("data-static") == "false" || forceLoad){
		var url = htmlContainer.attr("data-raw-content-url");
		$.get(XPRSHelper.getStaticServerPath() + url,function(html){
			if($("[data-block-script]").length > 0){
				htmlContainer.html(SpimeEngine.unescapeHtml(html))
			}else{
				htmlContainer.html(html)
			}
			if(callback)callback();
		});
	}
};

SpimeEngine.unescapeHtml = function(safe) {
    var temp = document.createElement("div");
    temp.innerHTML = safe;
    var result = temp.childNodes[0].nodeValue;
    temp.removeChild(temp.firstChild);
	return result;
}

SpimeEngine.initProducts = function(){
	SpimeEngine.ecommerceSolution = $("body").attr("data-ecommerce-solution");
	$(".preview-price").not(".sold-out").each(function() {
		var pid = $(this).attr("data-product-id");
		if (pid != "N/A"){
			var relevantItem = $(this).closest(".item-box");
			relevantItem.addClass("clickable");
			if(typeof window["EditorHelper"] == "undefined"){
				relevantItem.unbind("click").bind("click",function(e){
					e.stopPropagation();
					SpimeEngine.buyProduct(pid);
				});
			}
			//disable lightbox
			relevantItem.find("a[data-link-type='LIGHTBOX']").each(function(){
				$(this).unbind("click");
			});
		}else{
			SpimeEngine.demoProduct()
		}
	});
	$("a[data-link-type='BUY']").each(function() {
		var currentLink = $(this);
		currentLink.addClass("clickable");
		currentLink.removeAttr("href");
		currentLink.unbind("click").bind("click",function(e){
			e.preventDefault();
			e.stopPropagation();
			var parent = $(this).closest(".item-box");
			var previewPrice = parent.find(".preview-price").not(".sold-out");
			if (previewPrice.length > 0){
				var pid = previewPrice.attr("data-product-id");
				if (pid != "N/A"){
					SpimeEngine.buyProduct(pid);
				}else{
					SpimeEngine.demoProduct()
				}
			}else{
				SpimeEngine.demoProduct()
			}
		});
	});
};


SpimeEngine.demoProduct = function(){
	if (SpimeEngine.ecommerceSolution == "IMOS"){
		return;
	}
	if (typeof showcart != "undefined"){
		showcart();
	}
	var demoProductText = "PRODUTO DE TESTE <br> (para adicionar um produto real, clique na opção ‘vender este produto’ no menu)"
	if (typeof XPRSTranslator != "undefined"){
		demoProductText = XPRSTranslator.translateText(demoProductText);
	}
	$("#sr-cart-modal-productname").html(demoProductText);
	$("#sr-cart-modal-productprice").text("0.00");
	var demoBlocker = $("<div/>").attr("id","demo-blocker").css({"width":"100%","height":"100%","position":"absolute","top":"0px","left":"0px","z-index":"9999999999","cursor":"pointer"}).bind("click",function(e){
		e.stopPropagation();
		$("#sr-cartmodal").SRmodal('hide');
		$(this).remove();
	});
	$("#sr-cartmodal").prepend(demoBlocker);
};

SpimeEngine.buyProduct = function(pid){
	if (SpimeEngine.ecommerceSolution == "IMOS"){
		var shopId = $("body").attr("data-os-store-id")
		var priceElement = $("[data-product-id='" + pid + "']");
		var openInProductPage = priceElement.closest(".master.item-box.show-product-inner-page").length > 0;
		var relevantItem = priceElement.closest(".item-box");
		if (openInProductPage){
			var absoluteUrl =$(".master.container").attr("data-absolute-path");
			if (typeof EditorHelper == "undefined"){
				window.location.href = SpimeEngine.getProductUrl(relevantItem.attr("id"));
			}else{
				XPRSHelper.updateParent({"deliver_to":"parent","action":"navigate-viewer","vbid":"product/" + relevantItem.attr("id")});
			}
			return
		}
		var productType = priceElement.attr("data-product-type");
		if (!productType){
			productType = "SERVICE";
		}
		var relevantTitle = relevantItem.find(".preview-title").text();
		SpimeEngine.stripePaymentParams["shop_id"] = shopId;
		SpimeEngine.stripePaymentParams["amount"] = SpimeEngine.parsePrice(priceElement);
		SpimeEngine.stripePaymentParams["description"] = relevantTitle;
		SpimeEngine.stripePaymentParams["name"] = $("body").attr("data-store-name");
		SpimeEngine.stripePaymentParams["root_id"] = $("body").attr("data-root-id")
		SpimeEngine.stripePaymentParams["visitor_id"] = XPRSHelper.getXprsCookie("os_visitor")
		SpimeEngine.stripePaymentParams["product_id"] = pid;
		SpimeEngine.stripePaymentParams["currency"] = $("body").attr("data-default-currency");
		SpimeEngine.stripePaymentParams["osid"] = $("body").attr("data-osid");
		if (productType == "PHYSICAL"){
			SpimeEngine.stripePaymentParams["shippingAddress"]=true;
			var shippingCost = $("body").attr("data-shipping-cost");
			if (shippingCost){
				shippingCost = parseInt(shippingCost);
				var shippingCostInCents = shippingCost * 100;
				SpimeEngine.stripePaymentParams["shipping_cost"] = shippingCostInCents
				SpimeEngine.stripePaymentParams["amount"] += shippingCostInCents;
				var currencyArr = {"USD":"$","EUR":"\u20ac","GBP":"\u00a3","BRL":"R$", "JPY":"\u00a5","NZD":"NZ$","SEK":"Kr","CHF":"CHF","NOK":"kr","MYR":"RM","SGD":"S$","AED":"\u062F.\u0625","PKR":"₨","THB":"฿","IDR":"Rp","PHP":"₱","VND":"₫","NPR":"Re.","RON":"lei","HUF":"Ft"};
				var currencySymbol = "$" + SpimeEngine.stripePaymentParams["currency"];
				if (SpimeEngine.stripePaymentParams["currency"] in currencyArr){
					currencySymbol = currencyArr[SpimeEngine.stripePaymentParams["currency"]];
				}
				SpimeEngine.stripePaymentParams["description"] += " ( + " + currencySymbol + shippingCost + " Shipping ) ";
			}
		}else{
			SpimeEngine.stripePaymentParams["shippingAddress"]=false;
		}
		SpimeEngine.populateProductDetails(priceElement);
		SpimeEngine.stripePaymentHandler.open(SpimeEngine.stripePaymentParams);
	}
};

SpimeEngine.getProductUrl = function(pid){
	var rootId = $("body").attr("data-root-id");
	var pageId = $(".master.container").attr("id");
	var isInnerpage = rootId != pageId
	var pathName = location.pathname;
	if(pathName.endsWith("/")){
		pathName = pathName.substring(0,pathName.length-1);
	}
	if (isInnerpage){
		if (pathName.indexOf("/free/") != -1 || pathName.indexOf("/viewer/") != -1 || pathName.indexOf("/live/") != -1){
			pathName = pathName.substring(0, pathName.lastIndexOf('/'));
		}else{
			pathName = "";
		}
	}
	return window.location.protocol + "//" + window.location.host + pathName + "/product/" + pid;
};

SpimeEngine.parsePrice = function(priceElement){
	if (priceElement.find(".real-price").length > 0){
		strPrice = priceElement.find(".real-price").text();
	}else{
		strPrice = priceElement.text();
	}
	var multiplyBy = 1;
	strPrice = strPrice.trim().toLowerCase().replace(",","");
	strPrice = strPrice.split(" ")[0];
	if (strPrice.indexOf("k") == strPrice.length - 1){
		multiplyBy = 1000;
	}
	return parseInt((parseFloat(strPrice) * 100 * multiplyBy).toFixed(2));
};

SpimeEngine.populateProductDetails = function(priceElement){
	var productImg = "none"; 
	var item = priceElement.closest(".item-box");
	var previewImage = item.find(".inner-pic.preview-element");
	if (previewImage.length ==0){
		previewImage = item.find(".image-source.preview-element");
	}
	if (previewImage.length > 0){
		var originalSrc = previewImage.css("background-image");
		var imageSrc = originalSrc;
		if (imageSrc.indexOf(",") != -1){
			imageSrc = imageSrc.split(",")[0];
			imageSrc = imageSrc.replace('"','').replace('"','');
		}
		imageSrc = imageSrc.replace("url(","").replace(")","");
		var imageSrc = imageSrc.substring(0,imageSrc.indexOf("=s"));
		productImg = imageSrc;
	}
	SpimeEngine.stripePaymentParams["product_img"] = productImg;
	SpimeEngine.stripePaymentParams["product_name"] = item.find(".preview-title").text().replace(/&nbsp;/gi, ' ');
}

SpimeEngine.initAnchors = function(){
	$("a[data-link-type='ANCHOR']").each(function() {
		var currentLink = $(this);
		currentLink.unbind("click").bind("click",function(e){
			e.preventDefault();
			var target = $(this).attr("href");
			var menuOffset = SpimeEngine.calculateScrollOffset();
			if ($(this).closest(".preview-item-links.flipped").length > 0 ){
				$(".links-menu-btn").click();
			}
			if ($(target).length > 0) {
 				targetOffset = $(target).offset().top - menuOffset;
 				$('body,html').animate({
 				scrollTop: targetOffset
 				}, 2000);
 			} else {
 				var pathName = SpimeEngine.getPathName();
 				var newTarget = window.location.protocol + "//" + window.location.host + pathName +target;
 				window.location.href = newTarget;
 			}
		});
	});
};

SpimeEngine.getPathName = function() {
 	var rootId = $("body").attr("data-root-id");
 	var pageId = $(".master.container").attr("id");
 	var isInnerpage = rootId != pageId
 	var pathName = location.pathname;
 	if(pathName.endsWith("/")){
 		pathName = pathName.substring(0,pathName.length-1);
 	}
 	if (isInnerpage){
 		if (pathName.indexOf("/edit_site/") != -1 || pathName.indexOf("/edit/") != -1 || pathName.indexOf("/free/") != -1 || pathName.indexOf("/viewer/") != -1 || pathName.indexOf("/live/") != -1){
 			pathName = pathName.substring(0, pathName.lastIndexOf('/'));
 		}else{
 			pathName = "";
 		}
 	}
 	return pathName;
 }

SpimeEngine.calculateScrollOffset = function(){
	var scrollOffset = 0;
	if(typeof window["EditorHelper"] != "undefined"){
		scrollOffset = 50; //topbar
	}
	var menuStripe = $(".menus-wrapper").closest(".master.item-box");
	//if the menu exists
	if (menuStripe.length > 0){
		var menuStripeSettings = menuStripe.find(".layout-settings");
		var isFloatingMenu = menuStripeSettings.attr("data-menu_scroll") == "true";
		var isLeftSideMenu = $(".left-menu-placeholder").length != 0;
		if (isFloatingMenu && !isLeftSideMenu){
			var originalMenuHeight = menuStripe.outerHeight(true);
			var floatingMenuHeight = Math.max(50 + menuStripe.find(".preview-content-holder").outerHeight(true) - menuStripe.find(".preview-content-holder").height(),menuStripe.find(".preview-title-holder").height() + parseInt(menuStripe.find(".preview-content-holder").css("padding-top"))+ parseInt(menuStripe.find(".preview-content-holder").css("margin-top")));
			if (menuStripe.is(".being-scrolled") || menuStripe.is(".force-transparency") || $(".left-menu-placeholder").length > 0){
				originalMenuHeight = 0;
			}
			scrollOffset += originalMenuHeight + floatingMenuHeight;
		}
	}
	return scrollOffset;
};

SpimeEngine.InitContainer = function(container,itemsClass, whatsNext){
	SpimeEngine.DebugPrint("Init Container Start");
	var containerArranger = SpimeEngine.getArranger(container);
	var items = container.children("#children").find(".item-box");
	SpimeEngine.arrangers[containerArranger] = window[containerArranger + "_arranger"];
	if (typeof SpimeEngine.arrangers[containerArranger] != "undefined"){
		SpimeEngine.arrangers[containerArranger].init(container,items ,whatsNext);
	}
};

SpimeEngine.initLayout = function(container, itemsClass){
	var layoutSettings = container.find(".layout-settings");
	var itemsLayout = layoutSettings.attr("data-type");
	if (typeof itemsLayout == "undefined"){
		itemsLayout = "bottom";
	}
	//Do not change layout when stripe header exists
	if (itemsLayout == "blocks" && container.find(".stripe-header").length > 0){
		layoutSettings.attr("data-type", "multi");
		itemsLayout = "multi";
	}
	if (typeof window[itemsLayout + "_layout"]== "undefined"){
		console.error("layout " + itemsLayout + " needs to be loaded, thank you");
	}
	SpimeEngine.layouts[itemsLayout] = window[itemsLayout + "_layout"];
	SpimeEngine.layouts[itemsLayout].init(container,container.find(itemsClass));
	SpimeEngine.setInitialShrinkerData(container.find(itemsClass),"");
	SpimeEngine.setInitialShrinkerData(container.find(itemsClass),"blocks-");
};

SpimeEngine.AttachHelperIfNeeded = function(){
	if(typeof window["EditorHelper"] != "undefined"){
		window.addEventListener("message", EditorHelper.receiveMessage, false);
		EditorHelper.bindHelperActions();
	}
};

/******************************************************************************************************
 *                                               ON RESIZE
 *                      The following methods are called every time the window is resized
 ******************************************************************************************************/

SpimeEngine.ArrangeAll = function(includeMaster){
	if ($(".master.container").hasClass("left-menu-layout")){
		$(".master.container").find("#children").first().css("width",$(window).innerWidth() - menu_layout.SCROLLBAR_WIDTH - $(".left-menu-placeholder").width());
		$(".left-menu-placeholder").height($(window).height());
	}else{
		$(".master.container").find("#children").first().css("width","");
	}
	SpimeEngine.ArrangeMaster();
	SpimeEngine.getAllHolders().each(function(){
		var currentHolder = $(this);
		SpimeEngine.ArrangeHolder(currentHolder,{"force_redraw":true});
	});
	LightBox.arrange();
};

SpimeEngine.arrangePopups = function(){
	var popup = $(".stripe_popup_app");
	if (popup.length > 0){
		var popupRealTime = $("#popup-realtime");
		var popupRealTimeStyle = "";
		if (popupRealTime.length == 0){
			popupRealTime = $("<style />");
			popupRealTimeStyle = ".stripe_popup_app.inmobile{width:100%!important;max-width:" + popup.css("width") + "!important;";
			popupRealTimeStyle += ".stripe_popup_app.inmobile input.Field{width:100%;min-width:auto;}"
			popupRealTime.text(popupRealTimeStyle);
			$("head").append(popupRealTime);
		}
		console.log($(window).width()  + " " +  parseInt(popup.css("width")))
		if ($(window).width() <= parseInt(popup.css("width"))){
			popup.addClass("inmobile");
		}else{
			popup.removeClass("inmobile");
		}
	}
};

SpimeEngine.InitHolder = function(holder){
	var holderType = SpimeEngine.getHolderType(holder);
	switch(holderType){
		case "gallery":
			var currentContainer = holder.find(".sub.container");
			SpimeEngine.InitContainer(currentContainer,".item-box");
			SpimeEngine.ArrangeContainer(currentContainer);
			SpimeEngine.initLayout(currentContainer,".item-box");
			SpimeEngine.applyLayout(currentContainer,".item-box",{"force_redraw":true});
			setTimeout(function(){
				if (currentContainer.is(".matrix")){
					SpimeEngine.evenItemsHeights(currentContainer);
				}
			},500)
			break;
		case "item":
			var currentItem = holder.find(".item-wrapper");
			SpimeEngine.initLayout(currentItem,".item-content");
			SpimeEngine.applyLayout(currentItem,".item-content",{"force_redraw":true});
			break;
	}
};

SpimeEngine.InitMaster = function(){
	var masterContainer = $(".master.container");
	SpimeEngine.InitContainer(masterContainer,".master.item-box");
	SpimeEngine.ArrangeContainer(masterContainer);
};

SpimeEngine.ArrangeMaster = function(){
	var masterContainer = $(".master.container");
	SpimeEngine.ArrangeContainer(masterContainer);
	SpimeEngine.fitVideos();
	SpimeEngine.centerMaps();
	SpimeEngine.fixZoomedImages();
};

SpimeEngine.ArrangeHolder = function(holder,paramsFromRealtime,whatsNext){
	if (holder.hasClass("master container")){
		SpimeEngine.ArrangeMaster();
		return;
	}
	var holderType = SpimeEngine.getHolderType(holder);
	switch(holderType){
		case "gallery":
			var currentContainer = holder.find(".sub.container");
			SpimeEngine.ArrangeContainer(currentContainer,whatsNext);
			SpimeEngine.applyLayout(currentContainer,".item-box",paramsFromRealtime);
			if (currentContainer.is(".matrix")){
				setTimeout(function(){
					SpimeEngine.evenItemsHeights(currentContainer);	
				},10);
				
			}
			break;
		case "item":
			var currentItem = holder.find(".item-wrapper");
			SpimeEngine.applyLayout(currentItem,".item-content",paramsFromRealtime);
			break;
	}
};

SpimeEngine.showMoreInHolder = function(holder){
	var holderType = SpimeEngine.getHolderType(holder);
	if (holderType == "gallery"){
		var currentContainer = holder.find(".sub.container");
		var containerArranger = SpimeEngine.getArranger(currentContainer);
		if (typeof SpimeEngine.arrangers[containerArranger] != "undefined"){
			if (typeof SpimeEngine.arrangers[containerArranger].showMore != "undefined"){
				SpimeEngine.arrangers[containerArranger].showMore(holder);
			}
		}else{
			console.error("bad arranger for show more " + containerArranger);
		}
	}
};

SpimeEngine.showLessInHolder = function(holder){
	var holderType = SpimeEngine.getHolderType(holder);
	if (holderType == "gallery"){
		var currentContainer = holder.find(".sub.container");
		var containerArranger = SpimeEngine.getArranger(currentContainer);
		if (typeof SpimeEngine.arrangers[containerArranger] != "undefined"){
			if (typeof SpimeEngine.arrangers[containerArranger].showLess != "undefined"){
				SpimeEngine.arrangers[containerArranger].showLess(holder);
			}
		}else{
			console.error("bad arranger for show more " + containerArranger);
		}
	}
};

SpimeEngine.getAllHolders = function(){
	return $(".master.item-box").not(".hidden-from-view").not(".error-stripe");
};

SpimeEngine.getHiddenHolders= function(){
	return $(".master.item-box.hidden-from-view");
};

SpimeEngine.getHolderType = function(holder){
	var holderRole = holder.attr("data-holder-type");
	if (typeof holderRole == "undefined"){
		return "element";
	}
	switch(holderRole){
		case "header":
		case "footer":
		case "page":
			return "item";
		case "gallery":
			return "gallery";
		case "element":
			return "element";
		}
};

SpimeEngine.applyLayout = function(container,itemsClass,paramsFromRealTime){
	var layoutSettings = container.find(".layout-settings");
	container.find(".circlize").closest(".preview-image-holder").css({"height":"","width":""});
	SpimeEngine.shrinkImg(container);
	if (layoutSettings.length > 0 && (!(container.hasClass("master")))) {
		var itemsLayout = layoutSettings.attr("data-type");
		if (typeof itemsLayout == "undefined" ||  itemsLayout==""){
			itemsLayout = "bottom";
		}
		if (typeof SpimeEngine.layouts[itemsLayout] != "undefined"){
			if (itemsLayout == "menu"){
				SpimeEngine.shrinkImg(container);
			}
			SpimeEngine.layouts[itemsLayout].applyLayout(container,container.find(itemsClass),paramsFromRealTime);
			if (itemsLayout != "menu"){
				var fromHeightResize = (typeof container.closest(".master.item-box").attr("data-height-resize") != "undefined");
				if (!fromHeightResize){
					SpimeEngine.shrinkText(container.find(".sub.item-box").not(".stripe-header").not(".stripe-footer"),paramsFromRealTime,"");
					SpimeEngine.shrinkText(container.find(".blocks_layout"),paramsFromRealTime,"blocks-");
					SpimeEngine.shrinkText(container.find(".blocks_layout"),paramsFromRealTime,"blocks-");
				}
			}
			SpimeEngine.fitVideos(container);
			SpimeEngine.centerMaps(container);
		}else{
			console.error("bad layout " + itemsLayout);
		}
	}
	var visibleCircles = container.find(".circlize:visible");
	if (visibleCircles.length > 0){
		//Getting height from visible items only
		container.addClass("circlize-holder");
		var firstVisibleCircle = visibleCircles.first();
		var visibleCircleImageCover = firstVisibleCircle.closest(".image-cover");
		var newSquareSize = Math.min(visibleCircleImageCover.height(),visibleCircleImageCover.width());
		container.find(".circlize").each(function(){
			var imageHolder = $(this);
			if (imageHolder.hasClass("element")){
				//this is an element
			}else{
				if (imageHolder.hasClass("inner-pic")){
					var widthToCheck = firstVisibleCircle.closest(".pic-side").width();
					var heightToCheck = firstVisibleCircle.closest(".item-box").height();
					if (imageHolder.closest(".bottom-center").length > 0 || imageHolder.closest(".top-center").length > 0){
						heightToCheck = firstVisibleCircle.closest(".pic-side").height();
					}
					newSquareSize = Math.min(heightToCheck,widthToCheck);
					imageHolder.css("border-radius",6000);
					imageHolder.height(newSquareSize);
					imageHolder.width(newSquareSize);
					imageHolder.closest(".inner-pic-holder").height(newSquareSize).css({"display":"table-cell","vertical-align":"middle"});
				}else{
					imageHolder.height(newSquareSize);
					imageHolder.width(newSquareSize);
					imageHolder.css("border-radius",6000);
					imageHolder.css("margin-left","auto");
					imageHolder.css("margin-right","auto");
					$(this).position().left= $(this).parent().width() - $(this).width();
					$(this).position().top = $(this).parent().height() - $(this).height();
				}
			}
		});
	}
	SpimeEngine.fixZoomedImages(container);
};

SpimeEngine.fixZoomedImages = function(container){
	return;
	var zoomedImages;
	if (typeof container != "undefined"){
		zoomedImages = container.find(".background-div");
	}else{
		zoomedImages = $(".element-box .background-div");
	}
	zoomedImages = zoomedImages.filter(function() {return ($(this).css('background-size').indexOf("%") != -1);});
	zoomedImages.each(function(){
		var currentSize = $(this).css("background-size");
		if ($(this).width() < $(this).height()){
			if(currentSize.indexOf("auto") == -1){
				$(this).css("background-size" ,"auto " + currentSize);	
			}
		}else{
			if(currentSize.indexOf("auto") != -1){
				$(this).css("background-size" ,currentSize.replace("auto",""));
			}
		}
	});
};


SpimeEngine.sendVideoCommand = function(videoId,commandName){
	var vid = $("#" + videoId + "-vidframe");
	if (vid.is(".ytplayer")){
		if (typeof YT != "undefined"){
			if (typeof YT.Player != "undefined"){
				if ( !(videoId in SpimeEngine.YTPlayers)) {
					setTimeout(function(){
						SpimeEngine.YTPlayers[videoId] =  new YT.Player(videoId + "-vidframe", {});
						SpimeEngine.YTPlayers[videoId].addEventListener("onStateChange", "onytplayerStateChange");
					},300);
				}
				SpimeEngine.sendVideoCommandOnInterval(videoId,commandName);
			}else{
				SpimeEngine.sendVideoCommandOnInterval(videoId,"init-"+commandName);
			}
		}else{
			SpimeEngine.sendVideoCommandOnInterval(videoId,"init-"+commandName);
		}
	}else if (vid.is(".vimplayer")){
		setTimeout(function(){
			if ($("#" + videoId +".magic-circle-holder").hasClass("vid-mute")){
				vid[0].contentWindow.postMessage({"method":"setVolume","value": 0}, '*');
			}
			commandName = commandName.replace("-muted","");
			vid[0].contentWindow.postMessage({"method":commandName}, '*');	
		},2000);
		
	}
};

SpimeEngine.sendVideoCommandOnInterval = function(videoId,commandName,interval){
	vidPlayer = SpimeEngine.YTPlayers[videoId];
	if (typeof interval == "undefined"){
		interval = 200;
	}
	
	if (typeof vidPlayer == "undefined" || typeof vidPlayer.playVideo == "undefined"){
		setTimeout(function(){
			if (commandName.indexOf("init-") == -1){
				SpimeEngine.sendVideoCommandOnInterval(videoId,commandName,interval*1.3);
			}else{
				SpimeEngine.sendVideoCommand(videoId,commandName.replace("init-",""));
			}
			
		},interval);
	}else{
		switch (commandName){
			case "bind-and-play":
				//vidPlayer.addEventListener("onStateChange", "SpimeEngine.videoStateChange");
				//no break...
			case "play-muted":
				vidPlayer.mute();
			case "play":
				vidPlayer.playVideo();
				break;
			case "mute":
				vidPlayer.mute();
				break;
			case "unmute":
				vidPlayer.unMute();
				break;
			case "pause":
				vidPlayer.pauseVideo();
				break;
			case "bind-state-change":
				vidPlayer.addEventListener("onStateChange", "SpimeEngine.videoStateChange");
				break;
			case "init":
			case "init-play":
			case "init-mute":
			case "init-unmute":
			case "init-pause":	
				SpimeEngine.sendVideoCommand(videoId,commandName.replace("init-",""));
				break;
			}
	}
};

function onytplayerStateChange(e) {
	  var newState = e.data;
	  for (videoId in SpimeEngine.YTPlayers){
		  var currentState = SpimeEngine.YTPlayers[videoId].getPlayerState();
		  //Playing
		  if (currentState == 1){
			  if ($("#" +videoId +":not(.element-box)").hasClass("vid-autoplay")){
				  $("#" +videoId + ":not(.element-box)").css("opacity","1");
			  }
		  }
		  //ended
		  if(typeof window["EditorHelper"] == "undefined"){
			  if (currentState == 0){
				  if ($("#" +videoId + ":not(.element-box)").hasClass("vid-loop")){
					  SpimeEngine.YTPlayers[videoId].playVideo();
				  }
			  }
		  }
	  }
}

SpimeEngine.initVideos = function(){
	//only in site and preview
	if(typeof window["EditorHelper"] == "undefined"){
		//Enable click to play
		$(".video-blocker").unbind("click").bind("click",function(){
			var videoBlocker = $(this);
			var videoElement = videoBlocker.closest(".magic-circle-holder");
			SpimeEngine.sendVideoCommand(videoElement.attr("id"),"play");
			videoBlocker.remove();
		});
	}
	//Play all autoplay videos
	$(".vid-autoplay").each(function(){
		SpimeEngine.sendVideoCommand($(this).attr("id"),"play-muted");
		if(typeof window["EditorHelper"] == "undefined"){
			$(".video-blocker").unbind("click").bind("click",function(){
				var videoBlocker = $(this);
				var videoElement = videoBlocker.closest(".magic-circle-holder");
				SpimeEngine.sendVideoCommand(videoElement.attr("id"),"play");
				videoBlocker.remove();
			});
		}
	});
	if (window.addEventListener) {
		window.addEventListener('message', SpimeEngine.vimeoMessage, false);
	}
	else {
		window.attachEvent('onmessage', SpimeEngine.vimeoMessage, false);
	}
	SpimeEngine.fitVideos();
};


SpimeEngine.vimeoMessage = function(event){
	if (!(/^https?:\/\/player.vimeo.com/).test(event.origin)) {
		//not from vimeo
	}else{
		var data = JSON.parse(event.data);
		switch (data.event) {
            case 'ready':
	        	$(".vid-mute .vimplayer").each(function(){
	    			$(this)[0].contentWindow.postMessage({"method":"setVolume","value": 0}, '*');
	    		});
	        	$(".vid-autoplay .vimplayer").each(function(){
	        		$(this).closest(".vid-autoplay").css("opacity",1)
	    		});
	            break;
		 };
	}
};

SpimeEngine.shrinkImg = function(container){
	container.closest(".master.item-box").find(".shrinkable-img").each(function(){
		var currentImg = $(this);
		var imgWidth = currentImg.width()
		if (currentImg.attr("data-width-before-shrink")){
			imgWidth = parseInt(currentImg.attr("data-width-before-shrink"));
		}else{
			currentImg.attr("data-width-before-shrink",imgWidth);
			var loadWidth = imgWidth*2;
			if (currentImg.attr("src").indexOf("=s") == -1){
				currentImg.attr("src", currentImg.attr("src") + "=s" + loadWidth);
			}
		}
		if (container.width() < imgWidth){
			if (container.closest(".master.item-box").is("[data-preset-type-id='MENUS']")){
				currentImg.css("width","70%");
			}else{
				currentImg.css("width","100%");
			}
			
			currentImg.addClass("shrinked");
		}else{
			if (currentImg.is(".shrinked")){
				currentImg.removeClass("shrinked");
				currentImg.css("width","");
			}
		}
	});
};

SpimeEngine.initDynamicStripes = function(){
	if ($("body").attr("data-caller") == "static"){
		$(".showing-feed").each(function(){
			var feedHolder = $(this);
			SpimeEngine.initDynamicStripe(feedHolder);
		});
	}
};


SpimeEngine.initDynamicStripe = function(feedHolder){
	var resolvedHost = XPRSHelper.getStaticServerPath();
	feedHolder.load(window.location.protocol + resolvedHost + "/get_part",{"vbid":feedHolder.attr("id"),"root_id":$(".master.container").attr("id"),"no_blocking_div":true},function(data, status, xhr){
		feedHolder.find(".sub.item-box").addClass("animated-opacity");
		SpimeEngine.InitHolder(feedHolder);
		LightBox.initLinks(feedHolder);
		feedHolder.addClass("loaded");
	});
};

SpimeEngine.initMaps = function(){
	if (typeof google != "undefined"){
		SpimeEngine.Geocoder = new google.maps.Geocoder();
		$(".map-frame").each(function(){
			var mapFrame = $(this);
			SpimeEngine.initMap(mapFrame);
		});
	}
};


SpimeEngine.initMap = function(mapFrame){
	var mapHolder = mapFrame.closest(".magic-circle-holder");
	mapBlocker = mapHolder.find(".map-blocker");
	if(typeof window["EditorHelper"] == "undefined"){
		mapBlocker.unbind("click").bind("click",function(){
			$(this).remove();
		});
	}
	var elementId = mapHolder.attr("id");
	var mapLat = parseFloat(mapHolder.attr("data-spimelat")) ;
	var mapLng = parseFloat(mapHolder.attr("data-spimelng")) ;
	var myLatlng = new google.maps.LatLng(mapLat,mapLng);
	var allowInteraction = true;
	
	if(typeof window["EditorHelper"] != "undefined"){
		allowInteraction = false;
	}
	var mapOptions = {
			center: myLatlng,
			zoom:8,
			disableDefaultUI:!allowInteraction,
			draggable:allowInteraction,
			zoomControl:allowInteraction,
			scrollwheel:allowInteraction
	};
	var map = new google.maps.Map(mapFrame[0],mapOptions);
	SpimeEngine.GoogleMaps[elementId]= {};
	SpimeEngine.GoogleMaps[elementId]["map"] = map;
	SpimeEngine.sendMapCommand(mapHolder,"center",{"first_time":true});
};

//MAPSFIX
SpimeEngine.initMapsEmbed = function(){
	$(".map-frame").each(function(){
		var mapFrame = $(this);
		SpimeEngine.initMapEmbed(mapFrame);
	});
}

//MAPSFIX
SpimeEngine.initMapEmbed = function(mapFrame){
	var mapHolder = mapFrame.closest(".magic-circle-holder");
	mapBlocker = mapHolder.find(".map-blocker");
	if(typeof window["EditorHelper"] == "undefined"){
		mapBlocker.unbind("click").bind("click",function(){
			$(this).remove();
		});
	}
	var mapLocation = mapHolder.attr("data-spimelocation");
	var mapLat = parseFloat(mapHolder.attr("data-spimelat")) ;
	var mapLng = parseFloat(mapHolder.attr("data-spimelng")) ;
	var myLatlng = mapLat + "," + mapLng;
	var APIKEY = "AIzaSyC_rQkOzLFzNFDolszpJnNiz-klYsz0gAw";
	var mapIFrame = $('<iframe class="map-iframe" width="100%" height="100%" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?key=' + APIKEY +'&q=' + mapLocation + '&center=' + myLatlng + '"></iframe>')
	mapFrame.empty().append(mapIFrame);
};

SpimeEngine.geoCode = function(address,callbackFunc){
	SpimeEngine.Geocoder.geocode( { 'address': address}, function(results, status) {
	  if (status == google.maps.GeocoderStatus.OK) {
		  var lat = results[0].geometry.location.lat();
		  var lng = results[0].geometry.location.lng();
		  var northeastLat = results[0].geometry.viewport.getNorthEast().lat();
		  var northeastLng = results[0].geometry.viewport.getNorthEast().lng();
		  var southwestLat = results[0].geometry.viewport.getSouthWest().lat();
		  var southwestLng = results[0].geometry.viewport.getNorthEast().lng();
		  callbackFunc(lat,lng,northeastLat,northeastLng,southwestLat,southwestLng);
	  } else {
		  XPRSHelper.xprsAlert('Geocode was not successful for the following reason: ' + status,{"title":"GEO code error","report_error":true});
	  }
	});
};

SpimeEngine.sendMapCommand = function(mapHolder,commandName,params){
	if(typeof window["EditorHelper"] === undefined){
		return;//MAPSFIX
	}
	var mapId = mapHolder.attr("id");
	if (mapHolder.hasClass("element-box")){
		mapHolder = mapHolder.find(".element.map-source");
	}
	if ( mapId in SpimeEngine.GoogleMaps){
		var map = SpimeEngine.GoogleMaps[mapId]["map"];
		switch (commandName){
			case "center":
				var mapnortheastLat =  0 ;
				var mapnortheastLng =  0 ;
				var mapsouthwestLat =  0 ;
				var mapsouthwestLng =  0 ;
				var mapLat = parseFloat(mapHolder.attr("data-spimelat"))  ;
				var mapLng = parseFloat(mapHolder.attr("data-spimelng")) ;
				var myLatlng = new google.maps.LatLng(mapLat,mapLng);
				mapnortheastLat = mapHolder.attr("data-spimenortheast-lat") ? parseFloat(mapHolder.attr("data-spimenortheast-lat")) : 0 ;
				mapnortheastLng = mapHolder.attr("data-spimenortheast-lng") ? parseFloat(mapHolder.attr("data-spimenortheast-lng")) : 0 ;
				mapsouthwestLat = mapHolder.attr("data-spimesouthwest-lat") ? parseFloat(mapHolder.attr("data-spimesouthwest-lat")) : 0 ;
				mapsouthwestLng = mapHolder.attr("data-spimesouthwest-lng") ? parseFloat(mapHolder.attr("data-spimesouthwest-lng")) : 0 ;
				google.maps.event.trigger(map, "resize");
				var viewport = null;
				if (typeof params.first_time != "undefined"){
				if (mapnortheastLat != 0){
					var ne = new google.maps.LatLng(mapnortheastLat, mapnortheastLng); 
					var sw = new google.maps.LatLng(mapsouthwestLat, mapsouthwestLng);
					viewport = new google.maps.LatLngBounds(sw,ne);
					map.fitBounds(viewport);
				}
				}else{
					map.setCenter(myLatlng);
				}
				google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
					map.setCenter(myLatlng);
				});
				google.maps.event.addListenerOnce(map, 'center_changed', function(event) {
					if (typeof SpimeEngine.GoogleMaps[mapId]["marker"] == "undefined"){
						var marker = new google.maps.Marker({
						      position: myLatlng,
						      map:SpimeEngine.GoogleMaps[mapId]["map"],
						      title: mapHolder.attr("data-spimelocation")
						  });
						SpimeEngine.GoogleMaps[mapId]["marker"] = marker;
					}else{
						if (!(SpimeEngine.GoogleMaps[mapId]["marker"].getPosition().equals(myLatlng))){
							SpimeEngine.GoogleMaps[mapId]["marker"].setPosition(myLatlng);
						}else{
						}
					}
				});
				break;
		}
	}
};

SpimeEngine.centerMaps = function(container){
	if(typeof window["EditorHelper"] === undefined){
		return;//MAPSFIX
	}
	if (typeof container != "undefined"){
		var maps = container.find(".preview-map-source");
		//console.log("for all preview maps here" + maps.length)
		maps.each(function(){
			var mapHolder = $(this);
			SpimeEngine.sendMapCommand(mapHolder,"center",{});
		});
	}else{
		var maps = $(".element-box .map-source");
		maps.each(function(){
			var mapHolder = $(this);
			SpimeEngine.sendMapCommand(mapHolder,"center",{});
		});
	}
};

SpimeEngine.fitVideos = function(container){
	if (typeof container != "undefined"){
		var vidList = container.find(".vid-cover");
		vidList.each(function(){
			var vid = $(this);
			SpimeEngine.fitVideo(vid);
		});
	}else{
		var vidList = $(".element-box .vid-cover");
		vidList.each(function(){
			var vid = $(this);
			SpimeEngine.fitVideo(vid);
		});
	}
};

SpimeEngine.fitVideo = function(vidElement){
	if (vidElement.length > 0){
		var outBox,outBoxHeight,outBoxWidth;
		if (vidElement.hasClass("preview-element")){
			vidElement.css({"width":"","height":""});
			vidElement.find("iframe").css({"width":"","height":""});
			outBox = vidElement.closest(".pic-side");
			if (outBox.length == 0){
				outBox = vidElement.closest(".preview-video-holder");
			}
			outBoxHeight = outBox.height();
		    outBoxWidth = outBox.width();
		}else{
			outBox = vidElement.closest(".master.item-box");
			outBoxHeight = parseInt(outBox.css("min-height"));
			if (outBoxHeight == 0){
				outBoxHeight = parseInt(vidElement.closest(".video-wrapper").css("height"));
			}
		    outBoxWidth = parseInt(vidElement.closest(".video-wrapper").css("max-width"));
		    if (isNaN(outBoxWidth)){
		    	outBoxWidth = vidElement.closest(".video-wrapper").width();
		    }
		}
		
		var containerRatio = outBoxWidth / outBoxHeight;
		var iframeHeight = 0;
		var iframeWidth = 0;
		if (containerRatio > 16/9){
			iframeWidth = outBoxWidth;
			iframeHeight = outBoxWidth * 16/9;
			
		}else{
			iframeHeight = outBoxHeight;// * 16/9; 
			iframeWidth = iframeHeight * 16/9;
		}
		var marginTop = (outBoxHeight - iframeHeight) / 2;
		var marginLeft =  (outBoxWidth - iframeWidth) / 2;
		vidElement.find("iframe").width(iframeWidth).height(iframeHeight).css({"margin-top": marginTop, "margin-left":marginLeft});
		vidElement.width(outBoxWidth).height(outBoxHeight);
	}
};

SpimeEngine.unfitVideo = function(vidElement){
	vidElement.find("iframe").css({"margin-top": "", "margin-left":"","width":"100%","height":"100%"});
	vidElement.css({"width":"100%","height":"100%"});
};

SpimeEngine.ArrangeContainer = function(container,whatsNext){
	if (container.closest(".fill-height").length > 0){
		SpimeEngine.fitToPageHeight(container.closest(".fill-height"));
	}
	var containerArranger = SpimeEngine.getArranger(container);
	var items = container.children("#children").find(".item-box");
	if (typeof SpimeEngine.arrangers[containerArranger] != "undefined"){
		SpimeEngine.arrangers[containerArranger].arrange(items,container,whatsNext);
	}else{
		console.error("bad arranger " + containerArranger);
	}
};


SpimeEngine.fitToPageHeight = function(stripe){
	return;
	var stripeNewHeight = $(window).height();
	if(typeof window["EditorHelper"] != "undefined"){
		if ( $(".tablet-preview").length == 0 && $(".cellphone-preview").length == 0){
			stripeNewHeight -= 50; //topbar
		}
		if ( $(".tablet-preview").length > 0){
			stripeNewHeight -= 80;
		}
		if ( $(".cellphone-preview").length > 0){
			stripeNewHeight -= 110;
		}
	}
	
	if ((stripe.prevAll(".master.item-box[data-preset-type-id='MENUS']").length > 0 && stripe.prevAll(".master.item-box").not("[data-preset-type-id='MENUS']").not("[data-child-type='RAW']").length == 0) || stripe.nextAll(".master.item-box[data-preset-type-id='MENUS']").length > 0){
		 var menuStripe = $(".master.item-box[data-preset-type-id='MENUS']");
		 if (!menuStripe.is(".force-transparency") && menuStripe.css("display") != "none"){
			var menuHeight  = menuStripe.height() //+ ((EditorHelper === undefined) ? 0 : 50);
			stripeNewHeight -= menuHeight;
		 }
	}
	
	stripeNewHeight -= parseInt(stripe.css("padding-top")) + parseInt(stripe.css("padding-bottom"))
	
	var footerSize = 0;
   	footerSize = stripe.find(".stripe-header-wrapper").height() + stripe.find(".stripe-footer-wrapper").height();
	stripe.css("min-height",stripeNewHeight - footerSize);
};

SpimeEngine.showItem = function(parentHolder,itemToShowId){
	var holderType = SpimeEngine.getHolderType(parentHolder);
		if (holderType == "gallery"){
			var currentContainer = parentHolder.find(".sub.container");
			var containerArranger = SpimeEngine.getArranger(currentContainer);
			var items = currentContainer.find(".sub.item-box");
			if (typeof SpimeEngine.arrangers[containerArranger] != "undefined"){
				if (typeof SpimeEngine.arrangers[containerArranger].showItem != "undefined"){
					SpimeEngine.arrangers[containerArranger].showItem(currentContainer,items,itemToShowId);
				}
			}else{
				console.error("bad arranger for show item " + containerArranger);
			}
		}
};

SpimeEngine.submitClick = function(currentLink,mailTo){
	if (window.location.href.indexOf(".com/free/") != -1 || window.location.href.indexOf(".com/viewer/") != -1 || window.location.href.indexOf(".com/serve_static/") != -1){
			alert("For security reasons form submit is not available from preview URLs");
			return;
		}
		if ($("#g-recaptcha-response").length > 0){
			//support for multiple forms
			var recaptchaResponse = $(".g-recaptcha-response").filter(function(){return $(this).val() != ''}).val()
			if (recaptchaResponse === undefined){
				$(".g-recaptcha").css("border","1px solid red");
				setTimeout(function(){
					$(".g-recaptcha").css("border","")
				},2000);
				return;
			}
		}
		var containingItem = currentLink.closest(".item-box");
		var formFields = containingItem.find(".Field:not(.no-value)");
		var thankYouText = currentLink.attr("data-text");
		var submitParams = {};
		var siteName = window.location.hostname
		submitParams["xprs_mail_to"] = mailTo;
		submitParams["xprs_site_name"] = siteName;
		submitParams["g-recaptcha-response"] = recaptchaResponse;
		var formIsValid = true;
		var isRegistrationForm = false;
		var registrationEmail = "";
		var registrationName = "";
		var fieldsOrder = [];
		formFields.each(function(){
			var currentField = $(this);
			if (!(SpimeEngine.validateField(currentField))){
				formIsValid = false;
				if (currentField.attr("type") != "date"){
					currentField.addClass("erred-user-form-field");
				}else{
					currentField.parent().addClass("erred-user-form-field");
				}
			}else{
				currentField.removeClass("erred-user-form-field");
			}
			if (currentField.hasClass("field-email")){
				isRegistrationForm = true;
				registrationEmail = currentField.val();
			}
			if (currentField.attr("name").toLowerCase() == "name"){
				registrationName = currentField.val();
			}
			if (currentField.is("input[type=checkbox]")){
				submitParams[currentField.attr("name")] = currentField.is(":checked");
			}else{
				submitParams[currentField.attr("name")] = currentField.val();
			}
			fieldsOrder.push(currentField.attr("name"))
		});
		submitParams["fields_order"] = fieldsOrder.join("&&&");
		submitParams["separator"] = "&&&"
		if (formIsValid){
			currentLink.find(".item-link").closest(".removable-parent").fadeTo(1000,0, function(){
				$(this).unbind("click").css({"visibility":"hidden","cursor":"default"});
			});
			$(".g-recaptcha").fadeTo(1000,0);
			var resolvedHost = location.host;
			//This is a live site
			if (resolvedHost.indexOf("appspot") == -1 && resolvedHost.indexOf("localhost") == -1 && resolvedHost.indexOf("127.0.0.1") == -1){
				resolvedHost = "www.imdomainrouter.com";
			}
			XPRSHelper.POST(XPRSHelper.getParentWindow().location.protocol+'//'+  resolvedHost + "/form_submit", submitParams, function(){
				var thankyouDiv = $("<div />").addClass("preview-element preview-subtitle magic-circle-holder text-element").text(thankYouText);
				var form = currentLink.closest(".preview-item-links").siblings(".preview-form");
				var formHeightBeforeEmpty = form.outerHeight(true);// + currentLink.closest(".preview-item-links").outerHeight(true);
				var formWidthBeforeEmpty = form.find(".Field").width();
				form.fadeTo(1000,0, function(){
					thankyouDiv.width(formWidthBeforeEmpty);
					form.height(formHeightBeforeEmpty);
					var middleTop = formHeightBeforeEmpty /2 - thankyouDiv.height() / 2; 
					form.empty().first().append(thankyouDiv).fadeTo("fast",1);
					thankyouDiv.css({"top":middleTop,"position":"relative"});
				});
				if (isRegistrationForm){
					try{
			    		if (typeof IMOS != "undefined"){
			    			IMOS.trackGoal("Registration",{"email":registrationEmail,"nickname":registrationName});
			    			if (currentLink.attr("data-mailing-list")){
			    				submitParams["mailing_list_id"] = currentLink.attr("data-mailing-list");
			    			}
			    			IMOS.handleNewsLetterIntegration(submitParams);
						}
						if (typeof imosSdk != "undefined"){
							imosSdk.setEmail(registrationEmail);
						}
					}catch(err){
					}
				}
			});
		}
};


SpimeEngine.initForms = function(stripe){
	//Only in viewer mode
	if(typeof window["EditorHelper"] == "undefined"){
		var links = $("a[data-link-type='SUBMIT']");
		links.each(function(){
			var currentLink = $(this);
			var mailTo = currentLink.attr("href");
			currentLink.removeAttr("href");
			currentLink.addClass("clickable");
			var recaptcha = $("<i />").addClass("clickable g-recaptcha").attr("data-sitekey", SpimeEngine.captchaKey).css("pointer-events","auto").css({"display":"block","margin":"5px","box-sizing":"border-box"});
			currentLink.before(recaptcha);
			currentLink.unbind("click").bind("click",function(){
				SpimeEngine.submitClick(currentLink,mailTo);
			});
		});
	}
	var allFields = $(".Field");
	var links = $("a[data-link-type='SUBMIT']");
	if (typeof stripe != "undefined"){
		allFields = stripe.find(".Field");
	}
	allFields.each(function(){
		var currentField = $(this);
		SpimeEngine.setPlaceholderFunc(currentField);
	});
};

SpimeEngine.setPlaceholderFunc = function(currentField){
	var currentFieldEl = currentField.get(0);
	if (currentField.is("select") || currentField.attr("type") == "date"){
		currentFieldEl.addEventListener("change", function(){$(this).parent().andSelf().removeClass("erred-user-form-field")});
	}
	if (currentField.attr("type") == "date" || currentField.attr("type") == "checkbox" || currentField.is("label") || currentField.is("select")){
		return;
	}
	var currentPlaceholder = currentField.attr("placeholder");
	currentField.addClass("placeholder-mode");
	currentField.val(currentPlaceholder);
	currentField.attr("data-placeholder", currentPlaceholder);
	currentField.removeAttr("placeholder");
	
	currentFieldEl.addEventListener("focus", SpimeEngine.setCaret, false);
	currentFieldEl.addEventListener("drop", SpimeEngine.setCaret, false);
	currentFieldEl.addEventListener("click", SpimeEngine.setCaret, false);
	currentFieldEl.addEventListener("keydown", SpimeEngine.clearPlaceholder, false);
	currentFieldEl.addEventListener("keyup", SpimeEngine.restorePlaceHolder, false);
	currentFieldEl.addEventListener("blur", SpimeEngine.restorePlaceHolder, false);
};


// Set caret at the beginning of the input
SpimeEngine.setCaret = function (evt) {
    if (this.value === this.getAttribute("data-placeholder")) {
    	if(typeof this.setSelectionRange != "undefined"){
    		this.setSelectionRange(0, 0);
    	}
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    }
};

// Clear placeholder value at user input
SpimeEngine.clearPlaceholder = function (evt) {
	var currentField = this;
	if (currentField.getAttribute("type") == "date"){
		return;
	}
	 if (!(evt.shiftKey && evt.keyCode === 16) && evt.keyCode !== 9) {
	        if (this.value === this.getAttribute("data-placeholder")) {
	        	setTimeout(function(){
	        		currentField.value = currentField.value.replace(currentField.getAttribute("data-placeholder"),"");
	        	},1)
	        	
	        }
	        this.className = this.className.replace("placeholder-mode" ,"");
	    } 
};

SpimeEngine.restorePlaceHolder = function (evt) {
	var currentField = this;
	if (evt.type == "keyup"){
		$(this).removeClass("erred-user-form-field");
	}
	var args = arguments;
	setTimeout(function(){
	    if (currentField.value.length === 0) {
	    	currentField.value = currentField.getAttribute("data-placeholder");
	        SpimeEngine.setCaret.apply(currentField, args);
	        currentField.className = currentField.className + " placeholder-mode";
	    }
	},50);
};

SpimeEngine.validateField = function(currentField){
	var fieldValueToCheck = currentField.val();
	var passedMandatory = true;
	if (currentField.hasClass("field-mandatory") || currentField.is("[required]")){
		passedMandatory = (currentField.val() != "" && currentField.val() != currentField.attr("data-placeholder"));
		if (currentField.is("input[type=checkbox]")){
			passedMandatory = currentField.is(":checked");
		}
	}
	if (fieldValueToCheck == currentField.attr("data-placeholder")){
		fieldValueToCheck = "";
	}
	if (currentField.hasClass("field-email")){
		return passedMandatory && SpimeEngine.validateEmail(fieldValueToCheck);
	}
	if (currentField.hasClass("field-phone")){
		if (currentField.val() != currentField.attr("data-placeholder")){
			return passedMandatory && SpimeEngine.validatePhone(fieldValueToCheck);
		}
	}
	return passedMandatory;
};

SpimeEngine.validateEmail = function(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email) || email == "";
};

SpimeEngine.validatePhone = function(phone) { 
	var strippedPhone = phone.replace("+","").replace("-","");
	var phoneAsNumber =  parseInt(strippedPhone);
	if (isNaN(phoneAsNumber)){
		return false || strippedPhone == "";
	}
    return true;
};

SpimeEngine.setInitialShrinkerData = function(items,textPrefix){
	var previewTitle = items.find("." + textPrefix + "preview-title");
	var previewSubtitle = items.find("." + textPrefix + "preview-subtitle");
	var previewTitleFontSize = 0;
	var previewSubtitleFontSize = 0;
	if (previewTitle.length > 0){
		if (!(previewTitle.attr("data-orig-font-size"))){
			previewTitleFontSize = Math.round(parseInt(previewTitle.css("font-size")));
			previewTitle.attr("data-orig-font-size",previewTitleFontSize);
		}
	}
	if (previewSubtitle.length > 0){
		if (!(previewSubtitle.attr("data-orig-font-size"))){
			previewSubtitleFontSize = Math.round(parseInt(previewSubtitle.css("font-size")));
			previewSubtitle.attr("data-orig-font-size",previewSubtitleFontSize);
		}
	}
};

SpimeEngine.shrinkText = function(items,paramsFromRealTime,textPrefix){
	return
	items.find(".text-side").css("display","block");
	var previewTitle = items.find("." + textPrefix + "preview-title");
	var previewSubtitle = items.find("." + textPrefix + "preview-subtitle");
	previewTitle.removeClass("disable-max-width");
	previewSubtitle.removeClass("disable-max-width");
	
	
	var shrinkPlease = true;
	if (typeof paramsFromRealTime != "undefined" ){
		if (typeof paramsFromRealTime.value != "undefined"){
			shrinkPlease = false;
		}
	}
	if (shrinkPlease){
		var previewTitleOriginalFontSize = 9999;
		var previewSubtitleOriginalFontSize = 9999;
		if (previewTitle.length > 0){
			previewTitleOriginalFontSize = Math.round(parseInt(previewTitle.attr("data-orig-font-size")));
			previewTitle.css("font-size",previewTitleOriginalFontSize);
		}
		if (previewSubtitle.length > 0){
			previewSubtitleOriginalFontSize = Math.round(parseInt(previewSubtitle.attr("data-orig-font-size")));
			previewSubtitle.css("font-size",previewSubtitleOriginalFontSize);
		}
	
		var titleMinFontSize = 9999;
		var subtitleMinFontSize = 9999;
		items.each(function(){
			var currentItem = $(this);
			var currentTitle = currentItem.find("." + textPrefix + "preview-title");
			var currentSubtitle = currentItem.find("." + textPrefix + "preview-subtitle");
			var contentHolder = currentItem.find(".shrinker-content");
			var parent = contentHolder.closest(".shrinker-parent");
			var offset = 0;
			var minimalFontSize = 10;
			var contentHolderPadding = parseInt(contentHolder.css("padding-left")) + parseInt(contentHolder.css("padding-right")) +parseInt(contentHolder.css("margin-left")) + parseInt(contentHolder.css("margin-right")); 
			if (previewSubtitleOriginalFontSize != 9999 && previewSubtitleOriginalFontSize > previewTitleOriginalFontSize){
				titleMinFontSize = SpimeEngine.tryToShrink(   currentTitle,    previewTitleOriginalFontSize,    titleMinFontSize,    currentItem, contentHolderPadding, offset, minimalFontSize, false);
				subtitleMinFontSize = SpimeEngine.tryToShrink(currentSubtitle, previewSubtitleOriginalFontSize, subtitleMinFontSize, currentItem, contentHolderPadding, offset, minimalFontSize, false);
				titleMinFontSize = SpimeEngine.tryToShrink(   currentTitle,    previewTitleOriginalFontSize,    titleMinFontSize,    currentItem, contentHolderPadding, offset, minimalFontSize, true);
			}else{
				subtitleMinFontSize = SpimeEngine.tryToShrink(currentSubtitle, previewSubtitleOriginalFontSize, subtitleMinFontSize, currentItem, contentHolderPadding, offset, minimalFontSize, false);
				titleMinFontSize = SpimeEngine.tryToShrink(   currentTitle,    previewTitleOriginalFontSize,    titleMinFontSize,    currentItem, contentHolderPadding, offset, minimalFontSize, false);
				subtitleMinFontSize = SpimeEngine.tryToShrink(currentSubtitle, previewSubtitleOriginalFontSize, subtitleMinFontSize, currentItem, contentHolderPadding, offset, minimalFontSize, true);
			}
		});
		
		items.each(function(){
			$(this).find(".text-side").css("display","");
			var currentTitle = $(this).find("." + textPrefix + "preview-title");
			if (currentTitle.length > 0){
				if (titleMinFontSize != 9999){
					currentTitle.css("font-size",titleMinFontSize);
				}
			}
			var currentSubtitle = $(this).find("." + textPrefix + "preview-subtitle");
			if (currentSubtitle.length > 0){
				if (subtitleMinFontSize != 9999){
					currentSubtitle.css("font-size",subtitleMinFontSize);
				}
			}
		});
	}
};


SpimeEngine.tryToShrink = function(textElementToShrink,textElementOriginalFontSize,textElementMinFontSize, currentItem, contentHolderPadding,offset , minimalFontSize,revertToOriginalSize){
	var contentHolder = currentItem.find(".shrinker-content");
	var parent = contentHolder.closest(".shrinker-parent");
	if(textElementToShrink.length > 0){
		if (parent.width() < textElementToShrink.parent().outerWidth(true) + contentHolderPadding){
			contentHolder = currentItem.find(".shrinker-content");
			parent = contentHolder.closest(".shrinker-parent");
		}else{
			contentHolder = textElementToShrink;
			parent = 	 textElementToShrink.parent();
		}
		var delta = Math.abs(contentHolder.outerWidth(true) - parent.width());
		if (delta > 1) {
			//still no room
			//revert to original font size
			if (revertToOriginalSize){
				textElementToShrink.css("font-size",textElementOriginalFontSize);
			}
			if (contentHolder.outerWidth(true) + offset> parent.width() || contentHolder.outerHeight(true)  > parent.outerHeight(true) ){
				//try shrinking the subtitle
				textElementMinFontSize = Math.min(textElementMinFontSize,SpimeEngine.shrinkTextToFit(textElementOriginalFontSize,parent,contentHolder,textElementToShrink,offset,minimalFontSize));
				return textElementMinFontSize;
			}
		}
	}
	return textElementMinFontSize;
};


SpimeEngine.evenItemsHeights = function(holder){
	if (holder.is(".sub.container.matrix")){
		var maxHeightsArray = {"PREVIEW_ICON":{"SELECTOR":".preview-icon-holder, .element-placeholder[data-elementtype='ICON']","MAX_HEIGHT":0,"MAX_HEIGHT_FOR_PLACEHOLDER":0},
				   "PREVIEW_TITLE":{"SELECTOR":".preview-element[data-menu-name='PREVIEW_TITLE'], .element-placeholder[data-elementtype='TITLE']","MAX_HEIGHT":0,"MAX_HEIGHT_FOR_PLACEHOLDER":0},
				   "PREVIEW_SUBTITLE":{"SELECTOR":".preview-element[data-menu-name='PREVIEW_SUBTITLE'], .element-placeholder[data-elementtype='SUBTITLE']","MAX_HEIGHT":0,"MAX_HEIGHT_FOR_PLACEHOLDER":0},
				   "PREVIEW_BODY":{"SELECTOR":".preview-element[data-menu-name='PREVIEW_BODY'], .element-placeholder[data-elementtype='BODY']","MAX_HEIGHT":0,"MAX_HEIGHT_FOR_PLACEHOLDER":0},
				   "PREVIEW_PRICE":{"SELECTOR":".preview-element[data-menu-name='PREVIEW_PRICE'], .element-placeholder[data-elementtype='PRICE']","MAX_HEIGHT":0,"MAX_HEIGHT_FOR_PLACEHOLDER":0},
				   //"PREVIEW_FORM":{"SELECTOR":".preview-form","MAX_HEIGHT":0},
				   "PREVIEW_LINKS":{"SELECTOR":".preview-item-links","MAX_HEIGHT":0},
				   "PREVIEW_SOCIAL":{"SELECTOR":".preview-element[data-menu-name='PREVIEW_SOCIAL'], .element-placeholder[data-elementtype='SOCIAL']","MAX_HEIGHT":0,"MAX_HEIGHT_FOR_PLACEHOLDER":0}};
		var arrangerSettings = holder.find(".arranger-settings");
		var isMazonite = arrangerSettings.attr("data-arranger_order_type") == "mazonite";
		var relevantItems = holder.find("#items-holder .sub.item-box");
		if (isMazonite){
			//debugger;
			relevantItems.find(".item-details").css("height","");
			relevantItems.each(function(){
				var currentItem = $(this);
				for(i in maxHeightsArray){
					var relevantElement = currentItem.find(maxHeightsArray[i].SELECTOR);
					relevantElement.css("min-height","");
				}
			});
			SpimeEngine.positionMazonite(holder);
			return;
		}else{
			SpimeEngine.resetMazonite(holder);
		}
		var maxHeight = 0;
		relevantItems.find(".item-details").css("height","");
		if (relevantItems.filter("[data-row='1']").length != 1 ){
			relevantItems.each(function(){
				var currentItem = $(this);
				itemDetailsHeight = currentItem.find(".item-details").height();
				maxHeight = Math.max(maxHeight,itemDetailsHeight);
				SpimeEngine.updateMaxHeightMap(maxHeightsArray,currentItem);
			});
			if(relevantItems.find(".helper-div.middle-center").length > 0){
				relevantItems.find(".item-details").css("height",maxHeight);
			}
			SpimeEngine.evenElementsHeight(maxHeightsArray,holder);
		}else{
			relevantItems.each(function(){
				var currentItem = $(this);
				for(i in maxHeightsArray){
					var relevantElement = currentItem.find(maxHeightsArray[i].SELECTOR);
					relevantElement.css("min-height","");
				}
			});
		}
	}
};


SpimeEngine.positionMazonite = function(holder){
	if (holder.is(".sub.container.matrix")){
		holder.find("#items-holder").css({"position":"relative","height":"100%"});
		holder.find("#items-holder-wrapper").css({"height":"100%"})
		var arrangerSettings = holder.find(".arranger-settings");
		var spacing = parseInt(arrangerSettings.attr("data-arranger_item_spacing"));
		var items = holder.find("#items-holder").find(".sub.item-box");
		var itemsWidth = items.width();
		var heightsArr = [];//new Array(items.filter("[data-row='1']").length);
		var cols = items.filter("[data-row='1']").length;
		var topOffset = spacing;
		var stripeHeader = holder.find(".stripe-header-wrapper");
		
		
		for (var i = 0; i < cols ; i++){
			heightsArr.push(0)
		}
		var minValIndex = 0;
		var itemIndex = 0;
		items.each(function(){
			var currentItem = $(this);
			var minVal = heightsArr[0];
			for (j in heightsArr){
				if (heightsArr[j] == 0){
					minVal = heightsArr[j];
					minValIndex = j;
					break;
				}
				if (heightsArr[j] <= minVal){
					minVal = heightsArr[j];
					minValIndex = j;
				}
			}
			var relevantSpacing = (minValIndex % cols == 0) ? 0 : spacing;
			var relevantTopSpacing = (itemIndex < cols) ? 0 : spacing;
			currentItem.css({"position":"absolute","left":itemsWidth*minValIndex + minValIndex*relevantSpacing*2,"top":topOffset + heightsArr[minValIndex] + relevantTopSpacing*2,"margin":"0px"});
			// if (cols == 1){
				// var holderWidth  = holder.width();
				// if ( holderWidth > currentItem.width()){
				// 	var centrelizedLeft = (holderWidth / 2) - (currentItem.width() / 2);
				// 	currentItem.css({"left":centrelizedLeft});
				// }
			// }
			heightsArr[minValIndex] += parseInt(currentItem.height()) + relevantTopSpacing*2;
			itemIndex++;
		});
		
	}
	var maxHeight = 0
	for(i in heightsArr){
		if (heightsArr[i] > maxHeight){
			maxHeight = heightsArr[i];
		}
	}
	if (stripeHeader.length > 0){
		topOffset += stripeHeader.outerHeight(true);
	}
	holder.closest(".master.item-box").height(maxHeight + topOffset + spacing).addClass("mazonite");
};


SpimeEngine.resetMazonite = function(holder){
	if (holder.is(".sub.container.matrix")){
		holder.find("#items-holder").find(".sub.item-box").css({"position":"","left":"","top":"","display":""});
		holder.closest(".master.item-box").css("height","").removeClass("mazonite");
		holder.find("#items-holder").css({"position":"","height":""});
		holder.find("#items-holder-wrapper").css({"height":""})
	}
};

SpimeEngine.updateMaxHeightMap = function(maxHeightsArray,currentItem){
	for(i in maxHeightsArray){
		var relevantElement = currentItem.find(maxHeightsArray[i].SELECTOR);
		relevantElement.css("min-height","");
		var currentHeight = relevantElement.height();
		var heightForPlaceholder = relevantElement.outerHeight(true);
		maxHeightsArray[i].MAX_HEIGHT = Math.max(currentHeight,maxHeightsArray[i].MAX_HEIGHT);
		maxHeightsArray[i].MAX_HEIGHT_FOR_PLACEHOLDER = Math.max(heightForPlaceholder,maxHeightsArray[i].MAX_HEIGHT_FOR_PLACEHOLDER);
	}
};

SpimeEngine.evenElementsHeight = function(maxHeightsArray,holder){
	if (holder.find(".helper-div.middle-center").length > 0 && holder.find(".item-details").css("vertical-align") == "middle"){
		return;
	}
	for(i in maxHeightsArray){
		holder.find(".sub.item-box").not(".stripe-header").not(".stripe-footer").find(maxHeightsArray[i].SELECTOR).each(function(){
			var currentElement = $(this);
			currentElement.css("min-height",maxHeightsArray[i].MAX_HEIGHT);
			if (currentElement.is(".element-placeholder")){
				currentElement.css({"display":"block","visibility":"hidden"})
				currentElement.css("min-height",maxHeightsArray[i].MAX_HEIGHT_FOR_PLACEHOLDER);
			}
			if (currentElement.is(".preview-icon-holder")){
				var icon = currentElement.find(".magic-circle-holder");
				icon.css("padding-top",(maxHeightsArray[i].MAX_HEIGHT/2) - (icon.height()/2));
			}
		});
	}
};

SpimeEngine.updateImageRealSize = function(element){
	if (!(element.attr("data-orig-width")) && element.attr("id") != "no-image"){
		var src = element.css("background-image").substring(4, element.css("background-image").length - 1);
		if (src.indexOf('"') != -1){
			src = src.substring(1,src.length - 1)
		}
		$("<img/>")
		.attr("src",src)
		.load(function() {
		    pic_real_width = this.width;
		    pic_real_height = this.height;
		    element.attr("data-orig-width",pic_real_width)
		    element.attr("data-orig-height",pic_real_height)
		});
	}
}

SpimeEngine.shrinkTextToFit = function(fontSize, parent,contentHolder,textElement,offset,minFontSize,noMoreShrinkCallback){
	if (isNaN(fontSize)){
		return -1;
	}
	if (fontSize == "N/A"){
		return -1;
	}
	if (contentHolder.outerWidth(true) + offset> parent.width() || contentHolder.outerHeight(true)  > parent.outerHeight(true) ){
		
		var shrinkedFontSize =  fontSize * 0.9 ;
		if (shrinkedFontSize < minFontSize){
			if (typeof noMoreShrinkCallback != "undefined"){
				noMoreShrinkCallback();
			}
		}else{
			textElement.css("font-size",shrinkedFontSize);
			return SpimeEngine.shrinkTextToFit(shrinkedFontSize,parent,contentHolder,textElement,offset,minFontSize,noMoreShrinkCallback);
		}
		
	}else{
		return parseInt(textElement.css("font-size"));
	}
};

SpimeEngine.updateParent = function(msg){
	XPRSHelper.getParentWindow().postMessage(msg, '*');
};

SpimeEngine.receiveMessage = function(event){
	console.log(event.data);
};

/******************************************************************************************************
 *                                               HELPERS
 *                                        helper methods and utils
 ******************************************************************************************************/

SpimeEngine.DebugPrint = function(msg){
	if (SpimeEngine.debugMode){
		//The only place console write may exist !
		console.debug( msg);
	}
};

SpimeEngine.getArranger = function(container){
	var arrangerSettings = container.children(".arranger-settings");
	return arrangerSettings.attr("data-arranger_type");
};

SpimeEngine.getLayout = function(container){
	var layoutSettings = container.children(".layout-settings");
	return layoutSettings.attr("data-type");
};

SpimeEngine.splitHostname = function(url) {
    var result = {};
    var regexParse = new RegExp('([a-z\-0-9]{2,63})\.([a-z\.]{2,7})$');
    var urlParts = regexParse.exec(url);
    result.domain = urlParts[1];
    result.type = urlParts[2];
    result.subdomain = url.replace(result.domain + '.' + result.type, '').slice(0, -1);;
    return result;
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
SpimeEngine.start();