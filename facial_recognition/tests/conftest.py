import face_recognition
import pytest

import facial_recognition.src.config as conf


@pytest.fixture
def input_image():
    image = face_recognition.load_image_file(f'{conf.KNOWN_FACES_DIR}/Roland_Mayer/Roland_Mayer.jpg')
    return image
