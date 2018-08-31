/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */
var OPT_DEFAULTS =
  { "sl-defaults-assigned"   : 0,
    "sl-auto-arrange-groups" : 1,
    "sl-launcher-size"       : 1,
    "sl-launcher-theme"      : 6,
    "sl-overlay-mode"        : 1,    
    "sl-hide-titles"         : 0,
    "sl-hide-keys"           : 0,
    "sl-open-new-tab"        : 0,
    "sl-grouping-on"         : 0,
    "sl-theme-codes-assigned": 0,
    "sl-theme-code-camo"    : 0,
    "sl-theme-code-gold"     : 0,
    "sl-theme-code-phoenix"  : 0,
    "sl-theme-code-camo" : 0,
    "sl-theme-code-pink" : 0,
    "sl-interface-mode-picked": 0,
    "sl-custom-bg-tile": 0,
    "sl-custom-bg-overlay": 1,
    "sl-custom-bg-scale": 1,
    "sl-custom-bg-image": "",
    "sl-show-context-item": 1,
    "sl-bw-toolbar-button": 0,
    "sl-text-shade" : 0,
    "sl-hide-tellfriend-button": 0};

function setPref(name, value)
{
  try
  {
    localStorage.setItem(name, value);
    return true;
  } 
  catch (e)
  {
    console.log("setPref failed:" + e);
  }

  return false;
}

function getPref(name)
{
  try
  {
  
    var value = localStorage.getItem(name);
    
    if(value === null)
    {
      if(typeof OPT_DEFAULTS[name] !== "undefined")
      {
        value = OPT_DEFAULTS[name];
      }
      else
      {
        value = null;
      }
    }

    if("sl-defaults-assigned" === name ||
       "sl-auto-arrange-groups" === name ||
       "sl-launcher-theme" === name ||
       "sl-hide-titles" === name ||
       "sl-hide-keys"   === name ||
       "sl-open-new-tab" === name ||
       "sl-grouping-on" === name ||
       "sl-theme-codes-assigned" === name ||
       "sl-interface-mode-picked" === name || 
       "sl-custom-bg-overlay" === name || 
       "sl-custom-bg-tile" === name || 
       "sl-custom-bg-scale" === name || 
       "sl-show-context-item" === name || 
       "sl-hide-tellfriend-button" === name || 
       "sl-bw-toolbar-button" === name || 
       "sl-text-shade" === name)
     {
       value = parseInt(value);
     }

    return value;
  } 
  catch(e)
  {
    console.log("getPref failed with " + e);
  }

  return null;
}
