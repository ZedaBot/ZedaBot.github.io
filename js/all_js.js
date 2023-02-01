var rowcol_arranger = {};

rowcol_arranger.init = function(container,items,whatsNext){
	 SpimeEngine.DebugPrint("rowcol arranger init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	 
	 /******************************************************************
		 *           HANDLING THE ELEMENTS
	 ********************************************************************/
	var elements = items.not(".element-box").first().siblings(".element-box");
	elements.remove();
	 
	 /******************************************************************
		 *           HANDLING THE ITEMS
	********************************************************************/
	 var itemsHolder = container.find("#items-holder");
	 var itemsHolderWrapper = container.find("#items-holder-wrapper");
	 //backward compatibility
	 if (itemsHolder.length == 0){
		 items = container.find(".sub.item-box");
		 itemsHolder = $("<div id='items-holder' />");
		 itemsHolderWrapper = $("<div id='items-holder-wrapper' />");
		 itemsHolder.append(items);
		 itemsHolderWrapper.append(itemsHolder);
		 container.find("#children").append(itemsHolderWrapper);
	 }
	 
	 var pagHolder = container.find("#pagination-holder");
	 if (pagHolder.length == 0){
		 rowcol_arranger.initPaginationHolder(container);
	 }
	 
	 if (typeof  whatsNext != "undefined"){
		 whatsNext();
	 }
};

rowcol_arranger.arrange = function(items,container,whatsNext){
	SpimeEngine.DebugPrint("rowcol arranger arrange for " + items.length + " items and container: " + container.width() + " X " + container.height());
	
	/******************************************************************
	 *           HANDLING THE ELEMENTS
	 ********************************************************************/
	//var elementsHolder = container.find("#elements-holder");
	var itemsHolder = container.find("#items-holder");
	items = itemsHolder.children();
	var calculatedElementsHeight = 0;
	
	var stripe = container.closest(".master.item-box");
	stripe.css("min-height","initial");
	var stripeType = stripe.attr("data-preset-type-id");
	var isFeatures = XPRSHelper.inPresetGroup(stripeType,"FEATURES");


	/******************************************************************
	 *           LOADING ARRANGER SETTINGS
	 ********************************************************************/
	
	var settings = container.closest(".item-wrapper").find(".arranger-settings");
	var ratio = parseFloat(settings.attr('data-arranger_item_ratio')) ;
	var colsFromSettings = parseInt(settings.attr('data-arranger_cols'));
	colsFromSettings = isFeatures ? items.length : colsFromSettings;
	var itemsMargin =  parseInt(settings.attr('data-arranger_item_spacing'));
	var itemMinWidth = parseInt(settings.attr('data-arranger_item_min_width'));
	var itemMaxWidth = parseInt(settings.attr('data-arranger_item_max_width'));
	var itemsPerPage = settings.attr('data-arranger_items_per_page');
	itemsPerPage = isFeatures ? items.length : itemsPerPage;
	itemsPerPage = (itemsPerPage == "all") ? items.length : parseInt(itemsPerPage);
	
	
	/******************************************************************
	 * DEFINE PARTICIPATING DIVS        
	 ********************************************************************/
	//ParentWrapper is the source for our max width
	var parentWrapper = itemsHolder.closest(".gallery-wrapper");
	
	var forcedArrange = (typeof stripe.attr("data-forced-arrange") != "undefined");
	var fromHeightResize = (typeof stripe.attr("data-height-resize") != "undefined");
	var fromWidthResize = forcedArrange || (typeof stripe.attr("data-width-resize") != "undefined") || (typeof stripe.attr("data-arranger_cols-from-settings") != "undefined")|| (typeof stripe.attr("data-arranger_item_spacing-from-settings") != "undefined");
	stripe.removeAttr("data-forced-arrange");
	var paginationWrapper =  container.find("#pagination-wrapper");
	var paginationHeight = paginationWrapper.is(':visible') ? paginationWrapper.outerHeight(true) : 0;
	//var stripeHeight = stripe.height() - calculatedElementsHeight - paginationHeight;//- parseInt(stripe.css("padding-top")) - parseInt(stripe.css("padding-bottom"));
	
	/******************************************************************
	 * START CALCULATIONS WITH ITEM MIN WIDTH AND HEIGHT * RATIO AND COLS AS THE NUMBER OF ITEMS      
	 ********************************************************************/
	var percentagePaddingFix = 0;
	if (parseInt(stripe.css("padding-left")) > 0){
		percentagePaddingFix = 1;
	}
	var wrapperWidth = parentWrapper.width() - percentagePaddingFix;
	//Min width can not be larger than  screen or the max item width
	itemMinWidth = Math.min(itemMinWidth,itemMaxWidth);
	itemMinWidth = Math.min(itemMinWidth,wrapperWidth);
	items.find(".preview-content-holder").css("min-height","");
	
	var cols = Math.floor((wrapperWidth + itemsMargin*2) / (itemMinWidth + itemsMargin*2));
	cols = Math.min(colsFromSettings,cols);
	if (fromWidthResize){
		var wrapperWidthForTest = wrapperWidth - colsFromSettings*itemsMargin*2 + itemsMargin*2;
		itemMinWidth =   Math.floor(wrapperWidthForTest / colsFromSettings);
		itemMinWidth = Math.min(itemMinWidth,itemMaxWidth);
		itemMinWidth *= 0.7;
		cols = colsFromSettings;
	}
	//cols must be at least 1
	cols =  Math.max(cols,1);
	
	if (cols == 2 && colsFromSettings != 2 && items.length == 3){
		cols = 1;
	}
	
	if (cols == 3 && items.length == 4 && colsFromSettings != 3){
		cols = 2;
	}
	if (cols == 5 && items.length == 6 && colsFromSettings != 5){
		cols = 3;
	}
	
	//The total number of rows we have
	var rows = Math.ceil(items.length / cols);
	//Restoring items defaults (if change during previous arrange)
	items.show();
	items.css({"clear":""});
	var itemRow = 0;
	
	/******************************************************************
	 * BREAK THE ITEMS ACCORDING TO CALCULATED COLS AND GIVE EACH ONE ROW IDENTIFIER 
	 ********************************************************************/
	
	var maxContentHeight = 0;
	items.removeClass("top-side").removeClass("bottom-side").removeClass("left-side").removeClass("right-side");;
	items.each(function(idx){
		if (idx % cols == 0){
			$(this).css({"clear":"left"});
			$(this).addClass("left-side");
			itemRow++;
		}
		if (idx % cols == cols-1){
			$(this).addClass("right-side");
		}
		if (itemRow == 1){
			$(this).addClass("top-side");
		}
		if (itemRow == rows){
			$(this).addClass("bottom-side");
		}
		$(this).attr("data-row",itemRow);
		maxContentHeight = Math.max(maxContentHeight,$(this).find(".preview-content-holder").height()); 
	});
	//maxContentHeight = Math.max(itemsHolder.height(),maxContentHeight);
	
	
	//if we have more space we enlarge the items 
	var extraSpace = Math.floor(    (wrapperWidth - (cols*itemMinWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
	var	calculatedItemWidth = Math.floor(itemMinWidth + extraSpace);//Math.round((wrapperWidth)/cols) - ((cols-1)*(itemsMargin*2));
	calculatedItemWidth = Math.min(calculatedItemWidth,itemMaxWidth);
	
	setTimeout(function(){
		if (wrapperWidth - parentWrapper.width() > 3){
			extraSpace = Math.floor(    (parentWrapper.width() - (cols*itemMinWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
			calculatedItemWidth = Math.floor(itemMinWidth + extraSpace);//Math.round((wrapperWidth)/cols) - ((cols-1)*(itemsMargin*2));
			calculatedItemWidth = Math.min(calculatedItemWidth,itemMaxWidth);
			items.width(calculatedItemWidth);
		}
	},10);
	
	if (fromWidthResize){
		//calculatedItemWidth = itemMinWidth;
		settings.attr('data-arranger_item_min_width',itemMinWidth);
		stripe.attr("data-items-min-width",itemMinWidth);
	}

	/******************************************************************
	 * CHANGE ITEMS WIDTH HEIGHT AND SPACING ACCORDING TO CALCULATIONS
	 ********************************************************************/
	items.width(calculatedItemWidth).css({"margin":itemsMargin});
	items.filter(".top-side").css("margin-top",itemsMargin*2);
	items.filter(".bottom-side").css("margin-bottom",itemsMargin*2);
	items.filter(".left-side").css("margin-left",0);
	items.filter(".right-side").css("margin-right",0);
	

	itemsHolder.css({"width":"100%","text-align":""});
	
	items.slice(itemsPerPage,items.length).hide();
	
	if (fromHeightResize && isFeatures){
		ratio = (stripe.height() - itemsMargin*4) / calculatedItemWidth;
		stripe.attr("data-item-ratio",ratio.toFixed(2));
		settings.attr('data-arranger_item_ratio',ratio);
	}
		var	calculatedItemHeight = calculatedItemWidth*ratio;
		items.css({"min-height":calculatedItemHeight});
		items.find(".item-wrapper").css({"min-height":calculatedItemHeight});
		
		
		items.each(function(idx){
			maxContentHeight = Math.max(maxContentHeight,$(this).find(".preview-content-holder").height()); 
		});
		//if (items.find(".helper-div.top-center").length == 0){
		if (items.find(".helper-div.middle-center,.helper-div.bottom-right,.helper-div.bottom-left,.helper-div.top-left,.helper-div.top-right").length == 0){
			items.find(".preview-content-holder").css("min-height",maxContentHeight);
		}else{
			//items.find(".vertical-aligner").css("min-height",maxContentHeight);
		}
		//}else{
		//	items.find(".text-side .vertical-aligner").css("min-height",maxContentHeight);
		//}
	
	
	
	/******************************************************************
	 * HANDLE PAGINATION
	 ********************************************************************/
	// If we need pagination (not all items fit the given height)
	var inMoreMode = (typeof stripe.attr("data-more-clicked") != "undefined");
	if (itemsPerPage < items.length ){
		if (inMoreMode){
			paginationWrapper.hide();
			items.show();
		}else{
			paginationWrapper.show();
		}
	}else{
		//Hide paginator
		paginationWrapper.hide();
	}
	
	
	extraSpace = Math.floor(    (wrapperWidth - (cols*itemMaxWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
	if(calculatedItemWidth == itemMaxWidth && extraSpace > 0){
		itemsHolder.css("text-align","center");
		var currentRowWidth = (itemMaxWidth * cols) + (cols*itemsMargin*2) - itemsMargin*2;
		itemsHolder.width(currentRowWidth);
	}else{
		itemsHolder.css("width","");
	}

	if (typeof  whatsNext != "undefined"){
		var originalItemMinWidth = parseInt(settings.attr('data-arranger_item_min_width'));
		var actualItemMinWidth = itemMinWidth;
		if (actualItemMinWidth != originalItemMinWidth){
			stripe.attr("data-items-min-width",actualItemMinWidth);
		}
		whatsNext();
	 }

};

rowcol_arranger.showMore = function(stripe){
	
	var itemsHolder = stripe.find("#items-holder");
	var items = itemsHolder.children();
	var paginationWrapper = stripe.find("#pagination-wrapper");
	paginationWrapper.hide();
	var itemsWrapper = stripe.find("#items-holder-wrapper");
	var topMargin = parseInt(itemsWrapper.css("margin-top"));
	itemsWrapper.css("margin-bottom",topMargin);
	items.show();
	SpimeEngine.fitVideos(stripe);
	stripe.attr("data-more-clicked","true");
};

rowcol_arranger.showLess = function(stripe){
	var itemsHolder = stripe.find("#items-holder");
	var items = itemsHolder.children();
	var paginationWrapper = stripe.find("#pagination-wrapper");
	var itemsWrapper = stripe.find("#items-holder-wrapper");
	//var topMargin = parseInt(itemsWrapper.css("margin-top"));
	itemsWrapper.css("margin-bottom","");
	var itemsToShow = parseInt(stripe.attr("data-items-to-show"));
	if (itemsToShow < items.length){
		paginationWrapper.show();
	}
	items.hide();
	items.slice(0,itemsToShow).show();
	stripe.removeAttr("data-more-clicked");
};



rowcol_arranger.initPaginationHolder = function(container){
	var paginationBtn = $("<div id='pagination-btn' />");
	paginationBtn.text("More");
	var paginationHolder = $("<div id='pagination-holder' />").addClass("magic-circle-holder").attr("data-menu-name","PAGINATION_SETTINGS");
	var paginationHolderWrapper = $("<div id='pagination-wrapper' class='layer5' />");
	paginationHolder.append(paginationBtn);
	paginationHolderWrapper.append(paginationHolder);
	container.find("#children").append(paginationHolderWrapper);
	paginationHolder.unbind("click").bind("click",function(e){
		e.stopPropagation();
		var stripe = container.closest(".master.item-box");
		rowcol_arranger.showMore(stripe);
	});
};; var bottom_layout = {};

bottom_layout.init = function(container,items){
	 SpimeEngine.DebugPrint("bottom layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	// var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//	items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
};

bottom_layout.applyLayout = function(container,items,paramsFromRealTime){
	var maxContentHeight = 0;
	var calculatedItemHeight = 0;
	var innerMaxHeight = 0;
	items.find(".image-cover").css("height","");
	items.find(".preview-content-holder").css("min-height","");
	items.filter(":visible").each(function(){
		var currentItem = $(this);
		if ( typeof currentItem.attr("data-height-from-arranger") != "undefined"){
			calculatedItemHeight = parseInt(currentItem.attr("data-height-from-arranger"));
		}else{
			calculatedItemHeight = Math.max(currentItem.height(),calculatedItemHeight);
		}
		
		var contentHolder = currentItem.find(".preview-content-holder");
		var contentHeight = contentHolder.outerHeight(true);
		maxContentHeight = Math.max(contentHeight,maxContentHeight);
		innerMaxHeight = Math.max(innerMaxHeight,$(this).find(".item-details").outerHeight());
	});
	var newImageHeight = calculatedItemHeight - maxContentHeight;
	items.each(function(){
		var currentItem = $(this);
		currentItem.find(".image-cover").css("height",newImageHeight);
		
		$(this).find(".preview-content-holder").css("min-height",maxContentHeight);
//		var textElement = currentItem.find(".preview-title");
//		var contentHolder = currentItem.find(".preview-content-holder");
//		var contentWrapper = currentItem.find(".preview-content-wrapper");
//		var originalFontSize = parseInt(textElement.attr("data-orig-font-size"));
//		textElement.css("font-size",originalFontSize);
//		if (contentHolder.outerWidth(true) > contentWrapper.width()){
//			var newFontSize =  SpimeEngine.shrinkTextToFit(originalFontSize,contentWrapper,contentHolder,textElement,0,30);
//			textElement.css("font-size",newFontSize);
//		}
	});
};; var dual_layout = {};

dual_layout.init = function(container,items){
	SpimeEngine.DebugPrint("dual layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	items.find(".preview-title").attr("original-font-size",originalFontSize);
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var originalMaxWidth = parseInt(previewContentHolder.css("max-width"));
		previewContentHolder.attr("data-orig-max-width", originalMaxWidth)
				
	});
}

dual_layout.applyLayout = function(container,items){
	SpimeEngine.DebugPrint("dual layout applyLayout for ");
	//TODO: width for flip should be set in the layout settings
	if (container.width() < 500){
		items.each(function(){
			dual_layout.flipVertically($(this));
		});
	}else{
		items.each(function(){
			dual_layout.unflip($(this));
		});
	}
	
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var margins = parseInt(previewContentHolder.css("margin-left")) + parseInt(previewContentHolder.css("margin-right")) + parseInt(previewContentHolder.css("padding-left")) + parseInt(previewContentHolder.css("padding-right"))
		var previewContentWrapper = $(this).find(".item-content ");
		//console.log("--------------------------- > " + previewContentWrapper.width())
		var maxWidthVal = (previewContentWrapper.width() / 2) - margins;
		var originalMaxWith = previewContentHolder.attr("data-orig-max-width");
		maxWidthVal = Math.min(maxWidthVal,originalMaxWith)
		previewContentHolder.css("max-width",maxWidthVal)
				
	});
	
	
	
//	var originalFontSize = parseInt(items.find(".preview-title").attr("original-font-size"));
//	var shrinkPlease = true;
//	if (typeof paramsFromRealTime != "undefined" ){
//		if (typeof paramsFromRealTime.value != "undefined"){
//			originalFontSize = parseInt(paramsFromRealTime.value);
//			items.find(".preview-title").attr("original-font-size",originalFontSize);
//			shrinkPlease = false;
//			
//		}
//	}
//	if (shrinkPlease){
//		items.find(".preview-title").css("font-size",originalFontSize)
//		var minFontSize = 9999;
//		items.each(function(){
//			var itemDetails = $(this).find(".item-details")//.outerHeight(true);
//			var stripe = itemDetails.closest(".item-wrapper")//.outerHeight(true);
//			minFontSize = Math.min(minFontSize,dual_layout.shrinker(originalFontSize,itemDetails,$(this).find(".preview-title")));
//		});
//		items.each(function(){
//			$(this).find(".helper-div").css("padding",$(this).css("padding"));
//			$(this).find(".preview-title").css("font-size",minFontSize)
//		});
//		//items.find(".preview-title").css("font-size",minFontSize)
//	}
	
}


dual_layout.flipVertically = function(item){	
	if (typeof item.attr("data-flipped") == "undefined"){
		item.attr("data-flipped","true")
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.children(".item-preview");
		var itemDetails = helperDiv.children(".item-details");
		var textWrapper = $("<div id='text-wrapper' />");
		var imageWrapper = $("<div id='image-wrapper' />");
		textWrapper.append(itemDetails);
		imageWrapper.append(itemPreview);
		helperDiv.append(textWrapper);
		helperDiv.append(imageWrapper);
	}
}

dual_layout.unflip = function(item){
	if (typeof item.attr("data-flipped") != "undefined"){
		item.removeAttr("data-flipped","true")
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.find(".item-preview");
		var itemDetails = helperDiv.find(".item-details");
		itemPreview.unwrap();
		itemDetails.unwrap();
		itemPreview.after(itemDetails);
	}
}

dual_layout.shrinker = function(fontSize,parent,content){
	if (content.width() > parent.width()){
		//console.log("shrink please")
		var previewTitle = content.find(".preview-title");
		var shrinkedFontSize =  fontSize * 0.9 ;
		if (shrinkedFontSize < 15){
			//console.debug("cant SHRINK no more!");
		}else{
			content.find(".preview-title").css("font-size",shrinkedFontSize)
			return dual_layout.shrinker(shrinkedFontSize,parent,content)
		}
		
	}else{
		//console.log("dont shrink")
		return parseInt(content.find(".preview-title").css("font-size"));
	}
}; var right_layout = {};

right_layout.init = function(container,items){
	SpimeEngine.DebugPrint("right layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	//var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var originalMaxWidth = parseInt(previewContentHolder.css("max-width"));
		previewContentHolder.attr("data-orig-max-width", originalMaxWidth);
	});
};

right_layout.applyLayout = function(container,items,paramsFromRealTime){
	SpimeEngine.DebugPrint("right layout applyLayout for ");
	//TODO: width for flip should be set in the layout settings
	if (container.width() < 500){
		items.each(function(){
			right_layout.flipVertically($(this));
		});
	}else{
		items.each(function(){
			right_layout.unflip($(this));
		});
	}
	
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var margins = parseInt(previewContentHolder.css("margin-left")) + parseInt(previewContentHolder.css("margin-right")) + parseInt(previewContentHolder.css("padding-left")) + parseInt(previewContentHolder.css("padding-right"));
		var previewContentWrapper = $(this).find(".item-content ");
		var maxWidthVal = (previewContentWrapper.width() / 2) - margins;
		var originalMaxWith = previewContentHolder.attr("data-orig-max-width");
		maxWidthVal = Math.min(maxWidthVal,originalMaxWith);
		//previewContentHolder.css("max-width",maxWidthVal)
				
	});
	
	items.each(function(idx){
		var currentItem = $(this);
		//var textElement = currentItem.find(".preview-title");
		//var contentHolder = currentItem.find(".preview-content-holder");
		var contentWrapper = currentItem.find(".preview-content-wrapper");
		//var originalFontSize = parseInt(textElement.attr("data-orig-font-size"));
		if (typeof currentItem.attr("data-flipped") != "undefined"){
			contentWrapper.removeClass("shrinker-parent");
			currentItem.find(".helper-div").addClass("shrinker-parent"); 
		}else{
			contentWrapper.addClass("shrinker-parent");
			currentItem.find(".helper-div").removeClass("shrinker-parent"); 
		}
		//textElement.css("font-size",originalFontSize);
		//if (contentHolder.outerWidth(true) > contentWrapper.width()){
		//	var newFontSize = SpimeEngine.shrinkTextToFit(originalFontSize,contentWrapper,contentHolder,textElement,0,30);
		//	textElement.css("font-size",newFontSize);
		//}
	});	
	
	

	
};


right_layout.flipVertically = function(item){	
	if (typeof item.attr("data-flipped") == "undefined"){
		item.attr("data-flipped","true");
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.children(".item-preview");
		var itemDetails = helperDiv.children(".item-details");
		var textWrapper = $("<div id='text-wrapper' />");
		var imageWrapper = $("<div id='image-wrapper' class='preview image-cover' />");
		textWrapper.append(itemDetails);
		imageWrapper.append(itemPreview);
		helperDiv.append(textWrapper);
		helperDiv.append(imageWrapper);
	}
};

right_layout.unflip = function(item){
	if (typeof item.attr("data-flipped") != "undefined"){
		item.removeAttr("data-flipped","true");
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.find(".item-preview");
		var itemDetails = helperDiv.find(".item-details");
		itemPreview.unwrap();
		itemDetails.unwrap();
		itemPreview.after(itemDetails);
	}
};; var left_layout = {};

left_layout.init = function(container,items){
	SpimeEngine.DebugPrint("left layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	//var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var originalMaxWidth = parseInt(previewContentHolder.css("max-width"));
		previewContentHolder.attr("data-orig-max-width", originalMaxWidth);
	});
};

left_layout.applyLayout = function(container,items,paramsFromRealTime){
	SpimeEngine.DebugPrint("left layout applyLayout for ");
	//TODO: width for flip should be set in the layout settings
	if (container.width() < 500){
		items.each(function(){
			left_layout.flipVertically($(this));
		});
	}else{
		items.each(function(){
			left_layout.unflip($(this));
		});
	}
	
	
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var margins = parseInt(previewContentHolder.css("margin-left")) + parseInt(previewContentHolder.css("margin-right")) + parseInt(previewContentHolder.css("padding-left")) + parseInt(previewContentHolder.css("padding-right"));
		var previewContentWrapper = $(this).find(".item-content ");
		var maxWidthVal = (previewContentWrapper.width() / 2) - margins;
		var originalMaxWith = previewContentHolder.attr("data-orig-max-width");
		maxWidthVal = Math.min(maxWidthVal,originalMaxWith);
	//	previewContentHolder.css("max-width",maxWidthVal);		
	});
	

	items.each(function(idx){
		var currentItem = $(this);
		//var textElement = currentItem.find(".preview-title");
		//var contentHolder = currentItem.find(".preview-content-holder");
		var contentWrapper = currentItem.find(".preview-content-wrapper");
		//var originalFontSize = parseInt(textElement.attr("data-orig-font-size"));
		if (typeof currentItem.attr("data-flipped") != "undefined"){
			contentWrapper.removeClass("shrinker-parent");
			currentItem.find(".helper-div").addClass("shrinker-parent"); 
		}else{
			contentWrapper.addClass("shrinker-parent");
			currentItem.find(".helper-div").removeClass("shrinker-parent"); 
		}
//		textElement.css("font-size",originalFontSize);
//		if (contentHolder.outerWidth(true) > contentWrapper.width()){
//			var newFontSize =  SpimeEngine.shrinkTextToFit(originalFontSize,contentWrapper,contentHolder,textElement,0,30);
//			textElement.css("font-size",newFontSize);
//		}
	});	
};


left_layout.flipVertically = function(item){	
	if (typeof item.attr("data-flipped") == "undefined"){
		item.attr("data-flipped","true");
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.children(".item-preview");
		var itemDetails = helperDiv.children(".item-details");
		var textWrapper = $("<div id='text-wrapper' />");
		var imageWrapper = $("<div id='image-wrapper' class='preview image-cover' />");
		textWrapper.append(itemDetails);
		imageWrapper.append(itemPreview);
		helperDiv.append(textWrapper);
		helperDiv.append(imageWrapper);
	}
};

left_layout.unflip = function(item){
	if (typeof item.attr("data-flipped") != "undefined"){
		item.removeAttr("data-flipped","true");
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.find(".item-preview");
		var itemDetails = helperDiv.find(".item-details");
		itemPreview.unwrap();
		itemDetails.unwrap();
		itemPreview.before(itemDetails);
	}
};; var top_layout = {};

top_layout.init = function(container,items){
	SpimeEngine.DebugPrint("top layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	//var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
};

top_layout.applyLayout = function(container,items,paramsFromRealTime){
	SpimeEngine.DebugPrint("top layout applyLayout for ");
	items.find(".item-details").css("height","");
	items.find(".image-cover").css("height","");
	items.find(".image-cover").css("min-height","");
	
	var maxHeight = 0;
	var innerMaxHeight = 0;
	var maxItemBoxHeight = 0;
	items.each(function(){
		itemDetailsHeight = $(this).find(".item-details").outerHeight(true);
		maxHeight = Math.max(maxHeight,itemDetailsHeight);
		var itemContent = $(this).find(".item-content").andSelf().filter(".item-content");
		maxItemBoxHeight = Math.max(maxItemBoxHeight,itemContent.height());
		innerMaxHeight = Math.max(innerMaxHeight,$(this).find(".item-details").outerHeight());
	});
	
	items.each(function(){
		$(this).find(".item-details").height(innerMaxHeight);
		var itemContent = $(this).find(".item-content").andSelf().filter(".item-content");
		itemBoxHeight =  itemContent.height();
		$(this).find(".image-cover").css("height",maxItemBoxHeight - maxHeight ).css("min-height",maxItemBoxHeight - maxHeight );
	});
};; var middle_layout = {};

middle_layout.init = function(container,items){
	//var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
	items.find(".image-cover").css("min-height","inherit");
};

middle_layout.applyLayout = function(container,items,paramsFromRealTime){
	items.find(".item-content , .item-preview").css("min-height","initial");
	//container.closest(".master.item-box").removeAttr("data-min-stripe-height");
	//var originalFontSize = parseInt(items.find(".preview-title").attr("data-orig-font-size"));
	//var shrinkPlease = true;
//	if (typeof paramsFromRealTime != "undefined" ){
//		if (typeof paramsFromRealTime.value != "undefined"){
//			originalFontSize = parseInt(paramsFromRealTime.value);
//			items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
//			shrinkPlease = false;
//		}
//	}
//	if (shrinkPlease){
	//	items.find(".preview-title").css("font-size",originalFontSize);
		//var minFontSize = 9999;
		//items.each(function(){
		//	var itemDetails = $(this).find(".item-details");
		//	var stripe = itemDetails.closest(".item-wrapper");
		//	var textElement = $(this).find(".preview-title");
		//	minFontSize = Math.min(minFontSize,SpimeEngine.shrinkTextToFit(originalFontSize,stripe,itemDetails,textElement,0,30));
		//});
		items.each(function(){
			$(this).find(".helper-div").css("padding",$(this).css("padding"));
			$(this).find(".item-content, .item-preview").css("min-height","inherit");
			//$(this).find(".preview-title").css("font-size",minFontSize);
		});
//	}
};; var matrix_arranger = {};

matrix_arranger.init = function(container,items,whatsNext){
	 SpimeEngine.DebugPrint("rowcol arranger init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	 var settings = container.closest(".item-wrapper").find(".arranger-settings");
	 /******************************************************************
		 *           HANDLING THE ELEMENTS
	 ********************************************************************/
//	var elements = items.not(".element-box").first().siblings(".element-box");
	//var stripeHeader
//	elements.remove();
	 
	 /******************************************************************
		 *           HANDLING THE ITEMS
	********************************************************************/
	 var itemsHolder = container.find("#items-holder");
	 var itemsHolderWrapper = container.find("#items-holder-wrapper");
	 //backward compatibility
	 if (itemsHolder.length == 0){
		 items = container.find(".sub.item-box");
		 itemsHolder = $("<div id='items-holder' />");
		 itemsHolderWrapper = $("<div id='items-holder-wrapper' />");
		 itemsHolder.append(items);
		 itemsHolderWrapper.append(itemsHolder);
		 container.find("#children").append(itemsHolderWrapper);
	 }
//	 var itemsHolderWrapper = container.find("#items-holder-wrapper");
	//Select only children of type item
//	 var onlyItems = items.not(".element-box").not(".stripe_header");
//	 if (itemsHolder.length == 0){
//		 itemsHolder = $("<div id='items-holder' />");
//		 itemsHolderWrapper = $("<div id='items-holder-wrapper' />");
//		 itemsHolder.append(onlyItems);
//		 itemsHolderWrapper.append(itemsHolder);
//		 container.find("#children").append(itemsHolderWrapper);
//	 }
	 
	 var pagHolder = container.find("#pagination-holder");
	 if (pagHolder.length == 0){
		 matrix_arranger.initPaginationHolder(container);
	 }
	 
	 if (typeof  whatsNext != "undefined"){
		 whatsNext();
	 }
	 
	//set original height
	items.find(".inner-pic").each(function(){
		SpimeEngine.updateImageRealSize($(this));
	});
};

matrix_arranger.arrange = function(items,container,whatsNext){
	SpimeEngine.DebugPrint("rowcol arranger arrange for " + items.length + " items and container: " + container.width() + " X " + container.height());
	
	/******************************************************************
	 *           HANDLING THE ELEMENTS
	 ********************************************************************/
	//var elementsHolder = container.find("#elements-holder");
	var itemsHolder = container.find("#items-holder");
	items = itemsHolder.children();
	var calculatedElementsHeight = 0;
	
	var stripe = container.closest(".master.item-box");
	stripe.css("min-height","initial");
	var stripeType = stripe.attr("data-preset-type-id");
	var isFeatures = false//XPRSHelper.inPresetGroup(stripeType,"FEATURES");


	/******************************************************************
	 *           LOADING ARRANGER SETTINGS
	 ********************************************************************/
	
	var settings = container.closest(".item-wrapper").find(".arranger-settings");
	var ratio = parseFloat(settings.attr('data-arranger_item_ratio')) ;
	var colsFromSettings = parseInt(settings.attr('data-arranger_cols'));
	colsFromSettings = isFeatures ? items.length : colsFromSettings;
	colsFromSettings = Math.min(items.length,colsFromSettings);
	var itemsMargin =  parseInt(settings.attr('data-arranger_item_spacing'));
	var itemMinWidth = parseInt(settings.attr('data-arranger_item_min_width'));
	var itemMaxWidth = parseInt(settings.attr('data-arranger_item_max_width'));
	var itemsPerPage = settings.attr('data-arranger_items_per_page');
	itemsPerPage = isFeatures ? items.length : itemsPerPage;
	itemsPerPage = (itemsPerPage == "all") ? items.length : parseInt(itemsPerPage);
	
	
	/******************************************************************
	 * DEFINE PARTICIPATING DIVS        
	 ********************************************************************/
	//ParentWrapper is the source for our max width
	var parentWrapper = itemsHolder.closest(".gallery-wrapper");
	
	var forcedArrange = (typeof stripe.attr("data-forced-arrange") != "undefined");
	var fromHeightResize = (typeof stripe.attr("data-height-resize") != "undefined");
	var fromWidthResize = forcedArrange || (typeof stripe.attr("data-width-resize") != "undefined") || (typeof stripe.attr("data-arranger_cols-from-settings") != "undefined")|| (typeof stripe.attr("data-arranger_item_spacing-from-settings") != "undefined");
	//fromWidthResize = false
	stripe.removeAttr("data-forced-arrange");
	var paginationWrapper =  container.find("#pagination-wrapper");
	var paginationHeight = paginationWrapper.is(':visible') ? paginationWrapper.outerHeight(true) : 0;
	//var stripeHeight = stripe.height() - calculatedElementsHeight - paginationHeight;//- parseInt(stripe.css("padding-top")) - parseInt(stripe.css("padding-bottom"));
	
	/******************************************************************
	 * START CALCULATIONS WITH ITEM MIN WIDTH AND HEIGHT * RATIO AND COLS AS THE NUMBER OF ITEMS      
	 ********************************************************************/
	var percentagePaddingFix = 0;
	if (parseInt(stripe.css("padding-left")) > 0){
		percentagePaddingFix = 1;
	}
	var wrapperWidth = parentWrapper.width() - percentagePaddingFix;
	//Min width can not be larger than  screen or the max item width
	itemMinWidth = Math.min(itemMinWidth,itemMaxWidth);
	itemMinWidth = Math.min(itemMinWidth,wrapperWidth);
	items.find(".preview-content-holder").css("min-height","");
	
	var cols = Math.floor((wrapperWidth + itemsMargin*2) / (itemMinWidth + itemsMargin*2));
	cols = Math.min(colsFromSettings,cols);
	if (forcedArrange){//if (fromWidthResize){
		var wrapperWidthForTest = wrapperWidth - colsFromSettings*itemsMargin*2 + itemsMargin*2;
		itemMinWidth =   Math.floor(wrapperWidthForTest / colsFromSettings);
		itemMinWidth = Math.min(itemMinWidth,itemMaxWidth);
		itemMinWidth *= 0.7;
		cols = colsFromSettings;
	}
	//cols must be at least 1
	cols =  Math.max(cols,1);
	
	if (cols == 2 && colsFromSettings != 2 && items.length == 3){
		cols = 1;
	}
	
	if (cols == 3 && items.length == 4 && colsFromSettings != 3){
		cols = 2;
	}
	if (cols == 5 && items.length == 6 && colsFromSettings != 5){
		cols = 3;
	}
	
	//The total number of rows we have
	var rows = Math.ceil(items.length / cols);
	//Restoring items defaults (if change during previous arrange)
	//items.show();
	items.css({"clear":"","display":"inline-block"});
	var itemRow = 0;
	
	/******************************************************************
	 * BREAK THE ITEMS ACCORDING TO CALCULATED COLS AND GIVE EACH ONE ROW IDENTIFIER 
	 ********************************************************************/
	
	var maxContentHeight = 0;
	items.removeClass("top-side").removeClass("bottom-side").removeClass("left-side").removeClass("right-side");;
	items.each(function(idx){
		if (idx % cols == 0){
			$(this).css({"clear":"left"});
			$(this).addClass("left-side");
			itemRow++;
		}
		if (idx % cols == cols-1){
			$(this).addClass("right-side");
		}
		if (itemRow == 1){
			$(this).addClass("top-side");
		}
		if (itemRow == rows){
			$(this).addClass("bottom-side");
		}
		$(this).attr("data-row",itemRow);
		maxContentHeight = Math.max(maxContentHeight,$(this).find(".preview-content-holder").height()); 
	});
	
	
	//maxContentHeight = Math.max(itemsHolder.height(),maxContentHeight);
	
	
	//if we have more space we enlarge the items 
	var extraSpace = Math.floor(    (wrapperWidth - (cols*itemMinWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
	var	calculatedItemWidth = Math.floor(itemMinWidth + extraSpace);//Math.round((wrapperWidth)/cols) - ((cols-1)*(itemsMargin*2));
	calculatedItemWidth = Math.min(calculatedItemWidth,itemMaxWidth);
	
	setTimeout(function(){
		if (wrapperWidth - parentWrapper.width() > 3){
			extraSpace = Math.floor(    (parentWrapper.width() - (cols*itemMinWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
			calculatedItemWidth = Math.floor(itemMinWidth + extraSpace);//Math.round((wrapperWidth)/cols) - ((cols-1)*(itemsMargin*2));
			calculatedItemWidth = Math.min(calculatedItemWidth,itemMaxWidth);
			items.width(calculatedItemWidth);
		}
		items.css("display", "inline-flex");
		setTimeout(function(){items.css("display","");},0)
	},10);
	
	if (fromWidthResize || forcedArrange){
		//calculatedItemWidth = itemMinWidth;
		settings.attr('data-arranger_item_min_width',itemMinWidth);
		stripe.attr("data-items-min-width",itemMinWidth);
	}

	/******************************************************************
	 * CHANGE ITEMS WIDTH HEIGHT AND SPACING ACCORDING TO CALCULATIONS
	 ********************************************************************/
	items.width(calculatedItemWidth).css({"margin":itemsMargin});
	items.filter(".top-side").css("margin-top",itemsMargin*2);
	items.filter(".bottom-side").css("margin-bottom",itemsMargin*2);
	items.filter(".left-side").css("margin-left",0);
	items.filter(".right-side").css("margin-right",0);
	

	itemsHolder.css({"text-align":""});
	
	items.slice(itemsPerPage,items.length).hide();
	

	
	
	
	/******************************************************************
	 * HANDLE PAGINATION
	 ********************************************************************/
	// If we need pagination (not all items fit the given height)
	var inMoreMode = (typeof stripe.attr("data-more-clicked") != "undefined");
	if (itemsPerPage < items.length ){
		if (inMoreMode){
			paginationWrapper.hide();
			items.css("display","inline-block");
		}else{
			paginationWrapper.show();
		}
	}else{
		//Hide paginator
		paginationWrapper.hide();
	}
	
	
	extraSpace = Math.floor(    (wrapperWidth - (cols*itemMaxWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
	if(calculatedItemWidth == itemMaxWidth && extraSpace > 0){
		// itemsHolder.css("text-align","center");
		var currentRowWidth = (itemMaxWidth * cols) + (cols*itemsMargin*2) - itemsMargin*2;
		itemsHolder.width(currentRowWidth);
	}else{
		itemsHolder.css("width","");
	}

	if (typeof  whatsNext != "undefined"){
		var originalItemMinWidth = parseInt(settings.attr('data-arranger_item_min_width'));
		var actualItemMinWidth = itemMinWidth;
		if (actualItemMinWidth != originalItemMinWidth){
			stripe.attr("data-items-min-width",actualItemMinWidth);
		}
		whatsNext();
	 }

};

matrix_arranger.showMore = function(stripe){
	
	var itemsHolder = stripe.find("#items-holder");
	var items = itemsHolder.children();
	var paginationWrapper = stripe.find("#pagination-wrapper");
	paginationWrapper.hide();
	var itemsWrapper = stripe.find("#items-holder-wrapper");
	var topMargin = parseInt(itemsWrapper.css("margin-top"));
	itemsWrapper.css("margin-bottom",topMargin);
	items.css("display","inline-block");
	SpimeEngine.fitVideos(stripe);
	stripe.attr("data-more-clicked","true");
};

matrix_arranger.showLess = function(stripe){
	var itemsHolder = stripe.find("#items-holder");
	var items = itemsHolder.children();
	var paginationWrapper = stripe.find("#pagination-wrapper");
	var itemsWrapper = stripe.find("#items-holder-wrapper");
	//var topMargin = parseInt(itemsWrapper.css("margin-top"));
	itemsWrapper.css("margin-bottom","");
	var itemsToShow = parseInt(stripe.attr("data-items-to-show"));
	if (itemsToShow < items.length){
		paginationWrapper.show();
	}
	items.hide();
	items.slice(0,itemsToShow).css("display","inline-block")
	stripe.removeAttr("data-more-clicked");
};



matrix_arranger.initPaginationHolder = function(container){
	var paginationBtn = $("<div id='pagination-btn' />");
	paginationBtn.text("More");
	var paginationHolder = $("<div id='pagination-holder' />").addClass("magic-circle-holder").attr("data-menu-name","PAGINATION_SETTINGS");
	var paginationHolderWrapper = $("<div id='pagination-wrapper' class='layer5' />");
	paginationHolder.append(paginationBtn);
	paginationHolderWrapper.append(paginationHolder);
	container.find("#children").append(paginationHolderWrapper);
	paginationHolder.unbind("click").bind("click",function(e){
		e.stopPropagation();
		var stripe = container.closest(".master.item-box");
		matrix_arranger.showMore(stripe);
	});
};; var stripes_arranger = {};

stripes_arranger.init = function(container,items,whatsNext){
	SpimeEngine.DebugPrint("stripes arranger init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	items.each(function(){
		var currentItem = $(this);
		if (currentItem.hasClass("element-box")){
			var textElement = currentItem.find(".text-element");
			if (textElement.length > 0){
				textElement.each(function(){
					$(this).attr("data-orig-font-size",parseInt($(this).css("font-size")));
				});
			}
		}
	});
	if (typeof  whatsNext != "undefined"){
		 whatsNext();
	}
};

stripes_arranger.arrange = function(items,container){
	SpimeEngine.DebugPrint("stripes arranger arrange for " + items.length + " items and container: " + container.width() + " X " + container.height());
	items.each(function(idx){
		var currentItem = $(this);
		if (currentItem.hasClass("element-box")){
			
			
			
//			var currentItem = $(this);
//			var textElement = currentItem.find(".preview-title");
//			var contentHolder = currentItem.find(".preview-content-holder");
//			var contentWrapper = currentItem.find(".preview-content-wrapper");
//			var originalFontSize = parseInt(textElement.attr("data-orig-font-size"));
//			if (typeof currentItem.attr("data-flipped") != "undefined"){
//				contentWrapper = currentItem.find(".helper-div"); 
//			}
//			textElement.css("font-size",originalFontSize);
//			if (contentHolder.outerWidth(true) > contentWrapper.width()){
//				var newFontSize =  SpimeEngine.shrinkTextToFit(originalFontSize,contentWrapper,contentHolder,textElement,0,30);
//				textElement.css("font-size",newFontSize);
//			}
			
			
			
			var textElement = currentItem.find(".text-element");
			
			
			textElement.each(function(){
				var originalFontSize = parseInt($(this).attr("data-orig-font-size"));
				$(this).css("font-size",originalFontSize);
				var contentHolder = $(this).parent();
				if ($(this).outerWidth(true) > contentHolder.width()){
					//var newFontSize = stripes_arranger.shrinker(originalFontSize,currentItem,textElement);
					var newFontSize = SpimeEngine.shrinkTextToFit(originalFontSize,currentItem,$(this),$(this),0,30);
					$(this).css("font-size",newFontSize);
				}
			});
			
			
		}
	});

};

stripes_arranger.shrinker = function(fontSize,parent,content){
	if (content.outerWidth(true) > parent.width()){
		var shrinkedFontSize =  fontSize * 0.9 ;
		if (shrinkedFontSize < 15){
			return 15;
		}else{
			content.css("font-size",shrinkedFontSize);
			return stripes_arranger.shrinker(shrinkedFontSize,parent,content);
		}
	}else{
		return parseInt(content.css("font-size"));
	}
};; var flex_arranger = {};
flex_arranger.init = function(container, items, whatsNext){
	var itemsHolder = container.find("#items-holder");
	items = itemsHolder.children();
	//if we have elements in the container remove them
	flex_arranger.removeElements(items);
	//create the arrows
	flex_arranger.createArrows(container, itemsHolder, items);
	items.attr("data-child-type","SLIDE");
	flex_arranger.handlePagination(items, container);
	if (typeof  whatsNext != "undefined"){
		 whatsNext();
	}
	items.removeAttr("data-visible");
	var firstSlide = items.first().attr("data-visible","visible");
	if (typeof container.attr("start-with-slide") != "undefined"){
		firstSlide = items.filter(".slide-" + container.attr("start-with-slide")).attr("data-visible","visible");
	}
	if (firstSlide.length == 0 ){
		firstSlide = items.first();
	}
	var slideshowType = flex_arranger.getSlideshowType(container);
	switch(slideshowType){
		case "SLIDE":
		case "FILM":
		case "SQUARES":
			firstSlide.css("left",0).addClass("play-effect");
			break;
		case "FADE":
			firstSlide.addClass("play-effect");
			firstSlide.css("left",0)
			items.css("left",0)
			break;
	}
	container.attr("data-slide-effect",slideshowType);
};

flex_arranger.arrange = function(items,container){
	var itemsHolder = container.find("#items-holder");
	items = itemsHolder.children();
	var stripe = container.closest(".master.item-box");
	var flexArrows = container.find(".flex-arrows");
	var settings = stripe.find(".arranger-settings");
	if (stripe.width() < 400){
		flexArrows.addClass("disabled");
	}else{
		flexArrows.removeClass("disabled");
	}
	var autoPlay = (settings.attr("data-auto_play") == "AUTOPLAY" || settings.attr("data-auto_play") == "true");
	var autoPlayDuration = parseInt(settings.attr("data-auto_play_duration"));
	var allowAutoPlay = !($("#xprs").hasClass("in-editor"));
	allowAutoPlay = allowAutoPlay || (typeof stripe.attr("data-auto_play-from-settings") != "undefined");
	allowAutoPlay = allowAutoPlay && items.length > 1;
	stripe.removeAttr("data-auto_play-from-settings");
	
	
	var durationSettingsChanged = stripe.attr("data-auto_play_duration-from-settings") || stripe.attr("data-forced-arrange");
	stripe.removeAttr("data-forced-arrange");
	if (durationSettingsChanged){
		stripe.removeAttr("data-auto_play_duration-from-settings");
		if (container.attr("data-interval-id")){
			clearInterval(parseInt(container.attr("data-interval-id")));
			container.removeAttr("data-interval-id");
		}
	}
	if (autoPlay && !container.attr("data-interval-id")){
		
		var rightArrow = flexArrows.filter(".right");
		var intervalId = setInterval(function(){
			if (allowAutoPlay){
				flex_arranger.slide(rightArrow,"right",items,container);
			}
		},autoPlayDuration*1000);
		container.attr("data-interval-id" , intervalId);
	}else{
		if (!autoPlay){
			if (container.attr("data-interval-id")){
				clearInterval(parseInt(container.attr("data-interval-id")));
			}
		}
	}
	
	if (items.length == 1 ){
		container.find(".flex-arrows").hide();
	}else{
		container.find(".flex-arrows").show();
	}
	var rightArrow = container.find(".flex-arrows.right");
	var leftArrow = container.find(".flex-arrows.left");
	var newTop = container.height()/2 - rightArrow.height/2;
	leftArrow.css({"float":"none","left":0,"top":newTop,"position":"absolute"});
	rightArrow.css({"float":"none","right":0,"top":newTop,"position":"absolute"});
	items.each(function(){
		var currentItem = $(this);
		currentItem.css("width",container.width());
	});

	container.find("#items-holder").width(parseInt(container.width()) * items.length);
	
	var visibleItem = items.filter("[data-visible='visible']");
	if (visibleItem.length  == 0 ){
		items.removeAttr("data-visible");
		visibleItem = items.first();
		visibleItem.attr("data-visible","visible");
		visibleItem.addClass("play-effect");
	}
	
	items.removeClass("before-visible after-visible")
	visibleItem.nextAll().addClass("after-visible");
	visibleItem.prevAll().addClass("before-visible");
	
	var slideshowType = flex_arranger.getSlideshowType(container);
	container.attr("data-slide-effect",slideshowType);
	switch(slideshowType){
		case "SLIDE":
		case "FILM":
		case "SQUARES":
			var itemsNewLeft = visibleItem.index() * -1 * visibleItem.width();
			items.each(function(){
				var currentItem = $(this);
				currentItem.css("left",itemsNewLeft);
			});
			break;
		case "FADE":
			
			break;
	}
};

flex_arranger.slide = function(btn,direction,items,container){
	var currentVisible = items.filter('[data-visible="visible"]');
	var nextVisible = currentVisible.prev();
	if (direction=="left"){
		if(nextVisible.length==0){
			nextVisible = items.last();
			flex_arranger.showPage(nextVisible.attr("data-page-num"),container,items);
		}else{
			flex_arranger.showPage(nextVisible.attr("data-page-num"),container,items);
		}
	}else{
		nextVisible = currentVisible.next();
		if(nextVisible.length==0){
			nextVisible = items.first();
			flex_arranger.showPage(nextVisible.attr("data-page-num"),container,items);

		}else{
			flex_arranger.showPage(nextVisible.attr("data-page-num"),container,items);

		}
		
	}


};



flex_arranger.showItem = function(container,items,itemId){
	var nextVisible = items.filter("#" + itemId);
	var itemToShowPageNum = nextVisible.attr("data-page-num");
	flex_arranger.showPage(itemToShowPageNum,container,items);
};

flex_arranger.showPage = function(pageNum,container,items){
	container.find(".page-navigator").removeClass("active");
	container.find(".page-navigator").removeClass("active");
	container.find("#nav" + pageNum).addClass("active");
	
	var pageToShow = items.filter(".slide-" + pageNum);
	items.removeAttr("data-visible");
	pageToShow.attr("data-visible","visible");
	items.removeClass("before-visible after-visible")
	pageToShow.nextAll().addClass("after-visible");
	pageToShow.prevAll().addClass("before-visible");
	var pageToShowIndex = pageToShow.index();
	var itemsNewLeft = pageToShowIndex * -1 * pageToShow.width();


	var slideshowType = flex_arranger.getSlideshowType(container);
	switch(slideshowType){
		case "SLIDE":
		case "FILM":
		case "SQUARES":
			items.each(function(){
				var currentItem = $(this);
				currentItem.css("left",itemsNewLeft);
			});
			break;
		case "FADE":
			items.each(function(idx){
				$(this).css ("transform","translateX(-" + (100*idx) + "%)");
			});
			break;
	}
	items.removeClass("play-effect");
	flex_arranger.emulateTransitionEnd (pageToShow,1050,function(){
		pageToShow.addClass("play-effect");
	});
};

flex_arranger.handlePagination = function(items,container){
	
	items.each(function(idx){
		var currentItem = $(this);
		currentItem.removeClass (function (index, className) {
		    return (className.match (/(^|\s)slide-\S+/g) || []).join(' ');
		});
		currentItem.addClass("slide-" + (idx + 1)).attr("data-page-num",(idx + 1));
	});
	var numOfPages = items.length;
	

	container.find(".page-navigator").remove();
	container.find("#paginator").remove();
	var paginator = $("<div />").attr("id","paginator");
	for(var i=1;i <= numOfPages; i++){
		var pageNavigator = $("<div />").attr("id","nav"+i).addClass("page-navigator").attr("data-page-num",i).click(function(e){
			e.stopPropagation();
			if (container.attr("data-interval-id")){
				clearInterval(parseInt(container.attr("data-interval-id")));
			}
			flex_arranger.showPage($(this).attr("data-page-num"),container,items);
		});
		paginator.append(pageNavigator);
	}
	
	//paginator.css("left",parseInt(container.width())/2);
	//paginator.css("top",parseInt(container.height()) - 40);
	
	
	container.find("#items-holder-wrapper").append(paginator);
	
	var paginationWidth = parseInt(paginator.width());
	paginatorNeMargin = paginationWidth / -2; 
	paginator.css("margin-left",paginatorNeMargin);
	if (items.length == 1){
		paginator.hide();
	}else{
		paginator.show();
	}
	
	container.find("#nav1").addClass("active");
	
};


flex_arranger.emulateTransitionEnd = function(element,duration,callbackFunc) {
	  var called = false;
	  element.one('webkitTransitionEnd', function() { called = true; callbackFunc();});
	  var callback = function() { if (!called) element.trigger('webkitTransitionEnd'); };
	  setTimeout(callback, duration);
	};

flex_arranger.removeElements = function(items){
	var elements = items.not(".element-box").first().siblings(".element-box");
	elements.remove();
};

flex_arranger.getSlideshowType = function(container){
	var stripe = container.closest(".master.item-box");
	var settings = stripe.find(".arranger-settings");
	var slideshowType = settings.attr("data-slide_effect");
	if (typeof slideshowType == "undefined"){
		slideshowType = "SLIDE";
	}
	return slideshowType;
};

flex_arranger.getArrowSrc = function(container){
	var stripe = container.closest(".master.item-box");
	var settings = stripe.find(".arranger-settings");
	var arrowsSrc = settings.attr("data-flex_arrows");
	if (typeof arrowsSrc == "undefined"){
		arrowsSrc = "https://lh3.googleusercontent.com/ZMARmveTg1geksYKXZKdh71KW09XrhDLg8N-XrfXCGsDBEHnuKwhmYpHd55Y2-NwuwLX8qsyx26JNyJWtr1jEcxD=s50";
	}
	return arrowsSrc;
};

flex_arranger.createArrows = function(container, itemsHolder, items){
	var flexArrows = container.find(".flex-arrows");
	var leftArrow = flexArrows.filter(".left");
	var arrowImg = flex_arranger.getArrowSrc(container);
	var rightArrow = flexArrows.filter(".right");
	if (flexArrows.length == 0 || leftArrow.attr("src") != arrowImg){
		flexArrows.remove();
		rightArrow = $("<img />");
		rightArrow.attr("src",arrowImg);
		rightArrow.addClass("flex-arrows").addClass("right").addClass("layer5").css("transform","scale(-1)");
		leftArrow = $("<img />");
		leftArrow.attr("src",arrowImg);
		leftArrow.addClass("flex-arrows").addClass("left").addClass("layer5");
		itemsHolder.parent().prepend(leftArrow).prepend(rightArrow);
	}
	rightArrow.unbind("click").bind("click",function(event){
		event.stopPropagation();
		if (container.attr("data-interval-id")){
			clearInterval(parseInt(container.attr("data-interval-id")));
		}
		flex_arranger.slide(rightArrow,"right",items,container);
	});
	leftArrow.unbind("click").bind("click",function(event){
		event.stopPropagation();
		if (container.attr("data-interval-id")){
			clearInterval(parseInt(container.attr("data-interval-id")));
		}
		flex_arranger.slide(leftArrow,"left",items,container);
	});

	container.unbind("swipeleft").bind("swipeleft",function(){
		if (items.length > 1){
			if (container.attr("data-interval-id")){
				clearInterval(parseInt(container.attr("data-interval-id")));
			}
	    	flex_arranger.slide(rightArrow,"right",items,container);
		}
	});
	
	container.unbind("swiperight").bind("swiperight",function(){
		if (items.length > 1){
			if (container.attr("data-interval-id")){
				clearInterval(parseInt(container.attr("data-interval-id")));
			}
	    	flex_arranger.slide(leftArrow,"left",items,container);
		}
	});
};; var menu_layout = {};
menu_layout.LEFT_MENU_WIDTH = 270;
menu_layout.SCROLLBAR_WIDTH = 0;

menu_layout.init = function(container,items){
	var currentPageId = $(".master.container").attr("id");
	var currentPageSlug = $(".master.container").attr("data-itemslug");
	if (XPRSHelper.isChrome()){
		menu_layout.SCROLLBAR_WIDTH = 0;
		//$(".master.container").addClass("chrome");
	}
	items.each(function(){
		var currentItem = $(this);
		
		//Mark link of the current page
		currentItem.find(".preview-item-links a").each(function(){
			var linkStr = $(this).attr("href");
			if (linkStr){
				//remove query params
				if (linkStr.indexOf("?") != -1){
					linkStr = linkStr.substring(0,linkStr.indexOf("?"));
				}
				//match slug or vbid
				var linkToCurrentPage = linkStr.indexOf(currentPageId, linkStr.length - currentPageId.length) !== -1;
				linkToCurrentPage = linkToCurrentPage || linkStr.indexOf(currentPageSlug, linkStr.length - currentPageSlug.length) !== -1;
				if (linkToCurrentPage){
					$(this).addClass("current-page");
					//do not mark more than one even if found
					return false;
				}
			}
		});



		
		//LEFT MENU
		var holder = container.closest(".master.item-box");
		holder.addClass("animated-color")
		var settings = holder.find(".layout-settings");
		var menuPosition = settings.attr("data-menu_position");
		var isProductPage = window.location.href.indexOf("/product/") != -1;
		if(typeof window["EditorHelper"] == "undefined"){
			var submenuTitles = currentItem.find(".submenu-title");
			submenuTitles.each(function(){
				var submenuTitle = $(this);
				if (submenuTitle.parent().is("a")){
					submenuTitle.unwrap()
				}
				submenuTitle.unbind("click").bind("click",function(e){
					e.stopPropagation();
					var clickedTitle = $(this);
					menu_layout.toggleSubmenu(clickedTitle);
				});
			});
			// submenuTitles.unbind("click").bind("click",function(e){
			// 	e.stopPropagation();
			// 	var clickedTitle = $(this);
			// 	menu_layout.toggleSubmenu(clickedTitle);
			// });
		}

		if (isProductPage && menuPosition == "none"){
			menuPosition= "top";
			settings.attr("data-menu_position","top")
		}
		holder.removeClass("hidden-menu");
		if (menuPosition == "none"){
			holder.css("display","none");
		}else if (menuPosition == "left"){
			$(".master.container").find("#children").first().css("width",$(window).innerWidth() - menu_layout.SCROLLBAR_WIDTH - menu_layout.LEFT_MENU_WIDTH);
			$(".left-menu-placeholder").height($(window).height());
		}else{
			$(".master.container").find("#children").first().css("width","");
		}
		
		var previewTitle = currentItem.find(".preview-title");
		//var previewSubtitle = currentItem.find(".preview-subtitle");
		var rightSideDiv = currentItem.find('.right-div');
		var leftSideDiv = currentItem.find('.left-div');
		var stripe = container.closest(".master.item-box");
		totalLinksWidth = rightSideDiv.outerWidth(true);
		
		//Saving the original links width for unmenufying - only if we are not centered
		if (!rightSideDiv.hasClass("centerified") && settings.attr("data-menu_align") != "center" && stripe.css("display") != "none"){
			stripe.attr("data-original-menu-width",totalLinksWidth);
		}
		
		//no shrink if title is not present
		var originalFontSize = "N/A";
		if (currentItem.find(".element-placeholder[data-elementtype='TITLE']").length == 0){
			originalFontSize = Math.round(parseInt(previewTitle.css("font-size")));
			leftSideDiv.attr("data-orig-font-size",originalFontSize);
		}
		var noTitleAndSub = currentItem.find(".preview-title").length == 0 && currentItem.find(".preview-subtitle").length == 0;
		//If no subtitle and no title found link will be aligned to center
		if ((noTitleAndSub) || (currentItem.find(".element-placeholder[data-elementtype='TITLE']").length > 0 && currentItem.find(".element-placeholder[data-elementtype='SUBTITLE']").length > 0)){
			currentItem.find(".helper-div").hide();
			if (noTitleAndSub && currentItem.find(".preview-icon").length > 0){
				menu_layout.centerifyLinks(leftSideDiv,rightSideDiv);
			}else{
				menu_layout.uncenterifyLinks(leftSideDiv,rightSideDiv);
			}
		}else{
			currentItem.find(".helper-div").show();
			menu_layout.uncenterifyLinks(leftSideDiv,rightSideDiv);
		}
	});
};


menu_layout.closeOpenedSubmenus = function(){
	var openedSubmenus = $(".submenu-title.menu-opened");
	var wasOpen = openedSubmenus.length > 0;
	if (wasOpen){
		var holder = openedSubmenus.closest(".master.item-box");
		holder.css("z-index","");
	}
	openedSubmenus.each(function(){
		var currentSubmenuTitle = $(this);
		if (currentSubmenuTitle.parent().is("a")){
			currentSubmenuTitle.parent().next(".submenu").hide();
		}else{
			currentSubmenuTitle.next(".submenu").hide();
		}
		currentSubmenuTitle.removeClass("menu-opened");
	});
	return wasOpen;
};

menu_layout.toggleSubmenu = function(clickedTitle){
	var holder = clickedTitle.closest(".master.item-box");
	var settings = holder.find(".layout-settings");
	var menuPosition = settings.attr("data-menu_position");
	var currentSubmenu = clickedTitle.next(".submenu");
	if (clickedTitle.parent().is("a")){
		currentSubmenu = clickedTitle.parent().next(".submenu");
	}
	var noPlaceMode = holder.find(".preview-item-links.no-place").length == 1;
	var minifiyType = settings.attr("data-always_minified");
	if (currentSubmenu.is(":visible")){
		holder.css("z-index","")
		if (menuPosition == "left" || minifiyType == "side_screen" || minifiyType == "full_screen" || noPlaceMode){
			currentSubmenu.slideUp(function(){
				clickedTitle.removeClass("menu-opened");
			});
		}else{
			currentSubmenu.fadeOut(function(){
				clickedTitle.removeClass("menu-opened");
			});
		}
		
	}else{
		holder.css("z-index","1234567890")
		menu_layout.calculateSubmenuBG(holder,currentSubmenu);
		holder.find(".menu-opened").removeClass("menu-opened");
		clickedTitle.addClass("menu-opened");
		if (menuPosition == "left" || minifiyType == "side_screen" || minifiyType == "full_screen" || noPlaceMode){
			holder.find(".submenu:visible").slideUp()
			currentSubmenu.slideDown();
		}else{
			holder.find(".submenu:visible").fadeOut()
			currentSubmenu.fadeIn(function(){
				clickedTitle.addClass("menu-opened");
			});
		}
		
	}
};

menu_layout.centerifyLinks = function(leftSideDiv,rightSideDiv){
	leftSideDiv.css({"width":0,"display":"inline"});
	rightSideDiv.css({"width":"100%","text-align":"center"}).addClass("centerified");
};

menu_layout.uncenterifyLinks = function(leftSideDiv,rightSideDiv){
	leftSideDiv.css({"width":"","display":""});
	rightSideDiv.css({"width":"","text-align":""}).removeClass("centerified");;
};

menu_layout.applyLayout = function(container,items,paramsFromRealTime){
	var holder = container.closest(".master.item-box");
	var masterContainer = $(".master.container");
	items.each(function(){
		var currentItem = $(this);
		currentItem.find(".preview-item-links").css("display","");
		var settings = container.closest(".master.item-box").find(".layout-settings");
		
		var alwaysMinify = settings.attr("data-always_minified") != "false";
		var leftMenuPlaceHolder = masterContainer.find(".left-menu-placeholder");
		var menuAlign = settings.attr("data-menu_align");
		if(holder.find(".item-wrapper").innerWidth() < 400 && leftMenuPlaceHolder.length == 0 && holder.css("display") != "none"){
			menuAlign = "left";
			holder.addClass("force-min-height50 minimal-design");
		}else{
			if (!holder.is(".being-scrolled")){
				holder.removeClass("force-min-height50 minimal-design");
			}
		}
		var menuPosition = settings.attr("data-menu_position");
		
		
		if (menuPosition == "none"){
			holder.css("display","none");
			//return;
		}else if (menuPosition == "left"){
			holder.css("display","");
			holder.removeClass("minimal-design");
			masterContainer.find("#children").first().css("width",$(window).innerWidth() - menu_layout.SCROLLBAR_WIDTH - menu_layout.LEFT_MENU_WIDTH);
			$(".left-menu-placeholder").height($(window).height());
		}else{
			holder.css("display","");
			masterContainer.find("#children").first().css("width","");
			//holder.find('.right-div').css("height",holder.find('.preview-icon-holder').height());
			if (holder.find('.preview-icon-holder').length > 0){
				holder.find('.right-div').css("height",holder.find('.preview-icon-holder').height());
			}else{
				holder.find('.right-div').css("height","");
			}
		}
		
		
		var menuRatio = $("body").width()/menu_layout.LEFT_MENU_WIDTH;
		if (menuPosition == "left" && menuRatio > 4){
			menuAlign = "center";
			masterContainer.addClass("left-menu-layout");
			holder.find(".preview-content-holder").css("height",$("body").height());
			if (leftMenuPlaceHolder.length == 0){
				leftMenuPlaceHolder = $("<div />").addClass("left-menu-placeholder");
				var holderHandle = holder.next(".control-handle");
				leftMenuPlaceHolder.append(holder);
				if (holderHandle.length > 0){
					leftMenuPlaceHolder.append(holderHandle);
				}
				$(".master.container > #children").before(leftMenuPlaceHolder);
			} 
		}else{
			masterContainer.removeClass("left-menu-layout");
			holder.find(".preview-content-holder").css("height","");
			masterContainer.find("#children").first().css("width","");
			menuPosition="top";
			if (leftMenuPlaceHolder.length != 0){
				var holderHandle = holder.next(".control-handle");
				$(".master.container > #children").prepend(holder);
				if (holderHandle.length > 0){
					holder.after(holderHandle);
				}
				
				leftMenuPlaceHolder.remove();
			}
		}
		if (menuAlign == "center"){
			holder.addClass("center-aligned-menu");
		}else{
			holder.removeClass("center-aligned-menu");
		}
		var previewTitle = currentItem.find(".preview-title");
		var previewSubtitle = currentItem.find(".preview-subtitle");
		var rightSideDiv = currentItem.find('.right-div');
		var leftSideDiv = currentItem.find('.left-div');
		leftSideDiv.find(".helper-div").show();
		var noTitleAndSub = currentItem.find(".preview-title").length == 0 && currentItem.find(".preview-subtitle").length == 0;
		if (noTitleAndSub || (currentItem.find(".element-placeholder[data-elementtype='TITLE']").length > 0 && currentItem.find(".element-placeholder[data-elementtype='SUBTITLE']").length > 0)){
			currentItem.find(".helper-div").hide();
			if (noTitleAndSub && currentItem.find(".preview-icon").length > 0){
				menu_layout.centerifyLinks(leftSideDiv,rightSideDiv);
			}else{
				menu_layout.uncenterifyLinks(leftSideDiv,rightSideDiv);
			}
		}else{
			currentItem.find(".helper-div").show();
			menu_layout.uncenterifyLinks(leftSideDiv,rightSideDiv);
		}
		
		var stripe = container.closest(".master.item-box");
		
		var textElement = currentItem.find(".preview-title");
		var contentHolder = currentItem.find(".preview-content-holder");
		var contentWrapper = currentItem.find(".preview-content-wrapper");
		
		var originalFontSize = "N/A";
		if (currentItem.find(".element-placeholder[data-elementtype='TITLE']").length == 0){
			originalFontSize =  parseInt(leftSideDiv.attr("data-orig-font-size"));
			if (textElement.attr("data-orig-font-size")){
				if (originalFontSize != textElement.attr("data-orig-font-size")){
					originalFontSize = textElement.attr("data-orig-font-size");
				}
			}
			textElement.css("font-size",originalFontSize + "px");
		}
		
		var totalLinksWidth = 0;
		
		if (typeof stripe.attr("data-original-menu-width") != "undefined"){
			totalLinksWidth = parseInt(stripe.attr("data-original-menu-width"));
		}else{
			totalLinksWidth = currentItem.find(".preview-item-links").outerWidth(true);
			if (stripe.css("display") != "none"){
				stripe.attr("data-original-menu-width",totalLinksWidth)
			}
		}
		
		
		var textSpace = 0;
		if (leftSideDiv.length > 0){
			textSpace = parseInt(leftSideDiv.width());
		}
		
		var relevantLinksWidth = totalLinksWidth
		var shrinkerRelevantContainer = contentWrapper;
		if( stripe.find(".preview-links-wrapper").is(".flipped")){
			relevantLinksWidth = 0;
			shrinkerRelevantContainer = stripe;
		}
		
		if (menuAlign == "center"){
			if (masterContainer.hasClass("left-menu-layout")){
				totalLinksWidth = 0; //(no shrink at all)
				shrinkerRelevantContainer = holder.find(".item-wrapper");
			}else{
				textSpace = 0; //(shrink and center)
				relevantLinksWidth = 0;
			}
		}
		//Shrink if needed
		if (leftSideDiv.outerWidth(true) + relevantLinksWidth > shrinkerRelevantContainer.width()){
			var newFontSize = SpimeEngine.shrinkTextToFit(originalFontSize,shrinkerRelevantContainer,leftSideDiv,textElement,totalLinksWidth,15);
			if (newFontSize != -1){
				textElement.css("font-size",newFontSize);
			}
		}

		var atLeastOneLink = holder.find("#sr-basket-widget , .preview-element.Link.item-link").length > 0
		alwaysMinify = alwaysMinify && menuAlign=="left" && menuPosition=="top";
		
		//console.log( contentHolder.width() + " " +  totalLinksWidth + " " + textSpace + " " +  alwaysMinify +  " " +atLeastOneLink)
		
		if ((contentHolder.width() <= totalLinksWidth + textSpace || alwaysMinify) && menuPosition=="top" && atLeastOneLink){
			//if shrink is not working menufyLinks
			menu_layout.menufyLinks(container,currentItem.find(".preview-item-links"));
			//if menufy is not enough remove text
			if (contentHolder.width() < textSpace + rightSideDiv.width()){
				//console.log("still NO space ");
				leftSideDiv.find(".helper-div").hide(); 
			}
		}else{
			if (!alwaysMinify || !atLeastOneLink){
				menu_layout.unmenufyLinks(container,container.next(".preview-item-links"));
				
			}
		}
		
		if (!holder.hasClass("menu-open")){
			if (settings.attr("data-menu_overlay") == "absolute" && !holder.is(".being-scrolled")){
				holder.addClass("force-transparency");
				if (settings.attr("data-menu_overlay") == "absolute" && holder.css("position")!= "absolute"){
					 holder.css("position","absolute");
				}
			}
			if (settings.attr("data-menu_overlay") == "relative" && !holder.is(".being-scrolled")){
				if (settings.attr("data-menu_overlay") == "relative" && holder.css("position")!= "relative"){
					holder.css("position","relative");
					holder.removeClass("force-transparency");
				}
			}
		}
		menu_layout.updateBurgerColor(stripe.find(".preview-item-links"));
		menu_layout.adjustMenuScrolling(stripe);
	});
	
};

menu_layout.forceRedraw = function(elements){
	elements.each(function(){
		var element = $(this)[0];
		  var disp = element.style.display;
		  element.style.display = 'none';
		  var trick = element.offsetHeight;
		  element.style.display = disp;
	});
	
};

menu_layout.adjustMenuScrolling = function(stripe){
	var linksHolder =  stripe.find(".preview-item-links");
	var linksWrapper = linksHolder.find(".preview-links-wrapper");
	if (stripe.hasClass("full-screen-menu menu-open")){
		if (linksWrapper.outerHeight(true) + linksWrapper.outerHeight(true)/2 > $(window).innerHeight() - stripe.height() -50){
			if (!linksHolder.hasClass("transform-disabled")){
				linksHolder.addClass("transform-disabled")
				linksWrapper.css({"top":stripe.height()});
				//linksWrapper.closest(".preview-item-links").css({"overflow-y":"scroll","padding-right": "20px"})//.attr("id","scrolling-menu");
			}
		}else{
			linksWrapper.css({"top":""});
			//linksWrapper.closest(".preview-item-links").css({"overflow-y":"","padding-right": ""});
			linksHolder.removeClass("transform-disabled")
		}
	}else{
		if (linksHolder.hasClass("transform-disabled")){
			linksHolder.removeClass("transform-disabled")
		}
	}
};

menu_layout.handleScroll = function(holder,scrollPos){
	if (holder.hasClass("is-blocked")){
		return;
	}
	var settings = holder.find(".layout-settings");
	var menuAlign = settings.attr("data-menu_align");
	var menuPosition = settings.attr("data-menu_position");
	if(holder.find(".item-wrapper").innerWidth() < 400 && menuPosition!="left"){
		menuAlign = "left";
		holder.addClass("force-min-height50 minimal-design");
	}else{
		holder.removeClass("minimal-design");
	}
	if (settings.attr("data-menu_scroll") == "true"){
		if (scrollPos == 0){
			$("#menu-placeholder").remove();
			if (menuAlign == "center"){
				holder.addClass("center-aligned-menu");
			}
			holder.css({"position":settings.attr("data-menu_overlay")});
			holder.removeClass("animated-top");
			holder.css("top","");
			//holder.find(".preview-subtitle-holder").show();
			holder.find('.left-div').removeClass("scale-down08");
			if (holder.find(".item-wrapper").innerWidth() >= 400){
				holder.removeClass("force-min-height50");
			}
			holder.removeClass("being-scrolled");
			if (!holder.is(".menufied")){
				//holder.find('.right-div').css("height","");
			}
			if (settings.attr("data-menu_overlay") == "absolute"){
				holder.addClass("force-transparency");
			}
			menu_layout.forceRedraw(holder.find(".item-wrapper"))
		}else if(scrollPos < holder.outerHeight(true)){

			
		}else{
			if (holder.css("position") != "fixed" ){
				//Create a menu place holder to prevent the mobile scroll jump
				var menuHeight = parseInt(holder.css("height"));
				if (holder.parent().find("#menu-placeholder").length == 0 && !holder.is(".force-transparency")){
					var menuPlaceHolder = $("<div />").attr("id","menu-placeholder").css({"height":menuHeight,"width":"100%"});
					holder.after(menuPlaceHolder);
				}
				//holder.attr("data-orig-min-height", holder.css("min-height"));
				holder.removeClass("center-aligned-menu");
				holder.addClass("being-scrolled");
				holder.addClass("force-min-height50");
				holder.css({"position":"fixed","top":menuHeight*-1});
				holder.find('.left-div').addClass("scale-down08");
				holder.find('.right-div').css("height",holder.find('.left-div').height());
				//holder.find(".preview-subtitle-holder").hide();
				holder.addClass("animated-top");
				holder.removeClass("force-transparency");
				setTimeout(function(){
					var offsetFix = (window["EditorHelper"] === undefined) ? 0 : $("#control-panel").css("height");
					holder.css("top",offsetFix);
				},10);
			}else{
				//if(typeof window["EditorHelper"] != "undefined" ){
				//	holder.removeClass("animated-top");
			//	holder.css("top",scrollPos);
				//}
			}
		}
	}
	
};


menu_layout.updateBurgerColor = function(linksHolder){
	var linksColor = linksHolder.find(".item-link").css("color");
	var styleForBurger = $("head style#for-burger");
	if (styleForBurger.length == 0){
		styleForBurger = $("<style>").attr("id","for-burger");
	}
	styleForBurger.text(".hamburger-inner:before,.hamburger-inner,.hamburger-inner:after {background-color:"+linksColor+";}")
	$('head').append(styleForBurger);
};

menu_layout.menufyLinks = function(container,linksHolder){
	var stripe = container.closest(".master.item-box");
	var settings = stripe.find(".layout-settings");
	var minifiyType = settings.attr("data-always_minified");
	var menufiedLinksBehaviour = settings.attr("data-menu_shrink_class");
	var menuBtn = container.find(".links-menu-btn");
	
	menuBtn.addClass("shown");
	if (container.next(".preview-item-links").length == 0){
		var allLinks = linksHolder.children();
		linksHolder.attr("data-shrink-style", menufiedLinksBehaviour)
		var menuBackground = container.find(".item-content").css("background-color");
		var menuMaxWidth = container.css("max-width");
		allLinks.addClass("flipped");
		stripe.addClass("menufied");
		if (!stripe.hasClass("menu-open")){
			//linksHolder.css({"max-width":menuMaxWidth,"background-color":menuBackground});
			linksHolder.hide();
		}
		
		//if (minifiyType != "false"){
			container.after(linksHolder);
			//linksHolder.css({"background-color":stripe.css("background-color")});
		//}
		
		
		
		stripe.attr("data-original-stripe-height" , stripe.height());
		
		menuBtn.unbind('click').bind('click', function(e){
			e.stopPropagation();
			menu_layout.burgerClick($(this),stripe,linksHolder);
		});
		
		
		if(typeof window["EditorHelper"] == "undefined"){
			linksHolder.unbind("click").bind("click",function(e){
				e.stopPropagation();
				menu_layout.burgerClick(menuBtn,stripe,linksHolder);
			});
		}
		
		stripe.find('.right-div').css("height",stripe.find('.preview-icon-holder').height());
	}
};


menu_layout.burgerClick = function(burger,stripe,linksHolder){
	if (!burger.hasClass("being-clicked")){
		burger.addClass("being-clicked")
		var settings = stripe.find(".layout-settings");
		var minifiyType = settings.attr("data-always_minified");
		linksHolder.removeClass("allow-bg-color");
		switch(minifiyType){
		case "true":
			menu_layout.handleMinifiedDefault(burger,stripe,linksHolder,settings);
			break;
		case "full_screen":
			linksHolder.addClass("allow-bg-color");
			menu_layout.handleMinifiedFullScreen(burger,stripe,linksHolder,settings);
			break;
		case "side_screen":
			linksHolder.addClass("allow-bg-color");
			menu_layout.handleMinifiedSideScreen(burger,stripe,linksHolder,settings);
			break;
		default:
			menu_layout.handleMinifiedDefault(burger,stripe,linksHolder,settings);
			break;
		}
		menu_layout.adjustMenuScrolling(stripe);
	}
};

menu_layout.handleMinifiedDefault = function(burger,stripe,linksHolder,settings){
	stripe.addClass("animated");
	burger.toggleClass("is-active");
	if (burger.hasClass("is-active")){
		stripe.removeClass("force-transparency");
		linksHolder.addClass("flipped");
		linksHolder.removeClass("no-place");
		stripe.addClass("menu-open");
		if (linksHolder.width() >=  stripe.width() && !linksHolder.is(".no-place")){
			linksHolder.addClass("no-place")
		}
		stripe.find(".item-content").addClass("flipped");
		burger.removeClass("being-clicked");
		linksHolder.slideDown(function(){
			
		});
	}else{
		linksHolder.slideUp(function(){
			stripe.removeClass("menu-open");
			if (settings.attr("data-menu_overlay") == "absolute" && !stripe.is(".being-scrolled")){
				stripe.addClass("force-transparency");
			}
		});
		burger.removeClass("being-clicked");
		
		linksHolder.removeClass("flipped");
		//linksHolder.css({"background-color":""});
	}
	
};

menu_layout.handleMinifiedFullScreen = function(burger,stripe,linksHolder,settings){
	burger.toggleClass("is-active");
	if (burger.hasClass("is-active")){
		//stripe.css("background-color","transparent")
		var master = $(".master.container");
		linksHolder.css({"margin-left":master.css("margin-left"),"margin-right":master.css("margin-right")});
		if (master.is(".narrow-site")){
			linksHolder.css("width","1000px");
		}
		$("body").addClass("noscroll");
		menu_layout.disableScroll();
		linksHolder.addClass("flipped");
		stripe.find(".item-content").addClass("flipped");
		linksHolder.fadeIn(function(){
			burger.removeClass("being-clicked")
		});
		stripe.addClass("full-screen-menu menu-open");
	}else{
		//stripe.css("background-color","")
		$("body").removeClass("noscroll");
		menu_layout.enableScroll();
		linksHolder.removeClass("flipped");
		linksHolder.fadeOut(function(){
			burger.removeClass("being-clicked")
			stripe.removeClass("full-screen-menu menu-open");
			//linksHolder.css({"background-color":""});
			linksHolder.css({"margin-left":"","margin-right":"","width":""})
		});
	}
};

menu_layout.handleMinifiedSideScreen = function(burger,stripe,linksHolder,settings){
	burger.toggleClass("is-active");
	if (burger.hasClass("is-active")){
		var master = $(".master.container");
		linksHolder.css({"margin-right":master.css("margin-right")})
		linksHolder.addClass("flipped");
		stripe.find(".item-content").addClass("flipped");
		stripe.addClass("side-screen-menu menu-open");
		linksHolder.show();
		setTimeout(function(){
			burger.removeClass("being-clicked")
			var calcRight = ($(window).width() - $("#xprs").width())/2
			// linksHolder.closest("nav").css("right",calcRight);
			linksHolder.css("right",calcRight)
		},10)
		
	}else{
		linksHolder.css({"transition":"none"});
		var animateSpeed = ($("body").is(".tablet-preview") || $("body").is(".cellphone-preview")) ? 0 : 1000;
		linksHolder.animate({
			right:"-360px"
		  }, animateSpeed, function() {
			  	burger.removeClass("being-clicked")
				linksHolder.hide();
				stripe.removeClass("side-screen-menu menu-open");
				linksHolder.css({"margin-right":"","right":"","transition":""});
		  });
		linksHolder.removeClass("flipped");
	}
};

menu_layout.handleMinifiedBoxed = function(burger,stripe,linksHolder,settings){
	burger.toggleClass("is-active");
	if (burger.hasClass("is-active")){
		stripe.removeClass("force-transparency");
		linksHolder.addClass("flipped");
		stripe.find(".item-content").addClass("flipped");
		linksHolder.css({"top":stripe.height()})
		linksHolder.fadeIn();
		stripe.addClass("boxed-menu menu-open");
	}else{
		linksHolder.removeClass("flipped");
		linksHolder.css("right","0px")
		//linksHolder.fadeOut(function(){stripe.removeClass("boxed-menu menu-open");});
		//if (settings.attr("data-menu_overlay") == "absolute" && !stripe.is(".being-scrolled")){
		//	stripe.addClass("force-transparency");
		//}
		
		
	}
	
};


menu_layout.disableScroll = function(){
	var x=window.scrollX;
    var y=window.scrollY;
    window.onscroll=function(){window.scrollTo(x, y);};
};

menu_layout.enableScroll = function(){
	window.onscroll=function(){};
};

menu_layout.unmenufyLinks = function(container,linksHolder){
	var holder = container.closest(".master.item-box");
	if (holder.hasClass("menufied")){//container.next(".preview-item-links").length > 0){
		
		
		linksHolder.removeAttr("data-shrink-style");
		var menuLinksHolder = linksHolder.find(".menu-links-holder");
		//linksHolder.find("span").css({"display":"","margin-right":"","margin-left":""});
		linksHolder.css({"max-width":"","background-color":"","margin":""});
		holder.removeClass("menufied");
		//linksHolder.find(".links-menu-btn").removeClass("shown");
		container.find(".links-menu-btn").removeClass("shown");
		var allLinks = menuLinksHolder.children();
		allLinks.removeClass("flipped");
		container.find(".item-content").removeClass("flipped");
		linksHolder.append(allLinks);
		container.find(".right-div").prepend(linksHolder);
		var stripe = container.closest(".master.item-box");
		stripe.removeClass("animated");
		linksHolder.show();
		linksHolder.removeClass("flipped");
		//holder.find('.right-div').css("height","");
		holder.find('.right-div').css("height",holder.find('.preview-icon-holder').height());
		linksHolder.removeClass("allow-bg-color");
		if (holder.hasClass("menu-open")){
			holder.find(".hamburger").click();
			setTimeout(function(){
				holder.find(".preview-item-links").css("display","");
			},1500);
		}
		holder.find(".preview-item-links").css("display","");
	}

};


menu_layout.calculateSubmenuBG = function(container,submenu){
	var menuBackground = container.find(".item-content").css("background-color");
	if (menuBackground.indexOf("rgba(") != -1 && menuBackground.indexOf(", 0)") != -1){
		menuBackground = container.closest(".master.item-box").css("background-color");
	}
	submenu.css("background-color",menuBackground);
};; var footer_layout = {};

footer_layout.init = function(container,items){
	items.each(function(){
		var currentItem = $(this);
		var links = currentItem.find(".preview-item-links").children();
		links.css("clear","");
		links.each(function(idx){
			if (idx % 2 == 0 && idx!=0){
				$(this).css("clear","left");
			}
		});
	});
	
};

footer_layout.applyLayout = function(container,items){
	items.each(function(){
		var currentItem = $(this);
		var stripe = container.closest(".master.item-box");
		var rightDivWidth = currentItem.find(".preview-social-wrapper").width();
		var leftDivWidth = currentItem.find(".helper-div").width();
		var centerDivWidth = currentItem.find(".preview-item-links").innerWidth();
		var stripeWidth = stripe.width();
		if (rightDivWidth + leftDivWidth + centerDivWidth > stripeWidth){
			footer_layout.flipVertically(currentItem);
		}else{
			footer_layout.unflip(currentItem);
		}
	});
};

footer_layout.flipVertically = function(item){	
	if (typeof item.attr("data-flipped") == "undefined"){
		item.attr("data-flipped","true");
		var rightDiv = item.find(".right-div");
		var leftDiv = item.find(".left-div");
		var centerDiv = item.find(".center-div");
		rightDiv.addClass("flipped");
		leftDiv.addClass("flipped");
		centerDiv.addClass("flipped");
	}
};

footer_layout.unflip = function(item){
	if (typeof item.attr("data-flipped") != "undefined"){
		item.removeAttr("data-flipped","true");
		var rightDiv = item.find(".right-div");
		var leftDiv = item.find(".left-div");
		var centerDiv = item.find(".center-div");
		rightDiv.removeClass("flipped");
		leftDiv.removeClass("flipped");
		centerDiv.removeClass("flipped");
	}
};; var multi_layout = {};

multi_layout.init = function(container,items){
	items = items.not(".stripe-header").not(".stripe-footer");
	items.each(function(){
		var helperDiv = $(this).find(".helper-div");
		var picSide = $(this).find(".pic-side");
		var textSide = $(this).find(".text-side");
		if (helperDiv.is(".top-center")){
			picSide.before(textSide);
		}else{
			picSide.after(textSide);
		}
	});
};

multi_layout.applyLayout = function(container,items,paramsFromRealTime){
	items = items.not(".stripe-header").not(".stripe-footer");
	var helperDiv = items.find(".helper-div");
	var picSide = items.find(".pic-side");
	var textSide = items.find(".text-side");
	
	items.find(".image-cover , .item-preview").css("min-height","inherit");
	
	//Handle Ratio
	if (container.find(".arranger-settings").length > 0){
		var arrangerSettings = container.find(".arranger-settings");
		if (arrangerSettings.attr("data-arranger_type") == "matrix"){
			var isMazonite = arrangerSettings.attr("data-arranger_order_type") == "mazonite";
			var ratioFromArranger = parseFloat(arrangerSettings.attr("data-arranger_item_ratio")).toFixed(1);
			items.each(function(){
				var currentItem = $(this);
				var innerPic = currentItem.find(".inner-pic");
				if (isMazonite){
					var origHeight = innerPic.attr("data-orig-height");
					var origWidth = innerPic.attr("data-orig-width");
					if (origHeight && origWidth){
						ratioFromArranger = parseInt(origHeight) / parseInt(origWidth)
					}else{
						if (innerPic.attr("id") != "no-image"){
							container.closest(".master.item-box").addClass("rearrange");
						}
						ratioFromArranger = 0;
					}
					
				}
				var newPicHeight = currentItem.find(".pic-side").width() * ratioFromArranger;
				if (currentItem.find(".video-frame").length > 0 && isMazonite){
					//found video
					newPicHeight = currentItem.find(".pic-side").width() * (9/16);
				}
				if (helperDiv.is(".top-center") || helperDiv.is(".bottom-center")){
					innerPic.css({"height":newPicHeight});	
					currentItem.find(".helper-div").css({"min-height":""});
				}else{
					currentItem.find(".helper-div").css({"min-height":newPicHeight});	
					innerPic.css({"height":""});	
				}
			});
			
		}else{
			items.find(".item-details").css("height","")
			if (helperDiv.is(".top-center") || helperDiv.is(".bottom-center")){
				items.each(function(){
					var currentItem = $(this)
					var textHeight = currentItem.find(".item-details").outerHeight(true);
					var newHeight = currentItem.height() - textHeight
					currentItem.find(".inner-pic").css("height",newHeight);
				});
			}else{
				picSide.find(".inner-pic").css({"height":""});	
			}
		}
	}else{
		items.find(".item-details").css("height","")
		if (helperDiv.is(".top-center") || helperDiv.is(".bottom-center")){
			items.each(function(){
				var currentItem = $(this)
				var textHeight = currentItem.find(".item-details").outerHeight(true);
				var newHeight = currentItem.height() - textHeight
				currentItem.find(".inner-pic").not(".circlize").css("height",newHeight);
				if (currentItem.find(".inner-pic").is(".circlize")){
					currentItem.find(".pic-side").not(".circlize").css("height",newHeight);
				}
			});
		}else{
			picSide.find(".inner-pic").css({"height":""});	
		}
	}
		
	
	
	
	if (container.width() < 500){
		if (!helperDiv.is(".middle-center") &&  !helperDiv.is(".top-center") && !helperDiv.is(".bottom-center")){
			items.each(function(){
				multi_layout.flipVertically($(this));
			});
		}
	}else{
		if (helperDiv.attr("data-orig-class")){
		items.each(function(){
			multi_layout.unflip($(this));
		});
		picSide.css("top","")
		textSide.find(".vertical-aligner").css("min-height","")	
		}
	}
	
	if (paramsFromRealTime && "force_redraw" in paramsFromRealTime){
		multi_layout.forceRedraw($(".item-wrapper"));
	}

	if (helperDiv.is(".middle-center")){
			items.each(function(){
				var currentItemDetails = $(this).find(".item-details");
				var draggableImages = $(this).find(".draggable-div-holder");
				if (currentItemDetails.css("text-align") == "center" || currentItemDetails.css("text-align") == "right"){
					var divisor = 2;
					if ( currentItemDetails.css("text-align") == "right"){
						divisor = 1;
					}
					var textSideMaxWidth = $(this).find(".text-side").css("max-width");
					if (textSideMaxWidth != "none"){
						textSideMaxWidth = parseInt(textSideMaxWidth);
						if (draggableImages.width() < textSideMaxWidth ){
							var newMarginLeft = (textSideMaxWidth - draggableImages.width())/divisor * -1;
							draggableImages.css("margin-left",newMarginLeft);
						}else{
							draggableImages.css("margin-left",0);
						}
					}
				}
				
				if ( currentItemDetails.css("vertical-align") == "top"){
					draggableImages.css("margin-top",0);
				}
				
				if ( currentItemDetails.css("vertical-align") == "middle" || currentItemDetails.css("vertical-align") == "bottom"){
					if (currentItemDetails.css("vertical-align") == "bottom"){
						if (!draggableImages.is(".bottomized")){
							draggableImages.addClass("bottomized");
							draggableImages.css({"top":"auto","bottom":0});
							draggableImages.css("margin-top",0);
						}
					}else{
						if (draggableImages.is(".bottomized")){
							draggableImages.css({"bottom":"","top":""});
							draggableImages.removeClass("bottomized");
						}
						var itemDetailsHeight = parseInt(currentItemDetails.innerHeight());
						var stripeHeight = parseInt($(this).closest(".master.item-box").height());
						if (itemDetailsHeight <= stripeHeight ){
							var newMarginTop = (stripeHeight - draggableImages.height())/2;
							draggableImages.css("margin-top",newMarginTop);
						}else{
							draggableImages.css("margin-top",0);
						}
					}
				}
				
			});
	}

};


multi_layout.forceRedraw = function(elements){
	if(typeof window["EditorHelper"] == "undefined"){
		//setting body height to prevent jitter 
		$("body").css("height",$("body").height())
		elements.each(function(){
			var element = $(this)[0];
			var disp = element.style.display;
			element.style.display = 'none';
			var trick = element.offsetHeight;
			element.style.display = disp;
		});
		$("body").css("height","")
	}
};




multi_layout.flipVertically = function(itemToFlip){
	var helperDiv = itemToFlip.find(".helper-div");
	var currentClass = helperDiv.attr("class").replace("helper-div", "").replace(" ","");
	if (currentClass=="top-left" || currentClass=="middle-left" || currentClass=="middle-left-25" || currentClass=="bottom-left"){
		helperDiv.removeClass("top-left top-center top-right middle-left middle-left-25 middle-center middle-right middle-right-25 bottom-left bottom-center bottom-right");
		helperDiv.addClass("top-center");
		helperDiv.attr("data-orig-class",currentClass);
		helperDiv.addClass("flipped-image")
	}
	if (currentClass=="top-right" || currentClass=="middle-right" || currentClass=="middle-right-25" || currentClass=="bottom-right"){
		helperDiv.removeClass("top-left top-center top-right middle-left middle-left-25 middle-center middle-right middle-right-25 bottom-left bottom-center bottom-right");
		helperDiv.addClass("bottom-center");
		helperDiv.attr("data-orig-class",currentClass);
		helperDiv.addClass("flipped-image")
	}
	itemToFlip.css("display", "inline-flex");
	setTimeout(function(){itemToFlip.css("display","");},0)
};

multi_layout.unflip = function(itemToUnFlip){
	var helperDiv = itemToUnFlip.find(".helper-div");
	itemToUnFlip.find(".inner-pic").css({"height":""});
	if (helperDiv.attr("data-orig-class")){
		helperDiv.removeClass("top-left top-center top-right middle-left middle-left-25 middle-center middle-right middle-right-25 bottom-left bottom-center bottom-right");
		helperDiv.addClass(helperDiv.attr("data-orig-class"));
		helperDiv.removeAttr("data-orig-class")
		helperDiv.removeClass("flipped-image")
	}
	itemToUnFlip.css("display", "inline-flex");
	setTimeout(function(){itemToUnFlip.css("display","");},0)
};

var item_layout = {
	init:function(){

	},
	applyLayout:function(){

	}
};; var blocks_layout = {};

blocks_layout.init = function(container,items){

};

blocks_layout.applyLayout = function(container,items,paramsFromRealTime){
	var helperDiv = container.find(".item-box:not(.stripe-header) .helper-div");
	var containerHeight = container.height();
	var helperDivHeight = helperDiv.height();
	var center = (containerHeight/2) - (helperDivHeight/2);
	center = Math.max(0,center);
	helperDiv.css("top",center)
};;