/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */
function event_onAddButtonPress(e)
{
  // revise shortcut
  if(inEditShortcutState && selRowIsShortcut)
  {
    SiteManager.update();
  }
  // add shortcut
  else
  {
    SiteManager.add()
  }
}

function event_addGroupButtonPress(e)
{
  SiteManager.addGroup();
}

function event_unlockButtonClicked(e)
{
  e.preventDefault();
  var input_text = document.getElementById("theme_unlock_textbox").value;
  setThemeUnlockCodeVal(getPref("sl-launcher-theme"), input_text);
  event_optionChanged();
  return true;
}

function event_renameGroupPressed()
{
  var groupRow = getActiveGroupRow();
  
  if(groupRow !== null)
  {
    var groupId = groupRow.getAttribute(ROW_ATTR_ITEM_ID);

    var uf_group_title = groupRow.getAttribute(ROW_ATTR_ITEM_TITLE);    
    if(generalGroupId === groupId)
    {
      uf_group_title = uf_group_title.replace(" [General]", "");
    } 
  
    showCustomInputPrompt(uf_group_title, "Rename", event_renameGroupCallback);
  }
}

function event_renameGroupCallback(val)
{
  SiteManager.renameGroup(getActiveGroupRow().getAttribute(ROW_ATTR_ITEM_ID), val);
  return true;
}

function event_genericInputBoxSubmit()
{
  var val = document.getElementById("genericInputTextBox").value;
  var res = genericInputBoxCallback(val);
  
  if(res)
  {
    closeGenericInputBox();  
  }
}

function event_genericDropBoxItemClick(e)
{
  if(genericDropBoxDropToId === -1)
  {
    return;
  }
  
  if(genericDropBoxCallback(genericDropBoxDropToId))
  {
    closeGenericDropBox();  
  }
}

function event_moveShortcutItemCallback(newGroupId)
{
  var selRow = getSelectedRow();

  if(!selRowIsShortcut || !selRow)
  {
    return false;
  }

  var mvGroup = getGroupRowById(newGroupId);
  var groupTitle = mvGroup.getAttribute("__itemTitle");
  
  chrome.bookmarks.move(selRowItemId, {'parentId': newGroupId, 'index': 0}, 
  function(result)
  {
      SiteManager.restore();
      informBackground();
      //showUserMessagePrompt(MSG_TYPE_SHORTCUT_MOVED, "Shortcut moved to " + groupTitle, DURATION_3SEC);
  });

  return true;
}


function event_moveGroupItemCallback(group_before_id)
{
  var selRow = getSelectedRow();

  if(selRowIsShortcut || !selRow || group_before_id === selRowGroupId)
  {
    return true;
  }
  
  if(group_before_id === "last")
  {
    moveGroupToLastPos(selRow);
  }
  else
  {
    var before_row = getGroupRowById(group_before_id);
    moveGroupToBefore(selRow, before_row);
  }
  
  return true;
}


function event_editInputBoxKeyDown(e)
{
  switch(e.keyCode)
  {
    case KEY_ENTER:
      event_onAddButtonPress();
    break;
    case KEY_ESCAPE:
      just_redrawn = true;
      setSelectAutoScroll(false);    
      if(selRowIsShortcut)
      {
        selectShortcutRowById(selRowItemId);
        document.activeElement.blur();
      }
      else if(selRowIsGroup)
      {
        selectGroupRowById(selRowItemId);
        document.activeElement.blur();
      }
      setSelectAutoScroll(true);   
    break;
  }
}

function event_newSiteIconReady(e_url)
{
  var rows = getRowsByAttribute(ROW_ATTR_ITEM_URL, e_url);
  var id, img, url;
  
  for(var i = 0; i < rows.length; i++)
  {
    id = rows[i].getAttribute(ROW_ATTR_ITEM_ID);
    img = document.getElementById("siteIconImg_" + id);
    url = rows[i].getAttribute("__itemUrl");
    
    img.style.setProperty("background-image", "url(" + getIconData(url) + ")", null);
  }
  
  var rows2 = getRowsByAttribute(ROW_ATTR_ITEM_RELATED_URL, e_url);

  for(var i = 0; i < rows2.length; i++)
  {
    id = rows2[i].getAttribute(ROW_ATTR_ITEM_ID);
    img = document.getElementById("siteIconImg_" + id);
    url = rows2[i].getAttribute(ROW_ATTR_ITEM_RELATED_URL);
    
    img.style.setProperty("background-image", "url(" + getIconData(url) + ")", null);
  }
  
  
}

