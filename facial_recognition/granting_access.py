import datetime
import logging
import os
import time
import cv2
import face_recognition
import database_connector
import numpy as np

db = database_connector.init()
usersCollection = db.users
loginCollection = db.login_attempts

KNOWN_CROPPED_IMAGES = 'cropped_authenticated_users'
UNKNOWN_FACES_DIR = 'not_authenticated_users'
LOGIN_ATTEMPTS_DIR = 'login_attempts'
LOGS_DIR = 'logs'
TOLERANCE = 0.6
MODEL = 'mtcnn'
ACCEPTANCE_PERCENTAGE = 59
IMAGE_RESIZE_PERCENTAGE = 20  # smallest value is 20
GREEN = '\x1b[1;32;40m'
RED = '\x1b[1;31;40m'
END = '\x1b[0m'

logging.basicConfig(
    filename=f'{LOGS_DIR}/face_authenticator.log',
    level=logging.DEBUG,
    format='%(asctime)s.%(msecs)03d | %(levelname)8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
log = logging.getLogger(__name__)

log.debug('AUTHENTICATION SCRIPT START')


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
            image = cv2.resize(image, dsize)
            log.info('Image resize successful to ' + str(int(percentage)) + '% of original size')
            return image
        except Exception as ex:
            error_message = 'Something went wrong with resize_image_by_percentage function. The problem was: ' + str(ex)
            print(error_message)
            log.error(error_message)
            return None


def take_picture():
    print('Scanning...')
    try:
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cv2.imwrite(f'{UNKNOWN_FACES_DIR}/temp.jpg', frame)
        cv2.destroyAllWindows()
        cap.release()
        print('Face scan complete')
        log.info('Face scan complete')
    except Exception as ex:
        error_message = 'Something went wrong with take_picture function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


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
        for name in os.listdir(KNOWN_CROPPED_IMAGES):
            encodings = []
            for filename in os.listdir(f'{KNOWN_CROPPED_IMAGES}/{name}'):
                image = face_recognition.load_image_file(f'{KNOWN_CROPPED_IMAGES}/{name}/{filename}')
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                try:
                    encoding = face_recognition.face_encodings(image)[0]
                    encodings.append(encoding)
                except:
                    continue
            array_of_faces[name] = encodings
        # take_picture()
        log.info('Known faces loading was successful')
    except Exception as ex:
        error_message = 'Something went wrong with loading_authenticated_users function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def processing_unknown_users(array_of_faces, tolerance):
    try:
        for filename in os.listdir(UNKNOWN_FACES_DIR):
            print(f'Filename {filename}', end='')
            log.info('------------ Processing ' + str(filename) + ' has started ------------')
            image_original = cv2.cvtColor(face_recognition.load_image_file(f'{UNKNOWN_FACES_DIR}/{filename}'),
                                          cv2.COLOR_RGB2BGR)
            image_resized = resize_image_by_percentage(image_original, IMAGE_RESIZE_PERCENTAGE)
            locations = face_recognition.face_locations(image_resized, model=MODEL)
            encodings = face_recognition.face_encodings(image_resized, locations)
            showing_granted_images(encodings, locations, array_of_faces, tolerance, image_original, filename)
            log.info('------------ Processing ' + str(filename) + ' was successful ------------')
        message = 'Everything was okay with processing_unknown_users function'
        log.info(message)
    except Exception as ex:
        error_message = 'Something went wrong with processing_unknown_users function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def correct_encoding(dictionary):

    new = {}
    for key1, val1 in dictionary.items():
        if isinstance(val1, dict):
            val1 = correct_encoding(val1)

        if isinstance(val1, np.bool_):
            val1 = bool(val1)

        if isinstance(val1, np.int64):
            val1 = int(val1)

        if isinstance(val1, np.float64):
            val1 = float(val1)

        if isinstance(val1, set):
            val1 = list(val1)

        new[key1] = val1

    return new


def showing_granted_images(encodings, locations, known_faces, tolerance, image_original, filename):
    try:
        print(f', found {len(encodings)} face(s)')
        for face_encoding, face_location in zip(encodings, locations):
            final_message = {
                'access_granted': False,
                'message': '',
                'message_normalized': '',
                'result': '',
                'authenticated_user': '',
                'createDate': int(0)
            }
            for name, face_encodings in known_faces.items():
                results = face_recognition.compare_faces(face_encodings, face_encoding, tolerance)
                access_granted = minimum_success_rate(ACCEPTANCE_PERCENTAGE, results)
                if access_granted:
                    match = name + ' ' + filename + ' ' + GREEN + 'ACCESS GRANTED' + END
                    log_text = name + ' ' + filename + ' ACCESS GRANTED'
                    timestamp = int(time.time())
                    final_message['access_granted'], final_message['message'], final_message['message_normalized'], \
                        final_message['result'], final_message[
                        'authenticated_user'], final_message[
                        'createDate'] = True, match, log_text, results, name, timestamp
                    time_string = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S") + '_ACCESS_GRANTED'
                    cv2.imwrite(f'{LOGIN_ATTEMPTS_DIR}/{time_string}.jpg', image_original)
                    os.remove(f'{UNKNOWN_FACES_DIR}/{filename}')
                    log.info(log_text)
                else:
                    match = 'UNKNOWN USER ' + filename + ' ' + RED + 'ACCESS DENIED' + END
                    log_text = 'UNKNOWN USER ' + filename + ' ACCESS DENIED'
                    if not final_message['access_granted']:
                        timestamp = int(time.time())
                        final_message['access_granted'], final_message['message'], final_message['message_normalized'], \
                            final_message['result'], final_message[
                            'authenticated_user'], final_message[
                            'createDate'] = False, match, log_text, results, 'UNKNOWN USER', timestamp
                    log.warning(log_text)

            print(f' - {final_message["message"]} from {final_message["result"]}')
            print(final_message)
            loginCollection.insert_one(correct_encoding(final_message))

        if os.path.exists(f'{UNKNOWN_FACES_DIR}/{filename}'):
            time_string = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S") + '_ACCESS_DENIED'
            cv2.imwrite(f'{LOGIN_ATTEMPTS_DIR}/{time_string}.jpg', image_original)
            os.remove(f'{UNKNOWN_FACES_DIR}/{filename}')
        message = 'Everything was okay with showing_granted_images function, original image saved'
        log.info(message)
    except Exception as ex:
        error_message = 'Something went wrong with showing_granted_images function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


known_faces = {}

loading_authenticated_users(known_faces)
processing_unknown_users(known_faces, TOLERANCE)
log.debug('AUTHENTICATION SCRIPT END')
