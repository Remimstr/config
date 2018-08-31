/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */

/* we know this is super easy to bypass/get
   the themes for free; but we ask you to buy the 
   themes instead not because you have to but 
   because it supports sitelauncher's future 
   development. Thanks, David Morrison.  */
   
var SL_CAMO_THEME_ID = 20;
var SL_GOLD_THEME_ID = 22;
var SL_PHOENIX_THEME_ID = 21;
var SL_PINK_THEME_ID = 8;
   
function isSitelauncherThemeUnlocked(theme_id)
{
  if(theme_id === SL_CAMO_THEME_ID)
  {
    return sitelauncherHash(getPref("sl-theme-code-camo")) === 217592589;
  }

  if(theme_id === SL_GOLD_THEME_ID)
  {
    return sitelauncherHash(getPref("sl-theme-code-gold")) === 877634281;
  }
  
  if(theme_id === SL_PHOENIX_THEME_ID)
  {
    return sitelauncherHash(getPref("sl-theme-code-phoenix")) === 1951310875;
  }
  
  if(theme_id === SL_PINK_THEME_ID)
  {
    return sitelauncherHash(getPref("sl-theme-code-pink")) === 949586792;
  }
  
  // non premium theme
  return true;
}

function setThemeUnlockCodeVal(theme_id, themecode)
{
  if(theme_id === SL_CAMO_THEME_ID)
  {
    return setPref("sl-theme-code-camo", themecode);
  }

  if(theme_id === SL_GOLD_THEME_ID)
  { 
    return setPref("sl-theme-code-gold", themecode);
  }
  
  if(theme_id === SL_PHOENIX_THEME_ID)
  {
    return setPref("sl-theme-code-phoenix", themecode);
  }
  
  if(theme_id === SL_PINK_THEME_ID)
  {
    return setPref("sl-theme-code-pink", themecode);
  } 
}

function sitelauncherHash(str){
  var hash = 0;
  if (str === null) return hash;
  if (!str.length) return hash;
  str = str.toLowerCase();
  for (i = 0; i < str.length; i++)
  {
    char = str.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; 
  }
  return hash;
}