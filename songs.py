from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pyodbc
import os
import logging

app = Flask(__name__)
CORS(app)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

# SQL Server connection
conn = pyodbc.connect(
    'DRIVER={SQL Server};SERVER=TABISH\\SQLEXPRESS04;DATABASE=MusicDB;Trusted_Connection=yes;'
)

# ✅ Home route for testing
@app.route('/')
def home():
    return "Offline Music Player API is running!"

# ✅ Check current working directory
@app.route('/check_directory')
def check_directory():
    return f"Current working directory: {os.getcwd()}"

# ✅ List files in local 'songs' folder (optional)
@app.route('/list_songs')
def list_songs():
    songs_dir = os.path.join(os.getcwd(), 'songs')
    if not os.path.exists(songs_dir):
        return "Songs directory not found", 404
    files = os.listdir(songs_dir)
    return jsonify(files)

# ✅ Serve MP3 file from *any absolute path*
@app.route('/songs/<path:filename>')
def serve_song(filename):
    try:
        # Decode and normalize full file path
        file_path = filename
        if os.path.exists(file_path):
            directory = os.path.dirname(file_path)
            file = os.path.basename(file_path)
            return send_from_directory(directory, file)
        else:
            return jsonify({"error": f"File not found: {file_path}"}), 404
    except Exception as e:
        app.logger.error(f"Serve song error: {e}")
        return jsonify({"error": str(e)}), 500

# ✅ Add Song
@app.route('/add_song', methods=['POST'])
def add_song():
    try:
        data = request.json
        required_fields = ['SongID', 'Title', 'Artist', 'Album', 'FilePath']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing fields"}), 400
        if not isinstance(data['SongID'], int) or data['SongID'] <= 0:
            return jsonify({"error": "Invalid SongID"}), 400

        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Songs (SongID, Title, Artist, Album, FilePath) VALUES (?, ?, ?, ?, ?)",
                (data['SongID'], data['Title'], data['Artist'], data['Album'], data['FilePath'])
            )
            conn.commit()
        return jsonify({"message": "Song added successfully"}), 201
    except pyodbc.IntegrityError:
        return jsonify({"error": "SongID already exists or constraint violation"}), 400
    except Exception as e:
        app.logger.error(f"Add Song Error: {e}")
        return jsonify({"error": str(e)}), 500

# ✅ Get all Songs
@app.route('/get_songs', methods=['GET'])
def get_songs():
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM Songs")
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description]
            data = [dict(zip(columns, row)) for row in rows]
        return jsonify(data)
    except Exception as e:
        app.logger.error(f"Get Songs Error: {e}")
        return jsonify({"error": str(e)}), 500

# ✅ Update Song
@app.route('/update_song/<int:song_id>', methods=['PUT'])
def update_song(song_id):
    try:
        data = request.json
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE Songs SET Title=?, Artist=?, Album=?, FilePath=? WHERE SongID=?",
                (data['Title'], data['Artist'], data['Album'], data['FilePath'], song_id)
            )
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "SongID not found"}), 404
        return jsonify({"message": "Song updated successfully"})
    except Exception as e:
        app.logger.error(f"Update Song Error: {e}")
        return jsonify({"error": str(e)}), 500

# ✅ Delete Song
@app.route('/delete_song/<int:song_id>', methods=['DELETE'])
def delete_song(song_id):
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM Songs WHERE SongID = ?", (song_id,))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"error": "SongID not found"}), 404
        return jsonify({"message": "Song deleted successfully"})
    except Exception as e:
        app.logger.error(f"Delete Song Error: {e}")
        return jsonify({"error": str(e)}), 500

# ✅ Search Song by SongID or Title
@app.route('/search_song', methods=['GET'])
def search_song():
    try:
        song_id = request.args.get('SongID')
        title = request.args.get('Title')

        query = "SELECT * FROM Songs WHERE 1=1"
        params = []

        if song_id:
            query += " AND SongID=?"
            params.append(song_id)
        if title:
            query += " AND Title LIKE ?"
            params.append(f"%{title}%")

        with conn.cursor() as cursor:
            cursor.execute(query, params)
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description]
            data = [dict(zip(columns, row)) for row in rows]
        return jsonify(data)
    except Exception as e:
        app.logger.error(f"Search Song Error: {e}")
        return jsonify({"error": str(e)}), 500


# ✅ Run the app
if __name__ == '__main__':
    app.run(debug=True)
