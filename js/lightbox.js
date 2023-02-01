/******************************************************************************************************
 *                                             SPIME START 
 ******************************************************************************************************/
var LightBox = {};

/******************************************************************************************************
 *                                               MAIN
 *                                  called from body onLoad func    
 ******************************************************************************************************/

LightBox.initLinks = function(holder){
	//Only in viewer mode
	if(typeof window["EditorHelper"] == "undefined"){
		var links;
		if (holder){
			links = holder.find("a[data-link-type='LIGHTBOX']");
		}else{
			links = $("a[data-link-type='LIGHTBOX']");
		}
		links.each(function(){
			var currentLink = $(this);
			currentLink.removeAttr("href");
			currentLink.removeAttr("target");
			currentLink.addClass("clickable");
			//blocking media widgets to show lightbox
			if (currentLink.closest(".item-box").find("[data-menu-name='PREVIEW_RAW']").length > 0 && currentLink.is(".image-link")){
				currentLink.remove();
			}
			currentLink.unbind("click").bind("click",function(e){
				e.stopPropagation();
				//blocking media widgets to show lightbox
				if (currentLink.closest(".item-box").find("[data-menu-name='PREVIEW_RAW']").length > 0){
					e.preventDefault();
					return false;
				}
				LightBox.itemClick($(this).closest(".item-content"));
				return false;
			});
		});
		
		var registerLinks ;
		if (holder){
			registerLinks = holder.find("a[href^='register://'] , a[href^='registers://']");
		}else{
			registerLinks = $("a[href^='register://'], a[href^='registers://']");
		}
		if (registerLinks.length > 0){
			if (typeof XPRSTranslator == "undefined"){
				$("<script/>").attr("src", XPRSHelper.getServerPath() + "/translation_js").appendTo("head");
				$("<script/>").attr("src", XPRSHelper.getServerPath() + "/js/lib/jquery.cookie.min.js").appendTo("head");
				var loginWrapper = $("<div/>").attr("id","lightbox-menus-holder").css({"height":"100%","width": "100%","position":"fixed","top": "0px","left": "0px","display": "table","background-color": "rgba(0,0,0,0.1)","z-index":"99999999"}).hide();
				$("body").append(loginWrapper);
				loginWrapper.load(XPRSHelper.getServerPath() +  "/login?form_only=true")
			}
		}
		registerLinks.each(function(){
			var currentLink = $(this);
			currentLink.attr("data-href",currentLink.attr("href").replace("register://","http://").replace("registers://","https://"));
			currentLink.removeAttr("href");
			currentLink.removeAttr("target");
			currentLink.addClass("clickable");
			currentLink.unbind("click").bind("click",function(e){
				e.stopPropagation();
				XPRSHelper.invokeLogin(function(){
					location.href = currentLink.attr("data-href");
				  },"register");
				return false;
			});
		});

	}
};


