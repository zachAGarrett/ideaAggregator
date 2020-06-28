import json

def findNouns(words = []):
    nouns = []
    with open('./lists/Nouns.json') as f:
        nounList = json.load(f)
        for noun in nounList:
            # for variant in noun['variants']:
            #     if words.__contains__(variant) or words.__contains__(noun['word']):
            #         if not nouns.__contains__(noun['word']):
            #             nouns.append(verb['word'])
            if words.__contains__(noun['word']) and not nouns.__contains__(noun['word']):
                nouns.append(noun['word'])
            
    return nouns

def findVerbs(words = []):
    verbs = []
    with open('./lists/verbs.json') as f:
        verbList = json.load(f)
        for verb in verbList:
            for variant in verb['variants']:
                if words.__contains__(variant) or words.__contains__(verb['word']):
                    if not verbs.__contains__(verb['word']):
                        verbs.append(verb['word'])
            
    return verbs

def findAdjectives(words = []):
    adjectives = []
    with open('./lists/Adjectives.json') as f:
        adjectiveList = json.load(f)
        for adjective in adjectiveList:
            # for variant in adjective['variants']:
            #     if words.__contains__(variant) or words.__contains__(adjective['word']):
            #         if not adjectives.__contains__(adjective['word']):
            #             adjectives.append(adjective['word'])
            if words.__contains__(adjective['word']) and not adjectives.__contains__(adjective['word']):
                adjectives.append(adjective['word'])
            
    return adjectives


def parseSentence(s = ''):
    words = s.split(' ')
    nouns = findNouns(words)
    verbs = findVerbs(words)
    adjectives = findAdjectives(words)

    ideaDict = {
        'nouns': nouns,
        'verbs': verbs,
        'adjectives': adjectives
    }

    with open('ideas.json', 'w') as f:
        json.dump(ideaDict, f, indent=4)
    


s = input("Enter a sentence: ").__str__()

parseSentence(s)

    