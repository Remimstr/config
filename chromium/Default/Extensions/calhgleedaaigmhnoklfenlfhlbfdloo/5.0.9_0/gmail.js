// https://mail.google.com/mail/u/0/h/

if(window.location.href.indexOf("#bnt") !== -1)
{	
    document.getElementsByTagName("title")[0].innerHTML = "";
	if(document.getElementsByTagName("body")[0].innerHTML.indexOf("like to use HTML Gmail") !== -1)
	{
	  var div = document.createElement("div");
	  div.setAttribute("style", "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background: #fff; color: #000; z-index: 99999999; padding: 20px;");
	  div.innerHTML = "<strong>Setting up Gmail integration. Please wait ...</strong>";
	  document.getElementsByTagName("body")[0].appendChild(div);

      var elms = document.getElementsByTagName("input");
	  
	  for(var i = 0; i < elms.length; i++)
	  {
		  if(elms[i].getAttribute("type") == "submit")
		  {
			  setTimeout(function(){window.close();}, 3000);
         	  elms[i].click();
			  break;
		  }		  
	  }
	}
}
