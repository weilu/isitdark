chrome.tabs.onUpdated.addListener(function(tabID, info, tab) {
  if (~tab.title.indexOf("DafangHacks") && info.status === 'complete') {
    chrome.tabs.executeScript(tabID, {file: "isitdark.js"}, function(results) {
      if(chrome.runtime.lastError) {
        console.error("Script injection failed: " + chrome.runtime.lastError.message);
      }
    });
  }
});
