/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */

/* objects */
var uiSelector;
var node_table;
var node_page_group_row;
var node_launcher_container;

var groups = [];
var items = [];

var open_shortcuts_new_tab = false;
var already_initd = false;
var redraw_timer_id = null;

var keycode_w;
var keycode_a;
var keycode_s;
var keycode_d;
var keycode_e;
var keycode_q;

var keycode_8;
var keycode_4;
var keycode_5;
var keycode_6;
var keycode_2;
var keycode_0;

function init()
{
  window.addEventListener('contextmenu', function (e) {
    e.preventDefault(); return true;
  }, false);
  
  node_table = document.getElementById('launcher_table');
  node_launcher_container = document.getElementById("launcher_container");
  
  var bg_window = chrome.extension.getBackgroundPage();
  groups = bg_window.getAllGroupData();
  items = bg_window.getAllShortcutData();
  
  init_launcher();
  
  node_launcher_container.addEventListener('mousedown', handleLauncherContainerClick, false);
  
  keycode_w = "W".charCodeAt(0);
  keycode_a = "A".charCodeAt(0);
  keycode_s = "S".charCodeAt(0);
  keycode_d = "D".charCodeAt(0);
  keycode_e = "E".charCodeAt(0);
  keycode_q = "Q".charCodeAt(0);
}

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse)
  {
    if(request.msg === CMD_NOTIFY_NEW_SHORTCUTS)
    {
      init();
    }
  });
  
function updateLauncherToNoShortcutsMessage()
{
  var div = document.createElement("div");
  div.setAttribute("id", "noShortcutDiv");
  
  var div1 = document.createElement("div");
  div1.innerText = "You don't have any shortcuts set.";
  div1.setAttribute("id", "noShortcutsMsgPart1");
  
  var div2 = document.createElement("div");
  div2.innerText = "Assign default shortcuts";
  div2.setAttribute("id", "noShortcutsMsgPart2");
  div2.addEventListener("mousedown", event_assignDefaultsClicked, false); 
  
  var div3 = document.createElement("div");
  div3.innerText = "Manage shortcuts";
  div3.setAttribute("id", "noShortcutsMsgPart4");  
  div3.addEventListener("mousedown", event_manageShortcutsClicked, false);
  
  div.appendChild(div1);
  div.appendChild(div2);
  div.appendChild(div3);    
  node_table.appendChild(div);
}

function updateLauncherPickInterfaceMode()
{

  var tr = document.createElement("tr");
  
  var td1 = document.createElement("td");
  
  var div = document.createElement("div");
  div.setAttribute("id", "pickModeDiv");

  
  var div1 = document.createElement("div");
  div1.innerHTML = "<strong>SiteLauncher Setup</strong><p>Would you like to enable keyboard letter keys to open shortcuts or prefer to use standard navigation?</p>";
  div1.setAttribute("id", "noShortcutsMsgPart1");
  
  var div2 = document.createElement("div");
  div2.innerHTML = "Enable Keyboard Shortcuts";
  div2.setAttribute("id", "noShortcutsMsgPart2");

  div2.addEventListener("mouseup", event_enableKeyboardModeClicked, false);  

  
  var div3 = document.createElement("div");
  div3.innerHTML = "Use Standard Navigation";
  div3.setAttribute("id", "noShortcutsMsgPart4");  

  div3.addEventListener("mouseup", event_enablePointModeClicked, false);
  td1.appendChild(div3);
  
  
  var div4 = document.createElement("div");
  div4.innerHTML = "You can always change your preference later using SiteLauncher's Options page.";
  div4.setAttribute("id", "noShortcutsMsgPart5");  

  td1.appendChild(div4);
  
  div.appendChild(div1);
  div.appendChild(div2);
  div.appendChild(div3);    
  div.appendChild(div4);  
  
  td1.appendChild(div);
  
  tr.appendChild(td1);
  
  node_table.appendChild(tr);
}

