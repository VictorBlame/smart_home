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
    if not os.path.isdir(f'facial_recognition/tests/images/authenticated_users/Roland_Mayer'):
        os.makedirs(f'facial_recognition/tests/images/authenticated_users/Roland_Mayer')
        shutil.copy(f'facial_recognition/images/authenticated_users/Roland_Mayer/Roland_Mayer.jpg',
                    f'facial_recognition/tests/images/authenticated_users/Roland_Mayer/Roland_Mayer.jpg')
    if os.path.isdir(f'facial_recognition/tests/images/cropped_authenticated_users'):
        shutil.rmtree(f'facial_recognition/tests/images/cropped_authenticated_users')
