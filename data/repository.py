import pymongo
import urllib

username = urllib.parse.quote("idea-rw")
password = urllib.parse.quote("Nt1h8UvPUkxa2EzQ")
dbName = urllib.parse.quote("words")

client = pymongo.MongoClient("mongodb+srv://%s:%s@idea-aggregator.jhami.mongodb.net/%s?retryWrites=true&w=majority" % (username, password, dbName))



def insert(dbName, collectionName, document):
    db = client[dbName]
    collection = db[collectionName]
    return collection.insert_one(document)

def update(dbName, collectionName, document):
    db = client[dbName]
    collection = db[collectionName]
    return collection.find_one_and_replace({'_id': document['_id']},document)

def find_one(dbName, collectionName, query):
    db = client[dbName]
    collection = db[collectionName]
    return collection.find_one(query)

def find_list(dbName, collectionName, query):
    db = client[dbName]
    collection = db[collectionName]
    return list(collection.find(query))

    
def find(dbName, collectionName):
    db = client[dbName]
    collection = db[collectionName]
    return collection.find()

def aggregate(dbName, collectionName, pipeline):
    db = client[dbName]
    collection = db[collectionName]
    return list(collection.aggregate(pipeline))