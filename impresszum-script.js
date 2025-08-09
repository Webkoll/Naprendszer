document.addEventListener('DOMContentLoaded', () => {
    // === KÓD A PROFILKÉP NAGYÍTÁSÁHOZ (MODAL) ===

    // 1. A szükséges HTML elemek elérése
    const modalOverlay = document.getElementById('modal-overlay');
    const modalImage = document.getElementById('modal-image');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const profilKep = document.getElementById('profil-kep');

    // 2. Eseményfigyelő a profilképre kattintáshoz
    profilKep.addEventListener('click', function() {
        modalOverlay.style.display = 'flex';
        modalImage.src = this.src; // A kattintott kép URL-jét adja a modalnak
    });

    // 3. Függvény a modal bezárásához
    function closeModal() {
        modalOverlay.style.display = 'none';
    }

    // 4. Eseményfigyelők a modal bezárásához
    closeModalBtn.addEventListener('click', closeModal);
    
    // Bezárás, ha a háttérre kattintunk
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    // Bezárás Escape billentyűvel
    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modalOverlay.style.display === 'flex') {
            closeModal();
        }
    });
});