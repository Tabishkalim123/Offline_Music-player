const API_URL = 'http://127.0.0.1:5000';
let currentAudio = null;
let currentIndex = -1;
let songs = [];
let isRepeat = false;

// Add Song Form Handler
document.getElementById('songForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const songData = {
    SongID: parseInt(document.getElementById('songID').value),
    Title: document.getElementById('title').value,
    Artist: document.getElementById('artist').value,
    Album: document.getElementById('album').value,
    FilePath: document.getElementById('filePath').value
  };
  
  try {
    const res = await fetch(`${API_URL}/add_song`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData)
    });
    const result = await res.json();
    
    if (res.ok) {
      showMessage('✅ Song added successfully!', 'green');
      document.getElementById('songForm').reset();
      loadSongs();
    } else {
      showMessage('❌ ' + (result.error || 'Failed to add song'), 'red');
    }
  } catch (err) {
    showMessage('❌ Connection error: ' + err.message, 'red');
  }
});

// Show Message Function
function showMessage(text, color) {
  const box = document.getElementById('messageBox');
  box.textContent = text;
  box.style.color = color;
  box.style.fontWeight = 'bold';
  box.style.marginTop = '10px';
  box.style.padding = '10px';
  box.style.borderRadius = '8px';
  box.style.background = color === 'green' ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 78, 80, 0.2)';
  
  setTimeout(() => {
    box.textContent = '';
    box.style.background = 'transparent';
  }, 3000);
}

// Load All Songs
async function loadSongs() {
  try {
    const res = await fetch(`${API_URL}/get_songs`);
    songs = await res.json();
    displaySongs();
  } catch (err) {
    showMessage('❌ Failed to load songs', 'red');
    console.error(err);
  }
}

// Display Songs in Table
function displaySongs() {
  const tbody = document.querySelector('#songsTable tbody');
  tbody.innerHTML = '';
  
  songs.forEach((song, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${song.Title}</td>
      <td>${song.Artist}</td>
      <td>${song.Album}</td>
      <td>
        <div class="audio-controls">
          <button onclick="playAudio(${index})">▶️</button>
          <button onclick="pauseAudio()">⏸</button>
        </div>
      </td>
      <td>
        <button onclick="deleteSong(${song.SongID})">🗑️ Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Play Audio
function playAudio(index) {
  if (index < 0 || index >= songs.length) return;
  
  const song = songs[index];
  currentIndex = index;
  
  // Stop current audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  // Create new audio instance
  currentAudio = new Audio(`${API_URL}/songs/${song.FilePath}`);
  
  // Update now playing
  document.getElementById('nowPlaying').textContent = 
    `🎵 Now Playing: ${song.Title} - ${song.Artist}`;
  
  // Play the audio
  currentAudio.play().catch(err => {
    showMessage('❌ Failed to play: ' + err.message, 'red');
  });
  
  // Auto-play next song when current ends
  currentAudio.onended = () => {
    if (isRepeat) {
      playAudio(currentIndex);
    } else {
      playNext();
    }
  };
  
  // Error handling
  currentAudio.onerror = () => {
    showMessage('❌ Audio file not found or cannot be played', 'red');
  };
}

// Pause Audio
function pauseAudio() {
  if (currentAudio) {
    currentAudio.pause();
    showMessage('⏸ Paused', '#ffa500');
  }
}

// Play Next Song
function playNext() {
  if (songs.length === 0) return;
  currentIndex = (currentIndex + 1) % songs.length;
  playAudio(currentIndex);
}

// Play Previous Song
function playPrevious() {
  if (songs.length === 0) return;
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playAudio(currentIndex);
}

// Toggle Repeat Mode
function toggleRepeat() {
  isRepeat = !isRepeat;
  const btn = event.target;
  if (isRepeat) {
    btn.style.background = 'linear-gradient(135deg, #1db954, #1ed760)';
    showMessage('🔁 Repeat ON', 'green');
  } else {
    btn.style.background = 'linear-gradient(135deg, #333, #555)';
    showMessage('🔁 Repeat OFF', '#ffa500');
  }
}

// Set Volume
function setVolume(value) {
  if (currentAudio) {
    currentAudio.volume = value;
  }
}

// Delete Song
async function deleteSong(songID) {
  if (!confirm('Are you sure you want to delete this song?')) return;
  
  try {
    const res = await fetch(`${API_URL}/delete_song/${songID}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    
    if (res.ok) {
      showMessage('✅ Song deleted successfully!', 'green');
      
      // Stop playing if deleted song is currently playing
      if (currentAudio && songs[currentIndex]?.SongID === songID) {
        currentAudio.pause();
        currentAudio = null;
        document.getElementById('nowPlaying').textContent = 'Currently Playing: None';
      }
      
      loadSongs();
    } else {
      showMessage('❌ ' + (result.error || 'Failed to delete song'), 'red');
    }
  } catch (err) {
    showMessage('❌ Connection error: ' + err.message, 'red');
  }
}

// Search Song (Optional - you can add search input in HTML)
async function searchSong(searchTerm) {
  try {
    const res = await fetch(`${API_URL}/search_song?Title=${encodeURIComponent(searchTerm)}`);
    songs = await res.json();
    displaySongs();
  } catch (err) {
    showMessage('❌ Search failed', 'red');
  }
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    if (currentAudio && !currentAudio.paused) {
      pauseAudio();
    } else if (currentIndex >= 0) {
      playAudio(currentIndex);
    }
  }
  if (e.code === 'ArrowRight') {
    playNext();
  }
  if (e.code === 'ArrowLeft') {
    playPrevious();
  }
});

// Initialize - Load songs on page load
window.addEventListener('DOMContentLoaded', () => {
  loadSongs();
  showMessage('🎵 Music Player Ready!', 'green');
});



// Global slider and time elements
const seekSlider = document.getElementById('seekSlider');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');

// Format time in mm:ss
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

// Play Audio
function playAudio(index) {
  if (index < 0 || index >= songs.length) return;
  
  const song = songs[index];
  currentIndex = index;
  
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  currentAudio = new Audio(`${API_URL}/songs/${song.FilePath}`);
  
  document.getElementById('nowPlaying').textContent = 
    `🎵 Now Playing: ${song.Title} - ${song.Artist}`;
  
  currentAudio.play().catch(err => {
    showMessage('❌ Failed to play: ' + err.message, 'red');
  });
  
  // Wait until metadata is loaded to get duration
  currentAudio.addEventListener('loadedmetadata', () => {
    seekSlider.max = Math.floor(currentAudio.duration);
    totalTimeEl.textContent = formatTime(currentAudio.duration);
  });
  
  // Update slider and current time
  currentAudio.addEventListener('timeupdate', () => {
    seekSlider.value = Math.floor(currentAudio.currentTime);
    currentTimeEl.textContent = formatTime(currentAudio.currentTime);
  });

  currentAudio.onended = () => {
    if (isRepeat) {
      playAudio(currentIndex);
    } else {
      playNext();
    }
  };

  currentAudio.onerror = () => {
    showMessage('❌ Audio file not found or cannot be played', 'red');
  };
}

// Seek Audio when slider changes
function seekAudio(value) {
  if (currentAudio) {
    currentAudio.currentTime = value;
  }
}
