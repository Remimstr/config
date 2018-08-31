/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */
 
 window.addEventListener('contextmenu', function (e){
  if(e.srcElement.tagName.toLowerCase() === "input" &&
     e.srcElement.getAttribute("type") !== "checkbox" &&
     e.srcElement.getAttribute("type") !== "button" &&
     e.srcElement.getAttribute("type") !== "radio")
  {
    return false;
  }
  
  e.preventDefault(); 
}, false);
 
var MSG_TYPE_KEY_CONFLICT = 1;
var MSG_TYPE_SHORTCUT_MOVED = 2;
var MSG_TYPE_UNDO_DEL_SHORTCUT = 3;
var MSG_TYPE_UNDO_DEL_GROUP = 4;
var MSG_TYPE_GROUP_MOVED = 5;
var MSG_TYPE_AUTO_ARRANGE_LOCK = 6;
var MSG_TYPE_CANNOT_DELETE_MAIN = 7;
var MSG_TYPE_INVALID_URL = 8;
var MSG_TYPE_IMPORT_COMPLETE = 9;

var ROW_ATTR_ITEM_ID = "__itemId";
var ROW_ATTR_GROUP_ID = "__groupId";
var ROW_ATTR_KEY = "__itemKey";
var ROW_ATTR_ITEM_TITLE = "__itemTitle";
var ROW_ATTR_IS_SHORTCUT = "__isShortcut";
var ROW_ATTR_GROUP_INDEX = "__groupIndex";
var ROW_ATTR_ITEM_URL = "__itemUrl";
var ROW_ATTR_ITEM_RELATED_URL = "__relatedUrl";
var ROW_ATTR_ITEM_INDEX = "__itemIndex";

var DURATION_3SEC = 3000;
var DURATION_20SEC = 20000;
var DURATION_1MIN = 60000;
var DURATION_3MIN = 180000;
var DURATION_10MIN = 600000;

var TYPE_SHORTCUT = 1;
var TYPE_GROUP = 2;
var TYPE_MULTIPLE_SHORTCUTS = 3;

var CALLED_FROM_OPTIONS = true;

var ENG_ALPHABET = ["a","b","c","d","e","f","g","h","i","j","k","l","m",
                    "n","o","p","q","r","s","t","u","v","w","x","y","z"];

var ERR_MSG_QUOTA_EXCEED = "Error modifying bookmark tree - possible cause: Chrome's internal bookmark quota for extensions exceeded. Please try restarting Chrome.";
var ERR_CANNOT_DEL_MAIN = "Default group container cannot be deleted";

var groups = [];
var connection = chrome.extension.connect();
var generalGroupId = -1;

var node_items_table;
var node_items_div;
var node_input_url;
var node_input_key;
var node_table_shortcut;

var just_redrawn = false;
var inEditShortcutState = false;

var lastDeletedDataItem = null;
var lastDeletedItemType = null;
var lastDeletedItemGroupId = null;

var tabbed_panels;

var latestUndoFunction = null;

var uiSelector;

var deleteOperationPending = false;

var onDrawSelectShortcutId = null;

var lastItemClickedTime = -1;
var lastItemClickedWasGroup = -1;
var lastItemClickedId = -1;

function init_options()
{


  var preview_box = document.getElementById("previews_inner");
  preview_box.setAttribute("style", "overflow: auto; height: 340px; max-height: 340px;");
  
  document.getElementById("shareButtonShortcutsTab").addEventListener("click", event_unlockFeatureClicked);
  document.getElementById("shareButtonShortcutsTab2").addEventListener("click", event_unlockFeatureClicked);  


  var unused_themes = [18, 34, 35, 36, 37, 39, 103, 97, 88, 115];
  var  shuffled_array = [];
  for(var i = 1; i <= 131; i++)
  {
	 if($.inArray(i, unused_themes) !== -1)
	 {
		 continue;
	 }
 	 shuffled_array.push(i);
  } 
 
  shuffled_array = shuffle_array(shuffled_array);

  var classic_themes = ["a", "b", "c", "d", "e", "f"];
  var classic_themes_x = 0;
  for(var i = 1; i <= shuffled_array.length; i++)
  {
	  var x = shuffled_array[i - 1];
	  
	  if(i === 4 && classic_themes_x < classic_themes.length)
	  {
	    x = classic_themes[classic_themes_x];
		classic_themes_x++;
		i--;
	  }
	  
	 
	  var link_elm = document.createElement("a");
	  link_elm.setAttribute("href", "#");	
	  link_elm.setAttribute("style", "cursor: default;");
	  var img_url = "previews/" + x + ".png";
	  var img_elm = document.createElement("img");
	  img_elm.setAttribute("src", img_url);
	  var margin_top = (i === 1 ? "20px" : "-15px");
	  img_elm.setAttribute("style", "width: 330px; margin-top: " + margin_top + "; display: block; clear: both; border: 1px solid #000; ");
	  var span_elm = document.createElement("span");
	  span_elm.setAttribute("style", "top: -40px; position: relative; left: 70px; ");
	  span_elm.innerHTML = "<input image_x='" + x + "' type='button' value='Click here to set as background' style='border: 1px solid #fff; opacity: .8;" +" webkit-appearance: none; padding: 8px 8px;  font-size: 12px;' />";
	  span_elm.onclick = function(e){
		  
		if(getPref("background_feature_unlocked") !== "donesmart")
		{
			var msg_div = document.createElement("div");
			msg_div.setAttribute("id", "unlock_feature_msg");
			msg_div.setAttribute("style", "text-align: center; width: 400px; height: 200px; top: 50%; left: 50%; position: fixed !important; margin-top: -130px; margin-left: -230px; " +
			                              "border: 1px solid #666; padding: 30px; font-size: 18px; background-color: rgba(255,255,255, .9)");
			msg_div.innerHTML = "<h4 style='margin-top: 0;'>Feature locked</h4><p>The background theme feature is locked, you need to unlock the feature first to use it</p>" +
			                    "<div><input style='background: #184bab; text-shadow: none; border-radius: 3px; font-weight: bold; font-size: 18px; color: #fff; -webkit-appearance: none; text-decoration: underline; cursor: hand; padding: 10px; border: 0; outline: 0;' type='button' value='Unlock feature now' id='unlock_feature_button' /></div>" +
								"<p><a href='#' id='feature_locked_cancel'>Cancel</a></p>";
								
			document.getElementsByTagName("body")[0].appendChild(msg_div);
			document.getElementById("unlock_feature_button").addEventListener("click", event_unlockFeatureClicked);
			document.getElementById("feature_locked_cancel").addEventListener("click", 
			  function()
			  {
				  document.getElementById("unlock_feature_msg").parentNode.removeChild(document.getElementById("unlock_feature_msg"));
			  });

			return;
		}		  
		  
		var image_x = e.target.getAttribute("image_x"); 
	  
	    if(image_x === "a")
		{
          setPref("sl-launcher-theme", 23);
		  return;
		}
		else if(image_x === "b")
		{
          setPref("sl-launcher-theme", 6);	
		  return;		  
		}
		else if(image_x === "c")
		{
          setPref("sl-launcher-theme", 24);		
		  return;		  
		}
		else if(image_x === "d")
		{
          setPref("sl-launcher-theme", 22);			
		  return;		  
		}
		else if(image_x === "e")
		{
          setPref("sl-launcher-theme", 8);	
		  return;		  
		}	  
		else if(image_x === "f")
		{
          setPref("sl-launcher-theme", 20);	
		  return;		  
		}	  			  	
						
		document.getElementById("dl_background").setAttribute("style",
		  "background: rgba(0, 0, 0, .7); margin-left: 200px; margin-top: -35px; color: #fff; padding: 7px; font-size: 11px; position: absolute; border-radius: 3px; display: inline-block;");	
	  
	    getImageById(image_x,
	 
			function(data_url)
			{
			   var split_i = Math.ceil(data_url.length / 3);
			   var data_url1 = data_url.slice(0, split_i);
			   var data_url2 = data_url.slice(split_i, split_i * 2);
			   var data_url3 = data_url.slice(split_i * 2);
				
			   setPref("sl-launcher-theme", 21);
			   setPref("sl-custom-bg-scale", false);
			   setPref("sl-custom-bg-image", data_url1);
			   setPref("sl-custom-bg-image2", data_url2);	
			   setPref("sl-custom-bg-image3", data_url3);			   
			   setPref("sl-custom-bg-split", true);	

			   setTimeout(function(){document.getElementById("dl_background").setAttribute("style", "display: none");}, 2000);
		   
		   
			}

	    ); 		   
	  e.preventDefault();
	  return true;
	  };
	  link_elm.appendChild(img_elm);
	  link_elm.appendChild(span_elm);
	  preview_box.appendChild(link_elm);
   }

  
  if(!getPref("sl-hide-keys"))
  {
    document.getElementById("opt_body").setAttribute("__keys", "on");
  }
  else
  {
    document.getElementById("opt_body").setAttribute("__keys", "off");
  }

  SiteManager.restore(0);
  slData.onDataSourceModified(function()
    {
      if(!deleteOperationPending)
      {
        // no need to redraw ui for delete operation as view changes already have been handled by delete function
        SiteManager.restore();
      }
      deleteOperationPending = false;
    })
  
  document.getElementById("button_edit").addEventListener("click", event_editButtonClicked, false);
  document.getElementById("button_new_group").addEventListener("click", event_addGroupButtonPress, false);
  document.getElementById("user_message_action1").addEventListener("click", event_userMessageAction1Clicked, false);
  document.getElementById("user_message_close").addEventListener("click", function(e){closeUserMessagePrompt()}, false);
  document.getElementById("new_shortcut_button_outside").addEventListener("click", event_newShortcutButtonClicked, false);
  
  document.getElementById("edit_input_title").addEventListener("blur", event_inputBoxLostFocus, false);
  document.getElementById("edit_input_url").addEventListener("blur", event_inputBoxLostFocus, false);
  document.getElementById("edit_input_key").addEventListener("blur", event_inputBoxLostFocus, false);
  
  document.getElementById("edit_input_key").addEventListener("keydown", event_keyInputKeyDown, false);
  document.getElementById("edit_input_key").addEventListener("keyup", event_keyInputKeyUp, false);
  
  document.getElementById("edit_input_title").addEventListener("focus", event_inputBoxHasFocus, false);
  document.getElementById("edit_input_url").addEventListener("focus", event_inputBoxHasFocus, false);
  document.getElementById("edit_input_key").addEventListener("focus", event_inputBoxHasFocus, false);
  
  document.getElementById("edit_input_url").addEventListener("keyup", updateInputTitleBasedOnURL, false);
 
  
  document.getElementById("hideKeysCheckbox").addEventListener("change", event_optionChanged, false);
  document.getElementById("hideTitlesCheckbox").addEventListener("change", event_optionChanged, false);
  document.getElementById("openNewTabCheckbox").addEventListener("change", event_optionChanged, false);
  
  document.getElementById("bwToolbarButtonCheckbox").addEventListener("change", event_optionChanged, false);
  document.getElementById("contextItemCheckbox").addEventListener("change", event_optionChanged, false);
  document.getElementById("hideTellFriendsCheckbox").addEventListener("change", event_optionChanged, false);
  
  document.getElementById("overlayBgCheckbox").addEventListener("change", event_optionChanged, false);
  
  document.getElementById("textShadeRadioDark").addEventListener("change", event_optionChanged, false);
  document.getElementById("textShadeRadioLight").addEventListener("change", event_optionChanged, false);
  
  document.getElementById("button_add").addEventListener("click", event_onAddButtonPress, false);
  
  document.getElementById("inputImportFile").addEventListener("change", event_importFileChanged, false);  
  document.getElementById("button_import").addEventListener("click", event_importButtonClick, false);
  document.getElementById("button_import_cancel").addEventListener("click", event_cancelImportButtonClick, false);
  
  document.getElementById("browseImageFile").addEventListener("change", event_importImageChanged, false);  
  
  document.getElementById("exportShortcutsButton").addEventListener("click", getSlDataAsXMLDoc, false);
  
  document.getElementById("genericInputButton").addEventListener("click", event_genericInputBoxSubmit, false);
  
  document.getElementById("genericErrorClose").addEventListener("click", closeCriticalError, false);
  
  document.getElementById("key-suggest-button-q").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-w").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-e").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-r").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-t").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-y").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-u").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-i").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-o").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-p").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-a").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-s").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-d").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-f").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-g").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-h").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-j").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-k").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-l").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-z").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-x").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-c").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-v").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-b").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-n").addEventListener("mousedown", event_keySuggestButtonClick, false);
  document.getElementById("key-suggest-button-m").addEventListener("mousedown", event_keySuggestButtonClick, false);
  
  document.getElementById("p_openNewTab").addEventListener("click", 
  function(e){if(e.target === this){document.getElementById("openNewTabCheckbox").click();} return false;}, false);
  
  document.getElementById("p_hideKeys").addEventListener("click", 
  function(e){if(e.target === this){document.getElementById("hideKeysCheckbox").click();} return false;}, false);
  
  document.getElementById("p_hideTitles").addEventListener("click", 
  function(e){if(e.target === this){document.getElementById("hideTitlesCheckbox").click();} return false;}, false);
  
  document.getElementById("p_bwToolbarButtonCheckbox").addEventListener("click", 
  function(e){if(e.target === this){document.getElementById("bwToolbarButtonCheckbox").click();} return false;}, false);
  
  document.getElementById("p_contextItemCheckbox").addEventListener("click", 
  function(e){if(e.target === this){document.getElementById("contextItemCheckbox").click();} return false;}, false);
  
  document.getElementById("p_hideTellFriendsCheckbox").addEventListener("click", 
  function(e){if(e.target === this){document.getElementById("hideTellFriendsCheckbox").click();} return false;}, false);
  

  
  var bttn_lines = 
  ["PLEASE SPREAD THE WORD",
   "PLEASE SHARE SITELAUNCHER",
   "PLEASE SHARE SITELAUNCHER WITH YOUR FRIENDS",
   "PLEASE TELL FRIENDS ABOUT SITELAUNCHER",
   "PLEASE HELP SITELAUNCHER GROW",
   "SHARE SITELAUNCHER",
   "PLEASE SHARE",
   "PLEASE HELP SITELAUNCHER GROW",
   "LET FRIENDS KNOW ABOUT SITELAUNCHER",
   "HELP US SPREAD THE WORD",
   "SHARE SITELAUNCHER AND GET ANY UNLOCK CODE FREE",
   "SHARE SITELAUNCHER WITH YOUR FRIENDS",
   "INVITE FRIENDS TO TRY SITELAUNCHER",
   "INVITE FRIENDS TO USE SITELAUNCHER",
   "POST SITELAUNCHER TO YOUR FRIENDS",
   "SHARE SITELAUNCHER AND GET A FREE THEME",
   "HELP SPREAD THE WORD",
   "LET YOUR FRIENDS KNOW ABOUT SITELAUNCHER"
   ];

  // document.getElementById("spreadWordTxt").innerText = bttn_lines[Math.floor(Math.random() * bttn_lines.length)]; 

  var timer_counts = [8, 4, 16, 60, 30, 90];
  var timer_count = timer_counts[Math.floor(Math.random() * timer_counts.length)];
  var animation_types = ["wiggle", "tada", "shake"];
  var animate_type = animation_types[Math.floor(Math.random() * animation_types.length)];
  setTimeout(
  function(e){
    if(getPref("sl-hide-tellfriend-button"))
    {
      return;
    }
    document.getElementById("shareButtonShortcutsTab").setAttribute("class", "largeShareButton2 animated " + animate_type);
    setTimeout(function(e){document.getElementById("shareButtonShortcutsTab").setAttribute("class", "largeShareButton2");}, 2000);
  }, timer_count * 1000);
  
  if(getPref("sl-hide-tellfriend-button"))
  {
    document.getElementById("shareButtonShortcutsTab").setAttribute("class", "displayNone");
    document.getElementById("tellfriends_block").setAttribute("class", "displayNone");
  }
}

