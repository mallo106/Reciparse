export class MatchIndex {
  text: string;
  lineIndex: number;
}

export class Ingredient extends MatchIndex {
  quantity: number;
  name: string;
}

export class Recipe {
  ingredients: Ingredient[];
}
