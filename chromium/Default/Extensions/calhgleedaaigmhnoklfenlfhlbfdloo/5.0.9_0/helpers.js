/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */
function SLHashTables()
{
  this.items = {};
  
  this.create = function(table, items, index)
  {
    for(var x = 0; x < items.length; x++)
    {
      var item = items[x];
      
      if(item[index] !== null && item[index] !== '')
      {
        this.items[table + item[index]] = item;
      }
    }
  };
  
  this.insert = function(table, id, item)
  {
    this.items[table + id] = item; 
  };
  
  this.get = function(table, id)
  {
    if(typeof this.items[table + id] !== 'undefined')
    {
      return this.items[table + id];
    }
    
    return null;
  };
  
  this.getCaseInsensitive = function(table, id)
  {
    var lcase = id.toLowerCase();
    if(typeof this.items[table + lcase] !== 'undefined')
    {
      return this.items[table + lcase];
    }
    
    var ucase = id.toUpperCase();
    if(typeof this.items[table + ucase] !== 'undefined')
    {
      return this.items[table + ucase];
    }
    
    return null;
  };  
  
  this.remove = function(table, id)
  {
    if(typeof this.items[table + id] !== 'undefined')
    {
      delete this.items[table + id];
    }
  };

  this.clearAll = function()
  {
    this.items = {};
  };
}

function SitelauncherHooks()
{
  this.attached = {};
  
  this.attach = function(hook, func)
  {
    if(typeof this.attached[hook] === 'undefined')
    {
      this.attached[hook] = [];
    }
    
    this.attached[hook].push(func);
  };
  
  this.fire = function(hook, detail)
  {
    if(typeof this.attached[hook] === 'undefined')
    {
      return;
    }
    
    for(var x = 0; x < this.attached[hook].length; x++)
    {
      this.attached[hook][x](detail);
    }
  };  
}
var sitelauncherHooks = new SitelauncherHooks();

function urlHasSpecialIcon(_url)
{
  if(_url === "[ShortcutPage]" || _url === "[manage]" || _url === "options.html" || _url === "options.html#options")
  {
    return true;
  }  
 
  if(_url.match(/^\s*javascript:/) !== null && getRelatedURLForJavascriptShortcut(_url) === null)
  {
    return true; // blank js url
  }
  
  if(_url.indexOf(chrome.extension.getURL("")) !== -1 || _url.indexOf("chrome://") === 0 || _url.indexOf("chrome-extension://")  === 0)
  {
    return true;
  }
  
  if(_url.match(/^\s*javascript:/) === null && (getFullyFormedURL(_url) === null || getFullyFormedURL(_url) === ""))
  {
    return true;
  }
  
  return false;
}

