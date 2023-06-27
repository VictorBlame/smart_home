from flask import Flask, render_template, Response

import config as conf
from granting_access import access_checking
from video_frames import generate_frames_for_frontend

app = Flask(__name__, template_folder="templates")
paused = False


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames_for_frontend(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/check')
def check():
    return Response(access_checking(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    app.run(host=conf.APP_HOST, port=conf.APP_PORT)