function informBackground()
{
  postMessageToBackground({update: "updateBookmarks"});
}

function postMessageToBackground(msg)
{
  try
  {       
    connection.postMessage(msg);
  }
  catch(e)
  {
    showCriticalError("Error messaging - " + msg.update + ": " + e);
  }   
}

function getSlDataAsXMLDoc()
{
  var xmldoc = document.implementation.createDocument(null, "shortcuts", null);
  
  // loop through shortcuts and create shortcut items
  for(var j = 0; j < slData.items.length; j++)
  {
    var shortcutElm = xmldoc.createElement("shortcut");
    shortcutElm.setAttribute("key", slData.items[j][SL_ATTR_KEY]);
    shortcutElm.setAttribute("title", slData.items[j][SL_ATTR_NAME]);
    shortcutElm.setAttribute("url", slData.items[j][SL_ATTR_URL]);
    shortcutElm.setAttribute("groupId", slData.items[j][SL_ATTR_GROUP_ID]);
    shortcutElm.setAttribute("iconData", getIconData(slData.items[j][SL_ATTR_URL]));
    xmldoc.documentElement.appendChild(shortcutElm);
  }
  
  for(var i = 0; i < groups.length; i++)
  { 
    var groupElm = xmldoc.createElement("group");
    groupElm.setAttribute("id", groups[i][SL_ATTR_ID]);
    groupElm.setAttribute("title", groups[i][SL_ATTR_NAME]);
    xmldoc.documentElement.appendChild(groupElm);
  }
 
  
  var xml_as_string = "<?xml version='1.0' encoding='UTF-8'?>" + (new XMLSerializer()).serializeToString(xmldoc);
  
  var uriContent = "data:application/xml.," + encodeURIComponent(xml_as_string);
  window.open(uriContent, 'Shortcuts');

}

