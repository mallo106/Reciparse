chrome.tabs.onActivated.addListener(anActiveInfo => {
  updateIcon(anActiveInfo.tabId)
});

chrome.tabs.onUpdated.addListener((aTabId, anInfo) => {
    updateIcon(aTabId);
});

/**
 * update the extension icon based on if there's a recipe on the page or not
 * @param theTabId
 */
function updateIcon(theTabId) {
  chrome.tabs.get(theTabId,(aCurrent) => {
    if (!Boolean(aCurrent.url) || !aCurrent.url.startsWith('http')) {
      setIcon(false);
      return;
    }
    chrome.tabs.executeScript(theTabId,
      {file: `js/microdata-to-json.js`}, (aResults) =>  {
        setIcon(Boolean(aResults) && Boolean(aResults[0]))
      });
  });
}

function setIcon(theHasSuffix) {
  const aSuffix = !theHasSuffix ? '' : '_alert';
  chrome.browserAction.setIcon({
    path: {
      "18": `icons/baseline_fastfood_black_18dp${aSuffix}.png`,
      "36": `icons/baseline_fastfood_black_18dp_2x${aSuffix}.png`
    }
  });
}
