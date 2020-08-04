// Weigh word connections
const fs = require('fs');
const json_path = `${__dirname}/data/data.json`;

(read_data = () => {
    fs.readFile(json_path, function readFileCallback(err, data){
        if (err){
            return console.log(err);
        } else {
            const json_data = JSON.parse(data);
            const dictionary = json_data.dictionary;
            const verbs = dictionary.map(e => (e.types.hasOwnProperty('verb')) ? e.root : '');
            const nouns = dictionary.map(e => (e.types.hasOwnProperty('noun')) ? e.root : '');
            const adjectives = dictionary.map(e => (e.types.hasOwnProperty('adjective')) ? e.root : '');
            const adverbs = dictionary.map(e => (e.types.hasOwnProperty('adverb')) ? e.root : '');
            const other = dictionary.map(e => (e.types.hasOwnProperty('other')) ? e.root : '');
            console.log(verbs)
            const ideas = json_data.ideas;
            const weights = json_data.weights;
            console.log(`I currently know ${dictionary.length} words.`);
            console.log(`I have logged ${ideas.length} ideas.`);
            console.log(`I am tracking weights for ${weights.length} words.`);
            const ideas_vals = ideas.map(x => Object.values(x.words));
            for (const idea of ideas_vals) {
                for (const word of idea) {
                    const weights_word_exists = (el) => { 
                        return el.root === word;
                      }
                    const dupCheck = weights.find(weights_word_exists)
                    const weights_index = (el) => { 
                        return el.root === word;
                    }
                    if (dupCheck === undefined) {
                        try {
                            const index = dictionary.findIndex(weights_index);
                            const word_types = Object.keys(dictionary[index].types);
                            console.log(dictionary[index].types.hasOwnProperty('noun'))
                            const as_types = (type, nouns, actions, descriptions) =>  { return {
                                type: type,
                                adj_nouns: nouns,
                                actions: actions,
                                descriptions: descriptions,
                               }
                            }
                            const types_map = word_types.map(x => [x, [as_types(x)]]);
                            const word_constructor = {
                                root: word,
                                asType: [Object.fromEntries(types_map)],
                            };
                            console.log(types_map);
                            //extract siblings from ideas and add siblings
                        } catch (err) {
                            console.log(err);  
                        }
                    } else { 
                        console.log(`${word} is already tracking`);
                        try {
                            const index = dictionary.findIndex(weights_index);
                            const word_types = Object.keys(dictionary[index].types);
                        } catch (err) {
                            console.log(err);  
                        }
                        //extract siblings from ideas and add / iterate siblings
                    }
                }
                
            }
            // const ideas_set = new Set(ideas_vals.flat(2));
            // const all_ideas = [...ideas_set];
            // const all_ideas_clean = all_ideas.map(x => x.length === 1 && (x != 'a' && x != 'i' && x.match(/\D/g)) || x.match(/\W|\d/g) ? x.replace(x, '') : x)
            // const all_ideas_filtered = all_ideas_clean.filter(el => el)
            // weights.push(all_ideas_filtered);
            
            const new_json = JSON.stringify(json_data, null, 2); //convert it back to json
            fs.writeFile('./lists/data.json', new_json, function(){
            }); // write it back 
            console.log('File saved')
    }});
})();