chrome.tabs.onActivated.addListener(anActiveInfo => {
  chrome.tabs.get(anActiveInfo.tabId,(aCurrent) => {
    if (!Boolean(aCurrent.url) || !aCurrent.url.startsWith('http')) {
      setIcon(false);
      return;
    }
    chrome.tabs.executeScript(anActiveInfo.tabId,
      {file: `js/microdata-to-json.js`}, (aResults) =>  {
        setIcon(Boolean(aResults) && Boolean(aResults[0]))
      });
  });
});

function setIcon(theHasSuffix) {
  const aSuffix = !theHasSuffix ? '' : '_alert';
  chrome.browserAction.setIcon({
    path: {
      "18": `icons/baseline_fastfood_black_18dp${aSuffix}.png`,
      "36": `icons/baseline_fastfood_black_18dp_2x${aSuffix}.png`
    }
  });
}
