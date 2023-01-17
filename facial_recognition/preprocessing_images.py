import logging
import os

import cv2
import face_recognition

KNOWN_FACES_DIR = 'authenticated_users'
KNOWN_CROPPED_IMAGES = 'cropped_authenticated_users'
LOGS_DIR = 'logs'
MODEL = 'mtcnn'
IMAGE_RESIZE_PERCENTAGE = 20  # smallest value is 20

logging.basicConfig(
    filename=f'{LOGS_DIR}/preprocessing_images.log',
    level=logging.DEBUG,
    format='%(asctime)s.%(msecs)03d | %(levelname)8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
log = logging.getLogger(__name__)


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


def preprocessing_images():
    log.info('Preprocessing started....')
    try:
        for name in os.listdir(KNOWN_FACES_DIR):
            if not os.path.isdir(f'{KNOWN_CROPPED_IMAGES}/{name}'):
                os.makedirs(f'{KNOWN_CROPPED_IMAGES}/{name}')
            for filename, counter in zip(os.listdir(f'{KNOWN_FACES_DIR}/{name}'),
                                         range(0, len(os.listdir(f'{KNOWN_FACES_DIR}/{name}')))):
                log.info("Image name is " + str(filename))
                image = face_recognition.load_image_file(f'{KNOWN_FACES_DIR}/{name}/{filename}')
                resized_image = resize_image_by_percentage(image, IMAGE_RESIZE_PERCENTAGE)
                locations = face_recognition.face_locations(resized_image, model=MODEL)
                log.info("Face locators are found!")
                log.debug("Locators are: " + str(locations))
                top, right, bottom, left = int(locations[0][0]), int(locations[0][1]), int(locations[0][2]), int(
                    locations[0][3])
                crop_image = resized_image[top:bottom, left:right]
                log.info("Cropping images by face locators finished")
                cv2.imwrite(f'{KNOWN_CROPPED_IMAGES}/{name}/{counter}.jpg', crop_image)
                log.info('Image saved to: ' + f'{KNOWN_CROPPED_IMAGES}/{name}/{counter}.jpg')
        log.info('Preprocessing finished.....')
    except Exception as ex:
        error_message = 'Something went wrong with preprocessing_images function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


preprocessing_images()
