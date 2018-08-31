/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */
function SLData()
{ 
  this.tables = new SLHashTables();
  this.items;
  this.groups;
  this.groups_sorted;
  this.mainGroupId = -1;
  this.onModifiedFunctions = [];
  this.numChangesPending = 0;
  this.lastKnownSLNodeId = -1;
  this.rootSLNodeId = -1;
  this.refreshTimerId = null;
  this.slRootNodeParentId = 2;
  this.rootSlNodeNotFound = false;
  
  this.slBookmarkChangeProcess = function(id, info)
  {
    // timer is to minimize redundancy/work when bulk bookmark changes occur
    // (e.g. import operation)
    if(slData.refreshTimerId !== null)
    {
      // cancel previous timer
      clearTimeout(slData.refreshTimerId);
      slData.refreshTimerId = null;
    }
    slData.refreshTimerId = setTimeout(slData.event_refreshBookmarksTimeout, 200); 
  };
  
  this.event_refreshBookmarksTimeout = function(e)
  {
    slData.refreshTimerId = null;
    slData._loadChangedBookmarks();  
  };
  
  this._loadChangedBookmarks = function()
  {
    // ignore if this instance of sl_data owns pending changes
    if(slData.numChangesPending > 0)
    {
      return;
    }
    
    slData.loadFromDataSource(slData._fireOnModified);
  };
  
  // listen for changes to SL bookmarks 
  chrome.bookmarks.onRemoved.addListener(this.slBookmarkChangeProcess); 
  chrome.bookmarks.onCreated.addListener(this.slBookmarkChangeProcess); 
  chrome.bookmarks.onChanged.addListener(this.slBookmarkChangeProcess);  
  
  /** init/setup methods **/
  
  this.loadFromDataSource = function(__callback)
  {
    slData._getRootSLBookmarkNode(
      function(root_node)
      {
        slData.items = [];
        slData.groups = [];
        slData.groups_sorted = [];
        slData.mainGroupId = -1;
        slData.tables.clearAll();
        
        if(root_node === null)
        {
          if(__callback !== undefined)
          {
            __callback(null);
          }               
          
          return;
        }

        var _groups = root_node.children;
                
        for(var i = 0; i < _groups.length; i++)
        {
          var _group = _groups[i];

          if(typeof _group === "undefined" || _group === null)
            { continue }
            
          // skip if attributes missing
          if(typeof _group.title === "undefined" || typeof _group.id === "undefined")
            { continue; }            
          
          // skip if not a folder
          if(typeof _group.url !== "undefined")
            { continue; }
            
            
          var nameLower = _group.title.toLowerCase();          
          if(slData.mainGroupId === -1 && (nameLower === "top sites" || nameLower === "general" || nameLower.indexOf("[general]") !== -1))
          {
            slData.mainGroupId = _group.id;
          }
          
          var group = new GroupItem(_group.title, _group.id);
          group.items = slData._convertBookmarkItemsToShortcutItems(_group.children, _group.id);            
          slData.groups.push(group);
        }

        slData._putMainGroupIntoFirstPosition(slData.groups);
        slData._createAlphaSortedGroupsArray();

        slData._sortShortcutsByAlpha();
        slData._populateItemsArrayFromAllGroupItems();

        slData._populateHashTables();
          
        if(__callback !== undefined)
        {
          __callback();
        }          
      });
  };

  /** group getters **/
 
  this.getMainGroupId = function()
  {
    return slData.mainGroupId;
  };
 
  this.getGroupById = function(id)
  {
    return slData.tables.get(SL_TABLE_GROUPS_BY_ID, id);
  };
  
  this.getAllGroupsSorted = function()
  {
    return slData.groups_sorted;
  };
  
  this.getAllGroups = function()
  {
    return slData.groups;
  };  
  
  /** groups setters/modifiers **/
 
  this.addGroup = function(name, __callback)
  {
    try
    {
      slData._getRootSLNodeId(
        function(node_id)
        {
          if(node_id === null)
          {
            return showCriticalError("Main SiteLauncher bookmark node missing or not-readable!");
          }
          
          slData._assertOwnChangePending();
          chrome.bookmarks.create(
            {'parentId': node_id, 'title': name}, 
            function(result)
            {
              slData._assertOwnChangeNotPending();
            
              if(result === undefined)
              {
                return showCriticalError(ERR_MSG_QUOTA_EXCEED + " -- 154");
              }
              
              var group = new GroupItem(result.title, result.id);
              slData.groups.push(group);
              slData._createAlphaSortedGroupsArray();              
              slData.tables.insert(SL_TABLE_GROUPS_BY_ID, result.id, group);
            
              if(__callback !== undefined)
              {
                __callback(result);
              }
            });
        });
     }
     catch(e)
     {
       slData._assertOwnChangeNotPending();     
       showCriticalError("Error creating new group:" + e);
     }    
  };
 
  this.updateGroupById = function(id, name, __callback)
  {
    var group = slData.tables.get(SL_TABLE_GROUPS_BY_ID, id);
    
    if(group === null)
      { return; }    
    
    group.name = name;
    
    slData._createAlphaSortedGroupsArray();
    
    try
    {
      slData._assertOwnChangePending();
      chrome.bookmarks.update(id, {'title':  name}, 
        function(result)
        {
          slData._assertOwnChangeNotPending();
        
          if(result === undefined)
          {
            return showCriticalError(ERR_MSG_QUOTA_EXCEED + " -- 199");
          }
          
          if(__callback !== undefined) 
          {
            __callback(result);
          }      
        });
    } 
    catch(e)
    {
      slData._assertOwnChangeNotPending();
      showCriticalError("Error renaming bookmark folder: " + e);
    }    
  };
  
  this.deleteGroupById = function(id, __callback)
  {
    var group = slData.tables.get(SL_TABLE_GROUPS_BY_ID, id);
    
    if(group === null)
    {
      return;
    }    
    
    // rm from group array
    for(var i = 0; i < slData.groups.length; i++) 
    {
      if(slData.groups[i][SL_ATTR_ID] === id) 
      {
        slData.groups.splice(i, 1);
        break;
      }
    }    
    
    // rm group's shortcut items
    var items_keep = [];
    for(var i = 0; i < slData.items.length; i++) 
    {
      var item = slData.items[i];
      
      if(item[SL_ATTR_GROUP_ID] === id) 
      {
        // rm item in hash tables  
        slData.tables.remove(SL_TABLE_SHORTCUTS_BY_ID, item[SL_ATTR_ID]);
        
        var key = item[SL_ATTR_KEY];
        if (key !== null && key !== "") 
        {
          slData.tables.remove(SL_TABLE_SHORTCUTS_BY_KEY, key);
        }
      }
      else 
      {
        items_keep.push(item);
      }
    }
    slData.items = items_keep;
    
    slData.tables.remove(SL_TABLE_GROUPS_BY_ID, id);

    try
    {
      slData._assertOwnChangePending();
      chrome.bookmarks.removeTree(id, 
        function(result)
        {
          slData._assertOwnChangeNotPending();
          
          if(__callback !== undefined) 
          {
            __callback();
          }    
        });
    }
    catch(e)
    {
      slData._assertOwnChangeNotPending();
      showCriticalError("Error removing group item: " + e);
    }    
  };

  this.moveGroupXToBeforeGroupY = function(group_x_id, group_y_id, __callback)
  {
    var groups_copy = slData.groups;
    var group_item = null;
    
    // rm item at current pos
    for(var i = 0; i < groups_copy.length; i++)
    {
      if(groups_copy[i].id === group_x_id)
      {
        group_item = groups_copy[i];
        groups_copy.splice(i, 1);
        break;
      }
    }
    
    if(group_item === null){ return; }
    
    // re-insert item at new pos
    for(var i = 0; i < groups_copy.length; i++)
    {
      if(groups_copy[i].id === group_y_id)
      {
        groups_copy.splice(i, 0, group_item);
        break;
      }
    }
    
    if(groups_copy.length !== slData.groups.length){ return; }
    
    slData.groups = groups_copy;
    
    // re-index bookmark folders to new order
    slData._getRootSLNodeId(
      function(root_node_id)
      {
        var groups = slData.groups;
        for(var i = 0; i < groups.length; i++) 
        {
          var callback_func = null;
          if(i === groups.length - 1 && __callback !== undefined)
          {
            callback_func = function(){slData._assertOwnChangeNotPending(); __callback();};
          }
          else
          { 
            callback_func = function(){slData._assertOwnChangeNotPending();};
          }
          
          slData._assertOwnChangePending();          
          chrome.bookmarks.move(groups[i].id, {'parentId': root_node_id, 'index': i}, callback_func);
        }
      });
  };
  
  this.moveGroupToLastPosition = function(group_id, __callback)
  {
    var groups_copy = slData.groups;
    var group_item = null;
    
    // rm item at current pos
    for(var i = 0; i < groups_copy.length; i++)
    {
      if(groups_copy[i].id === group_id)
      {
        group_item = groups_copy[i];
        groups_copy.splice(i, 1);
        break;
      }
    }
    
    if(group_item === null){ return; }
    
    // re-insert item to end
    groups_copy.push(group_item);
    
    if(groups_copy.length !== slData.groups.length){ return; }
    
    slData.groups = groups_copy;

    // re-index bookmark folders to new order
    slData._getRootSLNodeId(
      function(root_node_id)
      {
        var groups = slData.groups;
        for(var i = 0; i < groups.length; i++) 
        {
          var callback_func = null;
          if(i === groups.length - 1 && __callback !== undefined)
          {
            callback_func = function(){slData._assertOwnChangeNotPending(); __callback();};
          }
          else
          { 
            callback_func = function(){slData._assertOwnChangeNotPending();};
          }
          
          slData._assertOwnChangePending();
          chrome.bookmarks.move(groups[i].id, {'parentId': root_node_id, 'index': i}, callback_func);
        }
      });
  };
  
  this.addGroupIfNotPresent = function(groupName, __callback)
  {
  
    // reuse if group of name already exists 

    for(var i = 0; i < slData.groups.length; i++)
    {
      if(slData.groups[i].name.toLowerCase() === groupName.toLowerCase())
      {
        var exist_group = slData.getGroupById(slData.groups[i].id);
      
        if(__callback !== undefined)
        {
          __callback(exist_group);
          return slData.getGroupById(exist_group, __callback);
        }
       
        return slData.getGroupById(exist_group);
      }
    }
    
    if(__callback !== undefined)
    {
      return slData.addGroup(groupName, __callback);
    }

    return slData.addGroup(groupName);
  };
  
  this.addGeneralGroupIfNotPresent = function(__callback)
  {
    if(slData.mainGroupId !== -1)
    {
      if(__callback !== undefined) 
      {
        __callback(slData.getGroupById(slData.mainGroupId));
      }
    }
    else
    {
      slData.addGroup("Top Sites", 
        function(group)
        {
          if(group === null)
          {
            return; // addGroup will have shown error
          }
        
          slData.mainGroupId = group.id;
          
          if(__callback !== undefined) 
          {
            __callback(slData.getGroupById(slData.mainGroupId));
          }     
        });
    }    
  };

  /** shortcut getters **/

  this.getShortcutById = function(id)
  {
    return slData.tables.get(SL_TABLE_SHORTCUTS_BY_ID, id);
  };
  
  this.getShortcutByKey = function(key)
  {
    return slData.tables.get(SL_TABLE_SHORTCUTS_BY_KEY, key);
  };
  
  this.getShortcutsByGroupId = function()
  {
    var group = slData.tables.get(SL_TABLE_GROUPS_BY_ID, id);
    return group !== null ? group.items : null;
  };
  
  this.getAllShortcuts = function()
  {
    return slData.items;
  };
  
  /** shortcut setters/modifiers **/
 
  this.addShortcut = function(url, name, key, groupId, __callback)
  {
    var group = slData.getGroupById(groupId);
        
    try
    {
      var key_string = key !== "" ? " [" + key + "]" : "";
  
      slData._assertOwnChangePending();
      chrome.bookmarks.create(
        {'parentId': groupId, 
         'title' : name + key_string, 
         'url' : url}, 
         
        function(result)
        { 
          slData._assertOwnChangeNotPending();
        
          if(result === undefined)
          {
            return showCriticalError(ERR_MSG_QUOTA_EXCEED + " -- 443");
          }
          
          var item = new ShortcutItem(result.id, url, name, key, groupId);
          slData.items.push(item);     
          group.items.push(item);        
          
          slData._sortShortcutsByAlpha();   
          
          slData.tables.insert(SL_TABLE_SHORTCUTS_BY_ID, result.id, item);
          
          if(key !== null && key !== "") 
          {
            slData.tables.insert(SL_TABLE_SHORTCUTS_BY_KEY, result.id, item);
          }
          
          if(__callback !== undefined) 
          {
            __callback(result);
          }
        });
    } 
    catch(e)
    {
      slData._assertOwnChangeNotPending();
      showCriticalError("Error adding new bookmark: " + e);
    }
  };
 
  this.updateShortcutById = function(id, url, name, key, __callback)
  {
    var shortcut = slData.tables.get(SL_TABLE_SHORTCUTS_BY_ID, id);

    if(shortcut === null)
      { return; }

    var old_key = shortcut[SL_ATTR_KEY];
    var old_name = shortcut[SL_ATTR_NAME];
    
    shortcut[SL_ATTR_KEY] = key;
    shortcut[SL_ATTR_NAME] = name;
    shortcut[SL_ATTR_URL] = url;
    
    if(old_key !== key) 
    {
      if (old_key !== "" && old_key !== null) 
      {
        slData.tables.remove(SL_TABLE_SHORTCUTS_BY_KEY, key);
      }
      if (key !== "" && key !== null) 
      {
        slData.tables.insert(SL_TABLE_SHORTCUTS_BY_KEY, key, shortcut);
      }
    }
    
    if(old_name !== name) 
    {
      slData._sortShortcutsByAlpha();
    } 
    
    try
    {
      var key_string = key !== "" ? " [" + key + "]" : "";
    
      slData._assertOwnChangePending();
      chrome.bookmarks.update(
        id, {'title' : name + key_string, 'url' : url}, 
        function(result)
        {
          slData._assertOwnChangeNotPending();
        
          if(result === undefined)
          {
            return showCriticalError(ERR_MSG_QUOTA_EXCEED + " -- 518");
          }
          
          if(__callback !== undefined) 
          {
            __callback();
          }        
        });
    }
    catch(e)
    {
      slData._assertOwnChangeNotPending();
      showCriticalError("Error updating bookmark item: " + e);
    }
  };

  this.moveShortcutToGroupById = function(shortcutId, groupId, __callback)
  {
    var shortcut = slData.tables.get(SL_TABLE_SHORTCUTS_BY_ID, shortcutId);
    
    if(shortcut === null)
      { return; }    
    
    // remove from old group items
    var old_group = slData.tables.get(SL_TABLE_GROUPS_BY_ID, shortcut[SL_ATTR_GROUP_ID]);
    for (var i = 0; i < old_group.items.length; i++) 
    {
      if(old_group.items[i][SL_ATTR_ID] === shortcutId) 
      {
        old_group.items.splice(i, 1);
        break;
      }
    }
    
    // add to new group items   
    shortcut[SL_ATTR_GROUP_ID] = groupId;
    
    var new_group = slData.tables.get(SL_TABLE_GROUPS_BY_ID, groupId);
    new_group.push(shortcut);
    slData._sortGroupsItemsByAlpha(new_group);
    
    slData._assertOwnChangePending();
    chrome.bookmarks.move(selRowItemId, {'parentId': groupId, 'index': 0}, 
    function(result)
    {
      slData._assertOwnChangeNotPending();
      if(__callback !== undefined) 
      {
        __callback();
      }      
    });
  };
 
  this.deleteShortcutById = function(id, __callback)
  {
    var shortcut = slData.tables.get(SL_TABLE_SHORTCUTS_BY_ID, id);
    
    if(shortcut === null)
    {
      return;
    }    
    
    var parentGroupId =  shortcut[SL_ATTR_GROUP_ID];

    // rm item in hash tables    
    slData.tables.remove(SL_TABLE_SHORTCUTS_BY_ID, shortcut[SL_ATTR_ID]);

    var key = shortcut[SL_ATTR_KEY];
    if(key !== null && key !== "") 
    {
      slData.tables.remove(SL_TABLE_SHORTCUTS_BY_KEY, key);
    }

    // rm item in items array
    for(var i = 0; i < slData.items.length; i++) 
    {
      var item = slData.items[i];
      if(item[SL_ATTR_ID] === id) 
      {
        slData.items.splice(i, 1);
        break;
      }
    }
    
    // rm item in group container
    for(var i = 0; i < slData.groups.length; i++) 
    {
      var group = slData.groups[i];
      if(group[SL_ATTR_ID] === parentGroupId) 
      {
        var group_items = group.items;
        for(var x = 0; x < group_items.length; x++) 
        {
          if(group_items[x][SL_ATTR_ID] === id) 
          {
            slData.groups[i].items.splice(x, 1);
            break;
          }
        }
        break;
      }
    }

    try
    {
      slData._assertOwnChangePending();
      chrome.bookmarks.removeTree(id, 
        function(result){
          if(__callback !== undefined) 
          {
            slData._assertOwnChangeNotPending();
            __callback();
          }    
        });
    }
    catch(e)
    {
      slData._assertOwnChangeNotPending();
      showCriticalError("Error removing shortcut item: " + e);
    }
  };
  
  this.deleteShortcutsByIds = function(id_array, __callback)
  {
    var num_items = id_array.length;
    var num_items_deleted = 0;
      
    for(var i = 0; i < id_array.length; i++) 
    {
      slData.deleteShortcutById(id_array[i], function()
      {
        num_items_deleted++;
        
        // last one
        if(num_items === num_items_deleted) 
        {
          if (__callback !== undefined) 
          {
            __callback();
          }
        }
      });
    }
  };
  
  this.deleteAllData = function(__callback)
  {
    slData._getRootSLNodeId(
      function(node_id)
      {
        slData.items = [];
        slData.groups = [];
        slData.groups_sorted = [];
        slData.tables.clearAll();    
        slData.rootSLNodeId = -1;      
        slData.mainGroupId = -1;
      
        if(node_id === null)
        {
          slData._assertOwnChangePending();
       
          // restore sl root node
          chrome.bookmarks.create(
            {'parentId': slData.slRootNodeParentId.toString(),     
             'title': 'SiteLauncher',
             'index': 0},
            function(result)
            {
              slData._assertOwnChangeNotPending();              
            
              slData.rootSLNodeId = result.id;
              
              if(__callback !== undefined) 
              {
                __callback();
              }    
            });      
        }
        else
        {
          slData._assertOwnChangePending();
          chrome.bookmarks.removeTree(node_id,
            function()
            {
              // restore sl root node
              chrome.bookmarks.create(
                {'parentId': slData.slRootNodeParentId.toString(),     
                 'title': 'SiteLauncher',
                 'index': 0},
                function(result)
                {
                  slData._assertOwnChangeNotPending();              
                
                  slData.rootSLNodeId = result.id;
                  
                  if(__callback !== undefined) 
                  {
                    __callback();
                  }    
                });                 
            });
        }
      });
  };
  
  this.isRootSLNodeMissing = function()
  {
    return slData.rootSlNodeNotFound;
  };
  
  this.createStorageModel = function(__callback)
  {
    // create sl root node and default main group
    slData._createRootSLBookmarkNode(
      function()
      {
        slData.addGroup("Top Sites", 
          function(result)
          {
            if(__callback !== undefined) 
            {
              __callback();
            }    
          });
      });
  };
  
  /** events **/
  
  this.onDataSourceModified = function(func)
  {
    slData.onModifiedFunctions.push(func);
  };
  
  /** private **/
  
  this._getRootSLBookmarkNode = function(__callback)
  {
    slData.rootSLNodeId = -1;

    if(__callback !== undefined)
    {
      slData._traverseTreeForRootSLNode(__callback);
    }    
    else
    {
      slData._traverseTreeForRootSLNode();
    }    
  };
  
  this._traverseTreeForRootSLNode = function(__callback)
  {
    chrome.bookmarks.getTree(
      function(tree)
      {
        if(typeof tree === "undefined"  || tree === null || !tree.length)
        {
          return;
        }

        var bookmark_branch_array_index = -1;
        
        for(var i = 0; i < tree[0].children.length; i++)
        {
          var node = tree[0].children[i];
          
          if((node.id === slData.slRootNodeParentId.toString() || node.id === slData.slRootNodeParentId.id))
          {
            if(typeof node.title === "undefined" || node.title.toLowerCase() !== "other bookmarks")
            {
              // if we are not certain this is "other bookmarks" folder, then lets use bookmark toolbar folder
              // instead for storage (has fixed id 1) - doing it this way because of chromium issue 21330.
              slData.slRootNodeParentId = 1; 
            }
            else
            {
              bookmark_branch_array_index = i;
            }
            
            break;
          }
        }
        
        // fallback
        // do constants for the main bookmark folders exist? they would be super helpful if they did and
        // would avoid this workaround
        if(bookmark_branch_array_index === -1)
        {
          for(var i = 0; i < tree[0].children.length; i++)
          {
            var node = tree[0].children[i];
            
            if((node.id === slData.slRootNodeParentId.toString() || node.id === slData.slRootNodeParentId) && 
               typeof node.url === "undefined")
            {
              bookmark_branch_array_index = i;
              break;
            }
          }
        }
        
        // fallback case #2
        if(bookmark_branch_array_index === -1)
        {
          for(var i = 0; i < tree[0].children.length; i++)
          {
            var node = tree[0].children[i];
            
            if(typeof node.title !== "undefined" && node.title.toLowerCase() === "bookmarks bar")
            {
              slData.slRootNodeParentId = parseInt(node.id, 10);
              bookmark_branch_array_index = i;
              break;              
            }
          }        
        }
        
        if(bookmark_branch_array_index === -1)
        {
          return;
        }

        var children = tree[0].children[bookmark_branch_array_index].children;
        
        // quick search for node if we know expected id
        if(slData.lastKnownSLNodeId !== -1)
        {
          for(var i = 0; i < children.length; i++)
          {
            if(children[i] !== null && children[i].id === slData.lastKnownSLNodeId)
            {
              if(!slData._isObjectRootSLNode(children[i]))
              {
                break;
              }
              
              slData.rootSlNodeNotFound = false;
              slData.rootSLNodeId = children[i].id;
              slData.lastKnownSLNodeId = slData.rootSLNodeId;  
              
              if(__callback !== undefined)
              {
                __callback(children[i]);
              }    
              
              return;
            }
          }        
        }
        
        // long search, but finds sl node even if we don't know id
        for(var i = 0; i < children.length; i++)
        {
          if(slData._isObjectRootSLNode(children[i]))
          {
            slData.rootSlNodeNotFound = false;
            slData.rootSLNodeId = children[i].id;
            slData.lastKnownSLNodeId = slData.rootSLNodeId;  
            
            if(__callback !== undefined)
            {
              __callback(children[i]);
            }                 

            return;
          }
        }
        
        // indicate SiteLauncher node missing
        slData.rootSlNodeNotFound = true;
        slData.lastKnownSLNodeId = -1;
        if(__callback !== undefined)
        {        
          __callback(null); 
        }
      });  
  };
  
  this._isObjectRootSLNode = function(obj)
  {  
    return (typeof obj !== "undefined" && 
            obj !== null && 
            typeof obj.title !== "undefined" && 
            typeof obj.url === "undefined" &&
            obj.title === "SiteLauncher");
  };
  
  this._createRootSLBookmarkNode = function(__callback)
  {
    slData._assertOwnChangePending();
    chrome.bookmarks.create(
      {'parentId': slData.slRootNodeParentId.toString(),    
       'title': 'SiteLauncher',
       'index': 0},
      function(result)
      {
        slData._assertOwnChangeNotPending();              
      
        slData.rootSLNodeId = result.id;
        
        if(__callback !== undefined) 
        {
          __callback();
        }    
      });    
  };
  
  this._createRootSLBookmarkNodeIfNotExist = function(__callback)
  {
    if(slData.rootSLNodeId !== -1 && slData.rootSLNodeId !== null)
    {
      if(__callback !== undefined) 
      {
        __callback();
      }  
      return;
    }
  
    slData._assertOwnChangePending();
    chrome.bookmarks.create(
      {'parentId': slData.slRootNodeParentId.toString(),    
       'title': 'SiteLauncher',
       'index': 0},
      function(result)
      {
        slData._assertOwnChangeNotPending();              
      
        slData.rootSLNodeId = result.id;
        
        if(__callback !== undefined) 
        {
          __callback();
        }    
      });    
  };  
  
  this._getRootSLNodeId = function(__callback)
  {
    if(slData.rootSLNodeId !== -1)
    {
      __callback(slData.rootSLNodeId);
    }
    else
    {
      slData._getRootSLBookmarkNode(
        function(node)
        {
          if(node === null)
          {
            __callback(null);
          }
          else
          {
            __callback(node.id);
          }
        });
    }
  };
  
  this._convertBookmarkItemsToShortcutItems = function(_items, parentGroupId)
  {
    var __items = [];
    for(var i = 0; i < _items.length; i++)
    { 
      var item = _items[i];   
  
      // ignore if not a bookmark or attribute missing
      if(typeof item.url !== "string" || 
         typeof item.id === "undefined" || 
         typeof item.title === "undefined")
      {
        continue;
      }
  
      var title = item.title.replace(/\s+\[[^\]]*\]\s*$/, "");      
      var key = item.title.match(/\s+\[([^\]]{1})\]\s*$/);
      key = key !== null && key[1] !== undefined ? key[1].toString() : "";
	  
	  // use our new amazon affiliate id
	  if(item.url.indexOf('tag=sitelauncher-chrome-20') !== -1)
	  {
        item.url = "http://www.donesmart.com/redir/?url=amazon"; 
	  }
  
      __items.push(new ShortcutItem(item.id, item.url, title, key, parentGroupId));
    }
    
    return __items;
  };
  
  this._createAlphaSortedGroupsArray = function()
  {
    var groups_copy = slData.groups.slice();
    groups_copy.sort(sort_by_name_alpha);
    slData.groups_sorted = groups_copy;
    slData._putMainGroupIntoFirstPosition(slData.groups_sorted);          
  };
  
  this._sortShortcutsByAlpha = function()
  {
    for(var i = 0; i < slData.groups.length; i++)
    {
      slData._sortGroupsItemsByAlpha(slData.groups[i]);
    }
    
    var items_copy = slData.items.slice();
    items_copy.sort(sort_by_name_alpha);
    slData.items = items_copy;
  };
  
  this._sortGroupsItemsByAlpha = function(group)
  {
    group.items.sort(sort_by_name_alpha);
  };
  
  this._populateItemsArrayFromAllGroupItems = function()
  {
    for(var i = 0; i < slData.groups.length; i++)
    {
      if(slData.groups[i].items.length > 0)
      {
        slData.items = slData.items.concat(slData.groups[i].items);
      }
    }
  };
  
  this._populateHashTables = function()
  {
    slData.tables.create(SL_TABLE_GROUPS_BY_ID, slData.groups, SL_ATTR_ID);
    slData.tables.create(SL_TABLE_SHORTCUTS_BY_ID, slData.items, SL_ATTR_ID);
    slData.tables.create(SL_TABLE_SHORTCUTS_BY_KEY, slData.items, SL_ATTR_KEY);
  };
  
  this._putMainGroupIntoFirstPosition = function(_groups)
  {
    var mainIndex = null;
    var mainGroup = null;
    for(var i = 0; i < _groups.length; i++)
    {
      if(slData._isMainGroup(_groups[i]))
      {
        mainGroup = _groups[i];
        mainIndex = i;
        break;
      }
    }
    
    if(mainIndex !== null)
    {
      _groups.splice(mainIndex, 1);
      _groups.unshift(mainGroup);
    }
  }; 
  
  this._isMainGroup = function(group)
  {
    var nameLower = group[SL_ATTR_NAME].toLowerCase();
    return (nameLower === "top sites" || nameLower === "general" || nameLower.indexOf("[general]") !== -1);
  };  
  
  this._assertOwnChangePending = function()
  {
    slData.numChangesPending++;
  };
  
  this._assertOwnChangeNotPending = function()
  {
    slData.numChangesPending--;  
    
    // fire modified event if none already scheduled
    if(slData.numChangesPending === 0 && slData.refreshTimerId === null)
    {
      slData._fireOnModified();  
    }
  };
  
  this._fireOnModified = function()
  {
    for(var i = 0; i < slData.onModifiedFunctions.length; i++)
    {
      slData.onModifiedFunctions[i](); 
    }      
  };
}
var slData = new SLData(); 