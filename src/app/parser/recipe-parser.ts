import {Ingredient, MatchIndex, Recipe} from './parser';


export class RecipeParser {
  constructor(public myStringToParse: string) {

  }

  parse(): Recipe {
    const aStrings = this.myStringToParse.split('\n').map(aString => aString.trim());
    return {
      ingredients: this.parseIngredients(aStrings)
    };
  }

  private parseIngredients(thePhrases: string[]): Ingredient[] {
    const aRoughCut = this.parseIngredientsRough(thePhrases);
    return aRoughCut.map(aRough => Object.assign(aRough, {
      quantity: undefined,
      name: undefined,
    }));
  }

  private parseIngredientsRough(thePhrases: string[]): MatchIndex[] {
    // Find the indexes of all lines starting with "ingredient" (Ingredient List, Ingredients, etc)
    const anIngredientsLines = this.findMatchingIndices(thePhrases, /^ingredient/i);
    // Search for lines starting with numbers between the ingredients lines
    const aPossibleIngredients: MatchIndex[][] = anIngredientsLines.map((anIngredientLine, anIndex) => {
      const aStartIndex = anIngredientLine.lineIndex + 1;
      const anEndIndex = anIndex + 1 >= anIngredientsLines.length ? undefined : anIngredientsLines[anIndex + 1].lineIndex;
      return this.findMatchingIndices(thePhrases, /^[0-9\u00BE\u00BD]+\s/, aStartIndex, anEndIndex);
    });
    // Assuming the ingredients on the page are evenly spaced
    // we can take the standard deviation of the index deltas and remove everything past the first outlier
    const aTrimmed = aPossibleIngredients.map(aPossible => {
      if (aPossible.length <= 3) {
        return aPossible;
      }
      const aStartStop = this.withinDeviation(aPossible);
      return aPossible.slice(aStartStop.start, aStartStop.stop);
    });
    // take the ingredients list with the most matches
    let aBestMatch = aTrimmed[0];
    aTrimmed.forEach(aTrimmedIngredientsList => {
      if (aTrimmedIngredientsList.length > aBestMatch.length) {
        aBestMatch = aTrimmedIngredientsList;
      }
    });
    return aBestMatch;
  }

  private findMatchingIndices(thePhrases: string[], theRegex: RegExp, theStartIndex?: number, theStopIndex?: number): MatchIndex[] {
    const aMatches: MatchIndex[] = [];
    const aStart = theStartIndex === undefined ? 0 : theStartIndex;
    const anEnd = theStopIndex === undefined ? thePhrases.length - 1 : theStopIndex;
    thePhrases
      .slice(aStart, anEnd)
      .forEach((theString, theIndex) => {
      if (!theString.match(theRegex)) {
        return;
      }
      aMatches.push({
        text: theString,
        lineIndex: theIndex + aStart
      });
    });
    return aMatches;
  }

  private withinDeviation(theLineMatches: MatchIndex[]): {start: number, stop: number} {
    const aDistances: number[] = [];
    theLineMatches.forEach((aMatch, anIndex) => {
      if (anIndex + 1 >= theLineMatches.length) {
        return;
      }
      return aDistances.push(theLineMatches[anIndex + 1].lineIndex - aMatch.lineIndex);
    });
    const aMean = aDistances.reduce((anAccumulator, aDistance) => anAccumulator + aDistance, 0.0) / aDistances.length;
    const aDistancesFromMean = aDistances.map(aDistance => Math.abs(aMean - aDistance));
    const aVariance = aDistancesFromMean
      .map(aDistanceFromMean => Math.pow(aDistanceFromMean, 2))
      .reduce((anAcc, aNum) => anAcc + aNum, 0.0) / aDistances.length;
    const aDeviation = Math.sqrt(aVariance);
    const aStart = aDistancesFromMean.findIndex((aDistance) => aDistance <= (aDeviation * .5))
    const aStop = aDistancesFromMean.findIndex((aDistance, anIndex) => anIndex > aStart && aDistance > (aDeviation * .75))
    return {
      start: 0,
      stop: aStop
    };
  }

}

