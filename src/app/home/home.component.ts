import {Component} from '@angular/core';
import {exampleJson2} from './example-strings';
import {ImageObject, Recipe, URL} from 'schema-dts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  myLinkedDataRecipe: Recipe = {'@type': 'Recipe'};
  myImages: string[] = [];
  constructor() {
    try {
      // @ts-ignore
      chrome.tabs.executeScript(null,
        {file: `js/microdata-to-json.js`}, (theResults) =>  {
          this.myLinkedDataRecipe = theResults[0];
          this.myImages = this.getImages();
        });
    } catch (anE) {
      // This is here if you're running the app outside of the chrome extension popup window
      // Seed the component with some example json for dev work
      this.parseLinkedData(exampleJson2);
      this.myImages = this.getImages();
    }
  }

  /**
   * Linked data in web pages can be provided in a few different structures.
   * Ensure we get the recipe schema from the linked data
   */
  private parseLinkedData(theLinkedData: string) {
    const aLinkedData: any = JSON.parse(theLinkedData);
    let aLinkedDataList: any[] = [];
    if (Array.isArray(aLinkedData)) {
      aLinkedDataList = aLinkedData;
    } else if (Boolean(aLinkedData['@graph']) && Array.isArray(aLinkedData['@graph'])) {
      aLinkedDataList = aLinkedData['@graph'];
    }
    this.myLinkedDataRecipe = aLinkedDataList.find(aLD =>
      Boolean(aLD['@context'])
      && aLD['@context'].indexOf('://schema.org') > 0
      && aLD['@type'] === 'Recipe'
    );
  }

  /**
   * Images can be provided in many formats.
   * Return an array of urls from the images provided
   */
  getImages(): string[] {
    if (!Boolean(this.myLinkedDataRecipe) || !Boolean(this.myLinkedDataRecipe.image)) {
      return [];
    }
    if (Array.isArray(this.myLinkedDataRecipe.image)) {
      return this.myLinkedDataRecipe.image.map(anImage => this.getUrlFromImage(anImage));
    } else {
      return [this.getUrlFromImage(this.myLinkedDataRecipe.image as (ImageObject | URL))];
    }
  }

  /**
   * Return a URL for the image object provided
   */
  private getUrlFromImage(theImage: (ImageObject | URL)): string {
    switch (theImage['@type']) {
      case 'ImageObject': return (theImage as ImageObject).url.toString();
      default :
        console.log('Failed to match on type ', theImage['@type'], theImage);
        return theImage.toString();
    }
  }
}
