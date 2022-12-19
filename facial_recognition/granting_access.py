import cv2
import face_recognition
import sys
import os
import logging


logging.basicConfig(
    filename='logs/runLog.log',
    level=logging.DEBUG,
    format='%(asctime)s.%(msecs)03d | %(levelname)8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
log = logging.getLogger(__name__)


def take_picture():
    print('Scanning...')
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cv2.imwrite('temp_images/temp.jpg', frame)
    cv2.destroyAllWindows()
    cap.release()
    print('Face scan complete')
    log.info('Face scan complete')


def analyze_login_user():
    base_img = cv2.cvtColor(face_recognition.load_image_file('authenticated_users/Roland_Mayer.jpg'), cv2.COLOR_BGR2RGB)


take_picture()
