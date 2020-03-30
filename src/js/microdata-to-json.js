/**
 * Attempts to collect the recipe object from the ld+json first, then the microdata in the page
 * @returns {(null|T)|{"@type": *}}
 */
(function collectRecipe() {
  let aRecipe = collectRecipeFromLD();
  if (Boolean(aRecipe)) {
    return aRecipe;
  }
  aRecipe = document.querySelector(`*[itemType='https://schema.org/Recipe']`) || document.querySelector(`*[itemType='http://schema.org/Recipe']`);
  return getMicrodataItem(aRecipe);
})();

/**
 * Collects the recipe from the ld+json element if it exists
 * @returns {null|*}
 */
function collectRecipeFromLD() {
  const aLinkedDataElement = document.querySelector("script[type='application/ld+json");
  let aLinkedData = Boolean(aLinkedDataElement) && aLinkedDataElement.innerText;
  if (!Boolean(aLinkedData)) {
    return null;
  }
  aLinkedData = JSON.parse(aLinkedData);
  let aLinkedDataList = [];
  if (Array.isArray(aLinkedData)) {
    aLinkedDataList = aLinkedData;
  } else if (Boolean(aLinkedData['@graph']) && Array.isArray(aLinkedData['@graph'])) {
    aLinkedDataList = aLinkedData['@graph'];
  }
  return aLinkedDataList.find(aLD =>
    Boolean(aLD['@context'])
    && aLD['@context'].indexOf('://schema.org') > 0
    && aLD['@type'] === 'Recipe'
  );
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
