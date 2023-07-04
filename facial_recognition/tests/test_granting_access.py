import facial_recognition.src.config as conf
from facial_recognition.src.granting_access import resize_image_by_percentage, minimum_success_rate


def test_resize_image_by_percentage(input_image):
    resized_image = resize_image_by_percentage(input_image, conf.IMAGE_RESIZE_PERCENTAGE)
    assert int(resized_image.shape[0]) == int(input_image.shape[0] * (conf.IMAGE_RESIZE_PERCENTAGE / 100))


def test_minimum_success_rate():
    success = minimum_success_rate(55, [True, True, False, True, True])
    fail = minimum_success_rate(55, [True, False, False, False, True])
    assert success == True
    assert fail == False