function event_moveButtonClicked(e)
{
  e.cancelBubble = true;
  e.preventDefault();
  
  if(genericDropBoxOn == true)
  {
    closeGenericDropBox();
    return;
  }

  if(!selRowIsShortcut)
  {
    return;
  }

  showGenericDropBox(groups, "Move shortcut to:", this, event_moveShortcutItemCallback, "movingShortcut", false, selRowGroupId);  
}

function event_refreshIconButtonClicked(e)
{  
  e.cancelBubble = true;
  e.preventDefault();

  var url = slData.getShortcutById(selRowItemId)[SL_ATTR_URL];

  // special icons are static so no point in refreshing
  if(urlHasSpecialIcon(url))
  {
    return;
  }
  
  var rows = getRowsByAttribute(ROW_ATTR_ITEM_URL, url);

  for(var i = 0; i < rows.length; i++)
  {
    var id = rows[i].getAttribute(ROW_ATTR_ITEM_ID);
    var img = document.getElementById("siteIconImg_" + id);
    img.style.setProperty("background-image", "url(" + chrome.extension.getURL("images/loading.gif") + ")", null);
  }

  getIconData(url, true);
}

function event_duplicateButtonClicked(e)
{
  SiteManager.duplicate(selRowItemId);
}

function event_editButtonClicked(e)
{
  closeUserMessagePrompt();

  if(selRowIsGroup)
  {
    event_renameGroupPressed();
  }
  else
  {
    var item = slData.getShortcutById(selRowItemId);

    if(item && selRowIsShortcut)
    {
      node_input_key.value = item[SL_ATTR_KEY];
      node_input_title.value = item[SL_ATTR_NAME];  
      node_input_url.value = item[SL_ATTR_URL];
    
      changeAddButtonLabel("Update");    
      
      inEditShortcutState = true;
    }
  
    if(genericDropBoxOn)
    {
      closeGenericDropBox();
      return;
    }
    
    node_input_url.select();
  }
}

function event_inputTitleBoxFocused(e)
{

}

function event_groupMoveButtonClicked(e)
{
  if(genericDropBoxOn)
  {
    closeGenericDropBox();
    return;
  }
  
  if(getPref("sl-auto-arrange-groups"))
  {
    showUserMessagePrompt(MSG_TYPE_AUTO_ARRANGE_LOCK, "Can't move group because Auto-arrange is on", DURATION_1MIN, "Go to options",
      function()
      {
        closeUserMessagePrompt(MSG_TYPE_AUTO_ARRANGE_LOCK);
        tabbed_panels.showPanel(1);
      });   
    return;
  }

  if(!selRowIsGroup)
  {
    return;
  }
  
  var groups_list = [];
  for(var i = 0; i < groups.length; i++)
  {
    // don't include general group as is locked into 1st position
    if(groups[i][SL_ATTR_ID] === generalGroupId)
    {
      continue;
    }

    groups_list.push({"id": groups[i][SL_ATTR_ID], "name": groups[i][SL_ATTR_NAME]});
  }
  
  showGenericDropBox(groups_list, "Reorder group:", this, event_moveGroupItemCallback, "movingGroup", true, selRowItemId);  
}

function event_newShortcutButtonClicked()
{
  inEditShortcutState = false;    
  changeAddButtonLabel("Add");  
  closeUserMessagePrompt();
  selectGroupRowById(selRowGroupId);
  node_input_title.value = "";
  node_input_key.value = ""; 
  node_input_url.value = "";   
  node_input_url.focus();
  highlightAvailableKeys();
}

function event_userMessageAction1Clicked()
{
  if(usrMsgAction1Callback !== null)
  {
    usrMsgAction1Callback();
  }
}

