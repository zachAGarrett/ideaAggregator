// Create ideas from example sentences on Merriam Webster
const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = (word) => {return `https://www.merriam-webster.com/dictionary/${word}`};
const search_from = ["book"]
process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

(async () => {
    const browser = await puppeteer.launch();
    console.log(`Browser Launched`);
    const page = await browser.newPage();
    console.log(`New Page`);
    for (const word of search_from) {
        try {
            await page.goto(url(word), {waitUntil: 'domcontentloaded'});
            console.log(`Arrived at ${url(word)}`);
        } catch (err) {
           console.log(err);
        }
        const sentences = await page.evaluate(() => 
            Array.from($('.ex-sent'), element => element.innerText)
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
                        words_serial.push(word.replace(/(?!\-+\w)\W/gi, '').toLowerCase())
                    }
                    const words_filtered = words_serial.filter(el => el)
                    const words_set = new Set(words_filtered);
                    const words_no_dup = [...words_set];
                    const sentence_serial = sentence.replace(/^\s*|^\t|\s+$|\t|\n|\"|\-+\W|\s(?!\w)/gi, '')
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
        fs.readFile(`${__dirname}/data/data.json`, function readFileCallback(err, data){
            if (err || Obj_ideas === undefined || Obj_ideas === null){
                return console.log('Operation aborted');
            } else {
                const json_data = JSON.parse(data);
                const ideas = json_data.ideas;
                console.log(`I have logged ${ideas.length} ideas.`);
                for (const idea of Obj_ideas) {
                    console.log(`New Entry: ${idea}`);
                    ideas.push(idea);
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