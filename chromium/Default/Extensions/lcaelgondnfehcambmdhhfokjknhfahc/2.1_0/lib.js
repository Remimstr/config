const BOOKMARKS_BAR_ID = "1";
const OTHER_BOOKMARKS_ID = "2";
const STORAGE_KEY = "name";

const rxCreateBookmark = Rx.Observable.bindCallback(chrome.bookmarks.create);
const rxGetChildren = Rx.Observable.bindCallback(chrome.bookmarks.getChildren);
const rxMove = Rx.Observable.bindCallback(chrome.bookmarks.move);
const rxRemove = Rx.Observable.bindCallback(chrome.bookmarks.remove);
const rxSendMessage = Rx.Observable.bindCallback(chrome.extension.sendMessage);

const rxStorage = {
  sync: {
    get: Rx.Observable.bindCallback(chrome.storage.sync.get),
    set: Rx.Observable.bindCallback(chrome.storage.sync.set)
  }
};

function rxLoadStorage() {
  return rxStorage.sync.get(STORAGE_KEY)
    .map(function(items) {
      const name = items[STORAGE_KEY];
      if (name) return name;
      throw false;
    });
}

function rxSaveStorage(name) {
  return rxStorage.sync.set({ [STORAGE_KEY]: name })
}

function rxMoveChildren(from, to) {
  return rxGetChildren(from)
    .mergeMap(function(children) {
      if (children && children.length > 0) {
        return Rx.Observable.zip(
          ...children.map(function(child) {
            return rxMove(child.id, { parentId: to });
          })
        );
      }
      return Rx.Observable.of(true);
    });
}
