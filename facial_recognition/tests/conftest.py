import os
import shutil

import face_recognition
import pytest

import facial_recognition.src.config as conf


@pytest.fixture
def input_image():
    image = face_recognition.load_image_file(f'{conf.KNOWN_FACES_DIR}/Roland_Mayer/Roland_Mayer.jpg')
    return image


@pytest.fixture
def test_dir_zero_state():
    if not os.path.isdir(f'{conf.KNOWN_FACES_DIR}/Roland_Mayer'):
        os.makedirs(f'{conf.KNOWN_FACES_DIR}/Roland_Mayer')
    if os.path.isdir(f'{conf.KNOWN_CROPPED_IMAGES}/Roland_Mayer'):
        shutil.rmtree(f'{conf.KNOWN_CROPPED_IMAGES}/Roland_Mayer')