function updateLauncherWithGroups()
{    
  open_shortcuts_new_tab = getPref("sl-open-new-tab");
  
  var showTitles = !getPref("sl-hide-titles");
  var showKeys = !getPref("sl-hide-keys");
 
  // remove old elements if present
  deleteAllChildNodes(node_table);
  
  if(!getPref("sl-interface-mode-picked"))
  {
    updateLauncherPickInterfaceMode();
    return;
  }
  
  // show no shortcuts message if applicable
  if(items.length === 0)
  {
    updateLauncherToNoShortcutsMessage();
    return;
  }
  
  var numCols = 3;
  
  var numPopulatedGroups = 0;
  for(var i = 0; i < groups.length; i++)
  {
    if(groups[i].items.length > 0)
    {
      numPopulatedGroups++;
    }
  }
  
  var showHeaders = (numPopulatedGroups > 1);
    
  for(var i = 0; i < groups.length; i++)
  {
    if(groups[i].items.length === 0)
    {
      continue;
    }
  
    if(showHeaders)
    {
      var tr_header = document.createElement("tr");
      tr_header.setAttribute("class", "launcher_header_row");
      
      var th_header = document.createElement("th"); 
      th_header.setAttribute("colspan", "3");    
      th_header.innerText = groups[i].name.replace(" [General]", "");   
      tr_header.appendChild(th_header);
      
      document.getElementById("launcher_table").appendChild(tr_header);
    }

    var groupItems = groups[i].items;
    
    var rowTr = document.createElement("tr");
    
    for(var x = 0; x < groupItems.length; x++)
    {
      // build shortcut cell for item

      var item = groupItems[x];

      var td = document.createElement("td");   
	  
      td.setAttribute("class", "shortcut-td-cell");

      if(showKeys && showTitles)
      {
        td.style.setProperty("max-width", "200px", null);
        td.style.setProperty("min-width", "120px", null);
      }
      else if(!showTitles && showKeys)
      {
        td.style.setProperty("max-width", "50px", null);
        td.style.setProperty("min-width", "50px", null);
      }


      td.setAttribute("__itemId", item[SL_ATTR_ID]);
      td.setAttribute("id", "shortcut-td-cell-" + item[SL_ATTR_ID]);
      td.setAttribute("__url", item[SL_ATTR_URL])
      td.addEventListener("mousedown", processShortcutClick, false);
    
      if(showKeys)
      {
        var span_letter = document.createElement("span");
        if(item[SL_ATTR_KEY] === "")
        {
          span_letter.setAttribute("__noKey", "true");
        }
        span_letter.className = "site-letter"; 
        span_letter.innerText = item[SL_ATTR_KEY] !== "" ? item[SL_ATTR_KEY] : "";  
        td.appendChild(span_letter);
      }

      var img = document.createElement("div");
      img.setAttribute("class", "site-icon-img");
      img.style.setProperty("background-image", "url(" + getIconData(item[SL_ATTR_URL]) + ")", null);
      td.appendChild(img);
      
      if(showTitles)
      {
		var span_div = document.createElement("div");
		span_div.setAttribute("class", "span_div");
        var span_desc = document.createElement("a");
		span_div.appendChild(span_desc);
        span_desc.innerText = item[SL_ATTR_NAME];  
        td.appendChild(span_div);
      }
      
      rowTr.appendChild(td);
     
      // start new row / append old one if required
      if(x !== 0 && (x + 1) % numCols === 0)
      {
        document.getElementById("launcher_table").appendChild(rowTr);
        rowTr = document.createElement("tr");
      }
    }
   
    
    // build empty tds for last column (to facilitate keyboard arrow navigation)
    if(groupItems.length % 3 !== 0)
    {
      var cells_last_row = 3 - (groupItems.length % 3);
      for(var x = 0; x < cells_last_row; x++)
      {
        var td = document.createElement("td");   
        td.setAttribute("class", "shortcut-td-cell");
        td.setAttribute("__itemId", "-20" + i + x);
        td.setAttribute("id", "shortcut-td-cell-" + "-20" + i + x);
        td.setAttribute("__url", "")
        
        rowTr.appendChild(td);
      }
      document.getElementById("launcher_table").appendChild(rowTr);
    }
  }
    
}
  
function processKeyPress(e)
{  
  var KeyID = e.keyCode;
  var showKeys = !getPref("sl-hide-keys");
  
  if(KeyID === KEY_LEFT || (!showKeys && KeyID === keycode_a) || (!showKeys && KeyID === KEY_NUM4))
  {
    uiSelector.selectItemSiblingPrev();
    return;
  }

  if(KeyID === KEY_RIGHT || (!showKeys && KeyID === keycode_d)  || (!showKeys && KeyID === KEY_NUM6))
  {
    uiSelector.selectItemSiblingNext();
    return;
  }

  if(KeyID === KEY_UP  || (!showKeys && KeyID === keycode_w)   || (!showKeys && KeyID === KEY_NUM8))
  {
    uiSelector.selectPrevItem();
    return;
  }

  if(KeyID === KEY_DOWN  || (!showKeys && KeyID === keycode_s)  || (!showKeys && KeyID === KEY_NUM2))
  {
    uiSelector.selectNextItem();
    return;
  }
  
  if(KeyID === KEY_TAB)
  {
    showShortcutManagement(open_shortcuts_new_tab);
    return;
  }

  if(KeyID === KEY_ENTER || KeyID === KEY_INSERT || KeyID === KEY_NUM0 || KeyID === KEY_SPACE || (!showKeys && (KeyID === keycode_e)))
  {
    openURLOfSelectedItem();
    return;
  }   
  
  var target_url = null;
  
  if(showKeys)
  {
    for(var i = 0; i < items.length; i++)
    {
      if(items[i][SL_ATTR_KEY].toUpperCase().charCodeAt(0) == KeyID)
      {
        target_url = items[i][SL_ATTR_URL];
        
        openUrlThenCloseLauncher(target_url, !!open_shortcuts_new_tab);
        return;    
      }
    }
  }
}