LightBox.itemClick = function(currentItem){
	var imageSrc = currentItem.attr("data-bgimg");
	var videoSrc = "";
	var videoFrame = currentItem.find(".video-frame");
	if (videoFrame.length > 0){
		//var videoFrame = currentItem.find(".video-frame");
		if (videoFrame.length > 0){
			videoSrc = videoFrame.attr("src");
		}
	}
	if (imageSrc == ""){
		//no image
		return;
	}
	
	var title = currentItem.find(".preview-title");
	var subtitle = currentItem.find(".preview-subtitle");
	
	var currentHolder = currentItem.closest(".item-box");
	var itemSiblings = currentHolder.siblings(".sub.item-box").not(":has([data-menu-name='PREVIEW_RAW'])");
	if (itemSiblings.length > 0){
		itemSiblings = itemSiblings.add(currentHolder);
	}
	var lightboxWrapper = $(".light-box-wrapper");
	var closeBtn = lightboxWrapper.find(".close-lightbox-btn");
	closeBtn.unbind("click").bind("click",function(e){
		e.stopPropagation();
		//remove the video before closing
		$(".light-box-wrapper").find("iframe").remove();
		$(".light-box-wrapper").hide();
	});
	var stripe = currentHolder.closest(".master.item-box");
	var downloadBtn = lightboxWrapper.find(".download-gallery-btn");
	if (stripe.find(".container").attr("data-allow-download") == "true"){
		downloadBtn.show();
		downloadBtn.unbind("click").bind("click",function(e){
			e.stopPropagation();
			location.href = XPRSHelper.getStaticServerPath() + "/download_gallery?vbid=" + stripe.attr("id");
		});
	}else{
		downloadBtn.hide();
	}
	
	//Close lightbox when clicking outside the image
	lightboxWrapper.unbind("click").bind("click",function(e){
			e.stopPropagation();
			//remove the video before closing
			$(".light-box-wrapper").find("iframe").remove();
			$(".light-box-wrapper").hide();
	});
	
	
	var lightboxImageHolder = lightboxWrapper.find(".light-box-image-holder");
	var lightboxImage = lightboxImageHolder.find(".light-box-image");
	
	//Catch the click (do not close when clicking on the image
	lightboxImage.unbind("click").bind("click",function(e){
		e.stopPropagation();
	});
	
	var textWrapper = lightboxWrapper.find(".lightbox-text-wrapper");
	var textHolder = textWrapper.find(".lightbox-text-holder");
	var titleHolder = textWrapper.find(".lightbox-title").text(title.text());
	var subtitleHolder = textWrapper.find(".lightbox-subtitle").text(subtitle.text());
	var imageOrigHeight = currentItem.attr("data-orig-thumb-height");
	var imageOrigWidth = currentItem.attr("data-orig-thumb-width");
	var newWidth = parseInt(imageOrigWidth);
	if (isNaN(newWidth)){
		newWidth = 1600;
	}else{
		newWidth = Math.min(parseInt(imageOrigWidth),1600)
	}
	var imageId = currentItem.attr("data-vbid");
	lightboxImage.find("iframe").remove();
	if (videoSrc != ""){
		lightboxImage.attr("data-videosrc",videoSrc);
		var videoIframe = $("<iframe />").css({"width":"100%","height":"100%","border":"none"}).attr("src",videoSrc);
		lightboxImage.append(videoIframe);
		lightboxImage.css("background-image","");
	}else{
		if(!currentHolder.closest(".master.item-box").is(".showing-feed")){
			lightboxImage.css("background-image","url('"+ imageSrc + "=s" + newWidth +"')");
		}else{
			lightboxImage.css("background-image","url('"+ imageSrc + "')");
		}
		lightboxImage.attr("data-orig-thumb-height",imageOrigHeight);
		lightboxImage.attr("data-orig-thumb-width",imageOrigWidth);
	}
	
	//lightboxImage.attr("data-orig-thumb-height",imageOrigHeight);
	//lightboxImage.attr("data-orig-thumb-width",imageOrigWidth);
	
	lightboxImage.attr("data-vbid",imageId);
	//titleHolder.css({"color":title.css("color"),"text-shadow":title.css("text-shadow"),"font-family":title.css("font-family")});
	//subtitleHolder.css({"color":subtitle.css("color"),"text-shadow":subtitle.css("text-shadow"),"font-family":subtitle.css("font-family")});
	titleHolder.css({"font-family":title.css("font-family"),"text-align":title.css("text-align")});
	if (title.css("text-align") == "center"){
		titleHolder.css({"margin-left":"auto","margin-right":"auto"});
	}else if (title.css("text-align") == "right"){
		titleHolder.css({"margin-left":"auto","margin-right":""});
	}else{
		titleHolder.css({"margin-left":"","margin-right":""});
	}
	subtitleHolder.css({"font-family":subtitle.css("font-family"),"text-align":subtitle.css("text-align")});
	if (subtitle.css("text-align") == "center"){
		subtitle.css({"margin-left":"auto","margin-right":"auto"});
	}else if (subtitle.css("text-align") == "right"){
		subtitle.css({"margin-left":"auto","margin-right":""});
	}else{
		subtitle.css({"margin-left":"","margin-right":""});
	}
	lightboxWrapper.show();
	setTimeout(function(){
		XPRSHelper.onCssTransitionFinish(lightboxImage,function(){
			textHolder.css("opacity","1");
			closeBtn.css("opacity","1");
			LightBox.arrange();
		});
		
	},0);
	LightBox.addPagination(textHolder,lightboxWrapper,itemSiblings);
};

