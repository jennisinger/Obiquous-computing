document.addEventListener('DOMContentLoaded', () => {
  const bearImage = document.getElementById('bearImage');
  const audioPlayer = document.getElementById('audioPlayer');
  const backBtn = document.getElementById('back-btn');

  // Play / Pause toggle on bear click
  if (bearImage && audioPlayer) {
    bearImage.addEventListener('click', () => {
      if (audioPlayer.paused) {
        audioPlayer.play().catch(() => { /* Autoplay blocked — ignore */ });
      } else {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
    });

    // Loop audio
    audioPlayer.addEventListener('ended', () => {
      audioPlayer.currentTime = 0;
      audioPlayer.play().catch(() => {});
    });
  }

  // Back button: mark pet as hatched and return to room
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('petHatched', '1');
      window.location.href = 'room.html';
    });
  }
});

