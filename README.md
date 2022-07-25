# Variadle (Variable Wordle)
By Juan De Luca - juan.deluca.contact@gmail.com
## Table of contents
1. Link
1. Overivew
1. Clues
1. Development server

## 1. Link
To play the game, visit https://bit.ly/variadle

## 2. Overview
The idea behind this game is that, just like in the original Wordle game, one has a determined amount of tries to guess the correct word that the game chooses. But unlike the original Wordle game, here the amount of letters in the word to guess can go from 1 to 10 (10 was chosen as the maximum for simplicity reasons, given that a higher amount of letters would make the UI look too loaded), and the amount of tries depends on the length of the word, as it is the amount of letters + 1. So if the chosen word has 4 letters, then one has 5 tries to guess the word.

## 3. Clues
In addition to the original clues from the Wordle game (a letter turns yellow if the it belongs to the word but is in an incorrect position, green if the letter belongs to the word and it's position is correct, and dark grey if the letter doesn't belong to the word), an extra clue has been added to help the user know how many letters are there in the word. So if the word has 5 letters and a 4 letter word is introduced, then a message that reads "The word has more than 4 letters" will appear in the screen, before the space to introduce the next try. Additionally, messages telling the user if the word belongs to the dictionary, if they won or if they lost, will pop-up on the screen when needed.

## 4. Development server
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.0.6.
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.