function event_unlockFeatureClicked()
{
	if(document.getElementById("unlock_feature_msg"))
    {
	  document.getElementById("unlock_feature_msg").parentNode.removeChild(document.getElementById("unlock_feature_msg"));
	}
	// stick to same refer method
	if(!getPref("unlock_refer_contacts") && !getPref("unlock_refer_facebook"))
	{
      if(Math.floor(Math.random() * 2))
	  {
        setPref("unlock_refer_contacts", true);
	  }
	  else
	  {
        setPref("unlock_refer_facebook", true);
	  }
	}
	
	
	if(getPref("unlock_refer_contacts"))
	{
		chrome.tabs.create({"url" : "unlock2.html"});
	}
	else
	{
		chrome.tabs.create({"url" : "unlock.html"});
	}
}

function event_optionChanged(e)
{
  // set bool options
  setPref("sl-hide-titles", document.getElementById("hideTitlesCheckbox").checked ? 0 : 1);   // inverted for usability
  setPref("sl-hide-keys", document.getElementById("hideKeysCheckbox").checked ? 0 : 1);   // inverted for usability
  setPref("sl-open-new-tab", document.getElementById("openNewTabCheckbox").checked ? 1 : 0);    
  setPref("sl-show-context-item", document.getElementById("contextItemCheckbox").checked ? 1 : 0);    
  setPref("sl-hide-tellfriend-button", document.getElementById("hideTellFriendsCheckbox").checked ? 1 : 0);    
  setPref("sl-bw-toolbar-button", document.getElementById("bwToolbarButtonCheckbox").checked ? 1 : 0);    
  setPref("sl-custom-bg-overlay", document.getElementById("overlayBgCheckbox").checked ? 1 : 0);   
  
  // text shade radios
  if(document.getElementById("textShadeRadioLight").checked)
  {
    setPref("sl-text-shade", 1);
  }
  else
  {
    setPref("sl-text-shade", 0);
  }
  
  var opt_that_changed = "";
  if(e && e.target)
  {
    opt_that_changed = e.target.getAttribute("__for_option")
  }
  
  if(opt_that_changed === "sl-show-context-item")
  {
    chrome.extension.sendMessage({request: CMD_UPDATE_SL_CONTEXT_ITEM});
  }
  
  if(opt_that_changed === "sl-bw-toolbar-button")
  {
    if(getPref("sl-bw-toolbar-button"))
    {
      chrome.browserAction.setIcon({"path":"/images/icon-38px-bw.png"}); 
    }
    else
    {
      chrome.browserAction.setIcon({"path":"/images/icon-38px.png"}); 
    }
  }
  
  if(opt_that_changed === "sl-hide-tellfriend-button")
  {
    if(getPref("sl-hide-tellfriend-button"))
    {
      document.getElementById("shareButtonShortcutsTab").setAttribute("class", "displayNone");
      document.getElementById("tellfriends_block").setAttribute("class", "displayNone");
    }
    else
    {
      document.getElementById("shareButtonShortcutsTab").setAttribute("class", "largeShareButton2");
      document.getElementById("tellfriends_block").setAttribute("class", "");
    }
  }
  
  sitelauncherHooks.fire("option-changed", opt_that_changed);  
}

function event_handleOptionChanged(optionName)
{
  if(optionName === "sl-hide-keys")
  {
    SiteManager.restore(0); // redraw following ui elements disabled/enabled
  }
}

function event_importFileChanged()
{

	
	
  var files = document.getElementById("inputImportFile").files;
  
  if(!files.length)
  {
    document.getElementById("import_select").style.setProperty("display", "block", null); 
    document.getElementById("import_confirm").style.setProperty("display", "none", null); 
    document.getElementById('inputImportFile').value="";
  }
  else
  {
    document.getElementById("button_import").removeAttribute("disabled");
    document.getElementById("import_select").style.setProperty("display", "none", null); 
    document.getElementById("import_confirm").style.setProperty("display", "block", null); 
  }
}



function event_cancelImportButtonClick()
{
    document.getElementById("import_select").style.setProperty("display", "block", null); 
    document.getElementById("import_confirm").style.setProperty("display", "none", null); 
    document.getElementById('inputImportFile').value="";
}

function event_importButtonClick()
{
  //document.getElementById("import_arrow_right").style.setProperty("visibility", "");

  var files = document.getElementById("inputImportFile").files;
  
  if(!files.length)
  {
    alert("Error: no file selected");
  }
  
  var file = files[0];
  var reader = new FileReader();
  var blob = file.slice(0, file.size - 1);
  
  reader.onloadend = function(evt)
  {
    if(evt.target.readyState == FileReader.DONE)
    { 
      importXMLToSlData(evt.target.result);
      delete reader;
      
      document.getElementById('inputImportFile').value="";
    }
  };
  
  reader.readAsBinaryString(blob);
  
  document.getElementById("import_select").style.setProperty("display", "block", null); 
  document.getElementById("import_confirm").style.setProperty("display", "none", null); 
}

