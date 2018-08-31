if(window.location.href.indexOf("post_chrome_extension=true") !== -1)
{


var message_variations = ["I'm using the SiteLauncher extension for Chrome, I love it! It's a super fast speed dial extension that enables you to navigate the web faster and with style. https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",


"I'm using SiteLauncher for Google Chrome, I love it!  https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"Check out this killer Chrome extension: https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"I'm using a new extension for Google Chrome, I love it!  https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"I highly recommend this extension for Google Chrome: https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"I'm using the SiteLauncher extension for Google Chrome, It's awesome! I highly recommend checking it out https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",

"Check out this awesome chrome extension: https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en",


"Check out this awesome speed dial extension for Google Chrome, I highly recommend it: https://chrome.google.com/webstore/detail/sitelauncher-speed-dial/calhgleedaaigmhnoklfenlfhlbfdloo?hl=en"];
	
	var div = document.createElement("div");
	div.setAttribute("style", "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background: #fff; color: #000; z-index: 99999999; padding: 20px;");
	div.innerHTML = "<strong>Posting to Facebook...</strong>";
	
	document.getElementsByTagName("body")[0].appendChild(div);
	
	var textarea_array = document.getElementsByTagName("textarea");

	for(var i = 0; i < textarea_array.length; i++)
	{
	  var elm = textarea_array[i];
	  if(elm.getAttribute("class").indexOf("navigationFocus") !== -1)
	  {
		  var url = new URL(window.location.href);
		  var array_index  = url.searchParams.get("id");

		  elm.value = message_variations[array_index];
		  
		  var button_array = document.getElementsByTagName("button");
		  
		  for(var x = 0; x < button_array.length; x++)
		  {
			if(button_array[x].innerHTML === "Post" && button_array[x].getAttribute("type") === "submit")
			{
		        button_array[x].click();
				chrome.extension.sendRequest(null, "message posted");
			}
		  }
		  
		  break;
	  }
	}
}