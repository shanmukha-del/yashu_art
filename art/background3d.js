/* 
  ⚡ YASHU ARTS - HIGH-PERFORMANCE 5D BACKGROUND
  Engineered for Smoothness (60 FPS)
*/
const canvas = document.getElementById('canvas3d');
const ctx = canvas.getContext('2d', { alpha: true });

let width, height;
let particles = [];
let mouse = { x: 0, y: 0 };
let active = true;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor(type) {
        this.type = type;
        this.init();
    }

    init() {
        this.z = Math.random() * 800;
        this.x = Math.random() * width;
        this.y = -100;
        
        const factor = (800 - this.z) / 800;
        this.speedY = (Math.random() * 1.5 + 0.5) * factor + 0.2;
        this.speedX = (Math.random() * 0.4 - 0.2);
        this.size = (Math.random() * 6 + 1) * factor;
        // Optimization: Use less blur, only for deep particles
        this.blur = this.z > 500 ? Math.floor((this.z - 500) / 60) : 0; 
        this.opacity = (Math.random() * 0.3 + 0.05) * factor;
        
        this.color = this.type === 'drop' 
            ? (Math.random() > 0.5 ? '#00f2ff' : '#0066ff') 
            : '#444';
        
        if (this.type === 'stroke') {
            this.points = [];
            this.maxLength = Math.floor(Math.random() * 15 + 10);
        }
    }

    update() {
        const pFactor = this.z / 10000;
        this.y += this.speedY;
        this.x += this.speedX + (mouse.x - width/2) * pFactor;

        if (this.type === 'stroke') {
            this.points.push({x: this.x, y: this.y});
            if (this.points.length > this.maxLength) this.points.shift();
        }

        if (this.y > height + 100) {
            this.init();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;

        if (this.type === 'drop') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            if (this.points.length > 1) {
                ctx.beginPath();
                ctx.lineWidth = this.size / 3;
                ctx.lineCap = 'round';
                ctx.moveTo(this.points[0].x, this.points[0].y);
                for (let i = 1; i < this.points.length; i++) {
                    ctx.lineTo(this.points[i].x, this.points[i].y);
                }
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    // Reduced count for "Hanging" issues
    const count = width < 600 ? 25 : 50; 
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(i % 3 === 0 ? 'stroke' : 'drop'));
    }
}

function animate() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    
    // Draw particles
    for(let i=0; i<particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    
    requestAnimationFrame(animate);
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
});

// Pause when tab is inactive to save CPU
document.addEventListener('visibilitychange', () => {
    active = !document.hidden;
    if (active) animate();
});

window.addEventListener('resize', () => {
    resize();
    initParticles();
});

resize();
initParticles();
animate();
