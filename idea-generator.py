import json
import requests

def calculateWeights(words):
    with open('weights.json', 'r') as f:
        weightedWords = json.load(f)
        for word in words:
            weightedWord = [ww for ww in weightedWords if ww['root'] == word]
            if weightedWord.__len__() == 0:
                relatedWords = [w for w in words if w != word]
                newWeightedWord = {
                    'root': word,
                    'relationships': [{'word': w, 'weight': 1} for w in relatedWords],
                    'count': 1
                }
                weightedWords.append(newWeightedWord)
            else:
                weightedWord = weightedWord[0]
                weightedWord['count'] += 1
                for relatedWord in [w for w in words if w != word]:
                    match = [w for w in weightedWord['relationships'] if w['word'] == relatedWord]
                    if match.__len__() == 0:
                        relationship = {
                            'word': relatedWord,
                            'weight': 1
                        }
                        weightedWord['relationships'].append(relationship)
                    else:
                        match[0]['weight'] += 1
        with open('weights.json', 'w') as fw:
            json.dump(weightedWords, fw, indent=4)

def generateIdea(sentence = ''):
    words = sentence.split(' ')
    ideaWords = []
    with open('./lists/knownWords.json', 'r') as f:
        data = json.load(f)
        data = [w for w in data if 'verb' in w['types'] or 'adjective' in w['types'] or 'noun' in w['types']]
        for word in data:
            if words.__contains__(word['root']):
                if not ideaWords.__contains__(word['root']):
                    ideaWords.append(word['root'])
            else:
                for variant in word['variants']:
                    if words.__contains__(variant):
                        if not ideaWords.__contains__(word['root']):
                            ideaWords.append(word['root'])
    idea = {
        'sentence': sentence,
        'words': ideaWords
    }
    return idea

def getVariants(word):
    variants = []
    for variant in word['meta']['stems']:
        if variant.split(' ').__len__() == 1 and not variants.__contains__(variant) and not variant.__contains__('*'):
            variants.append(variant)
    if word['fl'] == 'verb':
        if 'ins' in word:
            for conj in word['ins']:
                if conj['if'].split(' ').__len__() == 1 and not variants.__contains__(conj['if']) and not conj['if'].__contains__('*'):
                    variants.append(conj['if'])
    return variants

def mergeVariants(knownVariants, variants):
    for variant in variants:
        if not knownVariants.__contains__(variant) and not variant.__contains__('*'):
            knownVariants.append(variant)
    return knownVariants

def addWord(wordResponse):
    trackedWords = []
    for word in json.loads(wordResponse.content.decode('utf8')):
        if not word['meta']['id'].split(' ').__len__() > 1 and not word['meta']['id'].split('-').__len__() > 1:
            if 'fl' in word:
                if word['meta']['id'].__contains__(':'):
                    wordId = word['meta']['id'].split(':')[0]
                else:
                    wordId = word['meta']['id']
                
                if trackedWords.__len__() > 0:
                    isTracked = False
                    for trackedWord in trackedWords:
                        if trackedWord['root'] == wordId:
                            isTracked = True
                            knownVariants = trackedWord['variants']
                            trackedWord['variants'] = mergeVariants(knownVariants, getVariants(word))
                            if not trackedWord['types'].__contains__(word['fl']):
                                trackedWord['types'].append(word['fl'])
                    if not isTracked:
                        variants = getVariants(word)
                        wordDict = {
                            'root': wordId,
                            'variants': variants,
                            'types': [word['fl']]
                        }
                        trackedWords.append(wordDict)
                        

                else:
                    variants = getVariants(word)
                    wordDict = {
                        'root': wordId,
                        'variants': variants,
                        'types': [word['fl']]
                    }
                    trackedWords.append(wordDict)
    with open('./lists/knownWords.json', 'r') as f:
        data = json.load(f)
        for word in trackedWords:
            data.append(word)
        with open('./lists/knownWords.json', 'w') as fw:
            json.dump(data, fw, indent=4)

def addUnknownWords(sentence = ''):
    words = sentence.split(' ')
    with open('./lists/knownWords.json') as f:
        wordList = json.load(f)
        knownWords = []
        for word in words:
            for knownWord in wordList:
                matchVariant = [w for w in knownWord['variants'] if w == word]
                if matchVariant.__len__() > 0 or knownWord['root'] == word:
                    if not knownWords.__contains__(word):
                        knownWords.append(word)
        
        for word in words:
            if not knownWords.__contains__(word) and word != '':
                addWord(requests.get('https://www.dictionaryapi.com/api/v3/references/collegiate/json/' + word + '?key=d4d67e7d-0f63-4432-a470-18c2e8544c3d'))   

def parseSentence(sentence = ''):
    sentence = sentence.lower().strip()
    sentence = sentence.replace(',', '')
    addUnknownWords(sentence)
    idea = generateIdea(sentence)
    calculateWeights(sentence.split(' '))
    with open('ideas.json', 'r') as f:
        data = json.load(f)
        data.append(idea)
        with open('ideas.json', 'w') as fw:
            json.dump(data, fw, indent=4)


p = "If you're visiting this page, you're likely here because you're searching for a random sentence. Sometimes a random word just isn't enough, and that is where the random sentence generator comes into play. By inputting the desired number, you can make a list of as many random sentences as you want or need. Producing random sentences can be helpful in a number of different ways."

for s in p.split('.'):
    parseSentence(s)

# s = input("Enter a sentence: ").__str__()
# parseSentence(s)
