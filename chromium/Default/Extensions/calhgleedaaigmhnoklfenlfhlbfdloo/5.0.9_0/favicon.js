/* Copyright Done Smart Limited.
 * SiteLauncher is a registered trademark of Done Smart Ltd.
 * http://www.donesmart.com/sitelauncher */
function extractIconLocationForURL(url, callback)
{
  // this code is here because the default amazon shortcut present in SiteLauncher contains
  // donesmart's affiliate tag that should not be fetched by a automatic query to be compliant with 
  // their tos
  if((url.indexOf("amazon.") !== -1 && url.indexOf("tag=sitelauncher-chrome-20") !== -1) || url.indexOf("www.donesmart.com/redir/?url=amazon") !== -1)
  {
    url = "http://www.amazon.com/";
  }
  
  // again, these are the default shortcuts thain contain donesmart's affiliate tag; and therefore 
  // should not be fetched automatically to be compliant with companies' tos
  if(url.indexOf("booking.") !== -1 && url.indexOf("aid=367160") !== -1)
  {
    url = "http://www.booking.com/";
  }
  
  // charm date affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=razer") !== -1)
  {
    url = "https://www.razerzone.com/";
  }    
  
  // charm date affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.qpidaffiliate.com/index.php/promote") !== -1)
  {
    url = "http://www.charmdate.com/";
  }  
  
  // charm date affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=date") !== -1)
  {
    url = "http://www.charmdate.com/";
  }  
  
  
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=sync") !== -1)
  {
    url = "https://www.sync.com/";
  }  
  
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=fashion") !== -1)
  {
    url = "https://www.shein.com/";
  }    
  
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=etoro") !== -1)
  {
    url = "https://pages.etoro.com/";
  }    
  
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=boscovs") !== -1)
  {
    url = "https://www.boscovs.com/";
  }      
  
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=tickets") !== -1)
  {
    url = "https://www.ticketnetwork.com/";
  }      
    
	
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=games") !== -1)
  {
    url = "https://www.kinguin.net/";
  }  	
  
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=shoes") !== -1)
  {
    url = "https://www.usadawgs.com/";
  }  	

  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=pet") !== -1)
  {
    url = "https://www.petcaresupplies.com/";
  }  	  
    
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=furniture") !== -1)
  {
    url = "https://www.burkedecor.com/";
  }  	  
    
	
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=jewellery") !== -1)
  {
    url = "http://www.jeulia.com/";
  }  

  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=flowers") !== -1)
  {
    url = "http://www.justflowers.com/";
  }  	  
      
  // affiliate url, we need to use their regular url to fetch favicon
  if(url.indexOf("http://www.donesmart.com/redir/?url=groceries") !== -1)
  {
    url = "https://taldepot.com/";
  }  	  
	  
	  
    
  
  // google cal icon changes everyday to reflect date, but we don't update icon daily (for performance
  // reasons), therefore just use a fixed date icon
  if(url.indexOf("http://calendar.google.com/") === 0 || url.indexOf("https://calendar.google.com/") === 0 || 
     url.indexOf("https://www.google.com/calendar/") === 0 || url.indexOf("http://www.google.com/calendar/") === 0 )
  {
    if(callback){callback(chrome.extension.getURL("images/gcal.ico"))};
    return chrome.extension.getURL("images/gcal.ico");
  }
  
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = 
    function handleStateChange()
    {
        if (xhr.readyState == 4) 
        {
            try
            {
              var iconpath = "/favicon.ico";                 
            
              var domParser = new DOMParser();
              var xmlDoc = domParser.parseFromString(xhr.responseText, 'application/xhtml+xml');
              
              // get url properties
              var a_elm = document.createElement('a');
              a_elm.href = url;
              var url_dir = a_elm.protocol + "//" + a_elm.hostname + a_elm.pathname.replace(/\/[^\/]+$/, ""); // dir end with forward slash always 
              var base_url = a_elm.protocol + "//" + a_elm.hostname;
              var url_protocol = a_elm.protocol;
              var icon_path_match = xhr.responseText.match(/rel\s*=\s*\"\s*shortcut\s+icon\s*\"\s+(?:type\s*=\s*[\'\"][^\'\"]+[\'\"]\s*)?(?:href\s*=\s*[\'\"]\s*([^\'\"]+)\s*[\'\"])?/i);              
              var icon_path_match1 = xhr.responseText.match(/(?:href\s*=\s*[\'\"]\s*([^\'\"]+)\s*[\'\"])\s+(?:type\s*=\s*[\'\"][^\'\"]+[\'\"]\s*)?rel\s*=\s*\"\s*shortcut\s+icon\s*\"/i);       
              var icon_path_match2 = xhr.responseText.match(/rel\s*=\s*\"\s*icon\s*\"\s+(?:type\s*=\s*[\'\"][^\'\"]+[\'\"]\s*)?(?:href\s*=\s*[\'\"]\s*([^\'\"]+)\s*[\'\"])?/i);  
              var icon_path_match3 = xhr.responseText.match(/(?:href\s*=\s*[\'\"]\s*([^\'\"]+)\s*[\'\"])\s+(?:type\s*=\s*[\'\"][^\'\"]+[\'\"]\s*)?rel\s*=\s*\"\s*icon\s*\"\s+?/i);   
              var match_found = false;
              
            
              if(icon_path_match && typeof icon_path_match[1] === "string")
              {

              
                iconpath = icon_path_match[1];
                match_found = true;
              }
              else if(icon_path_match1 && typeof icon_path_match1[1] === "string")
              {
                iconpath = icon_path_match1[1];
                match_found = true;
              }
              else if(icon_path_match2 && typeof icon_path_match2[1] === "string")
              {
                iconpath = icon_path_match2[1];
                match_found = true;
              }
              else if(icon_path_match3 && typeof icon_path_match3[1] === "string")
              {
                iconpath = icon_path_match3[1];
                match_found = true;
              }
              
              
              // case 1 full url sans protocol to full url
              if(match_found && iconpath.match(/^\/\//i))
              {         
                if(callback){callback(url_protocol + iconpath)};
                return url_protocol + iconpath;
              } 
              
              // case 2 absolute url to full url
              if(match_found && iconpath.match(/^[^:]+:/i))
              {
                if(callback){callback(iconpath)};
                return iconpath;
              } 
              
              // case 3 absolute *path* to full url
              if(match_found && iconpath.match(/^\//i))
              {
                if(callback){callback(base_url + iconpath)};
                return base_url + iconpath;
              }
              
              // case 4 relative path to full url
              if(match_found)
              {
                if(callback){callback(url_dir + iconpath)};
                return url_dir + iconpath;
              }
             
              // no match / fallback case : hostname/favicon.ico
              if(callback){callback(base_url + iconpath)};
              return base_url + iconpath;
            }
            catch(e)
            {
            }  
        }
    };
  xhr.open("GET", url, true);
  xhr.send();
}
