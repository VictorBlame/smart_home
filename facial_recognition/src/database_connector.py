import pymongo

import facial_recognition.src.config as conf

log = conf.LOG


def init():
    try:
        client = pymongo.MongoClient(conf.MONGO_CLIENT)
        db = client.smart_home
        log.info('CONNECTING TO MONGODB WAS SUCCESSFUL')
        return db
    except Exception as ex:
        error_message = 'Something went wrong with the connecting to the MongoDB database. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)
        return None
