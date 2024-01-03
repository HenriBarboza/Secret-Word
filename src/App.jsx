//  React
import { useState, useCallback, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Howl } from 'howler'

// Components
import StartScreen from './components/StartScreen'
import Game from './components/Game'
import GameOver from './components/GameOver'

// data
import { wordsList } from './data/words'

// CSS
import './App.css'

const stages = [
  { id: 1, name: "start" },
  { id: 2, name: "game" },
  { id: 3, name: "end" },
];

const guessesQty = 3;

function App() {
  const [count, setCount] = useState(0)
  const [gameStage, setGameStage] = useState(stages[0].name);
  const [words] = useState(wordsList);

  const [pickedWord, setPickedWord] = useState("");
  const [pickedCategory, setPickedCategory] = useState("");
  const [letters, setLetters] = useState([]);

  const [guessedLetters, setGuessedLetters] = useState([])
  const [wrongLetters, setWrongLetters] = useState([])
  const [guesses, setGuesses] = useState(guessesQty)
  const [score, setScore] = useState(0)


  const winSound = () => {
    // Configuração do som
    const som = new Howl({
      src: ['src/assets/sounds/win-sound.mp3'], // Substitua pelo caminho do seu arquivo de som
      volume: 1, // Ajuste o volume conforme necessário
    });

    // Reproduz o som
    som.play();
  };
  const errorSound = () => {
    // Configuração do som
    const som = new Howl({
      src: ['src/assets/sounds/error-sound.mp3'], // Substitua pelo caminho do seu arquivo de som
      volume: 7, // Ajuste o volume conforme necessário
    });

    // Reproduz o som
    som.play();
  };

  const pickWordAndCategory = useCallback(() => {
    // pick a random category
    const categories = Object.keys(words)
    const category = categories[Math.floor(Math.random() * Object.keys(categories).length)];

    //pick a random word
    const word = words[category][Math.floor(Math.random() * words[category].length)];

    return { word, category };
  }, [words]);

  // start the game
  const startGame = useCallback(() => {
    // clear all letters
    clearLetterStates()
    // pick word and pick category
    const { word, category } = pickWordAndCategory();

    // create an array of letters
    let wordLetters = word.split("");

    wordLetters = wordLetters.map((l) => l.toLowerCase());

    // fill states
    setPickedWord(word);
    setPickedCategory(category);
    setLetters(wordLetters);

    setGameStage(stages[1].name);
  }, [pickWordAndCategory]);

  // process the letter input
  const verifyLetter = (letter) => {

    const normalizedLetter = letter.toLowerCase()

    // check if letter has alreary been utilized
    if (guessedLetters.includes(normalizedLetter) || wrongLetters.includes(normalizedLetter)) {
      return;
    }

    // push guessed letter or remove a guess
    if (letters.includes(normalizedLetter)) {
      setGuessedLetters((actualGuessedLetters) => [
        ...actualGuessedLetters,
        normalizedLetter,
      ]);
    } else {
      setWrongLetters((actualWrongLetters) => [
        ...actualWrongLetters,
        normalizedLetter,
      ]);
      errorSound();
      setGuesses((actualGuesses) => actualGuesses - 1)
    }

  };

  const clearLetterStates = () => {
    setGuessedLetters([]);
    setWrongLetters([]);
  };

  // check if guesses ended
  useEffect(() => {
    if (guesses <= 0) {
      // reset all states
      clearLetterStates()

      setGameStage(stages[2].name);
    }
  }, [guesses])

  // check win condition
  useEffect(() => {

    const uniqueLetters = [... new Set(letters)]
    // win condition
    if (guessedLetters.length === uniqueLetters.length && gameStage === stages[1].name) {
      // add score
      winSound();
      setScore((actualScore) => actualScore += 100)
      // restart game with new word
      startGame();
    }

  }, [guessedLetters, letters, startGame])


  //retarts the game
  const retry = () => {
    setScore(0);
    setGuesses(guessesQty);

    setGameStage(stages[0].name);
  };

  return (
    <>
      <div className="app">
        {/* <button onClick={winSound}>Começar o jogo</button>
        <button onClick={errorSound}>Começar o jogo</button> */}
        {gameStage === "start" && <StartScreen startGame={startGame} />}
        {gameStage === "game" && (
          <Game
            verifyLetter={verifyLetter}
            pickedWord={pickedWord}
            pickedCategory={pickedCategory}
            letters={letters}
            guessedLetters={guessedLetters}
            wrongLetters={wrongLetters}
            guesses={guesses}
            score={score} />
        )}
        {gameStage === "end" && <GameOver retry={retry} score={score} />}
      </div>
    </>
  );
}


export default App
