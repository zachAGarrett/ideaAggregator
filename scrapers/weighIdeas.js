const fs = require('fs');
const json_path = './data.json';

(read_data = () => {
    fs.readFile('./lists/data.json', function readFileCallback(err, data){
        if (err){
            return console.log(err);
        } else {
            const json_data = JSON.parse(data);
            const dictionary = json_data.dictionary;
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
                    if (dupCheck === undefined) {
                        const weights_index = (el) => { 
                            return el.root === word;
                          }
                        try {
                            const index = dictionary.findIndex(weights_index);
                            const word_types = dictionary[index].types;
                            const as_types = (type) =>  { return {
                                type: type,
                                adj_nouns: [],
                                actions: [],
                                descriptions: [],
                               }
                            }
                            const types_map = word_types.map(x => [x, [as_types(x)]]);
                            const word_constructor = {
                                root: word,
                                asType: [Object.fromEntries(types_map)],
                            };
                            //extract siblings from ideas and add siblings
                        } catch (err) {
                            console.log(`${word} isn't in the dictionary yet. I'll come back later.`);  
                        }
                    } else { 
                        console.log(`${word} is already tracking`);
                        try {
                            const index = dictionary.findIndex(weights_index);
                            const word_types = dictionary[index].types;
                        } catch (err) {
                            console.log(`${word} isn't in the dictionary yet. I'll come back later.`);  
                        }
                        //extract siblings from ideas and add / iterate siblings
                    }
                    // const word_map = [];
                    // const word_loc = (el) => { 
                    //     return el.root === word;
                    //   }
                    // try {
                    //     const word_index = dictionary.findIndex(word_loc);
                    //     const word_types = Object.values(dictionary[word_index].types);
                    //     console.log(word_types);
                    //     const possible_types = ['noun', 'verb', 'adjective'];
                    //     for (const type of possible_types) {
                    //         if (word_types.includes(type)) {
                    //             const word_as_type = {
                    //                 type: type,
                    //                 adj_nouns: [],
                    //                 actions: [],
                    //                 descriptions: [],
                    //             }
                    //             const adj_nouns = weight_entry.adj_nouns;
                    //             const actions = weight_entry.actions;
                    //             const descriptions = weight_entry.descriptions;
                    //             const siblings = idea.map(x => x);
                    //             const index = siblings.indexOf(word);
                    //                 if (index > -1) {
                    //                     siblings.splice(index, 1);
                    //             }
                    //             for (const sibling of siblings) {
                    //                 const word_loc_sib = (el) => { 
                    //                     return el.root === sibling;
                    //                 }
                    //                 try {
                    //                     const word_index_sib = dictionary.findIndex(word_loc_sib);
                    //                     const word_types_sib = Object.values(dictionary[word_index_sib].types);
                    //                     console.log(word_types_sib);
                    //                     const to_push = () => {
                    //                         if (type === 'noun') {
                    //                             return adj_nouns;
                    //                         } else if (type === 'adjective') {
                    //                             return actions;
                    //                         } else {
                    //                             return descriptions;
                    //                         }
                    //                     }
                    //                     word_types_sib.includes(type) ? to_push.push(sibling) : false ;
                    //                 } catch (err) {
                    //                     return console.log(err)
                    //                 }
                    //             }
                                
                    //         } 
                    //     }
                    // } catch (err) {
                    //     return console.log(err)
                    // }
                    
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