var rand_reload_icon = false;
var randFetchNextIcon = false;
var firstCallOfGetIconData = true;
function getIconData(_url, forceRefetch)
{
  // every now and then force refresh of icon to allow for sites that have updated their favicon 
  if(randFetchNextIcon)
  {
    rand_reload_icon = true;
  }
  else if(window.items && firstCallOfGetIconData) // loaded from launcher
  {
    if(Math.floor((Math.random() * 7)) === 1)
    {
      rand_reload_icon = true;
    }
  }
  else if(window.slData && window.slData.items && firstCallOfGetIconData) // loaded from options window
  {    
    if(Math.floor((Math.random() * 3)) === 1)
    {
      rand_reload_icon = true;
    }
  }
  
  firstCallOfGetIconData = false;
  
  // special icons
  
  if(_url === "[ShortcutPage]" || _url === "[manage]" || _url === "options.html" || _url === "options.html#options" || _url.match(/chrome:\/\/sitelauncher/) !== null)
  {
    return chrome.extension.getURL("images/icon-16px.png");
  }  
  
  if(_url.match(/chrome:\/\/bookmarks/) !== null)
  {
    return "images/star.png";
  }
  
  var js_rel_url = null;
  if(_url.match(/^\s*javascript:/) !== null)
  {
    js_rel_url = getRelatedURLForJavascriptShortcut(_url);
  
    if(js_rel_url !== null)
    {
      _url = js_rel_url;
    }
    else
    {
      _url = js_rel_url;
      return chrome.extension.getURL("images/blank-icon-js.png");  
    }
  }
  
  if(_url.indexOf(chrome.extension.getURL("")) !== -1)
  {
    return chrome.extension.getURL("images/icon-16px.png");
  }
  
  if(_url.indexOf("chrome://") === 0 || _url.indexOf("chrome-extension://")  === 0)
  {
    return "chrome://favicon/" + _url;
  }

  var url = getFullyFormedURL(_url);
  
  // could not parse url, return empty icon
  if(url === "" || url === null)
  {
    return chrome.extension.getURL("images/blank-icon.png");
  }  
  
  // use cached icon if we have it 
  var local_copy = getIconDataFromLocalStorage(url);
  

  
  if(rand_reload_icon)
  {
    randFetchNextIcon = false;
    var oneDayMilliseconds = 86400000;
    if(getIconLastUpdatedFromLocalStorage(url) > (Date.now() - oneDayMilliseconds))
    {
      // icon updated in last 24 hours so schedule next icon to reload instead
      randFetchNextIcon = true;
      rand_reload_icon = false;
    }
  }
  
  
  // fetch icon from original source if we don't already have it
  if((local_copy === "-1" || local_copy === null || forceRefetch || rand_reload_icon) && 
     (window.CALLED_FROM_OPTIONS || (window.SITELAUNCHER_BG_JS || rand_reload_icon)))
  {  
    rand_reload_icon = false;
  
  
    // fetch icon
    extractIconLocationForURL(url, 
      function(icon_location)
      {
        var div = document.getElementById("slIconLoadDiv");
        if(div !== null)
        {
          var img = document.createElement("img");
          
          img.setAttribute("src", icon_location);

          img.onload = function(e)
          {
            var canvas_size = Math.min(Math.max(parseInt(img.width), 16), 48);
          
            var dataURL = getBase64Image(this, canvas_size);
            if(dataURL !== null)
            {
              storeIconDataInLocalStorage(url, dataURL);
              sitelauncherHooks.fire("new-site-icon-ready", url);
            }
            
            this.parentNode.removeChild(this);
            
            storeIconLastUpdatedInLocalStorage(url);
          }; 
          img.onerror = function(e)
          {
            //storeIconDataInLocalStorage(this.getAttribute("__urlsrc"), "-1");
            this.parentNode.removeChild(this);    
          };
          div.appendChild(img);
        }
      });
  }
  
  if(local_copy !== "-1" && local_copy !== null)
  {
    return local_copy;;
  }
  
  // no icon available, use blank
  return chrome.extension.getURL("images/blank-icon.png");
}

function getBase64Image(img, size)
{
  var canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  // copy image to canvas
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);

  var dataURL;
  try
  {
    dataURL = canvas.toDataURL("image/png");
  }
  catch(e)
  {
    dataURL = null;
  }

  return dataURL;
}

function getIconDataFromLocalStorage(key)
{
  return window.localStorage.getItem(key);
}

function storeIconDataInLocalStorage(key, data)
{
  window.localStorage.setItem(key, data);
}

function getIconLastUpdatedFromLocalStorage(url)
{
  return parseInt(window.localStorage.getItem("icon_update_time_" + url));
}

function storeIconLastUpdatedInLocalStorage(url)
{
  window.localStorage.setItem("icon_update_time_" + url, Date.now());
}

