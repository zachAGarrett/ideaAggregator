import json

def findNouns(words = []):
    nouns = []
    with open('./lists/Nouns.json') as f:
        data = json.load(f)
        for noun in data:
            if words.__contains__(noun):
                nouns.append(noun)
    return nouns

# def findVerbs(words = []):

# def findAdjectives(words = []):


def parseSentence(s = ''):
    words = s.split(' ')
    nouns = findNouns(words)
    # verbs = findVerbs(words)
    # adjectives = findAdjectives(words)
    verbs = []
    adjectives = []

    ideaDict = {
        'nouns': nouns,
        'verbs': verbs,
        'adjectives': adjectives
    }

    with open('ideas.json', 'a') as f:
        json.dump(ideaDict, f, indent=4)
    


s = input("Enter a sentence: ").__str__()

parseSentence(s)

    