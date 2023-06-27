from flask import Flask, render_template, Response

from video_frames import generate_frames_for_frontend

app = Flask(__name__, template_folder="templates")
paused = False


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames_for_frontend(paused), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/start')
def start():
    global paused
    paused = False
    return 'Webcam feed started.'


@app.route('/pause')
def pause():
    global paused
    paused = True
    return 'Webcam feed paused.'


if __name__ == "__main__":
    app.run(host='localhost', port=9874)
