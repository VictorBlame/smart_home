import facial_recognition.src.config as conf
from facial_recognition.src.preprocessing_images import preprocessing_images


def test_preprocessing_images():
    preprocessing = preprocessing_images(conf.KNOWN_FACES_DIR, conf.KNOWN_CROPPED_IMAGES)
    assert preprocessing == True
