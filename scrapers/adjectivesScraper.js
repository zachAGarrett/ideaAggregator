const axios = require('axios');
const cheerio = require('cheerio');
const url = 'http://www.talkenglish.com/vocabulary/top-500-adjectives.aspx';

fetchData(url).then( (res) => {
    const response = res.data;
    const $ = cheerio.load(response);
    const Table = $('#GridView3 > tbody > tr');
    const List = [];
    Table.each(function() {
        let word = $(this).children('td').eq(1).children('a').text();
        List.push(word);
    });
    const FilterList = List.filter(Boolean);

    const Obj = [];
    for (const word of FilterList) {
        Obj.push({word: word, variants: []})
    }

    const json = JSON.stringify(Obj);
    const fs = require('fs');
    fs.writeFile('./lists/Adjectives.json', json, function (){
        console.log('File Written')
    });
})

async function fetchData(url){
    console.log("Crawling data...")
    // make http call to url
    let response = await axios(url).catch((err) => console.log(err));

    if(response.status !== 200){
        console.log("Error occurred while fetching data");
        return;
    }
    return response;
}