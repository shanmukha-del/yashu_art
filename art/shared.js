/* 
  🎨 YASHU ARTS - SHARED LOGIC
  Handling Supabase, Auth, and Global Navigation
*/

let allArts = [];
let selectedArt = null;

async function initStore() {
    allArts = await fetchAllArts();
    if (typeof renderGallery === "function") {
        renderGallery(allArts);
    }
}

// 🛒 Global Navigation Helpers
function navigateTo(url) {
    window.location.href = url;
}

// 3D Tilt Effect Utility
function applyTiltEffect() {
    const cards = document.querySelectorAll('.card, .detail-container');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// 🎵 Music Logic
let musicOn = localStorage.getItem("musicOn") === "true";
const bgMusic = document.getElementById('bgMusic');

function updateMusicUI() {
    const btn = document.getElementById('musicBtn');
    if (btn) btn.innerText = musicOn ? "🔊" : "🔇";
}

function toggleMusic() {
    musicOn = !musicOn;
    localStorage.setItem("musicOn", musicOn);
    if (musicOn) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
    updateMusicUI();
}

// 🇮🇳 INDIA FEST OFFER LOGIC
function triggerOffer() {
    const overlay = document.getElementById('offerOverlay');
    const box = document.getElementById('offerBox');
    if(!overlay || !box) return;
    overlay.style.display = 'flex';
    setTimeout(() => {
        box.classList.remove('exit');
        box.classList.add('active');
    }, 10);
}

function dismissOffer() {
    const box = document.getElementById('offerBox');
    const overlay = document.getElementById('offerOverlay');
    if(!box || !overlay) return;
    box.classList.remove('active');
    box.classList.add('exit');
    localStorage.setItem("indiaFestShown", "true"); // Mark as shown
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 800);
}

window.addEventListener('DOMContentLoaded', () => {
    if (bgMusic && musicOn) {
        bgMusic.play().catch(() => {});
    }
    updateMusicUI();

    // Offer trigger logic
    const offerShown = localStorage.getItem("indiaFestShown");
    
    if (!offerShown) {
        if (window.location.pathname.includes('home.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
            setTimeout(triggerOffer, 3000);
        }
    }
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (musicOn && bgMusic) bgMusic.pause();
    } else {
        if (musicOn && bgMusic) bgMusic.play();
    }
});