function getNormalizedTopUrl(url)
{
  var isHttp = url.match(/^(http|https)+:\/\//i);
  var hasProtocol = url.match(/^[^:]+:/i);
  
  // unknown protocol
  if(hasProtocol && !isHttp)
  {
    return null;
  } 
  
  // if no protocol assume http
  if(!isHttp && !hasProtocol)
  {
    url = 'http://' + url;
  }
  
  var baseURL = url.match(/[a-z0-9]+:\/\/[^\/]+/i)[0]; 
  
  return baseURL + "/";
}

function getFullyFormedURL(url)
{
  var isHttp = url.match(/^(http|https)+:\/\//i);
  var hasProtocol = url.match(/^[^:]+:/i);
  
  // unknown protocol
  if(hasProtocol && !isHttp)
  {
    return null;
  } 
  
  // if no protocol assume http
  if(!isHttp && !hasProtocol)
  {
    url = 'http://' + url;
  }
  
  return url;
}

function getElmAbsTop(elm)
{
  var y = elm.offsetTop;
  
  while(elm.offsetParent)
  {
    y += elm.offsetParent.offsetTop;   
    elm = elm.offsetParent;
  }
  
  return y;
}

function getElmAbsLeft(elm)
{
  var x = elm.offsetLeft;
  while(elm.offsetParent)
  {
    x += elm.offsetParent.offsetLeft;
    elm = elm.offsetParent;
  }
  
  return x;
}

function debug_find_member_in_obj(name, obj)
{
  for(var x in obj)
  {
    if(x.toLowerCase().indexOf(name) !== -1)
    {
      alert(x + " : " + obj[x]);
    }
  }
}

function sl_trim(stringToTrim) 
{
  return stringToTrim.replace(/^\s+|\s+$/g,"");
}

function alertObject(object)
{
  var output = '';
  for (property in object) {
    output += property + ': ' + (object[property] + "").substring(0 , 24) +'; \n';
  }
  alert(output);
}

function consoleLogObject(object)
{
  var output = '';
  for (property in object) {
    output += property + ': ' + (object[property] + "").substring(0 , 24) +'; \n';
  }
  console.log(output);
}

var tld_domains = ["aero","biz","cat","com","coop","edu","gov","info","int","jobs","mil","mobi","museum",
"name","net","org","travel","ac","ad","ae","af","ag","ai","al","am","an","ao","aq","ar","as","at","au","aw",
"az","ba","bb","bd","be","bf","bg","bh","bi","bj","bm","bn","bo","br","bs","bt","bv","bw","by","bz","ca",
"cc","cd","cf","cg","ch","ci","ck","cl","cm","cn","co","cr","cs","cu","cv","cx","cy","cz","de","dj","dk","dm",
"do","dz","ec","ee","eg","eh","er","es","et","eu","fi","fj","fk","fm","fo","fr","ga","gb","gd","ge","gf","gg","gh",
"gi","gl","gm","gn","gp","gq","gr","gs","gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","im",
"in","io","iq","ir","is","it","je","jm","jo","jp","ke","kg","h","ki","km","kn","kp","kr","kw","ky","kz","la","lb",
"lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","mg","mh","mk","ml","mm","mn","mo","mp","mq",
"mr","ms","mt","mu","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nu",
"nz","om","pa","pe","pf","pg","ph","pk","pl","pm","pn","pr","ps","pt","pw","py","qa","re","ro","ru","rw",
"sa","sb","sc","sd","se","sg","sh","si","sj","sk","sl","sm","sn","so","sr","st","su","sv","sy","sz","tc","td","tf",
"tg","th","tj","tk","tm","tn","to","tp","tr","tt","tv","tw","tz","ua","ug","uk","um","us","uy","uz", "va","vc",
"ve","vg","vi","vn","vu","wf","ws","ye","yt","yu","za","zm","zr","zw"];

function generateTitleBasedOnURL(url)
{
  if(url.split(".").length < 2)
  {
    return "";
  }
  
  // functino derives shortcut title suggestion based on domain. not perfect but serves as suggestion that user can edit if they wish
  
  var hostname = url.replace(/[a-z]+:\/\//i, "").replace(/\/.*$/, "");
  
  var names = hostname.split(".");
  var longest_index = 0;
  
  for(var i = 0; i < names.length; i++)
  {
    if(names[i].length > names[longest_index].length)
    {
      longest_index = i;
    }
  }
  
  // if the second from last name is not a tld but not longest, then still use as main title
  // e.g. login.live.com.
  if(tld_domains.indexOf(names[names.length - 2]) === -1)
  {
    var gen_name = capitaliseFirstLetter(names[names.length - 2]);
    
    if(names.length !== 2 && names[0].toLowerCase() !== "www" && names[0].toLowerCase() !== "wwww" && names[0].toLowerCase() !== "en")
    {  
      gen_name += " " + capitaliseFirstLetter(names[0]);
    }

    return gen_name;
  }
  
  // same as above but use third from last even if not longest
  // e.g. news.bbc.co.uk 
  if(names.length > 2 && tld_domains.indexOf(names[names.length - 3]) === -1)
  {
    var gen_name = capitaliseFirstLetter(names[names.length - 3]);
    
    if(names.length !== 3 && names[0].toLowerCase() !== "www" && names[0].toLowerCase() !== "wwww" && names[0].toLowerCase() !== "en")
    {  
      gen_name += " " + capitaliseFirstLetter(names[0]);
    }

    return gen_name;
  }
  
  if(names.length > 2 && longest_index === 1 && names[0].toLowerCase() !== "www" && names[0].toLowerCase() !== "wwww" && names[0].toLowerCase() !== "en") 
  {
    return capitaliseFirstLetter(names[longest_index]) + " " + capitaliseFirstLetter(names[0]);
  }
  
  if(names.length === 2)
  {
    return capitaliseFirstLetter(names[0]);
  }
  
  if(names[longest_index].toLowerCase() !== "www")
  {
    return capitaliseFirstLetter(names[longest_index]);
  }
  
  return capitaliseFirstLetter(names[1]);
}

function capitaliseFirstLetter(str)
{
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRelatedURLForJavascriptShortcut(url)
{
  // todo: maintain hash tables of related urls 

  // this regex is short and sweet for performance sake. 
  // we only fetch the top level of the site, because we don't want to fetch
  // url that might be part of ajax/mvc implementation.
  // we only search first 100 chars (again) for performance sake
  var res = url.substr(0,100).match(/https?:\/\/[^\/]+/);
  
  if(res !== null)
  {
    return res[0] + "/";
  }
  
  return null;
}