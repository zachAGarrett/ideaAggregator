
// Read entries from dictionary
const readDictionary = (p) => {
  const json_data = fs.readFileSync(p, 'utf-8');
  const parsed = JSON.parse(json_data)
  return parsed.dictionary.map(e => e.root);
};
// Find all unique pairs from the dictionary terms
const pairDict = (arr) => {
  if (arr.length < 2) {return [];}
  let first = arr[0],
    rest  = arr.slice(1),
    pairs = rest.map((x) => {return `${first}-${x}`;});
    return pairs.concat(pairDict(rest));
  };
// Extract words from a given sentence
const wordsInSentence = (s) => {
  const words = s.match(/\b(\w\w*)\b/g);
  const case_correction = words.map(e => e.toLowerCase());
  return case_correction;
};
// fins all pairs from a given sentence
const pairSent = (arr) => {
  if (arr.length < 2) {return [];}
  let first = arr[0],
    rest  = arr.slice(1),
    pairs = rest.map((x) => {
      return {
        case_a: `${first}-${x}`,
        case_b: `${x}-${first}`
      };
    });
  return pairs.concat(pairSent(rest));
};
// Find keys of sentence pairs
const findPair = (arr, dict) => {
  return arr.map(e => dict.indexOf(e.case_a) === -1 ? 
    dict.indexOf(e.case_b) :
    dict.indexOf(e.case_a) 
  );
};
// Chunk a given array by a specified ammount
const chunk = (arr, size) => {
  if (!arr) return [];
  const firstChunk = arr.slice(0, size);
  if (!firstChunk.length) {
    return arr;
  }
  return [firstChunk].concat(chunk(arr.slice(size, arr.length), size)); 
};
// Find the nearest square root, higher than the current (if the current is a decimal)
const next_sqrt = (n) => Math.ceil(Math.sqrt(n));
// Create a map of all dictionary pairs with x, y coordinate values based on entry key
const mapPairs = (dict) => {
  const master = dict.map(e => ({pair: e, val: 0, x: 0, y: 0,}));
  const gridBounds = next_sqrt(dict.length);
  (() => {
    const placesToFill = Math.pow(gridBounds, 2) - master.length;
    for (let i = 0; i < placesToFill; i++) {
      master.push({
        pair: 0,
        val: 0,
        x: 0,
        y: 0,
      });
    }
  })();
  const chunkedArray = chunk(master, gridBounds);
  for (let i = 0; i < chunkedArray.length; i++) {
    for (let j = 0; j < chunkedArray[i].length; j++) {
      chunkedArray[i][j].x = j;
      chunkedArray[i][j].y = i;
    }
  }
  const flat = chunkedArray.flat();
  return flat;
};
// Create an "image" with unique x, y coordinates for a given sentence, based on the word pairs
const sentenceImage = (sent, dict) => {
  return sent.map(e => ({
    pair: dict[e].pair,
    x: dict[e].x,
    y: dict[e].y,
    val: 1,
  }))
};
const dictPairs = (t) => {
  const pairs = pairDict(t);
  const selfPairs = t.map(e => `${e}-${e}`);
  for (const pair of selfPairs) {
    pairs.push(pair);
  }
  return pairs;
};

const fs = require('fs');
const cuid = require('cuid');
const root = __dirname;
const dataDir = '/data/data.json';
const sentence = "Our friends will read books and news at the library.";
const terms = readDictionary(root+dataDir);
const dictionaryPairs = dictPairs(terms);
const sentenceImg = {
  id: cuid(),
  bounds: next_sqrt(dictionaryPairs.length),
  sentence: [
    ...sentenceImage(
      findPair(
        pairSent(
          wordsInSentence(sentence)
        ), 
        dictionaryPairs
      ), 
      mapPairs(dictionaryPairs)
    )
  ]
};
const imgDir = '/data/sentenceImages/images.json';
const images = JSON.parse(
  fs.readFileSync(root+imgDir, 'utf-8')
);
images.push(sentenceImg);
const new_json = JSON.stringify(images, null, 2);
fs.writeFileSync(root+imgDir, new_json, (err) => {
  if (err) {console.log(err)};
});
    



// const positionsInSentence = (arr) => {
//   const tenThou = (x) => {
//     return Number.parseFloat(x).toFixed(3);
//   }
//   const arrLength = arr.length;
//   const keys = Object.keys(arr);
//   return keys.map(e => tenThou((parseInt(e, 10) + 1)/arrLength));
// }
// const positionVectors = positionsInSentence(sentenceWords);
// const dictionaryLocations = (arr, dict) => {
//   return arr.map(e => dict.indexOf(e));
// }
// const locationValues = dictionaryLocations(sentenceWords, dictionaryTerms);
// const combine = (locations, vectors) => {
//   const results = [];
//   for (var i = 0; i < locations.length; i++) {
//       results.push([locations[i], vectors[i]]);
//   }
//   return results;
// };
// const sentence_array = combine(locationValues, positionVectors);
// console.log(sentence_array);