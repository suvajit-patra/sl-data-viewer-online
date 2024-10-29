import base64

import cv2
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os, csv

app = Flask(__name__)
CORS(app)

data_dict = {}
dataset_root_path = ''

# Endpoint to load metadata
@app.route('/api/load_metadata', methods=['POST'])
def load_metadata():
    data = request.json
    metadata_file = data.get('metadata_file')
    global dataset_root_path
    dataset_root_path = data.get('root_path')

    if not metadata_file or not dataset_root_path:
        return jsonify({"error": "Missing metadata file or root path"}), 400

    # Assuming metadata file is a JSON for simplicity
    try:
        metadata = []
        with open(metadata_file, 'r') as file:
            reader = csv.reader(file)
            header = next(reader)
            for row in reader:
                data_dict[row[0]] = {header[i]:row[i] for i in range(1, len(header))}
                metadata.append(data_dict[row[0]]['class'])
        metadata = list(set(metadata))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Return metadata and root path for video
    return jsonify({
        "metadata": metadata
    })

# Endpoint to load metadata
@app.route('/api/search_filter', methods=['GET'])
def search_filter():
    keyword = request.args['keyword']

    # Assuming metadata file is a JSON for simplicity
    try:
        results = {}
        for key, value in data_dict.items():
            if keyword == value['class']:
                results[f"{value['video_dir']} {value['class']} {value['split']}"] = key
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Return metadata and root path for video
    return jsonify({
        "results": results
    })

def get_video_description(video_path):
    # Open the video file
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print("Error: Could not open video.")
        return None

    # Retrieve video properties
    video_description = {
        "frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        "frame_width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "frame_height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        "fps": cap.get(cv2.CAP_PROP_FPS),
        "duration_seconds": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) / cap.get(cv2.CAP_PROP_FPS)
    }

    # Release the video capture object
    cap.release()
    
    return video_description

# Endpoint to serve video file
@app.route('/api/get_video', methods=['GET'])
def get_video():
    video_id = request.args['video_id']
    video_path = os.path.join(dataset_root_path, data_dict[video_id]['video_dir'])  # Adjust path as needed
    if os.path.exists(video_path):
        with open(video_path, 'rb') as video_file:
            video_data = base64.b64encode(video_file.read()).decode('utf-8')
        if 'frame_count' not in data_dict[video_id]:
            data_dict[video_id].update(get_video_description(video_path))
        return jsonify({
            "id": video_id,
            "video": video_data,
            "details": data_dict[video_id],
        })
    return jsonify({"error": "Video not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5500)
