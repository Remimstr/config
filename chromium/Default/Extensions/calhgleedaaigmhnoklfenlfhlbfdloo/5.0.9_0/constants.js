/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */
if(!window.sitelauncherConstantsDefined)
{
  window.sitelauncherConstantsDefined = true;
  
  // the above check doesn't always seem to work, perhaps because of concurrent threads?
  // for that reason we don't actually use real constants
  
  try
  {
    var KEY_TAB = 9;
    var KEY_SPACE = 32;
    var KEY_ESCAPE = 27;
    var KEY_ENTER = 13;
    var KEY_LEFT = 37;
    var KEY_RIGHT = 39;
    var KEY_UP = 38;
    var KEY_DOWN = 40;
    var KEY_HOME = 36;
    var KEY_END = 35;
    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    var KEY_DEL = 46;
    var KEY_NUM0 = 96;  
    var KEY_NUM1 = 97;      
    var KEY_NUM2 = 98;      
    var KEY_NUM3 = 99;      
    var KEY_NUM4 = 100;        
    var KEY_NUM5 = 101;      
    var KEY_NUM5_LOCK = 12;       
    var KEY_NUM6 = 102;            
    var KEY_NUM7 = 103;        
    var KEY_NUM8 = 104;    
    var KEY_NUM9 = 105;  
    var KEY_INSERT = 45;      
    
    var CMD_CLOSE_LAUNCHER = "close-launcher";
    var CMD_LAUNCHER_KEY_PRESS = "launcher-key-press";
    var CMD_OPEN_URL = "open-url";
    var CMD_GET_SHORTCUT_DATA = "shortcut-data";
    var CMD_TREE_IS_BUSY = "busy-start";
    var CMD_TREE_IS_NO_LONGER_BUSY = "busy-end";
    var CMD_NOTIFY_BOOKMARKS_UPDATED = "updateBookmarks";
    var CMD_OPEN_LAUNCHER_IN_CURRENT_TAB = "open-launcher-current-tab";
    var CMD_OPEN_LAUNCHER = "open-launcher";
    var CMD_OPEN_OPTIONS = "open-options";
    var CMD_SHORTCUT_PAGE = "shortcut-page";
    var CMD_NOTIFY_NEW_SHORTCUTS = "new-shortcuts-loaded";
    var CMD_CONFIRM_SHORTCUT_ADDED = "confirm-shortcut-added";
    var CMD_ASSIGN_DEFAULT_SHORTCUTS = "assign-default-shortcuts";
    var CMD_CONFIRM_LAUNCHER_CLOSE = "confirm-launcher-close";
    var CMD_UPDATE_SL_CONTEXT_ITEM = "update-sl-context-item";

    var PREF_AUTO_ARRANGE_GROUPS = "sl-auto-arrange-groups";
    
    var SL_ATTR_ID = "id";
    var SL_ATTR_NAME = "name";
    var SL_ATTR_INDEX = "index";
    var SL_ATTR_GROUP_ID = "group_id";
    var SL_ATTR_URL = "url";
    var SL_ATTR_KEY = "key";
    
    var SL_TABLE_GROUPS_BY_ID = "groups_by_id";
    var SL_TABLE_SHORTCUTS_BY_ID = "shortcuts_by_id";
    var SL_TABLE_SHORTCUTS_BY_KEY = "shortcuts_by_key";
    
    var LAUNCHER_FORMAT_DOCKED = 0;
    var LAUNCHER_FORMAT_FLOAT = 1;
  }
  catch(e)
  {
    console.log(e);
  }
}