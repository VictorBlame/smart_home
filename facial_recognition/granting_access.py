import cv2
import face_recognition
import os
import logging
import datetime
import numpy as np
import time

KNOWN_FACES_DIR = 'authenticated_users'
KNOWN_CROPPED_IMAGES = 'cropped_authenticated_users'
UNKNOWN_FACES_DIR = 'not_authenticated_users'
LOGIN_ATTEMPTS_DIR = 'login_attempts'
LOGS_DIR = 'logs'
TOLERANCE = 0.6
FRAME_THICKNESS = 4
FONT_THICKNESS = 1
MODEL = 'cnn'
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


def preprocessing_images():
    log.info('Preprocessing started....')
    tic = time.perf_counter()
    try:
        for name in os.listdir(KNOWN_FACES_DIR):
            if not os.path.isdir(f'{KNOWN_CROPPED_IMAGES}/{name}'):
                os.makedirs(f'{KNOWN_CROPPED_IMAGES}/{name}')
            for filename, counter in zip(os.listdir(f'{KNOWN_FACES_DIR}/{name}'),
                                         range(0, len(os.listdir(f'{KNOWN_FACES_DIR}/{name}')))):
                image = face_recognition.load_image_file(f'{KNOWN_FACES_DIR}/{name}/{filename}')
                resized_image = resize_image_by_percentage(image, IMAGE_RESIZE_PERCENTAGE)
                locations = face_recognition.face_locations(resized_image, model=MODEL)
                top, right, bottom, left = int(locations[0][0]), int(locations[0][1]), int(locations[0][2]), int(
                    locations[0][3])
                crop_image = resized_image[top:bottom, left:right]
                cv2.imwrite(f'{KNOWN_CROPPED_IMAGES}/{name}/{counter}.jpg', crop_image)
        log.info('Preprocessing finished.....')
    except Exception as ex:
        error_message = 'Something went wrong with preprocessing_images function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)
    toc = time.perf_counter()
    print(f"Ran in {toc - tic:0.4f} seconds")


def loading_authenticated_users(array_of_faces, array_of_names):
    log.info('Loading known faces...')
    print('Loading known faces...')
    try:
        for name in os.listdir(KNOWN_CROPPED_IMAGES):
            for filename in os.listdir(f'{KNOWN_CROPPED_IMAGES}/{name}'):
                image = face_recognition.load_image_file(f'{KNOWN_CROPPED_IMAGES}/{name}/{filename}')
                try:
                    encoding = face_recognition.face_encodings(image)[0]
                    array_of_faces.append(encoding)
                except:
                    continue
                if name not in array_of_names:
                    array_of_names.append(name)
        # take_picture()
        log.info('Known faces loading was successful')
    except Exception as ex:
        error_message = 'Something went wrong with loading_authenticated_users function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def processing_unknown_users(array_of_faces, tolerance):
    try:
        for filename, number_of_users in zip(os.listdir(UNKNOWN_FACES_DIR),
                                             range(0, len(os.listdir(UNKNOWN_FACES_DIR)))):
            print(f'Filename {filename}', end='')
            log.info('------------ Processing ' + str(filename) + ' has started ------------')
            image_original = cv2.cvtColor(face_recognition.load_image_file(f'{UNKNOWN_FACES_DIR}/{filename}'),
                                          cv2.COLOR_RGB2BGR)
            image_resized = resize_image_by_percentage(image_original, IMAGE_RESIZE_PERCENTAGE)
            tic = time.perf_counter()
            print(image_resized.shape)
            locations = face_recognition.face_locations(image_resized, model=MODEL)
            toc = time.perf_counter()
            print(f"Ran in {toc - tic:0.4f} seconds")
            encodings = face_recognition.face_encodings(image_resized, locations)
            showing_granted_images(encodings, locations, array_of_faces, tolerance, image_original, number_of_users,
                                   filename)
            log.info('------------ Processing ' + str(filename) + ' was successful ------------')
        message = 'Everything was okay with processing_unknown_users function'
        log.info(message)
    except Exception as ex:
        error_message = 'Something went wrong with processing_unknown_users function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def showing_granted_images(encodings, locations, known_faces, tolerance, image_original, number_of_users, filename):
    try:
        print(f', found {len(encodings)} face(s)')
        for face_encoding, face_location in zip(encodings, locations):
            results = face_recognition.compare_faces(known_faces, face_encoding, tolerance)
            access_granted = minimum_success_rate(ACCEPTANCE_PERCENTAGE, results)
            if access_granted:
                match = known_names[number_of_users] + ' ' + filename + ' ' + GREEN + 'ACCESS GRANTED' + END
                log_text = known_names[number_of_users] + ' ' + filename + ' ACCESS GRANTED'
                time_string = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S") + '_ACCESS_GRANTED'
                log.info(log_text)
                os.remove(f'{UNKNOWN_FACES_DIR}/{filename}')
            else:
                match = 'UNKNOWN USER ' + filename + ' ' + RED + 'ACCESS DENIED' + END
                log_text = 'UNKNOWN USER ' + filename + ' ACCESS DENIED'
                time_string = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S") + '_ACCESS_DENIED'
                log.warning(log_text)

            print(f' - {match} from {results}')
            cv2.imwrite(f'{LOGIN_ATTEMPTS_DIR}/{time_string}.jpg', image_original)
        message = 'Everything was okay with showing_granted_images function, original image saved'
        log.info(message)
    except Exception as ex:
        error_message = 'Something went wrong with showing_granted_images function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def split_list_run(known_faces, known_names, tolerance):
    for process in np.array_split(known_faces, len(known_names)):
        processing_unknown_users(process, tolerance)


known_faces = []
known_names = []

# preprocessing_images()
tic = time.perf_counter()
loading_authenticated_users(known_faces, known_names)
split_list_run(known_faces, known_names, TOLERANCE)
toc = time.perf_counter()
print(f"Ran in {toc - tic:0.4f} seconds")
log.debug('AUTHENTICATION SCRIPT END')
