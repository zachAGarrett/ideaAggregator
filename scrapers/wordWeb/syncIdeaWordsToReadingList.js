// Push new words from the reading list to the dictionary
const fs = require('fs');
const new_words = [];
const known_words = [];
const json_data = fs.readFileSync(`${__dirname}/data/data.json`)
const parsed_json_data = JSON.parse(json_data);
const dictionary = parsed_json_data.dictionary;
const ideas = parsed_json_data.ideas;
console.log(`I currently know ${dictionary.length} words.`);
console.log(`I have logged ${ideas.length} ideas.`);
const ideas_vals = ideas.map(x => Object.values(x.words));
for (const idea of ideas_vals) {
    for (const word of idea) {
        new_words.push(word.toLowerCase());
    }
}
const dictionary_vals = dictionary.map(x => x.root);
for (const word of dictionary_vals) {
    known_words.push(word);
}
const new_words_set = new Set(new_words);
const clean_new_words = [...new_words_set]
for (const word of known_words) {
    const l_case_word = word.toLowerCase();
    const index = clean_new_words.indexOf(l_case_word);
    if (index > -1) {
        clean_new_words.splice(index, 1);
    }
}
console.log(`Adding ${clean_new_words.length} words to my reading list.`);
console.log(clean_new_words);
const new_json = JSON.stringify(clean_new_words, null, 2); //convert it back to json
fs.writeFileSync(`${__dirname}/data/readingList.json`, new_json, function (err,data){
    if (err) {
        return console.log(err);
    } else {
        return console.log(`New file using: ${data}`)
    }
});