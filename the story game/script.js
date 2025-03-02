const titleScreenDiv = document.getElementById("titleScreen");
const gameDiv = document.getElementById("game");
const resultDiv = document.getElementById("result");
const beginStoryButton = document.getElementById("beginStoryButton");
const storyInput = document.getElementById("storyInput");
const nextButton = document.getElementById("nextButton");
const resultStory = document.getElementById("resultStory");
const resetButton = document.getElementById("resetButton");
const gameTitle = document.getElementById("gameTitle");
const endStoryButton = document.getElementById("endStoryButton");
const storyComponentsDiv = document.getElementById("storyComponents");
const componentsList = document.getElementById("componentsList");
const backButton = document.getElementById("backButton");
const theEnd = document.getElementById("theEnd");
const charCountDisplay = document.getElementById("charCount");
const charLimitError = document.getElementById("charLimitError");
const fullStopError = document.getElementById("fullStopError");

let story = "";
let firstTurn = true;
let storyNouns = [];
let storySegments = [];
let wordFrequencies = {}; // Track word frequencies
let resetConfirmed = false; // Flag for reset confirmation

beginStoryButton.addEventListener("click", beginStory);
nextButton.addEventListener("click", nextTurn);
resetButton.addEventListener("click", handleResetClick); // Use a handler function
endStoryButton.addEventListener("click", endGame);
backButton.addEventListener("click", goBack);
storyInput.addEventListener("input", updateCharacterCount);

function beginStory() {
  titleScreenDiv.classList.add("hidden");
  gameDiv.classList.remove("hidden");
  endStoryButton.style.display = "inline-block";
  resetButton.style.display = "none"; // Initially hide reset button
  resetButton.textContent = "Reset"; // Ensure correct initial text
  resetConfirmed = false; // Reset confirmation flag
  storyInput.focus();
}

function updateCharacterCount() {
  const currentLength = storyInput.value.length;
  charCountDisplay.textContent = `${currentLength}/100`;

  if (currentLength > 100) {
    charLimitError.classList.remove("hidden");
    nextButton.disabled = true;
    nextButton.style.opacity = 0.5;
  } else {
    charLimitError.classList.add("hidden");
    nextButton.disabled = false;
    nextButton.style.opacity = 1;
  }
}

function nextTurn() {
  const inputText = storyInput.value.trim();

  if (!inputText.endsWith(".")) {
    fullStopError.classList.remove("hidden"); // Show error
    return; // Stop if no full stop
  }
  fullStopError.classList.add("hidden"); // Hide error if present

  if (inputText === "") {
    return;
  }

  storySegments.push(inputText);
  story += inputText + " "; // Add the space here
  extractAndAddNouns(inputText);
  updateComponentsDisplay();
  storyInput.value = "";
  updateCharacterCount();
  if (firstTurn) {
    storyInput.placeholder =
      "Now pass to the next player and continue the story. You can finish the story at any time.";
    firstTurn = false;
  }
  storyInput.focus();
}

function goBack() {
  if (storySegments.length > 0) {
    const lastSegment = storySegments.pop();
    story = story.substring(0, story.length - lastSegment.length - 1); //remove last segment
    removeNounsFromSegment(lastSegment);
    updateComponentsDisplay();
    storyInput.value = lastSegment;
    updateCharacterCount();
    storyInput.focus();
    if (storySegments.length === 0) {
      firstTurn = true;
      storyInput.placeholder = "Begin a story about anything and tap next.";
    }
  } else {
    resetGame();
  }
}

