document.addEventListener('DOMContentLoaded', () => {
    // === VÁLTOZÓK AZ ELEMEKHEZ ===
    const urlParams = new URLSearchParams(window.location.search);
    const bolygoId = urlParams.get('bolygo');

    const bolygoNevElem = document.getElementById('bolygo-nev');
    const bolygoKepElem = document.getElementById('bolygo-kep');
    const bolygoLeirasElem = document.getElementById('bolygo-leiras');
    const galeriaContainer = document.getElementById('kep-galeria');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalImage = document.getElementById('modal-image');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // AUDIOLEJÁTSZÓ ELEMEI
    const playerContainer = document.getElementById('audio-player-container');
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const seekSlider = document.getElementById('seek-slider');
    const timeDisplay = document.getElementById('time-display');

    // === ADATOK BETÖLTÉSE AZ OLDALRA ===
    if (bolygoId) {
        fetch(`data/${bolygoId}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('A keresett adatfájl nem található.');
                }
                return response.json();
            })
            .then(adat => {
                document.title = adat.nev + " | Adatlap";
                bolygoNevElem.textContent = adat.nev;
                bolygoKepElem.src = adat.kep;
                bolygoKepElem.alt = adat.nev + " képe";
                bolygoLeirasElem.innerHTML = adat.leiras;

                // Galéria feltöltése
                galeriaContainer.innerHTML = '';
                if (adat.galeria && Array.isArray(adat.galeria)) {
                    adat.galeria.forEach(kepUrl => {
                        const img = document.createElement('img');
                        img.src = kepUrl;
                        img.alt = adat.nev + " galéria kép";
                        galeriaContainer.appendChild(img);
                    });
                }

                // AUDIOLEJÁTSZÓ LOGIKA
                if (adat.hang) {
                    playerContainer.style.display = 'flex';
                    audioPlayer.src = adat.hang;

                    playPauseBtn.addEventListener('click', () => {
                        if (audioPlayer.paused) {
                            audioPlayer.play();
                        } else {
                            audioPlayer.pause();
                        }
                    });

                    audioPlayer.addEventListener('play', () => playPauseBtn.innerHTML = '⏸');
                    audioPlayer.addEventListener('pause', () => playPauseBtn.innerHTML = '▶');
                    
                    stopBtn.addEventListener('click', () => {
                        audioPlayer.pause();
                        audioPlayer.currentTime = 0;
                    });

                    audioPlayer.addEventListener('loadedmetadata', () => {
                        seekSlider.max = audioPlayer.duration;
                        updateTimeDisplay();
                    });

                    audioPlayer.addEventListener('timeupdate', () => {
                        seekSlider.value = audioPlayer.currentTime;
                        updateTimeDisplay();
                    });

                    seekSlider.addEventListener('input', () => {
                        audioPlayer.currentTime = seekSlider.value;
                    });
                }
            })
            .catch(error => {
                console.error("Hiba történt az adatok betöltése közben:", error);
                bolygoNevElem.textContent = "Ismeretlen égitest";
                bolygoLeirasElem.innerHTML = `<p>A kért adatlap nem tölthető be. Lehet, hogy hibás a link, vagy az adatfájl nem létezik.</p><p>Kérjük, válasszon egy égitestet a <a href="index.html">főoldalon</a>.</p>`;
                playerContainer.style.display = 'none';
                galeriaContainer.innerHTML = '';
            });
    } else {
        bolygoNevElem.textContent = "Nincs kiválasztva égitest";
        bolygoLeirasElem.innerHTML = `<p>Kérjük, válasszon egy égitestet a <a href="index.html">főoldalon</a> a részletes adatlap megtekintéséhez.</p>`;
        playerContainer.style.display = 'none';
    }

    // === SEGÉDFÜGGVÉNYEK ÉS ESEMÉNYKEZELŐK (VÁLTOZATLAN) ===

    // Időkijelzőt formázó segédfüggvény
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    function updateTimeDisplay() {
        const currentTime = formatTime(audioPlayer.currentTime);
        const duration = formatTime(audioPlayer.duration || 0);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
    }

    // KÉP NAGYÍTÁS (MODAL) LOGIKA
    galeriaContainer.addEventListener('click', function(event) {
        if (event.target.tagName === 'IMG') {
            modalOverlay.style.display = 'flex';
            modalImage.src = event.target.src;
        }
    });

    function closeModal() {
        modalOverlay.style.display = 'none';
    }

    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => (event.target === modalOverlay) && closeModal());
    window.addEventListener('keydown', (event) => (event.key === 'Escape' && modalOverlay.style.display === 'flex') && closeModal());
});