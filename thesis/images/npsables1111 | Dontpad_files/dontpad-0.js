var dontpad = {
	
	TIME_TO_SAVE: 2000, //two seconds

	$text: null,
	$noConnectionAlert: null,
	changed: false,
		
	load: function() {
		dontpad.$text = $('#text');
		dontpad.$noConnectionAlert = $('#noConnectionAlert');
		dontpad.setOnLoad();
		dontpad.setOnResizeEvent();
		dontpad.enableAutoSaveOrUpdate();
		dontpad.setOnChangeTextEvent();		
		dontpad.setSaveBeforeExit();
		dontpad.setFocus();		
		dontpad.resize();
		dontpad.$text.on('keydown', dontpad.allowTab);
	},
	
	allowTab: function(e) { 
		var keyCode = e.keyCode || e.which; 
		if (keyCode == 9) { 
			e.preventDefault();
			dontpad.insertAtCaret('text', '\t');
		} 
	},
	
	insertAtCaret: function (areaId, text) {
	    var txtarea = document.getElementById(areaId);
	    var scrollPos = txtarea.scrollTop;
	    var strPos = 0;
	    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? "ff" : (document.selection ? "ie" : false));
	    if (br == "ie") {
	        txtarea.focus();
	        var range = document.selection.createRange();
	        range.moveStart('character', -txtarea.value.length);
	        strPos = range.text.length;
	    } else if (br == "ff") strPos = txtarea.selectionStart;
	    var front = (txtarea.value).substring(0, strPos);
	    var back = (txtarea.value).substring(strPos, txtarea.value.length);
	    txtarea.value = front + text + back;
	    strPos = strPos + text.length;
	    if (br == "ie") {
	        txtarea.focus();
	        var range = document.selection.createRange();
	        range.moveStart('character', -txtarea.value.length);
	        range.moveStart('character', strPos);
	        range.moveEnd('character', 0);
	        range.select();
	    } else if (br == "ff") {
	        txtarea.selectionStart = strPos;
	        txtarea.selectionEnd = strPos;
	        txtarea.focus();
	    }
	    txtarea.scrollTop = scrollPos;
	},
	
	saveOrUpdate: function() {
		if (dontpad.changed) {
			this.save();
		} else {
			this.update();
		}
	},
	
	update: function(){
		$.ajax({
			data: {lastUpdate:$('#lastUpdate').val()},
			url: document.location + '.body.json',
	        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
	        dataType: 'json',
	        type: "GET",
	        success: function(result){
		        	if (result && result.changed) {
		        		dontpad.$text.val(result.body);
		        		$('#lastUpdate').val(result.lastUpdate);
		        	}
		        	dontpad.$noConnectionAlert.hide();
	        },
	        error: function() {
	        		dontpad.$noConnectionAlert.show();
	        }
		});
	},
	
	save: function() {
		if (dontpad.changed) {
			dontpad.changed = false;			
			$.ajax({
				data: {text:dontpad.$text.val()},
				url: document.location,
		        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		        type: "POST",
		        dataType: 'json',
		        success: function(result) {
		        	$('#lastUpdate').val(result);
		        }
			});
		}
	},
	
	enableAutoSaveOrUpdate: function(){
		window.setInterval(function() { dontpad.saveOrUpdate(); }, this.TIME_TO_SAVE);
	},
	
	setOnChangeTextEvent:function (){
		this.$text.keydown(function(){
			dontpad.changed = true;
		});
		this.$text.change(function(){
			dontpad.changed = true;
		});		
		this.$text.on('paste', function(){
			dontpad.changed = true;
		});
	},
	
	setOnResizeEvent: function(){
		$(window).resize(this.resize);
	},
	
	resize: function(){
		var SPACE_TO_WORK_IN_ALL_THE_BROWSERS = 25;
		var $menuDiv = $('#menu-div');
		var $textDiv = $('#text-div');
		if ($menuDiv.find('li').length > 0) {
			$menuDiv.show();
			var menuWidth = $('#menu-div').width();
			$menuDiv.width(menuWidth);
			$textDiv.width($(document).width() - menuWidth - SPACE_TO_WORK_IN_ALL_THE_BROWSERS);
		} else {
			$menuDiv.hide();
			$textDiv.width('100%');			
		}
		$textDiv.height('100%');
	},
	
	setFocus: function() {
		this.$text.focus();
	},
	
	setSaveBeforeExit: function() {
		$(window).unload(function(){
			dontpad.save();
		});
	},
	
	setOnLoad:function(){
		$(window).load(function(){
			dontpad.menu.loadLinks();
		});
	}
	
};


dontpad.menu = {		
	loadLinks: function() {
		$.ajax({
			url: document.location + ".menu.json", 
			cache: false,
			dataType: 'json',
			success: function(result){ dontpad.menu.create(result); }
		});		
	},
	
	create: function(links) {
		if (links.length > 0) {
			var $menu = $('#menu');
			$.each(links, function(index, link){
				$menu.append(dontpad.menu.createItemFromPath(link));
			});
		}
		dontpad.resize();
	},
	
	createItemFromPath: function(path) {
		var url = dontpad.menu.removeDuplicateSlashs(document.location + '/' + path);		
		return "<li><a href='" + url + "'>" + path +"</a></li>";
	},
	
	removeDuplicateSlashs: function(url) {
		return 'http://' + url.replace('http://','').replace(/\/\//g, '\/');				
	}
	
};

$(function(){
	dontpad.load();	
});