function removeNounsFromSegment(segment) {
  const words = segment.split(/\s+/);
  for (const word of words) {
    const cleanedWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const index = storyNouns.indexOf(cleanedWord);
    if (index > -1) {
      storyNouns.splice(index, 1);
    }
    // Decrement word frequency
    if (wordFrequencies[cleanedWord] > 0) {
      wordFrequencies[cleanedWord]--;
    }
  }
}
// --- Heuristic Noun Extraction ---
function extractAndAddNouns(text) {
  const words = text.split(/\s+/);
  const indicators = [
    "the",
    "a",
    "an",
    "this",
    "that",
    "these",
    "those",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
  ];
  const pronouns = [
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "its",
    "our",
    "their",
    "myself",
    "yourself",
    "himself",
    "herself",
    "itself",
    "ourselves",
    "yourselves",
    "themselves",
  ]; //Pronouns
  const adpositions = [
    "above",
    "across",
    "after",
    "against",
    "along",
    "among",
    "around",
    "as",
    "at",
    "before",
    "behind",
    "below",
    "beneath",
    "beside",
    "between",
    "beyond",
    "but",
    "by",
    "concerning",
    "despite",
    "down",
    "during",
    "except",
    "for",
    "from",
    "in",
    "inside",
    "into",
    "like",
    "near",
    "of",
    "off",
    "on",
    "onto",
    "out",
    "outside",
    "over",
    "past",
    "regarding",
    "round",
    "since",
    "through",
    "throughout",
    "till",
    "to",
    "toward",
    "under",
    "underneath",
    "until",
    "unto",
    "up",
    "upon",
    "with",
    "within",
    "without",
  ];

  for (let i = 0; i < words.length; i++) {
    let word = words[i].replace(/[^a-zA-Z]/g, "").toLowerCase();

    if (word.length > 3 && !isCommonWord(word) && !pronouns.includes(word)) {
      // Check if preceded by an indicator
      if (
        i > 0 &&
        indicators.includes(
          words[i - 1].replace(/[^a-zA-Z]/g, "").toLowerCase()
        )
      ) {
        addNoun(word);
        continue; // Move to the next word
      }

      //Check for noun followed by noun (prioritize the second)
      if (i < words.length - 1) {
        let nextWord = words[i + 1].replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (
          word.length > 3 &&
          !isCommonWord(nextWord) &&
          !pronouns.includes(nextWord) &&
          !adpositions.includes(nextWord)
        ) {
          addNoun(nextWord);
          i++; //Skip the next word as it has been added.
          continue;
        }
      }

      // Check if followed by "of" or "with" (common with descriptive nouns)
      if (
        i < words.length - 2 &&
        adpositions.includes(
          words[i + 1].replace(/[^a-zA-Z]/g, "").toLowerCase()
        )
      ) {
        addNoun(word);
        continue;
      }
      // Check if followed by a verb (less reliable, but can help)
      if (i < words.length - 1) {
        let nextWord = words[i + 1].replace(/[^a-zA-Z]/g, "").toLowerCase();
        //VERY basic verb check.
        if (
          nextWord.endsWith("ing") ||
          nextWord.endsWith("ed") ||
          nextWord.endsWith("s")
        ) {
          addNoun(word);
          continue;
        }
      }
    }
  }
}

function addNoun(word) {
  if (!storyNouns.includes(word)) {
    storyNouns.push(word);
  }
  // Increment word frequency
  wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
}

function isCommonWord(word) {
  const commonWords = [
    "the",
    "and",
    "a",
    "to",
    "of",
    "in",
    "is",
    "it",
    "you",
    "that",
    "he",
    "was",
    "for",
    "on",
    "are",
    "as",
    "with",
    "his",
    "they",
    "at",
    "be",
    "this",
    "have",
    "from",
    "or",
    "one",
    "had",
    "by",
    "word",
    "but",
    "not",
    "what",
    "all",
    "were",
    "we",
    "when",
    "your",
    "can",
    "said",
    "there",
    "use",
    "an",
    "each",
    "which",
    "she",
    "do",
    "how",
    "their",
    "if",
    "will",
    "up",
    "other",
    "about",
    "out",
    "many",
    "then",
    "them",
    "these",
    "so",
    "some",
    "her",
    "would",
    "make",
    "like",
    "him",
    "into",
    "time",
    "has",
    "look",
    "two",
    "more",
    "write",
    "go",
    "see",
    "number",
    "no",
    "way",
    "could",
    "people",
    "my",
    "than",
    "first",
    "water",
    "been",
    "call",
    "who",
    "oil",
    "its",
    "now",
    "find",
    "long",
    "down",
    "day",
    "did",
    "get",
    "come",
    "made",
    "may",
    "part",
  ];
  return commonWords.includes(word);
}

function updateComponentsDisplay() {
  componentsList.innerHTML = "";
  let sortedNouns = [...storyNouns].sort(
    (a, b) => wordFrequencies[b] - wordFrequencies[a]
  );

  for (const noun of sortedNouns) {
    const nounElement = document.createElement("p");
    nounElement.textContent = noun;
    componentsList.appendChild(nounElement);
  }
}

function endGame() {
  story += storyInput.value; //removed extra space
  extractAndAddNouns(storyInput.value);
  updateComponentsDisplay();

  gameDiv.classList.add("hidden");
  resultDiv.classList.remove("hidden");
  endStoryButton.style.display = "none";
  resetButton.style.display = "inline-block";
  resetButton.textContent = "Reset";
  resetConfirmed = false;
  resultStory.textContent = story;
  theEnd.style.display = "block";
}

function handleResetClick() {
  if (resetConfirmed) {
    resetGame();
  } else {
    resetButton.textContent = "Are you sure?";
    resetConfirmed = true;
  }
}

function resetGame() {
  story = "";
  firstTurn = true;
  storyNouns = [];
  storySegments = [];
  wordFrequencies = {};
  storyInput.value = "";
  updateCharacterCount();
  resultStory.textContent = "";
  storyInput.placeholder = "Begin a story about anything and tap next.";
  componentsList.innerHTML = "";
  theEnd.style.display = "none";

  gameDiv.classList.add("hidden");
  resultDiv.classList.add("hidden");
  titleScreenDiv.classList.remove("hidden");
  endStoryButton.style.display = "none";
  resetButton.style.display = "none";
  resetConfirmed = false;
}