function event_importImageChanged()
{
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
	
	
  var files = document.getElementById("browseImageFile").files;
  
  if(!files.length)
  {
    // do nothing
  }
  else
  {
    var file = files[0];
    var reader = new FileReader();
    var blob = file.slice(0, file.size - 1);
    
    
    reader.onloadend = function(evt)
    {
      if(evt.target.readyState == FileReader.DONE)
      { 
           var data_url = evt.target.result;

			
		   setPref("sl-launcher-theme", 21);
		   setPref("sl-custom-bg-scale", false);
           setPref("sl-custom-bg-image", data_url);
           setPref("sl-custom-bg-image2", "");	
           setPref("sl-custom-bg-image3", "");			   
           setPref("sl-custom-bg-split", false);	
        delete reader;
      }
    };
    
    reader.readAsDataURL(blob);
  }
}

function event_inputBoxHasFocus(e)
{
  try
  {
    // if input box has focus indicate the shortcut list table is not "active" 
    // (i.e. doesn't respond to keyboard events)
    if(currentSelectedRow !== null)
    {
      currentSelectedRow.style.setProperty("background-color", "#8D9BC4", null);
    }
    
    // show key suggestions
    if(event.target && event.target.id === node_input_key.id)
    {
      var key_box = document.getElementById("available_keys");
      var key_box_height = 132;
      var key_box_width = 110;

      var y = node_table_shortcut.offsetTop - key_box_height + 20;
      var x = (node_input_key.parentNode.offsetLeft)
     
      key_box.style.setProperty("top", y  + "px", null);
      key_box.style.setProperty("left", (node_table_shortcut.offsetLeft + x) +  "px", null);    
      key_box.style.setProperty("display", "block", null);
    }
    
  }
  catch(e)
  {
    console.log(e);
  }
}

function event_keyInputKeyDown(e)
{
  if(KEY_ENTER !== e.keyCode && KEY_ESCAPE !== e.keyCode)
  {
    document.getElementById("edit_input_key").select();
  }
  
  if(KEY_TAB === e.keyCode )
  {
    return;
  }
  
  var key_letter = String.fromCharCode(e.keyCode).toLowerCase();
  
  var suggest_elm = document.getElementById("key-suggest-button-" + key_letter);
  
  if(suggest_elm !== null)
  {
    suggest_elm.setAttribute("__highlight", "true");
    setTimeout(function(e){suggest_elm.setAttribute("__highlight", "");}, 500);
  }
}

function event_keyInputKeyUp(e)
{
  if(KEY_ENTER === e.keyCode || KEY_ESCAPE === e.keyCode || KEY_TAB === e.keyCode )
  {
    return;
  }


}

function event_inputBoxLostFocus()
{
  if(currentSelectedRow !== null)
  {
    currentSelectedRow.style.setProperty("background-color", "", null);  
  }
   
  // hide key suggestions
  if(event.target && event.target.id === node_input_key.id)
  {
    document.getElementById("available_keys").style.setProperty("display", "none", null);
  } 
}

var redraw_timer_id = null;
function event_windowResized()
{
  // timer logic is to minimize amount of redraws when user is drag-resizing window
  if(redraw_timer_id !== null)
  {  
    clearTimeout(redraw_timer_id);
  }
  redraw_timer_id = setTimeout(function(){resizeUIToFitWindow();}, 100); 
}

function event_keySuggestButtonClick(e)
{
  e.preventDefault();
  node_input_key.value = event.target.innerText;
}

function event_focusOnClick(e)
{
  e.target.focus();
}

function event_overrideButtonClicked()
{
  if(currentMessageType === MSG_TYPE_KEY_CONFLICT && !inEditShortcutState)
  {
    SiteManager.addWithKeyOverride();
  }
  else if(currentMessageType === MSG_TYPE_KEY_CONFLICT && inEditShortcutState)
  {
    SiteManager.updateWithKeyOverride();
  }
}