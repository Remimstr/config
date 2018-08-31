function popup() {
  rxLoadStorage()
    .subscribe(
      function(name) {
        $("#current-bookmarks-bar").text(name);
        $("#switcher").show();
      },
      function() {
        $("#start").show();
      }
    );
}

function loadBookmarksBars() {
  $("#bookmarks").html("");
  rxGetChildren(OTHER_BOOKMARKS_ID)
    .subscribe(
      function(children) {
        children.forEach(function(bookmarkNode) {
          if (!bookmarkNode.url) {
            var li = $("<li>" + bookmarkNode.title + "</li>");
            li.click(function() {
              switchBookmarksBar(bookmarkNode);
            });
            $("#bookmarks").append(li);
          }
        });
      }
    );
}

function switchBookmarksBar(bar) {
  rxSendMessage({
    cmd: "switchBookmarksBar",
    data: { node: bar }
  }).subscribe(function() {
      window.close();
  });
}

function backupCurrentBookmarksBar() {
  const name = $("#name").val().trim();
  if (name.length > 0) {
    $("#start").hide();
    rxSaveStorage(name)
      .subscribe(function() {
        $("#current-bookmarks-bar").text(name);
        $("#switcher").show();
      })
  }
}

document.addEventListener('DOMContentLoaded', function () {
  loadBookmarksBars();
  popup();
  $("#start-form").submit(function() {
    backupCurrentBookmarksBar();
    return false;
  });
});
