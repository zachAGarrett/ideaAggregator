from bs4 import BeautifulSoup
import requests
import json

verbs = []

i = 1

while i<=4:
    if i != 1:
        source = requests.get('https://www.linguasorb.com/english/verbs/most-common-verbs/' + i.__str__())
    else:
        source = requests.get('https://www.linguasorb.com/english/verbs/most-common-verbs/')
    
    soup = BeautifulSoup(source.content)
    
    verbList = soup.find_all('tr')

    n = 1

    while n <= 25:

        verbHref = verbList[n].contents[3].contents[1].attrs['href']
        verbSource = requests.get('https://www.linguasorb.com' + verbHref)
        verbSoup = BeautifulSoup(verbSource.content)

        vConj = []

        for v in verbSoup.findAll(attrs={'class': 'vReg'}):
            if not vConj.__contains__(v.contents[0].strip()):
                vConj.append(v.contents[0].strip())

        for v in verbSoup.findAll(attrs={'class': 'vIrreg'}):
            if not vConj.__contains__(v.contents[0].strip()):
                if v.contents[0] != 'Irregular forms' and not v.contents[0].__contains__("'"):
                    vConj.append(v.contents[0].strip())

        verbDict = {
            "verb": vConj[0],
            "conjugations": vConj
        }

        verbs.append(verbDict)

        with open('verbs.json', "w") as outfile:  
            json.dump(verbs, outfile, indent=4) 

        n += 1
    
    i += 1
