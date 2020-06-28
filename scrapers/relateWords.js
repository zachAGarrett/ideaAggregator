const axios = require('axios');
let word = 'cat'
let url = 'https://relatedwords.org/api/related?term=' + word;

fetchData(url).then( (res) => {
    const response = res.data;
    const topTwenty = response.slice(0, 19);
    const words = [];
    for (const word of topTwenty) {
        words.push(word.word)
    }
    console.log(words);
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
