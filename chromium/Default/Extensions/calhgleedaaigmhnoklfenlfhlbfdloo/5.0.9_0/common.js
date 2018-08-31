/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */
function putMainGroupIntoFirstPosition(_groups)
{
  var mainIndex = null;
  var mainGroup = null;
  for(var i = 0; i < _groups.length; i++)
  {
    if(isMainGroup(_groups[i]))
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
}

function isMainGroup(group)
{
  var nameLower = group.name.toLowerCase();
  return (nameLower === "top sites" || nameLower === "general" || nameLower.indexOf("[general]") !== -1);
}

function sort_by_name_alpha(a, b)
{
  var x = a.name.toLowerCase();
  var y = b.name.toLowerCase();
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

function sort_by_desc_alpha(a, b)
{
  var x = a.desc.toLowerCase();
  var y = b.desc.toLowerCase();
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

function isJavascriptURL(_url)
{
  return _url.match(/^\s*javascript:/) !== null;
}

function ShortcutItem(_id, _url, _name, _key, _group_id)
{
  this.id = _id;
  this.url = _url;
  this.name = _name;
  this.key = _key;
  this.group_id = _group_id;
}

function GroupItem(_name, _id)
{
  this.id = _id;
  this.name = _name;
  this.items = new Array();
}

function deleteAllChildNodes(node)
{
  while(node.hasChildNodes())
  {
    node.removeChild(node.firstChild);
  }
}

var _isMacPlatform = null;
function isMacPlatform()
{
  if(_isMacPlatform === null)
  {
    _isMacPlatform = (window.clientInformation.appVersion.match(/Mac\sOS\sX/) !== null);
  }
  
  return _isMacPlatform;
}