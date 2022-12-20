import cv2
import face_recognition
import os
import logging
import datetime

KNOWN_FACES_DIR = 'authenticated_users'
UNKNOWN_FACES_DIR = 'not_authenticated_users'
LOGIN_ATTEMPTS_DIR = 'login_attempts'
TOLERANCE = 0.6
FRAME_THICKNESS = 3
FONT_THICKNESS = 2
MODEL = 'cnn'
ACCEPTANCE_PERCENTAGE = 59
IMAGE_RESIZE_FACTOR = 0.4

logging.basicConfig(
    filename='logs/runLog.log',
    level=logging.DEBUG,
    format='%(asctime)s.%(msecs)03d | %(levelname)8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
log = logging.getLogger(__name__)


def resize_image_by_percentage(image, percentage):
    try:
        height = int(image.shape[0] * percentage / 100)
        width = int(image.shape[1] * percentage / 100)
        dsize = (width, height)
        image = cv2.resize(image, dsize)
        log.info('Image resize successful to ' + str(int(percentage * 100)) + '% of original size')
    except Exception as ex:
        error_message = 'Something went wrong with resize_image_by_percentage function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def take_picture():
    print('Scanning...')
    try:
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cv2.imwrite(f'{UNKNOWN_FACES_DIR}/temp1.jpg', frame)
        cv2.destroyAllWindows()
        cap.release()
        print('Face scan complete')
        log.info('Face scan complete')
    except Exception as ex:
        error_message = 'Something went wrong with take_picture function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def name_to_color(name):
    color = [(ord(c.lower()) - 97) * 8 for c in name[:3]]
    return color


def minimum_success_rate(percent, results):
    success = 0
    for result in results:
        if result:
            success += 1
    if (success / len(results)) * 100 >= percent:
        return True
    else:
        return False


def loading_authenticated_users(array_of_faces, array_of_names):
    log.info('Loading known faces...')
    try:
        for name in os.listdir(KNOWN_FACES_DIR):
            for filename in os.listdir(f'{KNOWN_FACES_DIR}/{name}'):
                image = face_recognition.load_image_file(f'{KNOWN_FACES_DIR}/{name}/{filename}')
                resize_image_by_percentage(image, 0.4)
                encoding = face_recognition.face_encodings(image)[0]

                array_of_faces.append(encoding)
                array_of_names.append(name)
        log.info('Known faces loading was successful')
    except Exception as ex:
        error_message = 'Something went wrong with loading_authenticated_users function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def processing_unknown_users(array_of_faces, tolerance):
    try:
        for filename in os.listdir(UNKNOWN_FACES_DIR):
            print(f'Filename {filename}', end='')
            image = face_recognition.load_image_file(f'{UNKNOWN_FACES_DIR}/{filename}')
            locations = face_recognition.face_locations(image, model=MODEL)
            encodings = face_recognition.face_encodings(image, locations)
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            resize_image_by_percentage(image, 0.4)
            showing_granted_images(encodings, locations, image, array_of_faces, tolerance, filename)
            log.info('Processing ' + str(filename) + ' was successful')
        message = 'Everything was okay with processing_unknown_users function'
        log.info(message)
    except Exception as ex:
        error_message = 'Something went wrong with processing_unknown_users function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def showing_granted_images(encodings, locations, image, known_faces, tolerance, filename):
    try:
        #take_picture()
        print(f', found {len(encodings)} face(s)')
        for face_encoding, face_location in zip(encodings, locations):
            results = face_recognition.compare_faces(known_faces, face_encoding, tolerance)
            match = None
            ACCESS_GRANTED = minimum_success_rate(ACCEPTANCE_PERCENTAGE, results)
            if ACCESS_GRANTED:
                match = known_names[results.index(True)] + ' ACCESS GRANTED'
                log.info(match)
            else:
                match = known_names[results.index(True)] + ' ACCESS DENIED'
                log.warning(match)
            print(f' - {match} from {results}')

            top_left = (face_location[3], face_location[0])
            bottom_right = (face_location[1], face_location[2])

            color = name_to_color(match)

            cv2.rectangle(image, top_left, bottom_right, color, FRAME_THICKNESS)

            top_left = (face_location[3], face_location[2])
            bottom_right = (face_location[1], face_location[2] + 22)
            cv2.rectangle(image, top_left, bottom_right, color, cv2.FILLED)
            cv2.putText(image, match, (face_location[3] + 10, face_location[2] + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                        (200, 200, 200), FONT_THICKNESS)
            timestr = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
            cv2.imwrite(f'{LOGIN_ATTEMPTS_DIR}/{timestr}.jpg', image)
        message = 'Everything was okay with showing_granted_images function'
        log.info(message)
    except Exception as ex:
        error_message = 'Something went wrong with showing_granted_images function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


print('Loading known faces...')
known_faces = []
known_names = []

loading_authenticated_users(known_faces, known_names)
processing_unknown_users(known_faces, TOLERANCE)
