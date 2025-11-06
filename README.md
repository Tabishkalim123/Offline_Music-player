# 🎵 Offline Music Player – Ad-Free & Premium-Free

An **offline, ad-free music player** built with Python Flask, HTML, CSS, and JavaScript.
Designed to let you **enjoy your local music library** without subscriptions, ads, or internet dependency.

---

## 🧠 Motivation

Streaming services often require subscriptions or show ads.
This project provides a **simple, free, offline alternative** where you can play, manage, and control your own music files easily.

---

## ⚙️ Tech Stack

* **Backend:** Python, Flask, Flask-CORS
* **Database:** SQL Server (for storing song metadata)
* **Frontend:** HTML, CSS, JavaScript (vanilla)
* **Audio Management:** HTML5 Audio API

---

## 💡 Features

* ✅ Add songs with metadata (Title, Artist, Album, FilePath)
* ✅ Play / Pause songs
* ✅ Next / Previous track controls
* ✅ Repeat mode toggle
* ✅ Volume control
* ✅ Delete songs from library
* ✅ Search songs by Title or SongID
* ✅ Keyboard shortcuts for quick playback:

  * Space → Play/Pause
  * Left/Right Arrows → Previous/Next

---

## 🖥️ Screenshots

<img width="1415" height="941" alt="image" src="https://github.com/user-attachments/assets/a8f410eb-5f20-45e2-9f03-099d633b427e" />



---

## 🗂️ Folder Structure

```
offline-music-player/
│
├─ backend/
│   └─ app.py           # Flask API server
├─ frontend/
│   ├─ index.html       # Player UI
│   ├─ style.css        # Styles for the player
│   └─ script.js        # Audio player logic
├─ songs/               # Folder to store local MP3 files
└─ README.md
```

---

## 🚀 How to Run Locally

1. **Clone the repository**

```bash
git clone https://github.com/your-username/offline-music-player.git
cd offline-music-player
```

2. **Set up Python environment**

```bash
python -m venv venv
venv\Scripts\activate       # Windows
# OR
source venv/bin/activate    # Mac/Linux

pip install flask flask-cors pyodbc
```

3. **Configure SQL Server connection**

* Update `app.py` with your SQL Server credentials:

```python
conn = pyodbc.connect(
    'DRIVER={SQL Server};SERVER=YOUR_SERVER;DATABASE=MusicDB;Trusted_Connection=yes;'
)
```

* Ensure a `Songs` table exists:

```sql
CREATE TABLE Songs (
    SongID INT PRIMARY KEY,
    Title NVARCHAR(100),
    Artist NVARCHAR(100),
    Album NVARCHAR(100),
    FilePath NVARCHAR(200)
);
```

4. **Run the Flask backend**

```bash
python app.py
```

5. **Open the frontend**

* Open `index.html` in your browser
* Ensure your `songs` folder contains MP3 files

6. **Add songs, play music, and enjoy!**

---

## 🛠️ Future Improvements

* Playlist management
* Drag & drop file uploads
* Better UI animations and dark/light mode toggle
* Mobile responsiveness improvements

---

## 📜 License

MIT License © Md Tabish Kalim

---

## 💬 Credits

Created by **Md Tabish Kalim** – Designed for **offline, ad-free music enjoyment**.

---

> Enjoy your music without interruptions! 🎶