function processShortcutClick(e)
{
  var target;
  if(e.currentTarget)
  {
    target = e.currentTarget;
  }
  else if(e.toElement)
  {
    target = e.toElement;
  }
  else
  {
    return;
  }
  
  e.cancelBubble = true;
  e.preventDefault();
  
  __processShortcutClick(e, target);
}

function __processShortcutClick(e, target)
{
  // invert open new tab option if middle click or ctrl key held down
  if(e.button === 1 || e.ctrlKey || e.shiftKey)
  {
    var target_url = target.getAttribute("__url");
    openUrlThenCloseLauncher(target_url, !open_shortcuts_new_tab);
  }
  else if(e.button === 0)
  {
    var target_url = target.getAttribute("__url");
    openUrlThenCloseLauncher(target_url, open_shortcuts_new_tab);  
  }  
  else if(e.button === 2)
  { 
    e.preventDefault();
    var target_id = target.getAttribute("__itemId");
    // var target_id = target.getAttribute("__itemId");
    showShortcutManagement(open_shortcuts_new_tab, target_id);
    return true;
  }
}

function handleLauncherContainerClick(e)
{
  if(e.button === 2)
  {
    e.preventDefault();
    showShortcutManagement(open_shortcuts_new_tab);
    return true;
  }
}

function init_launcher()
{ 
  if(!already_initd)
  {
    // set theme
  
    var theme_mode = getPref("sl-launcher-theme");
    
    // for backwards compatibility make sure theme still supported in this version
    // and if not use default theme instead
    if(theme_mode !== 6  &&  theme_mode !== 7  &&  theme_mode !== 8 && 
       theme_mode !== 20  &&  theme_mode !== 21  &&  theme_mode !== 22 && 
       theme_mode !== 23 && theme_mode !== 24)
    {
      theme_mode = 6;
    }


    // custom image theme
    if(theme_mode === 21)
    {
      
	  var img_part2 = "";
	  var img_part3 = "";
	  if(getPref("sl-custom-bg-split"))
	  {
	    img_part2 = getPref("sl-custom-bg-image2");
		img_part3 = getPref("sl-custom-bg-image3");
	  }
	  document.getElementById("launcher_container").style.setProperty("background-image", "url(" + getPref("sl-custom-bg-image") + img_part2 + img_part3 + ")", null);
      document.getElementById("launcher_container").style.setProperty("background-size", "auto 110%", null); 
      document.getElementById("launcher_container").style.setProperty("background-position", "center center", null);		
      document.getElementById("launcher_container").style.setProperty("background-repeat", "repeat", null); 
      
      
      if(getPref("sl-custom-bg-overlay"))
      {
        if(getPref("sl-text-shade"))
        {
          document.body.setAttribute("class", "lightTextOverlay");
        }
        else
        {
          document.body.setAttribute("class", "darkTextOverlay");
        }
      }
      else
      {
        if(getPref("sl-text-shade"))
        {
          document.body.setAttribute("class", "lightText");
        }
        else
        {
          document.body.setAttribute("class", "darkText");
        }
      }
    }
    
    document.body.setAttribute("__theme", theme_mode);
  }

  updateLauncherWithGroups();
  
  if(uiSelector !== undefined)
  {
    delete uiSelector;
  }
  
  uiSelector = new UISelector();
  uiSelector.setContainerNode(node_table);
  uiSelector.setItems(items);
  uiSelector.setIdAttrName("__itemId");
  uiSelector.setItemDomIdPrefix("shortcut-td-cell-");
  uiSelector.setItemDomSelectedAttr("__selected", "true");

  uiSelector.selectFirstItem();

  already_initd = true;
}

function openURLOfSelectedItem()
{
  var item = uiSelector.getSelectedItemNode();
  
  if(item !== null)
  {
    var url = item.getAttribute("__url");
    
    if(url === "")
    {
      return;
    }
    
    openUrlThenCloseLauncher(url, !!open_shortcuts_new_tab);
  }
}

function event_manageShortcutsClicked(e)
{
  if(e.button !== 1 && e.button !== 0)
  {
    return;
  }

  showShortcutManagement(e.button === 1);
}

function event_optionsClicked(e)
{
  if(e.button !== 1 && e.button !== 0)
  {
    return;
  }

  openUrlThenCloseLauncher("options.html#options", e.button === 1);
}

function event_assignDefaultsClicked(e)
{
  e.cancelBubble = true;
  e.preventDefault();
  assignDefaultsShortcuts();
}

