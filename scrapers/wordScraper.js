const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');


const words = [];
const urls = [];

const json = fs.readFileSync('./lists/WordBank.json', 'utf8');
const parsed_json = JSON.parse(json);
for (const word of parsed_json) {
    words.push(word)
}
const known_words = [];
const readWords = () => {
    const json_known_words = fs.readFileSync('./lists/KnownWords.json', 'utf8');
    const parsed_json_known_words = JSON.parse(json_known_words);
    if (parsed_json_known_words.table.length > 0) {
        for (const word of parsed_json_known_words.table) {
            known_words.push(word.root)
        }
    } else {
        return console.log('No known words');
    }
}
try {
    readWords();
} catch (error) {
    console.log(error);
    const Obj_init = {table: []};
    const json_init = JSON.stringify(Obj_init, null, 2);
    fs.writeFileSync('./lists/KnownWords.json', json_init, function (err,data){
        if (err) return console.log(err);
        console.log(`Wrote: ${data}`);
    });
    readWords();
}
for (const word of known_words) {
    const index = words.indexOf(word);
    if (index > -1) {
        words.splice(index, 1);
    }
}
console.log(`Words to enter: ${words}`);



for (const word of words) {
    urls.push(`https://www.merriam-webster.com/dictionary/${word}`)
};

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
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
            const type_serial = type.replace(/(\s+$)|\d|[()]/gi, '');
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

        const Obj = {
            root: words_no_dup[0],
            words: words_no_dup,
            variations: variations_no_dup,
            types: types_no_dup,
        };
        console.log(`New Entry: ${Obj.root}`);
        fs.readFile('./lists/KnownWords.json', function readFileCallback(err, data){
            if (err){
                console.log(err);
                const json_init = {table: [Obj]}
                const json = JSON.stringify(json_init, null, 2);
                fs.writeFile('./lists/KnownWords.json', json, function (){
                    console.log(`File Written with: ${Obj}`)
                });
            } else {
                const parsed_json_known_words = JSON.parse(data);
                const dupCheck = [];

                function wordExists(word) { 
                    return word.root === Obj.root;
                  }
                  
                dupCheck.push(parsed_json_known_words.table.find(wordExists))
                console.log(dupCheck)
                if (dupCheck[0] === undefined) {
                    parsed_json_known_words.table.push(Obj); //add some data
                    const new_json = JSON.stringify(parsed_json_known_words, null, 2); //convert it back to json
                    fs.writeFile('./lists/KnownWords.json', new_json, function(){
                        console.log('Data appended')
                    }); // write it back 
                } else { 
                    return console.log(`${Obj.root} is a known word`)
                }
        }});
    }
    
    await browser.close();
})();