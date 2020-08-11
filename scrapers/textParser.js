const fs = require('fs');
const text_path = `${__dirname}/data/textBody`;

const text = fs.readFileSync(text_path, 'utf8', (err, data) => {
    console.warn(err);
    return data;
});
// console.log(text);
const serialize = (textString) => {
    const regex_titles = /(?<=(?<titles>(mrs)|(mr)|(dr)|(esq)|(hon)|(jr)|(ms)|(messrs)|(mmes)|(msgr)|(prof)|(rev)|(rt)|(sr)|(st)))\./gi;
    // const regex_abbr = /(?<acronyms>(\w\.){2,})/g;
    const t = textString.replace(regex_titles, '');
    return t;
};
const serialized = serialize(text);
// console.log(serialized);
const regex_sentences = /(?<sentences>[^.?!]+[.?!])/g;
const sentences = serialized.match(regex_sentences);
// console.log(sentences);
const concatSentences = (arr) => {
    const checked = [];
    for (let i = 0; i < arr.length; i += 1) {
        const el = arr[i];
        if (el.match(/^\w\./g)) {
            let gather = checked[i - 1] + el;
            let c = 1;
            for (let j = 0; j < c; j += 1) {
                if (arr[i + j + 1].match(/^\w\./g)) {
                    c += 1;
                    gather += (arr[i + j + 1]);
                } else {
                    gather += (arr[i + j + 1]);
                }              
            }
            // console.log(c);
            checked[i - 1] = gather;
            i += c;
        } else {
            checked.push(el);
        }
    }
    return checked;
};
console.log(concatSentences(sentences));
console.log(concatSentences(sentences));
