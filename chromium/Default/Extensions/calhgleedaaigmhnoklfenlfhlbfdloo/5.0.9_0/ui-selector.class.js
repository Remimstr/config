/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */
function UISelector()
{
  this._callbackFuncs = [];
  this._container;
  this._idAttr;
  this._itemDomIdPrefix;
  this._items;
  
  this._selItemId = null;
  this._selItemNode = null;

  // 
  // configuration methods
  //

  // sets the top dom parent that
  // all items are below
  this.setContainerNode = function(node)
  {
    this._container = node;
  };
  
  this.setItems = function(items)
  {
    this._items = items;
  }
  
  // dom attr name that contains
  // unique id for each item.
  // items without this attr will
  // be considered non-selectable
  this.setIdAttrName = function(name)
  {
    this._idAttr = name;
  };
  
  // select callback fires on a new item selected
  this.addSelectCallback = function(func)
  {
    this._callbackFuncs.push(func);
  };
  
  // the dom node id prefix that should 
  // be the same for all selectable 
  // items
  this.setItemDomIdPrefix = function(name)
  {
    this._itemDomIdPrefix = name;
  };
  
  // the dom name/val attr pair that should
  // be applied to an item when selected
  this.setItemDomSelectedAttr = function(name, val)
  {
    this._itemDomSelectedAttr = {"name": name, "value": val};
  }
  
  //
  // selection methods
  // 
  
  this._select = function(id)
  {
    // un-flag prev selected dom node
    if(this._selItemNode !== null)
    {
      this._selItemNode.removeAttribute(this._itemDomSelectedAttr.name);
    }
  
    this._selItemId = id;
    this._selItemNode = document.getElementById(this._itemDomIdPrefix + id);
    this._selItemNode.setAttribute(this._itemDomSelectedAttr.name, this._itemDomSelectedAttr.value);
    
    for(var i = 0; i < this._callbackFuncs.length; i++)
    {
      this._callbackFuncs[i]();
    }
  }
  
  this.selectItemById = function(id)
  {
    this._select(id);
  };

  this.selectItemByAttr = function(attr_name, attr_val)
  {
    var nodes = this.getAllItemNodes();
    for(var i = 0; i < nodes.length; i++)
    {
      if(nodes[i].hasAttribute(attr_name) && nodes[i].getAttribute(attr_name) === attr_val)
      {
        this.selectItemByDomNode(nodes[i + 1])
        break;
      }
    }
  };

  this.selectItemByDomNode = function(node)
  {
    this._select(node.getAttribute(this._idAttr));
  };
  
  this.selectNextItem = function()
  {
    var row_num = this._selItemNode.parentNode.sectionRowIndex;
    var cell_num = this._selItemNode.cellIndex;
    var rows = this._container.rows;

    
    // no more rows
    if(row_num + 1 === rows.length)
    {
      return;
    }
    
    // skip header row
    if(rows[row_num + 1].getAttribute("class") === "launcher_header_row")
    {
      row_num++;
    }

    // no more rows
    if(row_num + 1 === rows.length)
    {
      return;
    }
    
    this.selectItemByDomNode(rows[row_num + 1].cells[cell_num]);
    
    return;
  };
  

  this.selectPrevItem = function()
  {
    var row_num = this._selItemNode.parentNode.sectionRowIndex;
    var cell_num = this._selItemNode.cellIndex;
    var rows = this._container.rows;
    
    // no more rows
    if(row_num === 0)
    {
      return;
    }
    
    // skip header row
    if(rows[row_num - 1].getAttribute("class") === "launcher_header_row")
    {
      row_num--;
    }

    // no more rows
    if(row_num === 0)
    {
      return;
    }
    
    this.selectItemByDomNode(rows[row_num - 1].cells[cell_num]);
    
    return;
  };
  
  this.selectFirstItem = function()
  {
    var nodes = this.getAllItemNodes();  
    
    if(nodes && nodes.length)
    {
      this.selectItemByDomNode(nodes[0]);
    }    
  };

  this.selectItemSiblingNext = function()
  {
    if(this._selItemNode === null)
    {
      return;
    }
    
    // last item in row
    if(this._selItemNode.nextSibling === null)
    {
      return;
    }
    
    this._selectMostAdjacentItemInColumn(this._selItemNode.cellIndex + 1);
  };
  
  this.selectItemSiblingPrev = function()
  {
    if(this._selItemNode === null)
    {
      return;
    }
    
    // first item in row
    if(this._selItemNode.previousSibling === null)
    {
      return;
    }    

    this._selectMostAdjacentItemInColumn(this._selItemNode.cellIndex - 1);
  };
  
  this._selectMostAdjacentItemInColumn = function(target_column)
  {
    if(this._selItemNode === null)
    {
      return;
    }
  
    var rows = this._container.rows;
    var row_num = this._selItemNode.parentNode.sectionRowIndex;
    
    // if sibling node is not selectable item, loop backwards through rows
    // to find last (i.e. closest) selectable cell in target column      
    for(var i = row_num; i > -1; i--)
    {
      var cell = rows[i].cells[target_column];
      
      if(cell.hasAttribute(this._idAttr))
      {
        this.selectItemByDomNode(cell);
        return;
      }    
    }
  }
  
  //
  // getter methods
  //
  
  this.getSelectedItemId = function()
  {
    if(!this.isItemSelected())
    {
      return null;
    }  
    
    return this._selItemId;
  };
  
  this.getSelectedItemNode = function()
  {
    if(!this.isItemSelected())
    {
      return null;
    }  
    
    return this._selItemNode;    
  };
  
  this.getSelectedItemNodeAttr = function(attr_name)
  {
    if(!this.isItemSelected() || !this._selItemNode.hasAttribute(attr_name))
    {
      return null;
    }
    
    return this._selItemNode.getAttribute(attr_name);
  };
  
  this.getAllItemNodes = function()
  {
    var nodes = document.getElementsByTagName("td");
    var items = [];
    
    for(var i = 0; i < nodes.length; i++)
    {
      if(nodes[i].hasAttribute(this._idAttr))
      {
        items.push(nodes[i]);
      }
    }
    
    return items;
  };
  
  this.isItemSelected = function()
  {
    return this._selItemId !== null && this._selItemNode !== null;
  }
}