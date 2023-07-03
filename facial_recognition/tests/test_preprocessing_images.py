from facial_recognition.src.preprocessing_images import preprocessing_images


def test_preprocessing_images():
    preprocessing = preprocessing_images(f'facial_recognition/tests/images/authenticated_users/Roland_Mayer',
                                         f'facial_recognition/tests/images/cropped_authenticated_users/Roland_Mayer')
    assert preprocessing == True
