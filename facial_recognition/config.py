import logging


KNOWN_CROPPED_IMAGES = 'cropped_authenticated_users'
KNOWN_FACES_DIR = 'authenticated_users'
UNKNOWN_FACES_DIR = 'not_authenticated_users'
LOGIN_ATTEMPTS_DIR = 'login_attempts'
LOGS_DIR = 'logs'
TOLERANCE = 0.6  # tolerance for the face recognition
MODEL = 'mtcnn'  # used model for the face recognition
ACCEPTANCE_PERCENTAGE = 59  # acceptance criteria for the face recognition
IMAGE_RESIZE_PERCENTAGE = 20  # smallest value is 20
GREEN = '\x1b[1;32;40m'
RED = '\x1b[1;31;40m'
END = '\x1b[0m'
MONGO_CLIENT = "mongodb+srv://superUser:superUser@smarthome.co6vilf.mongodb.net/?retryWrites=true&w=majority"
VIDEO_FPS = 30  # FPS used in the given in the video feed


logging.basicConfig(
    filename=f'{LOGS_DIR}/face_authenticator.log',
    level=logging.DEBUG,
    format='%(asctime)s.%(msecs)03d | %(levelname)8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
LOG = logging.getLogger(__name__)
