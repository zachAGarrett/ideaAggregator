const fs = require('fs');

// we can modify the entrypoint for a body of text
const file = '/data/textBody';
const text_path = `${__dirname}${file}`;

const text = fs.readFileSync(text_path, 'utf8', (err, data) => {
    console.warn(err);
    return data;
});

// this function will remove periods after common titles
const serialize = (textString) => {
    const regex_titles = /(?<=(?<titles>(mrs)|(mr)|(dr)|(esq)|(hon)|(jr)|(ms)|(messrs)|(mmes)|(msgr)|(prof)|(rev)|(rt)|(sr)|(st)))\./gi;
    const t = textString.replace(regex_titles, '');
    return t;
};

// this will match sentences, but fail on acronyms
const regex_sentences = /(?<sentences>[^.?!]+[.?!])/g;

// this function will concatenate sentences which were unintentionally broken by acronyms, and then return all sentences
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

// test
console.log( concatSentences( serialize(text).match(regex_sentences) ) );

