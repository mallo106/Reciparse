import {ChangeDetectorRef, Component} from '@angular/core';
import {exampleJson} from './example-strings';
import {ImageObject, Recipe, URL} from 'schema-dts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  myLinkedDataRecipe: Recipe = {'@type': 'Recipe'};
  myImages: string[] = [];
  myAuthor: string;
  constructor(myChangeDetector: ChangeDetectorRef) {
    try {
      // @ts-ignore
      chrome.tabs.executeScript(null,
        {file: `js/microdata-to-json.js`}, (theResults) =>  {
          if (!Boolean(theResults[0])) {
            return;
          }
          this.myLinkedDataRecipe = theResults[0];
          this.setupValues();
          myChangeDetector.detectChanges();
        });
    } catch (anE) {
      // This is here if you're running the app outside of the chrome extension popup window.
      // Seed the component with some example json for dev work
      this.myLinkedDataRecipe = exampleJson;
      this.setupValues();
    }
  }

  private setupValues() {
    this.myImages = this.getImages();
    if (Boolean(this.myLinkedDataRecipe.author) && this.myLinkedDataRecipe.author['@type'] === 'Person') {
      this.myAuthor = (this.myLinkedDataRecipe.author as any).name;
    }
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

  /**
   * Formats the instruction object to a string
   */
  getInstructionText(anInstruction: any): string {
    return (Boolean(anInstruction.text) ? anInstruction.text : anInstruction)
      .split('&gt;').join('>')
      .split('&lt;').join('<');
  }
}
