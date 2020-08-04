// Learn new words from the reading list
const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const readKnownWords = () => {
    const json_data = fs.readFileSync(`${__dirname}/data/data.json`, 'utf8');
    const parsed_json_data = JSON.parse(json_data);
    if (parsed_json_data.dictionary.length > 0) {
        for (const word of parsed_json_data.dictionary) {
            known_words.push(word.root);
        }
    } else {
        return console.log('No known words');
    }
};
const url = (word) => {return `http://wordnetweb.princeton.edu/perl/webwn?s=${word}&sub=Search+WordNet&o2=&o0=&o8=1&o1=&o7=&o5=&o9=&o6=&o3=&o4=1&h=0000000`};
const known_words = [];
try {
    readKnownWords();
} catch (err) {
    console.log(err);
    const Obj_init = {
        dictionary: [],
        ideas: [],
        weights: [],
    };
    const json_init = JSON.stringify(Obj_init, null, 2);
    fs.writeFileSync(`${__dirname}/data/data.json`, json_init, function (err,data){
        if (err) {
            return console.log(err);
        } else {
            return console.log(`New file using: ${data}`)
        }
    });
}
const json_word_bank = fs.readFileSync(`${__dirname}/data/readingList.json`, 'utf8');
const wordBank = JSON.parse(json_word_bank);
const new_words = wordBank.map(el => el);
// const new_words = ["stuff", "neat", "think"];
const json_data = fs.readFileSync(`${__dirname}/data/data.json`);
const parsed_json_data = JSON.parse(json_data);
const dictionary = parsed_json_data.dictionary;
console.log(`I currently know ${dictionary.length} words.`);
const dictionary_vals = dictionary.map(x => x.root);
for (const word of dictionary_vals) {
    known_words.push(word.toLowerCase());
}
for (const known_word of known_words) {
    const index = new_words.indexOf(known_word);
    if (index > -1) {
        new_words.splice(index, 1);
    }
}
console.log(`Preparing to learn ${new_words.length} words.`);
process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

(async () => {
    const browser = await puppeteer.launch();
    console.log(`Browser Launched`);
    const page = await browser.newPage();
    console.log(`New Page`);
    for (const word of new_words) {
        try {
            await page.goto(url(word), {waitUntil: 'domcontentloaded'});
            console.log(`Arrived at ${url(word)}`);
        } catch (err) {
           console.log(err);
        }
        const types = await page.$$eval('.form > h3', el => el.map(item => item.innerText.toLowerCase()));
        const types_set = new Set(types);
        const types_no_dup = [...types_set];
        console.log(`Types set acquired: ${types_no_dup}`);
        const subTypes = await page.$$eval('.form ul', el => el.map(item => item.innerText.match(/(?<=\.)(.*?)(?=\>)/gi)));
        const subTypes_set = subTypes.map(x => new Set(x));
        const subTypes_no_dup = subTypes_set.map(x => [...x]);
        console.log(`Types set acquired: ${subTypes_no_dup}`);
        const types_array = [];
        for (let i = 0; i < types_no_dup.length; i++) {
             types_array.push([types_no_dup[i], [...subTypes_no_dup[i]]])           
        }
        console.log(types_array.length)
        if (types_array.length === 0) {
            types_array.push(["other", []])
        }
        console.log(types_array)
        const Obj_word = {
            root: word,
            types: Object.fromEntries(types_array),
        };
        console.log(`New Entry: ${Obj_word.root}`);
        fs.readFile(`${__dirname}/data/data.json`, function readFileCallback(err, data){
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
                fs.writeFile(`${__dirname}/data/data.json`, new_json, function(){
                }); // write it back 
                return console.log('File saved')
            }
        })
    }
    await browser.close();
})();