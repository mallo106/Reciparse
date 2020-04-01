
(function main() {
  let aRecipe = collectRecipe(document);
  if (Boolean(aRecipe)) {
    return aRecipe;
  }
  document.querySelectorAll('iframe').forEach( anIframe => {
    if (Boolean(aRecipe)) {
      return;
    }
    try {
      aRecipe = collectRecipe(anIframe.contentWindow.document);
    } catch (anE) {
      // if the iframe is from a different origin an exception is thrown. keep looking
    }
  });
  return aRecipe;
})();

/**
 * Attempts to collect the recipe object from the ld+json first, then the microdata in the page
 * @returns {(null|T)|{"@type": *}}
 */
function collectRecipe(theWindow) {
  let aRecipe = collectRecipeFromLD(theWindow);
  if (Boolean(aRecipe)) {
    return aRecipe;
  }
  const aRecipeElement = theWindow.querySelector(`*[itemType='https://schema.org/Recipe']`) || theWindow.querySelector(`*[itemType='http://schema.org/Recipe']`);
  if (!Boolean(aRecipeElement)) {
    return null;
  }
  return getMicrodataItem(aRecipeElement);
}
/**
 * Collects the recipe from the ld+json element if it exists
 * @returns {null|*}
 */
function collectRecipeFromLD(theWindow) {
  const aLinkedDataElements = theWindow.querySelectorAll("script[type='application/ld+json']");
  let aRecipe = undefined;
  aLinkedDataElements.forEach(aLinkedDataElement => {
    let aLinkedData = Boolean(aLinkedDataElement) && aLinkedDataElement.innerText;
    if (!Boolean(aLinkedData)) {
      return null;
    }
    aLinkedData = JSON.parse(aLinkedData);
    if (!Array.isArray(aLinkedData) && aLinkedData['@type'] === "Recipe") {
      aRecipe = aLinkedData;
      return;
    }
    let aLinkedDataList = [];
    if (Array.isArray(aLinkedData)) {
      aLinkedDataList = aLinkedData;
    } else if (Boolean(aLinkedData['@graph']) && Array.isArray(aLinkedData['@graph'])) {
      aLinkedDataList = aLinkedData['@graph'];
    }
    aRecipe = aLinkedDataList.find(aLD =>
      Boolean(aLD['@context'])
      && aLD['@context'].indexOf('://schema.org') > 0
      && aLD['@type'] === 'Recipe'
    );
  });
  return aRecipe;
}

/**
 * Builds a microdata json element from the provided element
 * @param theElement
 * @returns {{"@type": *}}
 */
function getMicrodataItem(theElement) {
  var aResult = {
    "@type": theElement.getAttribute("itemtype")
  };
  theElement.querySelectorAll("[itemprop]").forEach(theElement => {
    const aPropertyName = theElement.getAttribute('itemprop');
    aResult[aPropertyName] = getPropertyValue(aResult[aPropertyName], theElement);
  });
  for (let aKey in aResult) {
    if (Array.isArray(aResult[aKey]) && aResult[aKey].length === 1) {
      aResult[aKey] = aResult[aKey][0];
    }
  }
  return aResult
}

/**
 * Fills the current value with all of the property values in the element
 * @param theCurrentValue
 * @param theElement
 * @returns {Array}
 */
function getPropertyValue(theCurrentValue, theElement) {
  theCurrentValue = !Boolean(theCurrentValue) ? [] : theCurrentValue;
  if (theElement.matches("[itemscope]") && theElement.matches("[itemprop]")) {
    theCurrentValue.push(getMicrodataItem(theElement))
  } else if (theElement.tagName.toLocaleLowerCase() === "ol") {
    theElement.querySelectorAll("li").forEach(aListItem => {
      getPropertyValue(theCurrentValue, aListItem);
    })
  } else if(Boolean(theElement.content || theElement.textContent || theElement.src)) {
    theCurrentValue.push((theElement.content || theElement.textContent || theElement.src).trim());
  }
  return theCurrentValue;
}