function event_enableKeyboardModeClicked(e)
{
  e.cancelBubble = true;
  e.preventDefault();
  setPref("sl-interface-mode-picked", 1); 
  setPref("sl-hide-keys", 0);
  window.close();
}

function event_enablePointModeClicked(e)
{
  e.cancelBubble = true;
  e.preventDefault();
  setPref("sl-interface-mode-picked", 1); 
  setPref("sl-hide-keys", 1);
  window.close();
}

function showShortcutManagement(openNewTab, selectShortId)
{
  if(typeof selectShortId !== "undefined")
  {
     openUrlThenCloseLauncher("options.html#id" + selectShortId, openNewTab);
  }
  else
  {
    openUrlThenCloseLauncher("options.html", openNewTab);
  } 
}

function createShortcutToCurrentPage()
{
  chrome.extension.sendMessage({request: CMD_SHORTCUT_PAGE});
  setTimeout(function(e){window.close();}, 1000);
}

function assignDefaultsShortcuts()
{
  chrome.extension.sendMessage({request: CMD_ASSIGN_DEFAULT_SHORTCUTS});
  
  if(isMacPlatform())
  {
    // mac redraws panel buggy, hence just close launcher on defaults assigned
    window.close();
    return;
  }
  
  setTimeout(function(e){init()}, 1000);
}

function openUrlThenCloseLauncher(url, newtab)
{
  if(url === "[ShortcutPage]" || url === "chrome://sitelauncher/add-shortcut")
  {
    createShortcutToCurrentPage();
    return;
  }
  
  if(url === "options.html" || url.match(/^options.html#id/) !== null)
  {
    // reuse manage tab if existing
    chrome.tabs.query({"windowId": window.WINDOW_ID_CURRENT, "url":chrome.extension.getURL("options.html")}, 
      function(response)
      {
        if(response.length)
        {
          chrome.tabs.update(response[0].id, {"selected": true, "url": chrome.extension.getURL(url)},
            function(e){chrome.tabs.reload(response[0].id);});
        }
        else
        {
          if(!newtab)
          {
            chrome.extension.sendMessage({request: CMD_OPEN_URL, url: chrome.extension.getURL(url), "newtab": false});
          }
          else
          {
            chrome.extension.sendMessage({request: CMD_OPEN_URL, url: chrome.extension.getURL(url), "newtab": true});
          }
        }
        
        setTimeout(function(e){window.close();}, 100);
      }); 
      
      return;
  }
  
  if( url.match(/^chrome:\/\/sitelauncher/) !== null)
  {
    // reuse manage tab if existing
    chrome.tabs.query({"windowId": window.WINDOW_ID_CURRENT, "url":chrome.extension.getURL("options.html")}, 
      function(response)
      {
        if(response.length)
        {
          chrome.tabs.update(response[0].id, {"selected": true, "url": chrome.extension.getURL("options.html")},
            function(e){chrome.tabs.reload(response[0].id);});
        }
        else
        {
          if(!newtab)
          {
            chrome.extension.sendMessage({request: CMD_OPEN_URL, url: chrome.extension.getURL("options.html"), "newtab": false});
          }
          else
          {
            chrome.extension.sendMessage({request: CMD_OPEN_URL, url: chrome.extension.getURL("options.html"), "newtab": true});
          }
        }
        
        setTimeout(function(e){window.close();}, 100);
      }); 
      
      return;
  }
  
  if(url === "options.html#options")
  {
    // reuse manage tab if existing and just focus options pane
    chrome.tabs.query({"windowId": window.WINDOW_ID_CURRENT, "url":chrome.extension.getURL("options.html")}, 
      function(response)
      {
        if(response.length)
        {
          chrome.tabs.update(response[0].id, {"selected": true, "url": chrome.extension.getURL("options.html#options")},
            function(e){chrome.tabs.reload(response[0].id);});
        }
        else
        {
          if(!newtab)
          {
            chrome.extension.sendMessage({request: CMD_OPEN_URL, url: chrome.extension.getURL("options.html#options"), "newtab": false});
          }
          else
          {
            chrome.extension.sendMessage({request: CMD_OPEN_URL, url: chrome.extension.getURL("options.html#options"), "newtab": true});
          }
        }
        
        setTimeout(function(e){window.close();}, 100);
      }); 
      
      return;
  }
  


  if(!newtab)
  {
    chrome.extension.sendMessage({request: CMD_OPEN_URL, url: url, "newtab": false});
  }
  else
  {
    chrome.extension.sendMessage({request: CMD_OPEN_URL, url: url, "newtab": true});
  }
  
  setTimeout(function(e){window.close();}, 100);
}

document.addEventListener( "DOMContentLoaded", init, false );
document.addEventListener('keydown', processKeyPress, false);