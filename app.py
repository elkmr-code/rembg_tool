import io

import flask

from rembg import remove
from ultralytics import YOLO
from PIL import Image

app = flask.Flask(__name__)
model = YOLO("yolo11n.pt")

@app.route('/')
def index():
    return flask.render_template('index.html')

@app.route('/remove', methods=['POST'])
def remove_background():
    if 'file' not in flask.request.files:
        return "No file part", 400
    
    file = flask.request.files['file']

    if file.mimetype != 'image/jpeg' and file.mimetype != 'image/png':
        return "Invalid file type. Only PNG files are allowed.", 400
    
    return flask.send_file(io.BytesIO(remove(file.stream.read(), force_return_bytes=True)), download_name='output.png', mimetype='image/png')


@app.route('/detect', methods=['POST'])
def detect_objects():
    if 'file' not in flask.request.files:
        return "No file part", 400
    
    file = flask.request.files['file']

    if file.mimetype != 'image/jpeg' and file.mimetype != 'image/png':
        return "Invalid file type. Only PNG files are allowed.", 400
    
    detect_results = model(Image.open(io.BytesIO(file.stream.read())), device="0") # GPU: "cuda:0"

    return detect_results[0].to_json(), 200, {'Content-Type': 'application/json'}

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)