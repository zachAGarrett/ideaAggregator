const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');


const new_words = ['man'];
const urls = [];

// const json = fs.readFileSync('./lists/WordBank.json', 'utf8');
// const parsed_json = JSON.parse(json);
// for (const word of parsed_json) {
//     new_words.push(word)
// }
const readDictionary = () => {
    const json_data = fs.readFileSync('./lists/data.json', 'utf8');
    const parsed_json_data = JSON.parse(json_data);
    console.log(`I currently know ${parsed_json_data.dictionary.length} words.`);
    console.log(`I have logged ${parsed_json_data.ideas.length} ideas.`);
    console.log(`I am tracking weights for ${parsed_json_data.weights.length} words.`);
    if (parsed_json_data.dictionary.length > 0) {
        for (const word of parsed_json_data.dictionary) {
            known_words.push(word.root);
        }
    } else {
        return console.log('No known words');
    }
}
const known_words = [];
try {
    readDictionary();
} catch (error) {
    console.log(error);
    const Obj_init = {
        dictionary: [],
        ideas: [],
        weights: [],
    };
    const json_init = JSON.stringify(Obj_init, null, 2);
    fs.writeFileSync('./lists/data.json', json_init, function (err,data){
        if (err) {
            return console.log(err);
        } else {
            return console.log(`New file using: ${data}`)
        }
    });
    readDictionary();
}
for (const word of known_words) {
    const index = new_words.indexOf(word);
    if (index > -1) {
        new_words.splice(index, 1);
    }
}
console.log(`Words to enter: ${new_words}`);



for (const word of new_words) {
    urls.push(`https://www.merriam-webster.com/dictionary/${word}`)
};

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
        const types_serial = [];
        for (const type of types) {
            const type_serial = type.replace(/(\s+$)|(\s+\W)|\d|[()]/gi, '');
            types_serial.push(type_serial);
        }
        const types_set = new Set(types_serial);
        const types_no_dup = [...types_set];
        console.log(`Types set acquired: ${types_no_dup}`);

        const variations = await page.evaluate(() => 
            Array.from($('.headword-row .if'), element => element.textContent)
        );
        const variations_set = new Set(variations);
        const variations_no_dup = [...variations_set];
        console.log(`Variation set acquired: ${variations_no_dup}`);

        const sentences = await page.evaluate(() => 
            Array.from($('.ex-sent'), element => element.textContent)
        );
        const Obj_ideas = [];
        for (const sentence of sentences) {
            const subSentences = sentence.match(/([^\.!\?]+[\.!\?])/g);
            try {
                const sentencesCorrected = []
                for (let i = 0; i < subSentences.length; i ++) {
                  const tester = subSentences[i].match(/\w/g).length > 2 
                  ? sentencesCorrected.push(subSentences[i]) 
                  : (sentencesCorrected[i-1] = sentencesCorrected[i-1]
                  + subSentences[i]
                  + subSentences[i+1]) && i++;
                }
                for (const sentence of sentencesCorrected) {
                    const words = sentence.split(" ");
                    const words_serial = [];
                    for (const word of words) {
                        words_serial.push(word.replace(/\W/gi, ''))
                    }
                    const words_filtered = words_serial.filter(el => el)
                    const words_set = new Set(words_filtered);
                    const words_no_dup = [...words_set];
                    const sentence_serial = sentence.replace(/^\s*|^\t|\s+$|\t|\n|\"|\-+\s*/gi, '')
                    if (sentence_serial.length > 0) {
                        Obj_ideas.push({
                            sentence: sentence_serial,
                            words: words_no_dup,
                            evaluated: false,
                        })
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        const Obj_word = {
            root: words_no_dup[0],
            words: words_no_dup,
            variations: variations_no_dup,
            types: types_no_dup,
        };
        console.log(`New Entry: ${Obj_word.root}`);
        fs.readFile('./lists/data.json', function readFileCallback(err, data){
            if (err){
                return console.log(err);
            } else {
                const json_data = JSON.parse(data);
                const dictionary = json_data.dictionary;
                const ideas = json_data.ideas;
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
                for (const idea of Obj_ideas) {
                    ideas.push(idea);
                }
                const new_json = JSON.stringify(json_data, null, 2); //convert it back to json
                fs.writeFile('./lists/data.json', new_json, function(){
                }); // write it back 
                console.log('File saved')
            }
        });
    }
    await browser.close();
})();