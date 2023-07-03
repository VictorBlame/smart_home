import logging
import os

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
APP_HOST = 'localhost'
APP_PORT = 9874


def setup_logger(log_file):
    # Create a logger
    logger = logging.getLogger(log_file)
    logger.setLevel(logging.DEBUG)

    # Create a formatter with date format
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

    # Create a file handler with full path
    log_folder = LOGS_DIR  # Specify the folder name
    os.makedirs(log_folder, exist_ok=True)  # Create the log folder if it doesn't exist
    log_path = os.path.join(log_folder, log_file)  # Create the full path to the log file
    file_handler = logging.FileHandler(log_path)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    # Add the file handler to the logger
    logger.addHandler(file_handler)

    return logger
