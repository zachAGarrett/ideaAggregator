const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');


const words = [];
const urls = [];

fs.readFile('./lists/WordBank.json', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    const WordList = JSON.parse(data); 
    for (const word of WordList) {
        words.push(word);   
    } 
}});


for (const word of words) {
    urls.push(`https://www.merriam-webster.com/dictionary/${word}`)
};

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

const program = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    const words = await page.evaluate(() => 
        Array.from($('.entry-header .hword'), element => element.textContent)
    );
    const words_set = new Set(words);
    const words_no_dup = [...words_set];

    const types = await page.evaluate(() => 
        Array.from($('.entry-header .important-blue-link'), element => element.textContent)
    );
    const types_serial = [];
    for (const type of types) {
        const type_serial = type.replace(/[^a-z]/gi, '');
        types_serial.push(type_serial);
    }
    const types_set = new Set(types_serial);
    const types_no_dup = [...types_set];

    const variations = await page.evaluate(() => 
        Array.from($('.headword-row .if'), element => element.textContent)
    );
    const variations_set = new Set(variations);
    const variations_no_dup = [...variations_set];

    const Obj = {
        root: words_no_dup[0],
        words: words_no_dup,
        variations: variations_no_dup,
        types: types_no_dup,
    };
    fs.readFile('./lists/Words.json', function readFileCallback(err, data){
        if (err){
            const json_init = {table: [Obj]}
            const json = JSON.stringify(json_init, null, 2);
            fs.writeFile('./lists/Words.json', json, function (){
                console.log('File Written')
            });
        } else {
        const old_json = JSON.parse(data); //now it an object
        old_json.table.push(Obj); //add some data
        const new_json = JSON.stringify(old_json, null, 2); //convert it back to json
        fs.writeFile('./lists/Words.json', new_json, function(){
            console.log('Data Appended')
        }); // write it back 
    }});
    

    await browser.close();
}

for (const url of urls) {
    program(url);
}