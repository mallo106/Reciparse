import {Component} from '@angular/core';
import {exampleJson} from '../parser/example-strings';
import {ImageObject, Recipe, URL} from 'schema-dts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  myLinkedDataRecipe: Recipe = {'@type': 'Recipe'} ;
  constructor() {
    try {
      // @ts-ignore
      chrome.tabs.executeScript(null,
        {code: `var aText = document.querySelector("script[type='application/ld+json").innerText; aText`}, (theResults) =>  {
          const aLinkedData: any[] = JSON.parse(theResults[0]);
          if (!Boolean(aLinkedData)) {
            return;
          }
          this.myLinkedDataRecipe = aLinkedData.find(aLD => aLD['@context'] === 'http://schema.org' && aLD['@type'] === 'Recipe');
        });
    } catch (anE) {
      const aLinkedData: any[] = JSON.parse(exampleJson);
      this.myLinkedDataRecipe = aLinkedData.find(aLD => aLD['@context'] === 'http://schema.org' && aLD['@type'] === 'Recipe');
    }
  }

  /**
   * Images can be provided in many formats.
   * Return an array of urls from the images provided
   */
  getImages(): string[] {
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
