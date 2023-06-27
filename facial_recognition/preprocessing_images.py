import os

import cv2
import face_recognition

import config as conf
from granting_access import resize_image_by_percentage

log = conf.LOG


def preprocessing_images():
    log.info('Preprocessing started....')
    try:
        for name in os.listdir(conf.KNOWN_FACES_DIR):
            if not os.path.isdir(f'{conf.KNOWN_CROPPED_IMAGES}/{name}'):
                os.makedirs(f'{conf.KNOWN_CROPPED_IMAGES}/{name}')
            for filename, counter in zip(os.listdir(f'{conf.KNOWN_FACES_DIR}/{name}'),
                                         range(0, len(os.listdir(f'{conf.KNOWN_FACES_DIR}/{name}')))):
                log.info("Image name is " + str(filename))
                image = face_recognition.load_image_file(f'{conf.KNOWN_FACES_DIR}/{name}/{filename}')
                resized_image = resize_image_by_percentage(image, conf.IMAGE_RESIZE_PERCENTAGE)
                locations = face_recognition.face_locations(resized_image, model=conf.MODEL)
                log.info("Face locators are found!")
                log.debug("Locators are: " + str(locations))
                top, right, bottom, left = int(locations[0][0]), int(locations[0][1]), int(locations[0][2]), int(
                    locations[0][3])
                crop_image = resized_image[top:bottom, left:right]
                log.info("Cropping images by face locators finished")
                cv2.imwrite(f'{conf.KNOWN_CROPPED_IMAGES}/{name}/{counter}.jpg', crop_image)
                log.info('Image saved to: ' + f'{conf.KNOWN_CROPPED_IMAGES}/{name}/{counter}.jpg')
        log.info('Preprocessing finished.....')
    except Exception as ex:
        error_message = 'Something went wrong with preprocessing_images function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


preprocessing_images()
