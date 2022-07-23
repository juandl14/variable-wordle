import { Component, HostListener, OnInit } from '@angular/core';
import { WORDS } from '../words';

const WORD_LEN = 5;
const TRIES = 6;
const NUM_WORDS = WORDS.length;

// Letter map
const LETTERS = (() => {
  // Letter -> true
  const ret: { [key: string]: boolean } = {};
  for (let charCode = 97; charCode < 97 + 26; charCode++) {
    ret[String.fromCharCode(charCode)] = true;
  }
  console.log(ret);
  return ret;
})();

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

  infoMsg = '';

  // Controls info message fade out time animation
  fadeOutInfoMsg = false;

  // Tracks the current letter index
  private currLetterIndex = 0;

  // Tracks the number of submitted tries
  private numTries = 0;

  private targetWord = '';

  private wordLen = 0;
  private maxTries = 0;

  // Check if the current word being submitted is the first one
  // private firstWord = true;

  // Length of the longest word possible
  private maxLetters = 0;

  constructor() {
    // Get a target word
    const randomIndex = Math.floor(Math.random() * NUM_WORDS);
    this.targetWord = WORDS[randomIndex];
    this.wordLen = this.targetWord.length;
    this.maxTries = this.wordLen + 1;

    console.log(this.targetWord);
    console.log(this.wordLen);
    console.log(this.maxTries);

    for (let i = 1; i < WORDS.length; i++) {
      if (this.maxLetters < WORDS[i].length) {
        this.maxLetters = WORDS[i].length;
      }
    }

    // Populate initial state
    this.populateNextRow();

    // Populate initial state
    // for (let i = 0; i < this.maxLetters + 1; i++) {
    //   const letters: Letter[] = [];
    //   for (let j = 0; j < this.maxLetters; j++) {
    //     letters.push({ text: '', state: LetterState.PENDING });
    //   }
    //   this.tries.push({ letters });
    // }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleClickKey(event.key);
  }

  private handleClickKey(key: string) {
    // If key is a letter, update.
    if (LETTERS[key.toLowerCase()]) {
      // Only allow typing letters in the current try.
      if (this.currLetterIndex < (this.numTries + 1) * WORD_LEN) {
        this.setLetter(key);
        this.currLetterIndex++;
      }
    }
    // Handle delete
    else if (key === 'Backspace') {
      if (this.currLetterIndex > this.numTries * WORD_LEN) {
        this.currLetterIndex--;
        this.setLetter('');
      }
    }
    // Handle enter
    else if (key === 'Enter') {
      this.checkCurrentTry();
      this.populateNextRow();
    }
  }

  private setLetter(letter: string) {
    const tryIndex = Math.floor(this.currLetterIndex / WORD_LEN);
    const letterIndex = this.currLetterIndex - tryIndex * WORD_LEN;
    this.tries[tryIndex].letters[letterIndex].text = letter
  }

  private checkCurrentTry() {
    // Check  if user has typed all the letters
    const curTry = this.tries[this.numTries];
    if (curTry.letters.some(letter => letter.text === '')) {
      this.showInfoMsg('Not enough letters');
      return;
    }
  }

  private showInfoMsg(msg: string) {
    this.infoMsg = msg;
    // Hide after 2s
    setTimeout(() => {
      this.fadeOutInfoMsg = true;
      // Reset when animation is done
      setTimeout(() => {
        this.infoMsg = '';
        this.fadeOutInfoMsg = false;
      }, 500);
    }, 2000);
  }

  private populateNextRow() {
    const letters: Letter[] = [];
    for (let j = 0; j < this.maxLetters; j++) {
      letters.push({ text: '', state: LetterState.PENDING });
    }
    this.tries.push({ letters });
  }

  ngOnInit(): void {
  }

}