function importXMLToSlData(xmlDocString)
{
  var itemsXML  = [];
  var groupsXML = [];
  var domParser = new DOMParser();
  var xmlDoc;
  
  try
  {
    xmlDoc = domParser.parseFromString(xmlDocString, 'application/xml');
  }
  catch(e)
  {
    return showCriticalError("Unable to parse XML: " + e);
  }  
  
  var shortcutNodes = xmlDoc.getElementsByTagName("shortcut");

  for (var i = 0; i < shortcutNodes.length; i++)
  {
    var nodeKey = shortcutNodes[i].attributes.getNamedItem("key").value;
    var nodeTitle = shortcutNodes[i].attributes.getNamedItem("title").value;
    var nodeUrl = shortcutNodes[i].attributes.getNamedItem("url").value;
    var groupID = shortcutNodes[i].attributes.getNamedItem("groupId").value;
    var iconData = shortcutNodes[i].attributes.getNamedItem("iconData").value;
    
    // parse url
    
    var isJsURL = isJavascriptURL(nodeUrl);
    var isChromeUrl = (nodeUrl.match(/^chrome:\/\//) !== null || nodeUrl.match(/^chrome-extension:\/\//) !== null);
  
    
    if(!isJsURL && !isChromeUrl)
    {
      nodeUrl = getFullyFormedURL(nodeUrl);
    }
    
    if(!isJsURL && !isChromeUrl && nodeUrl === null)
    {
      continue; // skip unknown protocol url
    }
    
    if(nodeUrl !== null)
    {
      var existingIconForURL = getIconDataFromLocalStorage(nodeUrl);
      
      if((existingIconForURL === null || existingIconForURL === "-1") &&
         iconData !== "" && iconData !== "chrome://sitelauncher/content/icons/default")
      {
         storeIconDataInLocalStorage(nodeUrl, iconData);
      }
    }
    
    itemsXML.push(new ShortcutItem('-1', nodeUrl, nodeTitle, nodeKey, groupID));
  }  
  
  if(!itemsXML.length)
  {
    return showCriticalError("Shortcut file appears to be empty");  
  }  
  
  var groupNodes = xmlDoc.getElementsByTagName("group");  
  for(var i = 0; i < groupNodes.length; i++)
  {
    var nodeId = groupNodes[i].attributes.getNamedItem("id").value;
    var nodeTitle = groupNodes[i].attributes.getNamedItem("title").value;
    groupsXML.push(new GroupItem(nodeTitle, nodeId)); 
  }
  
  createImportedBookmarks(groupsXML, itemsXML);
}

function createImportedBookmarks(groupsXML, itemsXML)
{
  var xmlMainGroupId = getXMLGeneralGroupId(groupsXML);
  
  slData.deleteAllData(
    function()
    {
      for(var i = 0; i < groupsXML.length; i++)
      {
         var nameLower = groupsXML[i].name.toLowerCase();
      
         if((xmlMainGroupId !== null) &&
            (groupsXML[i].id === xmlMainGroupId) &&
            (nameLower !== "top sites" && nameLower !== "general"))
         {
           // tag general group if name not fixed
           groupsXML[i].name += " [General]"; 
         }
      
         var itemsInGroup = [];
         
         for(var j = 0; j < itemsXML.length; j++)
         {
            if(itemsXML[j].group_id === groupsXML[i].id)
            {
               itemsInGroup.push(itemsXML[j]);
            }
         }
         
         // last item
         if(i === (groupsXML.length - 1)) 
         {
           createGroupWithItems(groupsXML[i].name, itemsInGroup, true); 
         }
         else 
         {
           createGroupWithItems(groupsXML[i].name, itemsInGroup, false);   
         } 
      }
      
      // add general group - which needs always be present - and add any
      // uncategorized shortcuts to it
      if(xmlMainGroupId === null)
      {
        slData.addGeneralGroupIfNotPresent(
          function(group)
          {
            var group_id = group[SL_ATTR_ID];
            
            for(var i = 0; i < itemsXML.length; i++)
            {
              var item = itemsXML[i];
              
              if(!item.group_id || item.group_id === "0")
              {
                var key_char = sl_trim(item[SL_ATTR_KEY]);
                slData.addShortcut(item[SL_ATTR_URL], item[SL_ATTR_NAME], key_char, group_id);
              }
            }
            
            SiteManager.restore(0);
          });
      }      
      tabbed_panels.showPanel(0);   
      showUserMessagePrompt(MSG_TYPE_IMPORT_COMPLETE, "Import operation completed.", DURATION_1MIN);        
    });
}

function getXMLGeneralGroupId(xmlGroups)
{
  for(var i = 0; i < xmlGroups.length; i++)
  { 
    // sl firefox xml format specifies that "0" is always general group
    if(xmlGroups[i].id === "0" || xmlGroups[i].id === 0)
    {
      return "0";
    }
  }
  
  for(var i = 0; i < xmlGroups.length; i++)
  {
    var nameLower = xmlGroups[i].name.toLowerCase();

    if(nameLower === "top sites" || nameLower === "general" || nameLower.indexOf("[general]") !== -1)
    {
      return xmlGroups[i].id;
    }
  }
  
  return null;
}

function createGroupWithItems(group_name, _items, refresh, selectAfterCreate)
{
  slData.addGroup(group_name, 
    function(group)
    {
      for(var i = 0; i < _items.length; i++)
      {   
        var item = _items[i];
        var key_char = sl_trim(item[SL_ATTR_KEY]);
        slData.addShortcut(item[SL_ATTR_URL], item[SL_ATTR_NAME], key_char, group.id);
      }

      if(refresh)
      {
        if(selectAfterCreate !== undefined)
        {
          SiteManager.restore(group.id, true);
        }
        else
        {
          SiteManager.restore(0);
        }
      }
    });
}

function getRowsByAttribute(attr_name, attr_value)
{
  var rows = node_items_table.rows;
  var matches = [];
  for(var i = 0; i < rows.length; i++)
  {
    var row = rows[i];
    
    if(row.hasAttribute(attr_name) && row.getAttribute(attr_name) == attr_value)
    {
      matches.push(row);
    }
  }
  
  return matches;
}

function createTable()
{
  var table = node_items_table;

  // empty the tables if necessary
  deleteAllChildNodes(node_items_table);
  
  for(var i = 0; i < groups.length; i++)
  {
    var isGeneralGroup = false;
    var group = groups[i];
      
    var nameLower = group.name.toLowerCase();
    if(nameLower === "top sites" || nameLower === "general" || nameLower.indexOf("[general]") !== -1)
    {
      generalGroupId = group[SL_ATTR_ID];
      isGeneralGroup = true;
    }
    
    var tr = document.createElement('tr');
    
    tr.setAttribute('id', 'groupItemRow' + group[SL_ATTR_ID]);
    if(group.items.length > 0)
    {
      tr.setAttribute("class", "groupItemRow");
    }
    else
    {
      tr.setAttribute("class", "groupItemRowEmpty");
    }
    tr.setAttribute(ROW_ATTR_ITEM_ID, group[SL_ATTR_ID]);
    tr.setAttribute(ROW_ATTR_GROUP_ID, group[SL_ATTR_ID]);
    tr.setAttribute(ROW_ATTR_GROUP_INDEX, group[SL_ATTR_INDEX]);
    tr.setAttribute(ROW_ATTR_ITEM_TITLE, group[SL_ATTR_NAME]);
    
    var td = document.createElement("td");
    td.setAttribute("class", "groupItemRowCell");
    
    // group title
    var uf_group_title = group[SL_ATTR_NAME];
    if(generalGroupId === group[SL_ATTR_ID])
    {
      uf_group_title = uf_group_title.replace(" [General]", "");
    }
    var div_title = document.createElement("div");
    div_title.setAttribute("id", "groupTitle_" + group[SL_ATTR_ID]);
    div_title.setAttribute("class", "groupTitle");
    div_title.appendChild(document.createTextNode(uf_group_title));
    td.appendChild(div_title);
    
    if(isGeneralGroup)
    {
      tr.setAttribute("__isMainGroup", "true");
      var div_flag = document.createElement("div");
      div_flag.setAttribute("class", "mainGroupFlag");
      div_flag.appendChild(document.createTextNode("Default Group"));
      td.appendChild(div_flag);
    }
    
    var bttn_container = document.createElement("div");
    bttn_container.setAttribute("class", "shortcut-button-container");
    
    if(groups.length > 2 && !getPref("sl-auto-arrange-groups"))
    {
      // main group can't be moved so only makes sense to show group move button if 3 or more groups
      var div_mv_bttn = document.createElement("div");
      div_mv_bttn.setAttribute("class", "shortcut-button smallerButton move-button");
      div_mv_bttn.setAttribute("click-priority", "true");
      div_mv_bttn.addEventListener("click", event_groupMoveButtonClicked, false);
      div_mv_bttn.setAttribute(ROW_ATTR_ITEM_ID, group[SL_ATTR_ID]);         
      div_mv_bttn.innerText = "Move";
      bttn_container.appendChild(div_mv_bttn);      
    }
      
    var btnDEL = document.createElement("div");
    btnDEL.setAttribute('class', 'deleteButton');
    btnDEL.setAttribute("click-priority", "true");
    btnDEL.setAttribute(ROW_ATTR_ITEM_ID, group[SL_ATTR_ID]);
    btnDEL.onclick = function(e)
    { 
      if(this.getAttribute(ROW_ATTR_ITEM_ID) === generalGroupId)
      {
        showUserMessagePrompt(MSG_TYPE_CANNOT_DELETE_MAIN, ERR_CANNOT_DEL_MAIN, DURATION_1MIN, "Delete shortcuts only", deleteMainGroupContents);
      }
      else
      {
        deleteGroupItem(this.getAttribute(ROW_ATTR_ITEM_ID));
      }
    }  
    bttn_container.appendChild(btnDEL);       

    td.appendChild(bttn_container);
    
    if(group.items.length == 0)
    {
      var div = document.createElement("div");
      div.setAttribute("class", "noItemsNotice");  
      div.appendChild(document.createTextNode(""));
      td.appendChild(div);
    }
    
    tr.appendChild(td);    
    
    tr.addEventListener("mousedown", 
      function(e)
      {
        if(e.target.hasAttribute("click-priority"))
        {
          e.preventDefault();
          return;
        }
        
        e.preventDefault();
        this.style.cursor = "default";
        mouseDownOnItem = true;
        setSelectedRow(this);      
        
        if(e.button === 0)
        {
          // detect double click
          if(lastItemClickedTime + 500 > Date.now() && lastItemClickedId === this.getAttribute(ROW_ATTR_ITEM_ID) && lastItemClickedWasGroup)
          {
            event_editButtonClicked(e);
          }
          
          lastItemClickedTime = Date.now();
          lastItemClickedWasGroup = true;
          lastItemClickedId = this.getAttribute(ROW_ATTR_ITEM_ID);
        }
        
      }, false);
      
    table.appendChild(tr);   
    
    

    // render each item in this group
    for(var j = 0; j < group.items.length; j++)
    {
      tr = document.createElement("tr");

      tr.setAttribute('id', 'shortcutItemRow' + group.items[j][SL_ATTR_ID]);    
      tr.setAttribute("class", "shortcutItemRow");      
      tr.setAttribute(ROW_ATTR_IS_SHORTCUT, 'true');
      tr.setAttribute(ROW_ATTR_GROUP_ID, group.items[j][SL_ATTR_GROUP_ID]);
      tr.setAttribute(ROW_ATTR_ITEM_ID, group.items[j][SL_ATTR_ID]);
      tr.setAttribute(ROW_ATTR_KEY, group.items[j][SL_ATTR_KEY]);
      tr.setAttribute(ROW_ATTR_ITEM_TITLE, group.items[j][SL_ATTR_NAME]);      
      tr.setAttribute(ROW_ATTR_ITEM_URL, group.items[j][SL_ATTR_URL]);
      
      if(group.items[j][SL_ATTR_URL].match(/^\s*javascript:/) !== null)
      {
        var js_rel_url = getRelatedURLForJavascriptShortcut(group.items[j][SL_ATTR_URL]);
      
        if(js_rel_url === null)
        {
          js_rel_url = "";
        }
        tr.setAttribute(ROW_ATTR_ITEM_RELATED_URL, js_rel_url);
      }
      
      tr.setAttribute(ROW_ATTR_ITEM_INDEX, group.items[j][SL_ATTR_INDEX]);
      tr.setAttribute(ROW_ATTR_GROUP_INDEX, group[SL_ATTR_INDEX]);  
            
      var td1 = document.createElement("td");

      // img
      var img = document.createElement("div");
      img.setAttribute("id", "siteIconImg_" + group.items[j][SL_ATTR_ID]);
      img.setAttribute("class", "site-icon-img");
      img.style.setProperty("background-image", "url(" + getIconData(group.items[j][SL_ATTR_URL]) + ")", null);
      td1.appendChild(img);            
      
      // title
      var div2 = document.createElement("div");
      div2.setAttribute("class", "websiteTitle");
      div2.appendChild(document.createTextNode(group.items[j][SL_ATTR_NAME]));
      td1.appendChild(div2);  

      // key      
      var div = document.createElement("div");
      var letter = group.items[j][SL_ATTR_KEY];
      div.setAttribute("class", "websiteKey");
      div.appendChild(document.createTextNode(letter));
      td1.appendChild(div);
      
      var bttn_container = document.createElement("div");
      bttn_container.setAttribute("class", "shortcut-button-container");      
      
      // refresh icon button
      var div_icon_bttn = document.createElement("div");
      div_icon_bttn.setAttribute("class", "shortcut-button smallerButton icon-button");
      div_icon_bttn.setAttribute("click-priority", "true");    
      div_icon_bttn.addEventListener("click", event_refreshIconButtonClicked, false);
      div_icon_bttn.setAttribute(ROW_ATTR_ITEM_ID, group.items[j][SL_ATTR_ID]);  
      div_icon_bttn.innerText = "Refresh Icon";
      bttn_container.appendChild(div_icon_bttn);  
      
      if(groups.length > 1)
      {
        // show move button if relevant
        var div_mv_bttn = document.createElement("div");
        div_mv_bttn.setAttribute("class", "shortcut-button smallerButton move-button");
        div_mv_bttn.setAttribute("click-priority", "true");
        div_mv_bttn.addEventListener("click", event_moveButtonClicked, false);
        div_mv_bttn.setAttribute(ROW_ATTR_ITEM_ID, group.items[j][SL_ATTR_ID]);         
        div_mv_bttn.innerText = "Move";
        bttn_container.appendChild(div_mv_bttn);  
      }      
      
      // del button      
      var btnDELItem = document.createElement("div");
      btnDELItem.setAttribute('class', 'deleteButton');
      btnDELItem.setAttribute("click-priority", "true");
      btnDELItem.setAttribute(ROW_ATTR_ITEM_ID, group.items[j][SL_ATTR_ID]);      
      btnDELItem.onclick = function()
      {
        deleteShortcutItem(this.getAttribute(ROW_ATTR_ITEM_ID));
      }
      bttn_container.appendChild(btnDELItem);
      
      td1.appendChild(bttn_container);

      tr.appendChild(td1);
     
      tr.addEventListener("mousedown", 
        function(e)
        {
          if(e.target.hasAttribute("click-priority"))
          {
            e.preventDefault();
            return;
          }
          
          e.preventDefault();
          this.style.cursor = "default";
          mouseDownOnItem = true;
          setSelectedRow(this);     

          if(e.button === 0)
          {
            // detect double click
            if(lastItemClickedTime + 500 > Date.now() && lastItemClickedId === this.getAttribute(ROW_ATTR_ITEM_ID) && !lastItemClickedWasGroup)
            {
              event_editButtonClicked(e);
            }
            
            lastItemClickedTime = Date.now();
            lastItemClickedWasGroup = false;
            lastItemClickedId = this.getAttribute(ROW_ATTR_ITEM_ID);
          }
          
        }, false);
        
      table.appendChild(tr);
    }
  }
}

function deleteShortcutItem(itemId)
{
  var sib = getSelRowClosestSibling();

  lastDeletedDataItem = slData.getShortcutById(selRowItemId);
  lastDeletedItemType = TYPE_SHORTCUT;
  lastDeletedItemGroupId = selRowGroupId;    
  
  deleteOperationPending = true;
  
  slData.deleteShortcutById(itemId, 
    function()
    { 
      var selRow = getSelectedRow();
      selRow.parentNode.removeChild(selRow);
      
      if(sib)
      {
        SiteManager.restore(sib.getAttribute(ROW_ATTR_ITEM_ID), !sib.hasAttribute(ROW_ATTR_IS_SHORTCUT));
      }
      else
      {
        SiteManager.restore();
      }
      
      latestUndoFunction = restoreLastDeletedShortcut;
      
      // show undo prompt
      showUserMessagePrompt(
        MSG_TYPE_UNDO_DEL_SHORTCUT, lastDeletedDataItem[SL_ATTR_NAME] + " shortcut deleted", DURATION_10MIN, "Undo", restoreLastDeletedShortcut);     
    });
}

function deleteMultipleShortcutItems(id_array)
{
  // for undo
  lastDeletedDataItem = [];
  lastDeletedItemType = TYPE_MULTIPLE_SHORTCUTS;
  lastDeletedItemGroupId = selRowGroupId;
  
  var id_array_checked = [];

  for(var i = 0; i < id_array.length; i++) 
  {
    var shortcut = slData.getShortcutById(id_array[i]);
    
    if(shortcut !== null) 
    {
      id_array_checked.push(id_array[i]);
      lastDeletedDataItem.push(shortcut);
    }
  }
    
  slData.deleteShortcutsByIds(id_array_checked, 
    function()
    {
      SiteManager.restore();
      
      latestUndoFunction = restoreLastDeletedShortcutsMultiple;
      
      // show undo prompt
      showUserMessagePrompt(
        MSG_TYPE_UNDO_DEL_SHORTCUT, lastDeletedDataItem.length + " shortcut(s) deleted", DURATION_10MIN, "Undo", restoreLastDeletedShortcutsMultiple);      
    }); 
}

function deleteGroupItem(itemId)
{
  if(itemId === generalGroupId)
  {
    showUserMessagePrompt(MSG_TYPE_CANNOT_DELETE_MAIN, ERR_CANNOT_DEL_MAIN, DURATION_1MIN, "Delete shortcuts only", deleteMainGroupContents);
    return;
  }

  var sib = getSelRowClosestSibling();  
  
  lastDeletedDataItem = slData.getGroupById(selRowItemId);
  lastDeletedItemType = TYPE_GROUP;
  lastDeletedItemGroupId = selRowItemId;    
  
  slData.deleteGroupById(itemId,
    function()
    {
      if(sib)
      {
        SiteManager.restore(sib.getAttribute(ROW_ATTR_ITEM_ID), !sib.hasAttribute(ROW_ATTR_IS_SHORTCUT));
      }
      else
      {
        SiteManager.restore();
      }    
      
      latestUndoFunction = restoreLastDeletedGroup;
      
      // show undo prompt
      showUserMessagePrompt(
        MSG_TYPE_UNDO_DEL_GROUP, lastDeletedDataItem.name + " group deleted", DURATION_10MIN, "Undo", restoreLastDeletedGroup);
    });
}

var SiteManager = 
{
restore: function(focusItemId, focusItemIsGroup, callback)
{
  groups = [];
  
  slData.loadFromDataSource(
    function()
    {
      if(getPref("sl-auto-arrange-groups"))
      {
        groups = slData.getAllGroupsSorted();
      }
      else
      {
        groups = slData.getAllGroups();
      }
      
      if(!deleteOperationPending)
      {   
        createTable();

        if(!getPref("sl-hide-keys"))
        {
          document.getElementById("opt_body").setAttribute("__keys", "on");
        }
        else
        {
          document.getElementById("opt_body").setAttribute("__keys", "off");
        }

      }
      
      just_redrawn = true;
      
      // focus item if instructed, otherwise
      // re-focus previously focused item
      if(focusItemId && focusItemIsGroup)
      {
        selectGroupRowById(focusItemId);
      }
      else if(focusItemId && !focusItemIsGroup)
      {
        selectShortcutRowById(focusItemId);
      }
      else if(onDrawSelectShortcutId !== null)
      {
        selectShortcutRowById(onDrawSelectShortcutId);
        onDrawSelectShortcutId = null;
      }
      else if(selRowItemId !== -1 && selRowIsGroup)
      {
        setSelectAutoScroll(false);
        selectGroupRowById(selRowItemId);
        setSelectAutoScroll(true);      
      }
      else if(selRowItemId !== -1 && selRowIsShortcut)
      {
        setSelectAutoScroll(false);    
        selectShortcutRowById(selRowItemId);
        setSelectAutoScroll(true);        
      }
      else if(groups[0])
      {
        selectGroupRowById(groups[0].id); 
      }
      
      highlightAvailableKeys();
      
      if(genericInputBoxOn)
      {
        var ginput = document.getElementById("genericInputTextBox");
        ginput.select();
      }
      
      if(callback)
      {
        callback();
      }
    });
},

add: function(force_key_override)
{
  if(typeof force_key_override === "undefined")
  {
    var force_key_override = false;
  }

  if(slData.isRootSLNodeMissing())
  {
    slData.createStorageModel(
      function()
      {
        SiteManager.restore(null, null, SiteManager._add);
      });
  }
  else
  {
    SiteManager._add(force_key_override);
  }
},

_add: function(force_key_override)
{
  if(typeof force_key_override === "undefined")
  {
    var force_key_override = false;
  }
  
  var groupId;
  groupId = selRowGroupId;

  var key_char = sl_trim(node_input_key.value);
  var url = node_input_url.value;
  var name = node_input_title.value;
  
  if(url === "unlock background feature")
  {
	  setPref("background_feature_unlocked", "donesmart");
	  alert("Background image feature has been unlocked");
	  node_input_url.value = "";
	  return;
  }
      
  if(sl_trim(url) === "" || groupId === -1)
  {
    return;
  }
  
  var conflict_item = slData.getShortcutByKey(key_char);
  if(conflict_item !== null && !force_key_override)
  {
    var conflict_label = conflict_item[SL_ATTR_NAME] !== "" ? conflict_item[SL_ATTR_NAME] : conflict_item[SL_ATTR_URL].replace("http://", "").replace("https://", "");
    
    showUserMessagePrompt(MSG_TYPE_KEY_CONFLICT,  "Key " + key_char + " in use by another shortcut: " + conflict_label, DURATION_1MIN, "<u>O</u>verride",  SiteManager.addWithKeyOverride);
    return;
  }
  
  // parse url
  
  var isJsURL = isJavascriptURL(url);
  
  var isChromeUrl = (url.match(/^chrome:\/\//) !== null || url.match(/^chrome-extension:\/\//) !== null);
  
  if(!isJsURL && !isChromeUrl)
  {
    url = getFullyFormedURL(url);
  }
  
  if(!isJsURL && !isChromeUrl && url === null)
  {
    showUserMessagePrompt(MSG_TYPE_INVALID_URL, "URL does not appear to be valid", DURATION_1MIN);
    return;
  }
    
  if(conflict_item !== null && force_key_override)
  {
    blankKeyOfShortcutById(conflict_item[SL_ATTR_ID]);
  }
  
  if(sl_trim(name) === "")
  {
    name = url;
  } 

  slData.addShortcut(url, name, key_char, groupId,
    function(result)
    {
      SiteManager.restore(result.id, false);
    });

  SiteManager.clearInput()
},

addWithKeyOverride: function()
{
  SiteManager.add(true);
},

duplicate: function(item_id)
{
  var item = slData.getShortcutById(item_id);
  
  if(item === null) { return; }
  
  slData.addShortcut(item[SL_ATTR_URL], item[SL_ATTR_NAME], "", selRowGroupId,
    function(result)
    {
      SiteManager.restore();
    });  
},

clearInput: function()
{
   node_input_title.value = "";
   node_input_key.value = ""; 
   node_input_url.value = "";
   node_input_url.focus();
},

renameGroup: function(groupId, new_title)
{
  new_title = sl_trim(new_title);
  if(groupId === 0 || new_title === "")
  {
    return;
  }
  
  var newTitleLower = new_title.toLowerCase();
  
  if(groupId === generalGroupId && newTitleLower !== "general" && newTitleLower !== "top sites")
  {
    // tag general group if name not fixed
    new_title = new_title + " [General]";
  }
  
  slData.updateGroupById(groupId, new_title, 
    function(result)
    {
      SiteManager.restore(result.id, true);
    }); 
},

update: function(force_key_override)
{    
  if(typeof force_key_override === "undefined")
  {
    var force_key_override = false;
  }
   
  var url = sl_trim(node_input_url.value);

  if(url === "")
  { 
    return; 
  }

  var isURLJs = isJavascriptURL(url);
  var isChromeUrl = (url.match(/^chrome:\/\//) !== null || url.match(/^chrome-extension:\/\//) !== null);
  
  if(!isURLJs && !isChromeUrl)
  {
    url = getFullyFormedURL(url);
  }
  
  if(!isURLJs && !isChromeUrl && url === null)
  {
    showUserMessagePrompt(MSG_TYPE_INVALID_URL, "URL does not appear to be valid", DURATION_1MIN);
    return;
  }
  
  var key_char = sl_trim(node_input_key.value);
  var name = node_input_title.value;
  var updateItemId = selRowItemId;
      
  // prevent key conflict

  var conflict_item = slData.getShortcutByKey(key_char);
  if(conflict_item !== null)
  {
    if(conflict_item[SL_ATTR_ID] === updateItemId)
    {
      conflict_item = null; // can't conflict with self
    }
  }
  
  if(conflict_item !== null && !force_key_override)
  {
    var conflict_label = conflict_item[SL_ATTR_NAME] !== "" ? conflict_item[SL_ATTR_NAME] : conflict_item[SL_ATTR_URL].replace("http://", "").replace("https://", "");
  
    showUserMessagePrompt(MSG_TYPE_KEY_CONFLICT, "Key " + key_char + " in use by another shortcut: " + conflict_label, DURATION_1MIN, "<u>O</u>verride",  SiteManager.updateWithKeyOverride);
    return;
  }
  else if(conflict_item !== null && force_key_override)
  {
    blankKeyOfShortcutById(conflict_item[SL_ATTR_ID]);
  }  
  
  if(sl_trim(name) === "")
  {
    name = url;
  }
  
  slData.updateShortcutById(updateItemId, url, name, key_char, 
    function()
    {
      SiteManager.restore(0);
    });
},

updateWithKeyOverride: function()
{
  SiteManager.update(true);
},

addGroup: function()
{
  if(slData.isRootSLNodeMissing())
  {
    slData.createStorageModel(SiteManager._addGroup);
  }
  else
  {
    SiteManager._addGroup();
  }
},

_addGroup: function()
{
  slData.addGroup("Untitled", 
    function(result)
    {
      SiteManager.restore(result.id, true, 
        function(){ showCustomInputPrompt("Untitled", "Rename", event_renameGroupCallback);} );
    });
}

};

document.addEventListener("DOMContentLoaded", function (e)
{
  tabbed_panels = new UITabPanels.Widget.TabbedPanels("tabPanelContainer", 0);

  node_items_table = document.getElementById("table_shortcut_list");
  node_items_div = document.getElementById("div_shortcut_list");
  node_input_url = document.getElementById("edit_input_url");
  node_input_title = document.getElementById("edit_input_title");
  node_input_key = document.getElementById("edit_input_key");
  node_button_add = document.getElementById("button_add");
  node_table_shortcut = document.getElementById("tableshortcut");

  document.addEventListener(
    "mousedown", 
    function(e)
    {
    
      var target = e.toElement;
      
      if(target && target.hasAttribute("click-priority"))
      {
        return;
      }

      if(genericInputBoxOn && target && (target.id === undefined || target.id.indexOf("genericInput") === -1))
      {
        e.cancelBubble = true;
        e.preventDefault();
        closeGenericInputBox();
      }
      else if(genericDropBoxOn && target && (target.id === undefined || target.id.indexOf("genericDropBox") === -1))
      {
        e.cancelBubble = true;
        e.preventDefault();    
        closeGenericDropBox();
      }
    },
    true);
    
   sitelauncherHooks.attach("new-site-icon-ready", event_newSiteIconReady);
   
   sitelauncherHooks.attach("option-changed", event_handleOptionChanged);

   resizeUIToFitWindow();

   // populate option values
   var opt_themeNumber = getPref("sl-launcher-theme");
   
    if(!isSitelauncherThemeUnlocked(opt_themeNumber))
    {
      opt_themeNumber = 6;
    }
  
    if(opt_themeNumber !== 6  &&  opt_themeNumber !== 7  &&  opt_themeNumber !== 8 &&
        opt_themeNumber !== 20  &&  opt_themeNumber !== 21  &&  opt_themeNumber !== 22 &&
        opt_themeNumber !== 23  &&  opt_themeNumber !== 24)
    {
      opt_themeNumber = 6;
    }
  

   
   var bool_prefs = [
     {"pref" : "sl-hide-titles", "dom_id" : "hideTitlesCheckbox", "invert" : true}, 
     {"pref" : "sl-hide-keys", "dom_id" : "hideKeysCheckbox", "invert" : true},
     {"pref" : "sl-open-new-tab", "dom_id" : "openNewTabCheckbox", "invert" : false},
     {"pref" : "sl-custom-bg-overlay", "dom_id" : "overlayBgCheckbox", "invert" : false}, 
     {"pref" : "sl-show-context-item", "dom_id" : "contextItemCheckbox", "invert" : false},
     {"pref" : "sl-hide-tellfriend-button", "dom_id" : "hideTellFriendsCheckbox", "invert" : false},
     {"pref" : "sl-bw-toolbar-button", "dom_id" : "bwToolbarButtonCheckbox", "invert" : false}];
   
   for(var i = 0; i < bool_prefs.length; i++)
   {
     var b_pref = bool_prefs[i];
     
     if(!!getPref(b_pref.pref) !== b_pref.invert)
     {
       document.getElementById(b_pref.dom_id).setAttribute("checked", "checked");
     }
     else
     {
       document.getElementById(b_pref.dom_id).removeAttribute("checked");   
     }
   }

   
   if(getPref("sl-text-shade"))
   {
     document.getElementById("textShadeRadioLight").setAttribute("checked", "checked");   
   }
   else
   {
     document.getElementById("textShadeRadioDark").setAttribute("checked", "checked");   
   }
   
   if(window.location.hash === "#options")
   {
     tabbed_panels.showPanel(1);
   }
   else if(window.location.hash === "#shortcuts")
   {
     tabbed_panels.showPanel(0);
   }
   else if(window.location.hash.match(/^#id/) !== null)
   {
     onDrawSelectShortcutId = parseInt(window.location.hash.replace(/#id/i, ""));
   }
}, false);



var genericInputBoxCallback;
var genericInputBoxOn = false;
function showCustomInputPrompt(initial_value, button_label, callback_func)
{
  var ginput = document.getElementById("genericInputTextBox");
  var gbox = document.getElementById("genericInputBox");
  var gbutton = document.getElementById("genericInputButton");
  
  genericInputBoxCallback = callback_func;
  
  ginput.value = initial_value;
  gbutton.value = button_label;
  
  // position, size
  gbox.setAttribute("class", "visible");
  var gbox_padding = 30;
  gbox.style.setProperty("left", node_table_shortcut.offsetLeft + "px", null);
  gbox.style.setProperty("top",  (node_table_shortcut.offsetTop + 1) +  "px", null);
  gbox.style.setProperty("height", (node_table_shortcut.offsetHeight - (gbox_padding + 1)) + "px", null);   
  gbox.style.setProperty("width", (node_table_shortcut.offsetWidth - (gbox_padding + 1)) + "px", null);    
  
  ginput.select();
  
  genericInputBoxOn = true;
}

function closeGenericInputBox()
{
  genericInputBoxOn = false;

  var ginput = document.getElementById("genericInputTextBox");
  var gbox = document.getElementById("genericInputBox");
  var gbutton = document.getElementById("genericInputButton");
  
  gbox.setAttribute("class", "hidden");
  ginput.value = "";
  gbutton.value = "";    
}

function moveGroupToBefore(group_row, before_row)
{
  var group_row_id = group_row.getAttribute(ROW_ATTR_ITEM_ID);
  var before_row_id = before_row.getAttribute(ROW_ATTR_ITEM_ID);
  
  slData.moveGroupXToBeforeGroupY(group_row_id, before_row_id, 
    function()
    {
      informBackground();
      SiteManager.restore();
    });
}

function moveGroupToLastPos(group_row)
{
  var group_row_id = group_row.getAttribute(ROW_ATTR_ITEM_ID);
  
  slData.moveGroupToLastPosition(group_row_id, 
    function()
    {
      informBackground();
      SiteManager.restore();
    }); 
}


var genericDropBoxCallback;
var genericDropBoxOn = false;
var genericDropBoxDropToId = -1;
var genericDropMouseUpEventAdded = false;
function showGenericDropBox(items_array, box_label, anchor_elm, callback_func, box_listclass, inter_move, current_item_id)
{
  var gbox = document.getElementById("genericDropBox");
  var gboxlist = document.getElementById("genericDropBoxList");
  gboxlist.setAttribute("class", box_listclass);
  genericDropBoxDropToId = -1;
  
  if(!genericDropMouseUpEventAdded)
  {
    genericDropMouseUpEventAdded = true;
    gbox.addEventListener("mouseup", function(e){ event_genericDropBoxItemClick(e); }, false);       
  }
  
  document.getElementById("genericDropBoxHeader").innerText = box_label;
  
  deleteAllChildNodes(gboxlist);
  
  // populate items into box
  for(var i = 0; i < items_array.length; i++)
  {
    if(inter_move)
    {
      var before_div = document.createElement("div");
      before_div.setAttribute("id", "genericDropBoxAbove_" + items_array[i].id);
      before_div.setAttribute("class", "genericDropBoxAboveItem");    
      before_div.setAttribute(ROW_ATTR_ITEM_ID, items_array[i].id);
      before_div.addEventListener("mouseover", 
        function(e)
        {
          this.setAttribute("mouse_is_over", "true");
          genericDropBoxDropToId = this.getAttribute(ROW_ATTR_ITEM_ID);
          
          for(var i = 0; i < items_array.length; i++)
          {
            var sibling_node = document.getElementById("genericDropBoxAbove_" + items_array[i].id);
            if(sibling_node && sibling_node.id !== this.id)
            {
              sibling_node.setAttribute("mouse_is_over", "");
            }
          }
          
          var last_div = document.getElementById("genericDropBoxBelowLast");
          last_div.setAttribute("mouse_is_over", "");
        
        }, false);    
          
      // right arrow
      var div_arrow = document.createElement("div");
      div_arrow.setAttribute("class", "genericDropBoxRightArrow");
      div_arrow.addEventListener("mousedown", function(e){e.preventDefault(); event_genericDropBoxItemClick(e); }, false);
      before_div.appendChild(div_arrow);  

      gboxlist.appendChild(before_div);
    }
      
    var div_node = document.createElement("div");
    div_node.setAttribute("id", "genericDropBoxItem_" + items_array[i].id);
    div_node.setAttribute("class", "genericDropBoxItem");
    div_node.setAttribute(ROW_ATTR_ITEM_ID, items_array[i].id);
    
    if(current_item_id === items_array[i].id)
    {
      div_node.setAttribute("__selected", "true");
    }
    
    if(!inter_move)
    {
      div_node.addEventListener("mouseover", 
        function(e)
        {
          genericDropBoxDropToId = this.getAttribute(ROW_ATTR_ITEM_ID);        
          this.setAttribute("mouse_is_over", "true");
          
          for(var i = 0; i < items_array.length; i++)
          {
            var sibling_node = document.getElementById("genericDropBoxItem_" + items_array[i].id);
            if(sibling_node && sibling_node.id !== this.id)
            {
              sibling_node.setAttribute("mouse_is_over", "");
            }
          }
        
        }, false);
    }
    
    var uf_name = items_array[i].name;
    if(generalGroupId === items_array[i].id)
    {
      uf_name = uf_name.replace(" [General]", "");
    }
    
    div_node.appendChild(document.createTextNode(uf_name));
    gboxlist.appendChild(div_node);
  }  
  
  if(inter_move)
  {
    var last_div = document.createElement("div");
    last_div.setAttribute("id", "genericDropBoxBelowLast");
    last_div.setAttribute("class", "genericDropBoxBelowLast");    
    last_div.setAttribute(ROW_ATTR_ITEM_ID, "last");  
    
    last_div.addEventListener("mouseover", 
      function(e)
      {
        genericDropBoxDropToId = this.getAttribute(ROW_ATTR_ITEM_ID);      
        this.setAttribute("mouse_is_over", "true");
        
        for(var i = 0; i < items_array.length; i++)
        {
          var sibling_node = document.getElementById("genericDropBoxAbove_" + items_array[i].id);
          sibling_node.setAttribute("mouse_is_over", "");
        }
        
      }, false);        
      
    // right arrow
    var div_arrow = document.createElement("div");
    div_arrow.setAttribute("class", "genericDropBoxRightArrow");
    div_arrow.addEventListener("mousedown", function(e){e.preventDefault(); event_genericDropBoxItemClick(e); }, false);
    last_div.appendChild(div_arrow);      
    
    gboxlist.appendChild(last_div);
  }
  
  genericDropBoxCallback = callback_func;
  
  var scroll_top = node_items_div.scrollTop;
  var anchor_ymidline = ( getElmAbsTop(anchor_elm) + (anchor_elm.offsetHeight / 2) ) - scroll_top;
  var anchor_x = node_table_shortcut.offsetLeft + getElmAbsLeft(anchor_elm);
  
  gbox.setAttribute("class", "visible");   
  
  var y_padding = 8;
  var elm_y = Math.max(anchor_ymidline - (gbox.clientHeight / 2), y_padding);
  var elm_x = getElmAbsLeft(anchor_elm);

  // prevent vertical scrolling
  if(elm_y + gbox.clientHeight + y_padding > window.innerHeight)
  {
    elm_y -= elm_y + gbox.clientHeight + y_padding - window.innerHeight;
  }
  
  gbox.style.setProperty("top", elm_y + "px", null);
  gbox.style.setProperty("left", elm_x + "px", null);

  genericDropBoxOn = true;
}

function closeGenericDropBox()
{
  genericDropBoxOn = false;
  var gbox = document.getElementById("genericDropBox");
  gbox.setAttribute("class", "hidden");
}

function getSelRowClosestSibling()
{
  if(selRowItemId === -1)
  {
    return;
  }

  var rows = node_items_table.rows;
  
  for(var i = 0; i < rows.length; i++)
  {
    var row = rows[i];
  
    if(row.getAttribute(ROW_ATTR_ITEM_ID) === selRowItemId && row.hasAttribute(ROW_ATTR_IS_SHORTCUT) === selRowIsShortcut)
    {
      var sibling_prev = row.previousSibling;
      var sibling_next = row.nextSibling;
    
      if(sibling_next)
      {
        return sibling_next;
      }
      else if(sibling_prev)
      {
        return sibling_prev;
      }
      else
      {
        return null;
      }
    }
  }
  
  return null;
}

var currentMessageType = 0;
var currentMessageId = 0;
var usrMsgFadeTimeoutId = -1;
var usrMsgAction1Callback = null;
function showUserMessagePrompt(msg_type_id, msg, _duration, _action_name, _action_func)
{
  currentMessageId++;

  var duration = _duration !== undefined ? _duration : 6000;
  var action1_name = _action_name !== undefined ? _action_name : "";
  var action1_func = _action_func !== undefined ? _action_func : null;

  currentMessageType = msg_type_id;
  
  var msg_txt = document.getElementById("user_message_text");
  msg_txt.innerText = msg;
  
  // action 1
  var act_text = document.getElementById("user_message_action1");
  act_text.innerHTML = action1_name;
  usrMsgAction1Callback = action1_func;  

  var msg_box = document.getElementById("user_message_box");
  msg_box.style.setProperty("opacity", 1, null);  
  msg_box.setAttribute("class", "visible");
  
  msg_box.style.setProperty("left", (document.getElementById("tabPanelContainer").offsetLeft + 100) + "px", null);
  msg_box.style.setProperty("top", node_table_shortcut.offsetTop + "px", null);
  msg_box.style.setProperty("width", "601px", null);

  usrMsgFadeTimeoutId = setTimeout(function(){fadeUserMessagePrompt(currentMessageId )}, duration); 
}

function closeUserMessagePrompt(msg_type_id)
{
  if(msg_type_id !== undefined && currentMessageType !== msg_type_id)
  {
    return;
  }

  // this will run on fade out - but not if user closes message first,
  // which is why it's called here to be sure
  resetAnimateMsgStates();
  currentMessageType = null;

  // reset to default style (i.e. not visible)
  var msg_box = document.getElementById("user_message_box");
  msg_box.setAttribute("class", "");
}

var usrMsgTimerIntervalId = null;
var animateMsgId = -1;
var animateMsgOpacity = 1;
var animateMsgFadeIncrement = .05;
var animateMsgDelay = 100;
function fadeUserMessagePrompt(msg_id)
{
  if(msg_id !== currentMessageId)
  {
    // event no longer valid
    return;
  }
  
  // prevent redudant clearTimeout
  usrMsgFadeTimeoutId = null;
  
  animateMsgOpacity = 1;
  animateMsgId = msg_id;
  
  usrMsgTimerIntervalId = setInterval(animateFadeUsrMsgStep, animateMsgDelay);
}

function animateFadeUsrMsgStep(e)
{
  if(animateMsgId !== currentMessageId)
  {
    // event no longer valid  
    return;
  }
  
  animateMsgOpacity -= animateMsgFadeIncrement;
  
  // last step
  if(animateMsgOpacity <= 0)
  {
    currentMessageType = null;
    resetAnimateMsgStates();

    // reset to default style (i.e. not visible)
    var msg_box = document.getElementById("user_message_box");
    msg_box.setAttribute("class", "");
  }
  
  document.getElementById("user_message_box").style.setProperty("opacity", animateMsgOpacity, null);
}

function resetAnimateMsgStates()
{
  // only reset if we own current animation
  if(animateMsgId !== currentMessageId)
  {
    return;
  }

  if(usrMsgTimerIntervalId !== null)
  {
    clearInterval(usrMsgTimerIntervalId);
  }
  
  if(usrMsgFadeTimeoutId !== null)
  {
    clearTimeout(usrMsgFadeTimeoutId);
  }

  usrMsgTimerIntervalId = null;
  usrMsgFadeTimeoutId = null;
  animateMsgId = null;
}

function deleteMainGroupContents()
{
  var group = slData.getGroupById(generalGroupId);
  var ids = [];
  
  if(group === null)
  {
    return;
  }
  
  for(var i = 0; i < group.items.length; i++)
  {
    ids.push(group.items[i][SL_ATTR_ID]);
  }
  deleteMultipleShortcutItems(ids);
  
  closeUserMessagePrompt(MSG_TYPE_CANNOT_DELETE_MAIN);
}

function restoreLastDeletedShortcut()
{
  latestUndoFunction = null;

  if(lastDeletedDataItem === null || lastDeletedItemType !== TYPE_SHORTCUT)
  {
    return;
  }
  
  var item = lastDeletedDataItem;
  var key_char = sl_trim(item[SL_ATTR_KEY]);
  
  slData.addShortcut(item[SL_ATTR_URL], item[SL_ATTR_NAME], key_char, lastDeletedItemGroupId, 
    function(_item)
    {
      SiteManager.restore(_item.id, false);
      closeUserMessagePrompt(MSG_TYPE_UNDO_DEL_SHORTCUT);
    });
}


function restoreLastDeletedGroup()
{
  latestUndoFunction = null;

  if(lastDeletedDataItem === null || lastDeletedItemType !== TYPE_GROUP)
  {
    return;
  }
  
  var group = lastDeletedDataItem;
  createGroupWithItems(group[SL_ATTR_NAME], group.items, true, true);
  
  closeUserMessagePrompt(MSG_TYPE_UNDO_DEL_GROUP);
}

function restoreLastDeletedShortcutsMultiple()
{
  latestUndoFunction = null;

  if(lastDeletedDataItem === null || lastDeletedItemType !== TYPE_MULTIPLE_SHORTCUTS)
  {
    return;
  }
  
  var items = lastDeletedDataItem;
  var num_items = items.length;
  var num_items_restored = 0;
  
  for(var i = 0; i < items.length; i++)
  {
    var item = items[i];
    var key_char = sl_trim(item[SL_ATTR_KEY]);
    
    slData.addShortcut(item[SL_ATTR_URL], item[SL_ATTR_NAME], key_char, lastDeletedItemGroupId, 
      function(_item)
      {
        num_items_restored++;

        if(num_items === num_items_restored)
        {
          SiteManager.restore();
          closeUserMessagePrompt(MSG_TYPE_UNDO_DEL_SHORTCUT);
        }      
      });    
  }
}

function showCriticalError(errorText)
{
  document.getElementById("genericErrorBox").style.setProperty("display", "block", null);
  document.getElementById("genericErrorTextarea").innerText = errorText;
}

function closeCriticalError()
{
  document.getElementById("genericErrorBox").style.setProperty("display", "none", null);
}

var resizeOnShortcutTabSelected = false;

function resizeUIToFitWindow()
{

   // resize container height to fit window
   var container = document.getElementById("tabPanelContainer");

  if(node_items_div.clientHeight === 0)
  {
    resizeOnShortcutTabSelected = true;
  }

   var y_shortfall = window.innerHeight - container.clientHeight;
   var target_height = (node_items_div.clientHeight + (y_shortfall - 50));
   
   if(target_height < 200)
   {
     target_height = 200;
   }
   
   if(target_height > 391)
   {
     target_height = 391;
   }
   
   node_items_div.style.setProperty("height", target_height + "px", null);

   // reposition user message box if visible
   if(currentMessageType !== null)
   {
      var msg_box = document.getElementById("user_message_box");
      msg_box.style.setProperty("left", (node_table_shortcut.offsetLeft - 1) + "px", null);
      msg_box.style.setProperty("top", node_table_shortcut.offsetTop + "px", null);
      msg_box.style.setProperty("width", (node_table_shortcut.offsetWidth - 1) + "px", null);
      msg_box.style.setProperty("height", node_table_shortcut.offsetHeight + "px", null);     
   }
   
   // reposition user input prompt if visible
   if(genericInputBoxOn)
   {
     var gbox = document.getElementById("genericInputBox");
     var gbox_padding = 30;
     gbox.style.setProperty("left", node_table_shortcut.offsetLeft + "px", null);
     gbox.style.setProperty("top",  (node_table_shortcut.offsetTop + 1) +  "px", null);
     gbox.style.setProperty("height", (node_table_shortcut.offsetHeight - (gbox_padding + 1)) + "px", null);   
     gbox.style.setProperty("width", (node_table_shortcut.offsetWidth - (gbox_padding + 1)) + "px", null);     
   }
}

function highlightAvailableKeys()
{
  for(var i = 0; i < ENG_ALPHABET.length; i++)
  {
    var elm = document.getElementById("key-suggest-button-" + ENG_ALPHABET[i]);
  
    if(slData.getShortcutByKey(ENG_ALPHABET[i]) === null)
    {
      elm.setAttribute("available", "true");
    }
    else
    { 
      elm.removeAttribute("available");
    }
  }
}

var currentSelectedRow = null;
var selRowItemId = -1;
var selRowIsShortcut = false;
var selRowIsGroup = false;
var selRowGroupId = -1;

var lastSelectedRow = null;

document.addEventListener('keydown', function(e)
{

  

  // only continue if shortcut tab selected
  if(tabbed_panels.getCurrentTabIndex() !== 0)
  {
    return;
  }
  
  var metaKey = "ctrlKey"; 
 
  if(navigator.appVersion.indexOf("Mac") !== -1)
  {
    metaKey = "cmdKey"; 
  }
  
  // handle access keys
  
  var accessModifier = isMacPlatform() ? "ctrlKey" : "altKey";
  
  if(e[accessModifier])
  {
    // edit shortcut accesskey
    if("E".charCodeAt(0) === e.keyCode)
    {
      e.preventDefault();  
      event_editButtonClicked();
      return;
    }  
    
    
    // key conflict override accesskey
    if("O".charCodeAt(0) === e.keyCode)
    {
      e.preventDefault();  
      event_overrideButtonClicked();
      return;
    }      
  }
  
  // handle undo
  if(e[metaKey] && "Z".charCodeAt(0) === e.keyCode)
  {
    if(latestUndoFunction !== null)
    {
      latestUndoFunction();
    }
  }
  
  
  if(document.activeElement && document.activeElement.hasAttribute("id"))
  {
    // delegate key handling if one of the edit input boxes/buttons has focus
    if(document.activeElement.getAttribute("id").indexOf("edit_input_") !== -1 || document.activeElement.getAttribute("id").indexOf("button_add") !== -1)
    {
      event_editInputBoxKeyDown(e);
      return;
    }     
  }

  if(e.keyCode == KEY_UP || e.keyCode == KEY_DOWN || e.keyCode == KEY_PAGEUP || e.keyCode == KEY_PAGEDOWN ||
     e.keyCode == KEY_HOME || e.keyCode == KEY_END)
  {
    e.preventDefault();
  }  
  
  var selRow = getSelectedRow();
  
  switch(e.keyCode)
  {
    case KEY_LEFT:
      if(selRow != null && (!e.srcElement || e.srcElement.localName !== "input") && e.srcElement.id !== "shortcut_tab")
      {
        e.preventDefault();  
        event_editButtonClicked();
      }
      return;   
    break;
    
    case KEY_UP:
      if (selRow != null && selRow.previousSibling != null && !genericInputBoxOn)
      {   
        if(!e.shiftKey)
        {
          setSelectedRow(selRow.previousSibling);
        }
        else
        {
          selectNextGroupUp();   
        }
      } 
      return;
    break;
    
    case KEY_DOWN:
      if (selRow != null && selRow.nextSibling != null && !genericInputBoxOn)
      {
        if(!e.shiftKey)
        {      
          setSelectedRow(selRow.nextSibling);           
        }
        else
        {
          selectNextGroupDown();               
        }
      }
      return;      
    break;
    
    case KEY_PAGEUP:
      if(selRow != null && !genericInputBoxOn)
      {
        selectNextGroupUp();           
      }    
      return;      
    break;
    
    case KEY_PAGEDOWN:
      if(selRow != null && !genericInputBoxOn)
      {
        selectNextGroupDown();       
      }      
      return;      
    break;
    
    case KEY_HOME:
      if(selRow != null && !genericInputBoxOn)
      {
        selectFirstItem();       
      }       
      return;      
    break;    
    
    
    case KEY_END:
      if(selRow != null && !genericInputBoxOn)
      {
        selectLastItem();       
      }   
      return;
    break;        

    case KEY_DEL:
      if(selRow != null && !genericInputBoxOn)
      {
        if(selRow.hasAttribute("__isShortcut"))
        {
          deleteShortcutItem(selRow.getAttribute(ROW_ATTR_ITEM_ID));
        }
        else
        {
          deleteGroupItem(selRow.getAttribute(ROW_ATTR_ITEM_ID));
        }
      }
      return;      
    break;

    case KEY_ESCAPE:
      if(genericInputBoxOn)
      {
        closeGenericInputBox();
      }
      if(genericDropBoxOn)
      {
        closeGenericDropBox();
      }
      if(currentMessageType !== null)
      {
        closeUserMessagePrompt();
      }
      return;      
    break;

    case KEY_ENTER:
      if(genericInputBoxOn)
      {
        event_genericInputBoxSubmit();
      }
      else if (selRow != null)
      {
        event_newShortcutButtonClicked();
      }
      return;      
    break;

    case KEY_SPACE:
      if(selRow != null && (!e.srcElement || e.srcElement.localName !== "input"))
      {
        e.preventDefault();  
        event_editButtonClicked();
      }
      return;      
    break;
  }

  if(selRow === null || genericInputBoxOn || e.altKey || e.ctrlKey || e.metaKey || e.cmdKey)
  {
    return;
  }
  
  // jump to list item by char
  var rows = node_items_table.rows;
  var row_index = selRow.sectionRowIndex + 1;
  for(var i = row_index; i < rows.length; i++)
  {
    if(rows[i].getAttribute(ROW_ATTR_ITEM_TITLE).toUpperCase().charCodeAt(0) === e.keyCode)
    {
      setSelectedRow(rows[i]);
      return;
    }
  }  
  
  // char not found - go back to start to find char match
  for(var i = 0; i < rows.length; i++)
  {
    if(rows[i].getAttribute(ROW_ATTR_ITEM_TITLE).toUpperCase().charCodeAt(0) === e.keyCode)
    {
      setSelectedRow(rows[i]);
      return;
    }
  }  
  
}, true);

function getSelectedRow()
{
  return currentSelectedRow;
}

function selectGroupRowById(id)
{
  var rows = node_items_table.rows;
  for(var i = 0; i < rows.length; i++)
  {
    if(rows[i].getAttribute(ROW_ATTR_ITEM_ID) == id && !rows[i].hasAttribute("__isShortcut"))
    {
      setSelectedRow(rows[i]);
      return;
    }
  }
}

function getGroupRowById(id)
{
  var rows = node_items_table.rows;
  for(var i = 0; i < rows.length; i++)
  {
    if(rows[i].getAttribute(ROW_ATTR_ITEM_ID) == id && !rows[i].hasAttribute("__isShortcut"))
    {
      return rows[i];
    }
  }
  
  return null;
}

function selectShortcutRowById(id)
{
  var rows = node_items_table.rows;
  for(var i = 0; i < rows.length; i++)
  {
    if(rows[i].getAttribute(ROW_ATTR_ITEM_ID) == id && rows[i].hasAttribute("__isShortcut"))
    {
      setSelectedRow(rows[i]);
      return;
    }
  }
}

function setSelectedRow(rowItem)
{
  if(rowItem === null || rowItem === undefined)
  {
    return;
  }
  
  var _rowItemId = rowItem.getAttribute(ROW_ATTR_ITEM_ID);
  var _rowIsShortcut = rowItem.hasAttribute(ROW_ATTR_IS_SHORTCUT);

  // ignore if already selected
  if(_rowItemId === selRowItemId && _rowIsShortcut === selRowIsShortcut && !just_redrawn)
  {
    return;
  }
  
  just_redrawn = false;
  
  currentSelectedRow = rowItem;
  selRowItemId = _rowItemId;
  selRowIsShortcut = _rowIsShortcut;
  selRowIsGroup = !selRowIsShortcut;
  selRowGroupId = rowItem.getAttribute(ROW_ATTR_GROUP_ID)
  updateItemAttributes();
  styleRowAsSelected(rowItem);

  document.activeElement.blur();
  
  closeUserMessagePrompt(MSG_TYPE_KEY_CONFLICT);  
}

function unsetSelectedRow()
{
  closeUserMessagePrompt(MSG_TYPE_KEY_CONFLICT);

  currentSelectedRow = null;
  selRowItemId = -1;
  selRowIsShortcut = false;
  selRowIsGroup = false;
  selRowGroupId = -1;
  updateItemAttributes();
  styleRowAsSelected(null);

  document.activeElement.blur();
}

function getActiveGroupRow()
{
  var rows = node_items_table.rows;
  for(var i = 0; i < rows.length; i++)
  {
    if(rows[i].getAttribute(ROW_ATTR_ITEM_ID) == selRowGroupId && !rows[i].hasAttribute("__isShortcut"))
    {
      return rows[i];
    }
  }
  
  return null;
}

function styleRowAsSelected(item) 
{
  // reset style of previously selected row
  if(lastSelectedRow !== null)
  {
    lastSelectedRow.removeAttribute('__selected');
    lastSelectedRow.style.setProperty("background-color", "", null);
  }


  if(!item)
  {
    return;
  }
  
  item.setAttribute('__selected', 'true');
  item.style.setProperty("background-color", "", null)  
  lastSelectedRow = item;
  
  if(!autoScrollOnSelect)
  {
    return;
  }
  
  // auto scroll to put item in viewport if needed
  
  var container_scroll_top = node_items_div.scrollTop;
  var container_height = node_items_div.offsetHeight;
  var container_scroll_bottom = container_scroll_top + container_height;  
  
  var item_offset_top = item.offsetTop;
  var item_offset_bottom = item_offset_top + item.offsetHeight;
  var scrollMargin = 16;
  
  if(container_scroll_top >= item_offset_top)
  {
    // scroll up
    node_items_div.scrollTop = item_offset_top - scrollMargin; 
  }
  else if(container_scroll_bottom <= item_offset_bottom)
  {
    // scroll down
    node_items_div.scrollTop = item_offset_bottom - container_height + scrollMargin;
  }  
}

function updateItemAttributes()
{
  if(inEditShortcutState)
  {
    inEditShortcutState = false;
    node_input_title.value = "";
    node_input_key.value = ""; 
    node_input_url.value = "";      
    changeAddButtonLabel("Add");    
  }
}

var addButtonWidthFixed = false;
function changeAddButtonLabel(label)
{
  if(node_button_add.value === label)
  {
    return;
  }
 
  // maintain button's width
  if(!addButtonWidthFixed)
  {
    node_button_add.style.setProperty("width",  node_button_add.offsetWidth + "px", null); 
    addButtonWidthFixed = true;
  }
  
  node_button_add.value = label; 
}

var autoScrollOnSelect = true;
function setSelectAutoScroll(bool_state)
{
  autoScrollOnSelect = bool_state;
}

function selectNextGroupUp()
{
  var row = getSelectedRow();
  
  if(row === null)
  {
    return;
  }
  
  while(row.previousSibling)
  {
    if(!row.previousSibling.hasAttribute(ROW_ATTR_IS_SHORTCUT))
    {
      setSelectedRow(row.previousSibling);
      node_items_div.scrollTop = currentSelectedRow.offsetTop; 
      return;
    }
    row = row.previousSibling;
  }
}

function selectNextGroupDown()
{
  var row = getSelectedRow();
  if(row === null)
  {
    return;
  }
  
  while(row.nextSibling)
  {
    if(!row.nextSibling.hasAttribute(ROW_ATTR_IS_SHORTCUT))
    {
      setSelectedRow(row.nextSibling);
      node_items_div.scrollTop = currentSelectedRow.offsetTop; 
      return;
    }
    row = row.nextSibling;    
  }
}

function selectFirstItem()
{
  var rows = node_items_table.rows;
  
  if(!rows.length)
    { return; }
  
  setSelectedRow(rows[0]);
}

function selectLastItem()
{
  var rows = node_items_table.rows;
  
  if(!rows.length)
    { return; }
  
  setSelectedRow(rows[rows.length - 1]);
}

function blankKeyOfShortcutById(id)
{
  var item = slData.getShortcutById(id);
  
  if(item === null)
  {
    return;
  }
  
  slData.updateShortcutById(item[SL_ATTR_ID], item[SL_ATTR_URL], item[SL_ATTR_NAME], "", function(){});
}

function updateInputTitleBasedOnURL()
{
  // don't do suggestion in edit shortcut mode, as user might 
  // want to edit url but keep title same
  if(inEditShortcutState)
  {return}

  var url = node_input_url.value;
  node_input_title.value = generateTitleBasedOnURL(url);
}

document.addEventListener( "DOMContentLoaded", init_options, false );
window.addEventListener( "resize", event_windowResized, false );


/* global functions */

function shuffle_array(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
  }

  return array;
}

function getImageById(id, callback)
{
var img = document.createElement("img");
img.setAttribute("id", "img_" + id);
img.setAttribute("image_id", id);
img.addEventListener("load", function(e){
	var local_id = e.target.getAttribute("image_id");
	var canvas = document.getElementById("img_canvas");
	var img = document.getElementById("img_" + local_id);
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	callback(canvas.toDataURL()); 
	});		

img.src = "http://www.donesmart.com/best_new_tab_images/" + id;
document.getElementById("image_loader").appendChild(img);

}
   