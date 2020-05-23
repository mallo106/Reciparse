chrome.tabs.onActivated.addListener(anActiveInfo => {
  updateIcon(anActiveInfo.tabId, true)
});

chrome.tabs.onUpdated.addListener((aTabId, anInfo) => {
    updateIcon(aTabId, anInfo.status === "complete");
});

const kCachedAddresses = {};

/**
 * update the extension icon based on if there's a recipe on the page or not
 * @param theTabId
 */
function updateIcon(theTabId, theFinalizeFindings) {
  chrome.tabs.get(theTabId,(aCurrent) => {
    if (!Boolean(aCurrent.url) || !aCurrent.url.startsWith('http')) {
      setIcon(false);
      return;
    }
    const anAddress = aCurrent.url;
    //Short circuit the call to microdata-to-json.js if we have this address cached
    if (kCachedAddresses[anAddress] !== undefined || kCachedAddresses[anAddress]) {
      setIcon(Boolean(kCachedAddresses[anAddress]));
      return;
    }
    chrome.tabs.executeScript(theTabId,
      {file: `js/microdata-to-json.js`}, (aResults) =>  {
        const aHasRecipe = Boolean(aResults) && Boolean(aResults[0]);
        if (aHasRecipe || theFinalizeFindings) {
          kCachedAddresses[anAddress] = aHasRecipe;
        }
        setIcon(aHasRecipe);
      });
  });
}

function setIcon(theHasRecipe) {
  const aSuffix = !theHasRecipe ? '' : '_alert';
  chrome.browserAction.setIcon({
    path: {
      "18": `icons/baseline_fastfood_black_18dp${aSuffix}.png`,
      "36": `icons/baseline_fastfood_black_18dp_2x${aSuffix}.png`
    }
  });
}
