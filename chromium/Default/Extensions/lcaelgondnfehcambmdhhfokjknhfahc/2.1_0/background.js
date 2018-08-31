chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.cmd === "switchBookmarksBar") {
      rxLoadStorage()
        .mergeMap(function(name) {
          return rxCreateBookmark({ title: name, parentId: OTHER_BOOKMARKS_ID });
        })
        .mergeMap(function(node) {
          return rxMoveChildren(BOOKMARKS_BAR_ID, node.id);
        })
        .mergeMap(function() {
          return rxMoveChildren(request.data.node.id, BOOKMARKS_BAR_ID);
        })
        .mergeMap(function() {
          return rxSaveStorage(request.data.node.title);
        })
        .mergeMap(function() {
          return rxRemove(request.data.node.id);
        })
        .subscribe(function() {
          sendResponse({});
        })
      ;
    }

    return true;
  }
);

