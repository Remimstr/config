
var message_variations = ["I'm using the SiteLauncher extension for Chrome, I love it! It's a super fast speed dial extension that enables you to navigate the web faster and with style. https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",


"I'm using SiteLauncher for Google Chrome, I love it!  https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"Check out this killer Chrome extension: https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"I'm using a new extension for Google Chrome, I love it!  https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"I highly recommend this extension for Google Chrome: https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"I'm using the SiteLauncher extension for Google Chrome, It's awesome! I highly recommend checking it out https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"Check out this awesome chrome extension: https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",


"Check out this awesome speed dial extension for Google Chrome, I highly recommend it: https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en"];


var new_window = null;
$( document ).ready(function() {
	
    var array_index = Math.floor(Math.random() * message_variations.length);
	document.getElementById("fb_message").innerHTML = message_variations[array_index];
	
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse){ 
    setTimeout(function(){ 
	
	  new_window.close();
	 
	  setPref("background_feature_unlocked", "donesmart");
	 
	  window.localStorage.setItem("backgroundFeatureUnlocked", "donesmart"); 

	  document.getElementById("unlock_div").innerHTML = "<h1>FEATURE UNLOCKED</h1><p style='font-size: 22px;'><strong>Congrats</strong>! The feature is now unlocked.<br /><br />Thanks for sharing SiteLauncher on Facebook - you're awesome!<br /><br /><a href='#' id='options_bg_link'>Go to options to set your background image now</a></p>";	
	  
	  document.getElementById("options_bg_link").addEventListener("click", function(){chrome.tabs.create({"url" : "options.html"});});
	  document.getElementById("options_bg_link").setAttribute("style", "color: #fff; !important");
	  
	  
	  }, 7000);  });	
	
  document.getElementById("fb_button").addEventListener("click", function(){
	  new_window = window.open("https://www.facebook.com/?post_chrome_extension=true&id=" + array_index, null, "height=100,width=300,status=no,toolbar=no,menubar=no,location=no");
	  
	  setTimeout(function(){new_window.close();}, 60000);
	  
	  document.getElementById("fb_button").value = "Please wait ...";
	  
	  setTimeout(function(e){
		  if(window.localStorage.getItem("backgroundFeatureUnlocked") === "donesmart")
		  {
		    return;
		  }
		  alert("Error posting. Please check your internet connection and make sure you're logged into Facebook then try again.");
	      document.getElementById("fb_button").value = "Post Facebook message now";
	  }, 20000);
	 
	 
  });

  
});