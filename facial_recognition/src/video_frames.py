import cv2

import facial_recognition.src.config as conf

log = conf.setup_logger('face_authenticator.log')
paused = False
video_feed = cv2.VideoCapture(0)
video_feed.set(cv2.CAP_PROP_FPS, conf.VIDEO_FPS)


def take_picture():
    print('Scanning...')
    try:
        cap = video_feed
        ret, frame = cap.read()
        cv2.imwrite(f'{conf.UNKNOWN_FACES_DIR}/temp.jpg', frame)
        cv2.destroyAllWindows()
        cap.release()
        print('Face scan complete')
        log.info('Face scan complete')
    except Exception as ex:
        error_message = 'Something went wrong with take_picture function. The problem was: ' + str(ex)
        print(error_message)
        log.error(error_message)


def generate_frames_for_frontend():
    while True:
        if not paused:
            success, frame = video_feed.read()
            if not success:
                break
            else:
                ret, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
