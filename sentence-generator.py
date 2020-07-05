from data.repository import find_one, find_list, aggregate, find
import random


def getAdjacency(word, prevWord = ''):
    wordAdjacencies = find_one('words', 'adjacency-weights', {'root': word})
    adj = [w for w in wordAdjacencies['adjacentWords'] if w['word'] != prevWord]
    bigAdj = max(adj, key= lambda k: k['count'])
    return bigAdj['word']


wordList = []
word = list(find('words', 'word-weights').sort('count', -1).limit(1))[0]['root']
wordList.append(word)

i = 0
while i < 20:
    if i == 0:
        word = getAdjacency(word)
    else:
        word = getAdjacency(word, wordList[i -1])
    wordList.append(word)
    i += 1

blah = 0