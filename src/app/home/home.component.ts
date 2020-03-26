import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RecipeParser} from '../parser/recipe-parser';
import {example1, example2} from '../parser/example-strings';
import {Recipe} from '../parser/parser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  myRecipe: Recipe = {
    ingredients: []
  };
  constructor(private change: ChangeDetectorRef) {}

  ngOnInit(): void {
    try {
      // @ts-ignore
      chrome.tabs.executeScript(null,
        {code: `var aText = document.querySelector('html').innerText; aText`}, (theResults) =>  {
          this.myRecipe = new RecipeParser(theResults[0]).parse();
          this.change.detectChanges();
        });
    } catch (anE) {
      this.myRecipe = new RecipeParser(example2).parse();
      new RecipeParser(example1).parse();
    }
  }
}