LightBox.arrange = function(){
	var lightboxWrapper = $(".light-box-wrapper");
	var offset = (typeof window["EditorHelper"] == "undefined") ? 0 : 50;
	if (lightboxWrapper.is(":visible")){
		var lightboxImageHolder = lightboxWrapper.find(".light-box-image-holder");
		var lightboxImage = lightboxImageHolder.find(".light-box-image");
		var lightboxTextWrapper = lightboxWrapper.find(".lightbox-text-wrapper");
		var deviceWidth = $(".main-page").width();
		var deviceHeight = Math.min($(window).height(),$(".main-page").height()) - offset;//$(".main-page").height() - lightboxTextWrapper.height();

		var borderWidth = deviceWidth* 0.1;
		var borderHeight = deviceHeight* 0.2;
		var imageOrigHeight = lightboxImage.attr("data-orig-thumb-height");
		var imageOrigWidth = lightboxImage.attr("data-orig-thumb-width");
		lightboxImage.css({"width":deviceWidth - borderWidth,"height":deviceHeight - borderHeight,"max-width":imageOrigWidth + "px","max-height":imageOrigHeight+ "px"});
	}
};

LightBox.addPagination = function(paginatorHolder,wrapper,items){
	var paginator = wrapper.find("#paginator");
	paginator.empty();
	var lightboxWrapper = $(".light-box-wrapper");
	var lightboxImageHolder = lightboxWrapper.find(".light-box-image-holder");
	var lightboxImage = lightboxImageHolder.find(".light-box-image");
	items.each(function(){
		var currentHolder = $(this);
		var currentItem = currentHolder.find(".item-content");
		
		var videoSrc = "";
		var videoFrame = currentItem.find(".video-frame");
		if (videoFrame.length > 0){
			//var videoFrame = currentItem.find(".video-frame");
			if (videoFrame.length > 0){
				videoSrc = videoFrame.attr("src");
			}else{
				return;
			}
		}
		var imageOrigHeight = currentItem.attr("data-orig-thumb-height");
		var imageOrigWidth = currentItem.attr("data-orig-thumb-width");
		var newWidth = parseInt(imageOrigWidth);
		if (isNaN(parseInt(newWidth))){
			newWidth = 1600;
		}else{
			newWidth = Math.min(parseInt(imageOrigWidth),1600)
		}
		var imageSrc = currentItem.attr("data-bgimg");
		
		if (imageSrc == ""){
			return;
		}else if(!currentHolder.closest(".master.item-box").is(".showing-feed")){
			imageSrc += "=s" + newWidth;
		}
		var imageId = currentItem.attr("data-vbid");
		var title = currentItem.find(".preview-title").text();
		var subtitle = currentItem.find(".preview-subtitle").text();
		var pageNavigator = $("<div />").addClass("page-navigator");
		if (videoSrc != ""){
			pageNavigator.attr("data-videosrc",videoSrc);
		}else{
			pageNavigator.attr("data-bgimg",imageSrc);
			pageNavigator.attr("data-orig-thumb-height",imageOrigHeight);
			pageNavigator.attr("data-orig-thumb-width",imageOrigWidth);
		}
		pageNavigator.attr("data-title",title);
		pageNavigator.attr("data-subtitle",subtitle);
		pageNavigator.attr("data-vbid",imageId);
		
		
		pageNavigator.unbind("click").bind("click",function(){
			var currentPaginator = $(this);
			lightboxImage.find("iframe").remove();
			if (currentPaginator.attr("data-videosrc")){
				var videoIframe = $("<iframe />").css({"width":"100%","height":"100%","border":"none"}).attr("src",currentPaginator.attr("data-videosrc"));
				lightboxImage.append(videoIframe);
				lightboxImage.css("background-image","");
			}else{
				lightboxImage.css("background-image","url('"+ currentPaginator.attr("data-bgimg") +"')");
				lightboxImage.attr("data-orig-thumb-height",imageOrigHeight);
				lightboxImage.attr("data-orig-thumb-width",imageOrigWidth);
			}
			
			
			lightboxImage.attr("data-vbid",imageId);
			wrapper.find(".lightbox-title").text(currentPaginator.attr("data-title"));
			wrapper.find(".lightbox-subtitle").text(currentPaginator.attr("data-subtitle"));
			setTimeout(function(){
				LightBox.arrange();
			},0);
		});
		paginator.append(pageNavigator);
	});
	
	if (items.length > 1){
		lightboxWrapper.find(".lightbox-arrow").show();
		lightboxWrapper.find(".lightbox-arrow").unbind("click").bind("click",function(e){
			e.stopPropagation();
			lightboxImage.find("iframe").remove();
			var currentShownId = lightboxImage.attr("data-vbid");
			var relevantPaginationHolder = paginator.find(".page-navigator[data-vbid='"+ currentShownId +"']");
			var currentPaginator = relevantPaginationHolder.next();
			if ($(this).hasClass("lightbox-left")){
				currentPaginator = relevantPaginationHolder.prev();
			}
			if (currentPaginator.length == 0){
				currentPaginator = relevantPaginationHolder.siblings().first(); 
				if ($(this).hasClass("lightbox-left")){
					currentPaginator = relevantPaginationHolder.siblings().last(); 
				}
			}
			if (currentPaginator.attr("data-videosrc")){
				var videoIframe = $("<iframe />").css({"width":"100%","height":"100%","border":"none"}).attr("src",currentPaginator.attr("data-videosrc"));
				lightboxImage.append(videoIframe);
				lightboxImage.css("background-image","");
			}else{
				lightboxImage.css("background-image","url('"+ currentPaginator.attr("data-bgimg") +"')");
				lightboxImage.attr("data-orig-thumb-height",currentPaginator.attr("data-orig-thumb-height"));
				lightboxImage.attr("data-orig-thumb-width",currentPaginator.attr("data-orig-thumb-width"));
			}
			lightboxImage.attr("data-vbid",currentPaginator.attr("data-vbid"));
			wrapper.find(".lightbox-title").text(currentPaginator.attr("data-title"));
			wrapper.find(".lightbox-subtitle").text(currentPaginator.attr("data-subtitle"));
			setTimeout(function(){
				LightBox.arrange();
			},0);
			
		});

		lightboxWrapper.unbind("swipeleft").bind("swipeleft",function(){
			LightBox.changePic("left");
		});
		
		lightboxWrapper.unbind("swiperight").bind("swiperight",function(){
			LightBox.changePic("right");
		});

		lightboxWrapper.unbind("keyup").bind("keyup", function(e){
			if(e.keyCode == 37) { // left
				LightBox.changePic("left");
			  }
			  else if(e.keyCode == 39) { // right
				LightBox.changePic("right");
			  }else if (e.keyCode === 27){
				lightboxWrapper.find("iframe").remove();
				lightboxWrapper.hide();
			  }
		});

		lightboxWrapper.focus();


	}else{
		lightboxWrapper.find(".lightbox-arrow").hide();
	}
};

