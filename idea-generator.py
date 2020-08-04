import json
import requests
from data.repository import insert, find_one, find_list, update
import re

def calculateWeights(words):
    for word in words:
        # maybe find bulk instead of issuing a bunch of finds here
        weightedWord = find_one('words', 'word-weights', {'root': word})
        if weightedWord is None:
            relatedWords = [w for w in words if w != word]
            newWeightedWord = {
                'root': word,
                'relationships': [{'word': w, 'weight': 1} for w in relatedWords],
                'count': 1
            }
            insert('words', 'word-weights', newWeightedWord)
        else:
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
            update('words', 'word-weights', weightedWord)

def generateIdea(sentence = ''):
    words = sentence.split(' ')
    ideaWords = []
    data = find_list('words', 'known-words', {'types': ['verb', 'noun', 'adjective', 'adverb']})
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
    for word in [ w for w in json.loads(wordResponse.content.decode('utf8')) if 'meta' in w]:
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
    for word in trackedWords:
        insert('words', 'known-words', word)

def addUnknownWords(sentence = ''):
    words = sentence.split(' ')
    knownWords = find_list('words', 'known-words', {'$or': [{'variants': {'$in': words}}, {'root': {'$in': words}}]})
    variants = [w['variants'] for w in knownWords]
    variants = [w for l in variants for w in l]
    for word in words:
        if not (word in [w['root'] for w in knownWords] or word in variants) and word != '' and not word.__contains__('-'):
            addWord(requests.get('https://www.dictionaryapi.com/api/v3/references/collegiate/json/' + word + '?key=d4d67e7d-0f63-4432-a470-18c2e8544c3d'))             

def mergeAdjacency(word = {}, adjacentWords = []):
    for adjWord in adjacentWords:
        existingAdj = [knownAdj for knownAdj in word['adjacentWords'] if knownAdj['word'] == adjWord['word']]
        if existingAdj.__len__() > 0:
            existingAdj[0]['count'] += 1
        else:
            word['adjacentWords'].append({'word': adjWord['word'], 'count': 1})
    return word

def calculateAdjacency(words = []):
    if words.__len__() > 1:
        i = 0
        while i < words.__len__():
            if i == 0:
                adjacencyDict = {
                    'root': words[i],
                    'adjacentWords': [{'word': words[i+1], 'count': 1}]
                }
            elif i == words.__len__() - 1:
                adjacencyDict = {
                    'root': words[i],
                    'adjacentWords': [{'word': words[i-1], 'count': 1}]
                }
            else:
                adjacencyDict = {
                    'root': words[i],
                    'adjacentWords': [{'word': words[i-1], 'count': 1}, {'word': words[i+1], 'count': 1}]
                }
                
            # maybe find bulk instead of issuing a bunch of finds here
            word = find_one('words', 'adjacency-weights', {'root': adjacencyDict['root']})
            if not word is None:
                word = mergeAdjacency(word, adjacencyDict['adjacentWords'])
                word = update('words', 'adjacency-weights', word)
            else:
                insert('words', 'adjacency-weights', adjacencyDict)
            i += 1

def parseSentence(sentence = ''):
    sentence = sentence.lower().strip()
    sentence = sentence.replace(',', '')
    addUnknownWords(sentence)
    idea = generateIdea(sentence)
    calculateWeights(sentence.split(' '))
    calculateAdjacency(sentence.split(' '))
    insert('ideas', 'ideas', idea)

with open ('mockingbird.txt', 'r') as f:
    data = f.read().replace('\n', ' ')
    sentences = re.split('(([^.?!]|[A-Z]\w{1}[.!?])+(\w.|\w!|\w?){2,})|([^.?!]|[A-Z]\w{1}[.!?])+([^A-Z]\w{1}[.!?])', data)
    blah = 0
    for sentence in sentences:
        parseSentence(sentence)

