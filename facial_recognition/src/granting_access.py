import datetime
import os
import time

import cv2
import face_recognition
import numpy as np

import facial_recognition.src.config as conf
import facial_recognition.src.database_connector as database
from facial_recognition.src.video_frames import take_picture

db = database.init()
usersCollection = db.users
loginCollection = db.login_attempts
known_faces = {}

log = conf.setup_logger('face_authenticator.log')

log.debug('AUTHENTICATION SCRIPT START')


def is_preprocessing_needed():
    known_user = []
    cropped_known_user = []
    for name in os.listdir(conf.KNOWN_FACES_DIR):
        known_user.append(name)
    for crop_name in os.listdir(conf.KNOWN_CROPPED_IMAGES):
        cropped_known_user.append(crop_name)
    if np.array_equal(known_user, cropped_known_user):
        log.info('Preprocessing is not needed')
        return False
    else:
        log.info('Preprocessing needed')
        return True


def resize_image_by_percentage(image, percentage):
    if percentage == 100:
        log.info('Original image returned')
        return image
    else:
        try:
            if percentage <= 20:
                percentage = 20
            height = int(image.shape[0] * percentage / 100)
            width = int(image.shape[1] * percentage / 100)
            dsize = (width, height)
            log.debug('Original shape: ' + str(dsize))
            image = cv2.resize(image, dsize)
            log.info('Image resize successful to ' + str(int(percentage)) + '% of original size')
            return image
        except Exception as ex:
            error_message = 'Something went wrong with resize_image_by_percentage function. The problem was: ' + str(ex)
            print(error_message)
            log.error(error_message)
            return None


def minimum_success_rate(percent, results):
    success = 0
    for result in results:
        if result:
            success += 1
    if (success / len(results)) * 100 >= percent:
        return True
    else:
        return False


def loading_authenticated_users(array_of_faces):
    log.info('Loading known faces...')
    print('Loading known faces...')
    try:
        for name in os.listdir(conf.KNOWN_CROPPED_IMAGES):
            encodings = []
            for filename in os.listdir(f'{conf.KNOWN_CROPPED_IMAGES}/{name}'):
                image = face_recognition.load_image_file(f'{conf.KNOWN_CROPPED_IMAGES}/{name}/{filename}')
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                try:
                    encoding = face_recognition.face_encodings(image)[0]
                    encodings.append(encoding)
                except:
                    continue
            array_of_faces[name] = encodings
        take_picture()
        log.info('Known faces loading was successful')
    except Exception as ex:
        error_message = 'Something went wrong with loading_authenticated_users function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def processing_unknown_users(array_of_faces, tolerance):
    try:
        for filename in os.listdir(conf.UNKNOWN_FACES_DIR):
            print(f'Filename {filename}', end='')
            log.info('------------ Processing ' + str(filename) + ' has started ------------')
            image_original = cv2.cvtColor(face_recognition.load_image_file(f'{conf.UNKNOWN_FACES_DIR}/{filename}'),
                                          cv2.COLOR_RGB2BGR)
            image_resized = resize_image_by_percentage(image_original, conf.IMAGE_RESIZE_PERCENTAGE)
            locations = face_recognition.face_locations(image_resized, model=conf.MODEL)
            encodings = face_recognition.face_encodings(image_resized, locations)
            showing_granted_images(encodings, locations, array_of_faces, tolerance, image_original, filename)
            log.info('------------ Processing ' + str(filename) + ' was successful ------------')
        message = 'Everything was okay with processing_unknown_users function'
        log.info(message)
    except Exception as ex:
        error_message = 'Something went wrong with processing_unknown_users function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def showing_granted_images(encodings, locations, known_faces, tolerance, image_original, filename):
    try:
        print(f', found {len(encodings)} face(s)')
        for face_encoding, face_location in zip(encodings, locations):
            final_message = {
                'createDate': int(0),
                'access_granted': False,
                'message': '',
                'message_normalized': '',
                'result': [],
                'authenticated_user': ''
            }
            for name, face_encodings in known_faces.items():
                results = face_recognition.compare_faces(face_encodings, face_encoding, tolerance)
                access_granted = minimum_success_rate(conf.ACCEPTANCE_PERCENTAGE, results)
                if access_granted:
                    match = name + ' ' + filename + ' ' + conf.GREEN + 'ACCESS GRANTED' + conf.END
                    log_text = name + ' ' + filename + ' ACCESS GRANTED'
                    timestamp = int(time.time())
                    final_message['createDate'] = timestamp
                    final_message['access_granted'] = True
                    final_message['message'] = match
                    final_message['message_normalized'] = log_text
                    final_message['result'] = np.array(results, dtype=bool).tolist()
                    final_message['authenticated_user'] = name
                    time_string = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S") + '_ACCESS_GRANTED'
                    cv2.imwrite(f'{conf.LOGIN_ATTEMPTS_DIR}/{time_string}.jpg', image_original)
                    os.remove(f'{conf.UNKNOWN_FACES_DIR}/{filename}')
                    log.info(log_text)
                else:
                    match = 'UNKNOWN USER ' + filename + ' ' + conf.RED + 'ACCESS DENIED' + conf.END
                    log_text = 'UNKNOWN USER ' + filename + ' ACCESS DENIED'
                    if not final_message['access_granted']:
                        timestamp = int(time.time())
                        final_message['createDate'] = timestamp
                        final_message['access_granted'] = False
                        final_message['message'] = match
                        final_message['message_normalized'] = log_text
                        final_message['result'] = np.array(results, dtype=bool).tolist()
                        final_message['authenticated_user'] = 'UNKNOWN USER'
                    log.warning(log_text)

            print(f' - {final_message["message"]} from {final_message["result"]}')
            try:
                loginCollection.insert_one(final_message)
                log.debug('Inserting new document to MongoDB was successful')
            except Exception as ex:
                print('Something went wrong with the MongoDB insert')
                log.error(ex)

        if os.path.exists(f'{conf.UNKNOWN_FACES_DIR}/{filename}'):
            time_string = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S") + '_ACCESS_DENIED'
            cv2.imwrite(f'{conf.LOGIN_ATTEMPTS_DIR}/{time_string}.jpg', image_original)
            os.remove(f'{conf.UNKNOWN_FACES_DIR}/{filename}')
        message = 'Everything was okay with showing_granted_images function, original image saved'
        log.info(message)
    except Exception as ex:
        error_message = 'Something went wrong with showing_granted_images function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def access_checking():
    try:
        loading_authenticated_users(known_faces)
        processing_unknown_users(known_faces, conf.TOLERANCE)
        message = 'Everything was okay with access_checking function'
        log.info(message)
    except Exception as ex:
        error_message = 'Something went wrong with access_checking function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


log.debug('AUTHENTICATION SCRIPT END')
