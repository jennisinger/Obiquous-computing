document.addEventListener('DOMContentLoaded', () => {
  const bearImage = document.getElementById('bearImage');
  const audioPlayer = document.getElementById('audioPlayer');

  // Click-Event auf dem Bär
  bearImage.addEventListener('click', () => {
    // Audio abspielen oder pausieren
    if (audioPlayer.paused) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
      audioPlayer.currentTime = 0; // Musik von vorne zurücksetzen
    }
  });

  // Loop-Funktionalität: Audio neu starten, wenn es endet
  audioPlayer.addEventListener('ended', () => {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
  });
});