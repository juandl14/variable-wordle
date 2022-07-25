import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { WORDS } from '../words';

const WORD_LEN = 5;
const TRIES = 6;
const NUM_WORDS = WORDS.length;
const MAX_WORD_LEN = 10;

// Letter map
const LETTERS = (() => {
  // Letter -> true
  const ret: { [key: string]: boolean } = {};
  for (let charCode = 97; charCode < 97 + 26; charCode++) {
    ret[String.fromCharCode(charCode)] = true;
  }
  return ret;
})();

// One try
interface Try {
  letters: Letter[];
  tryMsg: string;
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
  @ViewChildren('tryContainer') tryContainers!: QueryList<ElementRef>;
  // Stores all the tries
  // One try is one row in the UI
  readonly tries: Try[] = [];

  readonly LetterState = LetterState;

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

  // Stores the count for each letter from the target word
  private targetWordLetterCounts: { [letter: string]: number } = {};

  constructor() {
    // Get a target word
    const numWords = WORDS.length;
    while (true) {
      const randomIndex = Math.floor(Math.random() * numWords);
      const word = WORDS[randomIndex];
      if (!word.includes('(' || ')' || '-') && word.length <= MAX_WORD_LEN) {
        this.targetWord = word;
        break;
      }
    }

    // this.targetWord = 'carnality';

    this.wordLen = this.targetWord.length;
    this.maxTries = this.wordLen + 1;

    console.log('Target word: ', this.targetWord);
    console.log('Wordlen: ', this.wordLen);
    console.log('Maxtries: ', this.maxTries);

    // Populate initial state
    this.populateNextRow('');

    for (const letter of this.targetWord) {
      const count = this.targetWordLetterCounts[letter];
      if (count == null) {
        this.targetWordLetterCounts[letter] = 0;
      }
      this.targetWordLetterCounts[letter]++;
    }
    console.log('Target word letter count: ', this.targetWordLetterCounts)
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleClickKey(event.key);
  }

  private handleClickKey(key: string) {
    // If key is a letter, update.
    if (LETTERS[key.toLowerCase()]) {
      // Only allow typing letters in the current try.
      if (this.currLetterIndex < (this.numTries + 1) * MAX_WORD_LEN) {
        this.setLetter(key);
        this.currLetterIndex++;
      }
    }
    // Handle delete
    else if (key === 'Backspace') {
      if (this.currLetterIndex > this.numTries * MAX_WORD_LEN) {
        this.currLetterIndex--;
        this.setLetter('');
      }
    }
    // Handle enter
    else if (key === 'Enter') {
      if (this.checkCurrentTry()) {
        // if () {
        //   this.populateNextRow("with message");
        // }
        this.currLetterIndex = this.numTries * MAX_WORD_LEN;
      }
    }
  }

  private setLetter(letter: string) {
    const tryIndex = Math.floor(this.currLetterIndex / MAX_WORD_LEN);
    const letterIndex = this.currLetterIndex - tryIndex * MAX_WORD_LEN;
    this.tries[tryIndex].letters[letterIndex].text = letter
  }

  // If the try is not valid return false
  private checkCurrentTry(): boolean {

    const curTry = this.tries[this.numTries];

    // Check if the current try is a word in the list
    const wordFromCurTry = curTry.letters.map(letter => letter.text).join('');
    console.log(wordFromCurTry);
    console.log(WORDS.includes(wordFromCurTry));
    if (!WORDS.includes(wordFromCurTry)) {
      this.showInfoMsg('Not in word list');
      // Shake the current row
      const tryContainer = this.tryContainers.get(this.numTries)?.nativeElement as HTMLElement;
      tryContainer.classList.add('shake');
      setTimeout(() => {
        tryContainer.classList.remove('shake');
      }, 500);
      return false;
    }

    // Check if the current try matches the target word
    // Clone of the counts map
    const targetWordLetterCounts = { ...this.targetWordLetterCounts };
    // Stores the check results
    const states: LetterState[] = [];
    for (let i = 0; i < wordFromCurTry.length; i++) {
      const expected = this.targetWord[i];
      const curLetter = curTry.letters[i];
      const got = curLetter.text;
      let state = LetterState.WRONG;
      if (expected === got && targetWordLetterCounts[got] > 0) {
        targetWordLetterCounts[expected]--
        state = LetterState.CORRECT;
      }
      else if (this.targetWord.includes(got) && targetWordLetterCounts[got] > 0) {
        targetWordLetterCounts[got]--;
        state = LetterState.PARTIAL_MATCH;
      }
      states.push(state)
    }
    // console.log(states);

    for (let i = wordFromCurTry.length; i < MAX_WORD_LEN; i++) {
      wordFromCurTry.concat(' ');
      states.push(LetterState.WRONG);
    }

    this.animateTry(curTry, states);

    this.numTries++;

    let wordLenMsg: string = '';
    if (wordFromCurTry.length > this.targetWord.length) {
      this.populateNextRow("Word has less than " + wordFromCurTry.length + " letters");
    }
    else if (wordFromCurTry.length < this.targetWord.length) {
      this.populateNextRow("Word has more than " + wordFromCurTry.length + " letters");
    }
    else {
      this.populateNextRow('Amount of letters is correct!');
    }

    return true;
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

  private populateNextRow(tryMsg: string) {
    const letters: Letter[] = [];
    for (let j = 0; j < MAX_WORD_LEN; j++) {
      letters.push({ text: '', state: LetterState.PENDING });
    }
    this.tries.push({ letters, tryMsg });
  }

  private async animateTry(curTry: Try, states: LetterState[]) {
    // Get the current try
    const tryContainer = this.tryContainers.get(this.numTries)?.nativeElement as HTMLElement;
    const letterEles = tryContainer.querySelectorAll('.letter-container');
    for (let i = 0; i < letterEles.length; i++) {
      const curLetterEle = letterEles[i];
      curLetterEle.classList.add('fold');
      // Wait for the fold animation to finish
      await this.wait(180);
      // Update state
      curTry.letters[i].state = states[i];
      curLetterEle.classList.remove('fold');
      await this.wait(180);
    }
  }

  private async wait(ms: number) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms)
    })
  }

  ngOnInit(): void {
  }

}