LightBox.changePic = function(dir){
	var lightboxWrapper = $(".light-box-wrapper");
	var lightboxImageHolder = lightboxWrapper.find(".light-box-image-holder");
	var lightboxImage = lightboxImageHolder.find(".light-box-image");
	var paginator = lightboxWrapper.find("#paginator");


	lightboxImage.find("iframe").remove();
	var currentShownId = lightboxImage.attr("data-vbid");
	var relevantPaginationHolder = paginator.find(".page-navigator[data-vbid='"+ currentShownId +"']");
	var currentPaginator = relevantPaginationHolder.next();
	if (dir == "left"){
		currentPaginator = relevantPaginationHolder.prev();
	}
	if (currentPaginator.length == 0){
		currentPaginator = relevantPaginationHolder.siblings().first(); 
		if (dir == "left"){
			currentPaginator = relevantPaginationHolder.siblings().last(); 
		}
	}
	if (currentPaginator.attr("data-videosrc")){
		var videoIframe = $("<iframe />").css({"width":"100%","height":"100%","border":"none"}).attr("src",currentPaginator.attr("data-videosrc"));
		lightboxImage.append(videoIframe);
		lightboxImage.css("background-image","");
	}else{
		lightboxImage.css("background-image","url('"+ currentPaginator.attr("data-bgimg") +"')");
		lightboxImage.attr("data-orig-thumb-height",currentPaginator.attr("data-orig-thumb-height"));
		lightboxImage.attr("data-orig-thumb-width",currentPaginator.attr("data-orig-thumb-width"));
	}
	lightboxImage.attr("data-vbid",currentPaginator.attr("data-vbid"));
	lightboxWrapper.find(".lightbox-title").text(currentPaginator.attr("data-title"));
	lightboxWrapper.find(".lightbox-subtitle").text(currentPaginator.attr("data-subtitle"));
	setTimeout(function(){
		LightBox.arrange();
	},0);
}






