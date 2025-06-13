from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os

# フロントエンドの静的ファイルを提供する Flask アプリ
app = Flask(__name__, static_folder="../public", static_url_path="/")
CORS(app)

# 画像を一時保存するフォルダ
UPLOAD_FOLDER = os.path.join(app.static_folder, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/api/upload', methods=['POST'])
def upload():
    # アップロードされたファイルを取得
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    f = request.files['image']

    # 古い一時ファイルを削除しておく
    for name in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, name)
        if os.path.isfile(file_path):
            os.remove(file_path)

    ext = os.path.splitext(secure_filename(f.filename))[1].lower()
    filename = f"temp{ext if ext else '.png'}"
    path = os.path.join(UPLOAD_FOLDER, filename)
    # 適当なファイル名で保存
    f.save(path)
    return jsonify({'url': f'/uploads/{filename}'})


if __name__ == '__main__':
    # 開発用サーバーとして起動
    app.run(debug=True)
