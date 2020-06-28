const axios = require('axios');
const cheerio = require('cheerio');
const url = 'http://www.talkenglish.com/vocabulary/top-1500-nouns.aspx';

fetchData(url).then( (res) => {
    const response = res.data;
    const $ = cheerio.load(response);
    const nounsTable = $('#GridView3 > tbody > tr');
    const nounsList = [];
    nounsTable.each(function() {
        let word = $(this).children('td').eq(1).children('a').text();
        nounsList.push(word);
    });
    const filterNounsList = nounsList.filter(Boolean);

    const json = JSON.stringify(filterNounsList);
    const fs = require('fs');
    fs.writeFile('../lists/Nouns.json', json, function (){
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