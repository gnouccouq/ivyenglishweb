document.addEventListener("DOMContentLoaded", function() {
    const popupHTML = `
        <div id="ny-overlay" class="ny-popup-overlay">
            <div class="ny-popup-content">
                <span class="ny-close-btn" onclick="closeNYPopup()">&times;</span>
                <h2 style="color: #c5a059; margin-bottom: 10px;">🎉 Sắp Đến Năm Mới 2026!</h2>
                <p style="color: white; opacity: 0.9;">ivyEnglish cùng bạn đếm ngược...</p>
                <div class="timer">
                    <div class="time-box"><span id="days">00</span><small>Ngày</small></div>
                    <div class="time-box"><span id="hours">00</span><small>Giờ</small></div>
                    <div class="time-box"><span id="minutes">00</span><small>Phút</small></div>
                    <div class="time-box"><span id="seconds">00</span><small>Giây</small></div>
                </div>
            </div>
        </div>
        <canvas id="fireworks-canvas"></canvas>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    setTimeout(() => {
        document.getElementById('ny-overlay').style.display = 'flex';
    }, 1000);

    window.closeNYPopup = function() {
        document.getElementById('ny-overlay').style.display = 'none';
    }

    const countdownDate = new Date("Feb 17, 2026 00:00:00").getTime();
    
    const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        if(document.getElementById("days")) {
            document.getElementById("days").innerText = d.toString().padStart(2, '0');
            document.getElementById("hours").innerText = h.toString().padStart(2, '0');
            document.getElementById("minutes").innerText = m.toString().padStart(2, '0');
            document.getElementById("seconds").innerText = s.toString().padStart(2, '0');
        }

        if (distance < 0) {
            clearInterval(x);
            const overlay = document.getElementById("ny-overlay");
            const content = document.querySelector(".ny-popup-content");
            if(content) content.innerHTML = "<h1 style='color:#c5a059; font-size:3rem;'>HAPPY NEW YEAR 2026!</h1>";
            startFireworks();
            setTimeout(() => {
                if(overlay) overlay.style.opacity = '0';
                setTimeout(() => { overlay.style.display = 'none'; }, 500);
            }, 2000);
        }
    }, 1000);
    
    function startFireworks() {
        const canvas = document.getElementById('fireworks-canvas');
        if(!canvas) return;
        canvas.style.display = 'block';
        canvas.style.opacity = '1';
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        let animationId;
        let startTime = Date.now();
        const duration = 3000;

        function Particle(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            this.velocity = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
            this.alpha = 1;
            this.draw = function() {
                ctx.save(); ctx.globalAlpha = this.alpha;
                ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = this.color; ctx.fill(); ctx.restore();
            };
            this.update = function() {
                this.x += this.velocity.x; this.y += this.velocity.y;
                this.alpha -= 0.012;
            };
        }

        function animate() {
            if (Date.now() - startTime > duration) {
                cancelAnimationFrame(animationId);
                canvas.style.transition = "opacity 1s";
                canvas.style.opacity = '0'; 
                setTimeout(() => {
                    canvas.style.display = 'none';
                }, 1000);
                return;
            }
        }

        animationId = requestAnimationFrame(animate);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (Math.random() < 0.15) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * (canvas.height / 2);
                const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
                for (let i = 0; i < 60; i++) particles.push(new Particle(x, y, color));
            }
            
            particles.forEach((p, i) => {
                if (p.alpha <= 0) particles.splice(i, 1);
                else { p.update(); p.draw(); }
            });
        }
        animate();
});