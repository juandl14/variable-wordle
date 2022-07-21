import { Component, OnInit } from '@angular/core';

const WORD_LEN = 5;
const TRIES = 6;

// One try
interface Try {
  letters: Letter[];
}

// One letter in a try
interface Letter {
  text: string;
  state: LetterState;
}

enum LetterState {
  // Letter is completely wrong
  WRONG,
  // Letter belongs to word but position is incorrect
  PARTIAL_MATCH,
  // Letter belongs to word and position is correct
  CORRECT,
  // Before the current try is submitted
  PENDING
}

@Component({
  selector: 'app-wordle',
  templateUrl: './wordle.component.html',
  styleUrls: ['./wordle.component.scss']
})
export class WordleComponent implements OnInit {
  // Stores all the tries
  // One try is one row in the UI
  readonly tries: Try[] = [];

  constructor() {
    // Populate initial state
    for (let i = 0; i < TRIES; i++) {
      const letters: Letter[] = [];
      for (let j = 0; j < WORD_LEN; j++) {
        letters.push({ text: '', state: LetterState.PENDING });
      }
      this.tries.push({ letters });
    }
  }

  ngOnInit(): void {
  }

}
