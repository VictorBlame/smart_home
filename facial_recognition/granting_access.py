import cv2
import face_recognition
import sys
import os


def take_picture():
    print('Scanning...')
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cv2.imwrite('temp_images/temp.jpg', frame)
    cv2.destroyAllWindows()
    cap.release()
    print('Face scan complete')


take_picture()
