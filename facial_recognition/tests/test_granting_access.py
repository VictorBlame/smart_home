import facial_recognition.config as conf
from facial_recognition.granting_access import resize_image_by_percentage


def test_resize_image_by_percentage(input_image):
    resized_image = resize_image_by_percentage(input_image, conf.IMAGE_RESIZE_PERCENTAGE)
    assert int(resized_image.shape[0]) == int(input_image.shape[0] * (conf.IMAGE_RESIZE_PERCENTAGE / 100))
