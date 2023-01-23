import pymongo


def init():
    client = pymongo.MongoClient(
        "mongodb+srv://superUser:superUser@smarthome.co6vilf.mongodb.net/?retryWrites=true&w=majority")
    db = client.test
    return db
