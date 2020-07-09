const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');

const new_words = [];
const known_words = [];
const json_data = fs.readFileSync('./lists/data.json')
const parsed_json_data = JSON.parse(json_data);
const dictionary = parsed_json_data.dictionary;
const ideas = parsed_json_data.ideas;
const weights = parsed_json_data.weights;
console.log(`I currently know ${dictionary.length} words.`);
console.log(`I have logged ${ideas.length} ideas.`);
console.log(`I am tracking weights for ${weights.length} words.`);
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
const urls = clean_new_words.map(x => `https://www.merriam-webster.com/dictionary/${x}`);
console.log(`Preparing to learn ${clean_new_words.length} words from ${urls.length} urls.`);
process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

(async () => {
    const browser = await puppeteer.launch();
    console.log(`Browser Launched`);
    const page = await browser.newPage();
    console.log(`New Page`);
    for (const url of urls) {
        await page.goto(url, {waitUntil: 'domcontentloaded'});
        console.log(`Arrived at ${url}`);
        const words = await page.evaluate(() => 
            Array.from($('.entry-header .hword'), element => element.textContent)
        );
        const words_set = new Set(words);
        const words_no_dup = [...words_set];
        console.log(`Word set acquired: ${words_no_dup}`);
        const types = await page.evaluate(() => 
            Array.from($('.entry-header .important-blue-link'), element => element.textContent)
        );
        const types_serial = types.map(x => x.replace(/(\s+$)|(\s+\W)|\d|[()]/gi, ''));
        const types_set = new Set(types_serial);
        const types_no_dup = [...types_set];
        console.log(`Types set acquired: ${types_no_dup}`);
        const variations = await page.evaluate(() => 
            Array.from($('.headword-row .if'), element => element.textContent)
        );
        const variations_set = new Set(variations);
        const variations_no_dup = [...variations_set];
        console.log(`Variation set acquired: ${variations_no_dup}`);
        const Obj_word = {
            root: words_no_dup[0],
            words: words_no_dup,
            variations: variations_no_dup,
            types: types_no_dup,
        };
        console.log(`New Entry: ${Obj_word.root}`);
        fs.readFile('./lists/data.json', function readFileCallback(err, data){
            if (err || Obj_word.root === undefined || Obj_word.root === null){
                return console.log('Operation aborted');
            } else {
                const json_data = JSON.parse(data);
                const dictionary = json_data.dictionary;
                const wordExists = (word) => { 
                    return word.root === Obj_word.root;
                    }
                const dupCheck = dictionary.find(wordExists)
                if (dupCheck === undefined) {
                    dictionary.push(Obj_word); //add word to dictionary
                } else { 
                    console.log(`${Obj_word.root} is a known word`)
                    console.log('Operation aborted')
                }
                const new_json = JSON.stringify(json_data, null, 2); //convert it back to json
                fs.writeFile('./lists/data.json', new_json, function(){
                }); // write it back 
                return console.log('File saved')
            }
        })
    }
    await browser.close();
})();