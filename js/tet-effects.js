/**
 * ivyEnglish - Realistic Tet Firecrackers with Explosions 2026
 */
const TetEffects = {
    init() {
        this.createStyles();
        this.addFirecrackers('left');
        this.addFirecrackers('right');
        this.initFireworkOnClick();
        this.createSnowfall();
        // Bắt đầu hiệu ứng nổ lách tách ở đuôi pháo
        setInterval(() => this.createCrackerSpark('left'), 200);
        setInterval(() => this.createCrackerSpark('right'), 250);
    },

    addFirecrackers(side) {
        const container = document.createElement('div');
        container.className = `cracker-chain ${side}`;
        container.id = `chain-${side}`;
        
        const header = document.createElement('div');
        header.className = 'cracker-header';
        header.innerText = 'Chúc Mừng Năm Mới';
        container.appendChild(header);

        for (let i = 0; i < 12; i++) {
            const unit = document.createElement('div');
            unit.className = 'cracker-unit';
            container.appendChild(unit);
        }

        const footer = document.createElement('div');
        footer.className = 'cracker-footer';
        // Điểm nổ sẽ nằm ở đây
        footer.innerHTML = '<div class="explosion-point"></div>';
        container.appendChild(footer);

        document.body.appendChild(container);
    },

    // Hàm tạo hiệu ứng nổ lách tách và pháo giấy rơi ra từ dây pháo
    createCrackerSpark(side) {
        const chain = document.getElementById(`chain-${side}`);
        if (!chain) return;
        const footer = chain.querySelector('.explosion-point');
        const rect = footer.getBoundingClientRect();

        // 1. Tạo tia lửa (spark)
        const spark = document.createElement('div');
        spark.className = 'cracker-spark';
        spark.style.left = rect.left + rect.width / 2 + 'px';
        spark.style.top = rect.top + 'px';
        document.body.appendChild(spark);

        // 2. Tạo mảnh pháo giấy đỏ rơi ra
        const debris = document.createElement('div');
        debris.className = 'cracker-debris';
        debris.style.left = rect.left + rect.width / 2 + 'px';
        debris.style.top = rect.top + 'px';
        debris.style.backgroundColor = Math.random() > 0.5 ? '#ff0000' : '#ffd700';
        document.body.appendChild(debris);

        // Hiệu ứng vật lý cho mảnh giấy
        const dx = (Math.random() - 0.5) * 80;
        const dy = Math.random() * 100 + 50;
        
        debris.animate([
            { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], { duration: 1000 + Math.random() * 500, easing: 'ease-out' }).onfinish = () => debris.remove();

        setTimeout(() => spark.remove(), 100);
    },

    createStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .cracker-chain {
                position: fixed; top: 10px; z-index: 9999;
                display: flex; flex-direction: column; align-items: center;
                animation: physicsSwing 3s ease-in-out infinite alternate;
                transform-origin: top center; pointer-events: none;
            }
            .cracker-chain.left { left: 40px; }
            .cracker-chain.right { right: 40px; }

            .cracker-header {
                width: 60px; height: 100px; background: #d32f2f;
                border: 2px solid #ffd700; color: #ffd700;
                writing-mode: vertical-rl; text-align: center;
                font-weight: bold; font-size: 14px; border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); margin-bottom: -10px; z-index: 2;
            }

            .cracker-unit {
                width: 20px; height: 48px; 
                background: linear-gradient(90deg, #b71c1c 0%, #ff5252 50%, #b71c1c 100%);
                border-radius: 3px; position: relative; margin: -6px 0;
                border: 1px solid #8b0000;
            }
            .cracker-unit::before, .cracker-unit::after {
                content: ""; position: absolute; left: 0; width: 100%; height: 4px; background: #ffd700;
            }
            .cracker-unit::before { top: 8px; }
            .cracker-unit::after { bottom: 8px; }

            .cracker-footer {
                width: 4px; height: 40px; background: #ffd700; position: relative; margin-top: -5px;
            }

            /* Tia lửa nổ lách tách */
            .cracker-spark {
                position: fixed; width: 15px; height: 15px; background: #fff;
                border-radius: 50%; z-index: 10001; mix-blend-mode: screen;
                box-shadow: 0 0 20px 10px #ffd700, 0 0 40px 20px #ff4500;
                transform: translate(-50%, -50%); pointer-events: none;
            }

            /* Mảnh pháo giấy rơi */
            .cracker-debris {
                position: fixed; width: 6px; height: 8px; z-index: 10000; pointer-events: none;
            }

            @keyframes physicsSwing {
                0% { transform: rotate(-2deg) translateX(-3px); }
                100% { transform: rotate(2deg) translateX(3px); }
            }

            .tet-flake { position: fixed; top: -50px; z-index: 9998; pointer-events: none; animation: tetFall linear forwards; }
            @keyframes tetFall {
                0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
            }

            .firework-particle { position: fixed; width: 4px; height: 4px; border-radius: 50%; z-index: 10000; pointer-events: none; }

            @media (max-width: 768px) { .cracker-chain { display: none; } }

            /* --- HEADER TẾT (DỄ NHÌN) --- */
            header {
                background: linear-gradient(to bottom, #d32f2f, #b71c1c) !important; /* Giữ nền trắng cho sạch sẽ */
                border-bottom: 3px solid #d32f2f !important; /* Viền đỏ rực rỡ */
                position: relative;
            }

            /* Thêm họa tiết đồng tiền may mắn nhỏ ở góc header */
            header::after {
                content: "🧧";
                position: absolute;
                right: 150px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 20px;
            }

            header nav a {
                color: #334155 !important; /* Giữ màu chữ tối để dễ đọc */
                font-weight: 500;
            }

            header nav a:hover {
                color: #d32f2f !important; /* Hover ra màu đỏ */
            }

            /* Nút Đăng Ký - Điểm nhấn chính */
            .cta-nav {
                background: linear-gradient(135deg, #d32f2f, #ff5252) !important;
                color: #fff !important;
                border: none !important;
                box-shadow: 0 4px 10px rgba(211, 47, 47, 0.3);
            }

            /* --- FOOTER TẾT (SANG TRỌNG) --- */
            #main-footer {
                background: #f0a5a5 !important; /* Màu hồng nhạt rất nhẹ, dịu mắt */
                border-top: 5px solid #d32f2f;
                color: #334155 !important;
            }

            #main-footer h3 {
                color: #b71c1c !important; /* Màu đỏ đô cho tiêu đề */
                border-left: 4px solid #ffd700;
                padding-left: 10px;
            }

            #main-footer .footer-desc, #main-footer p, #main-footer a {
                color: #4b5563 !important; /* Chữ xám đậm dễ đọc */
            }

            #main-footer a:hover {
                color: #d32f2f !important;
                text-decoration: underline !important;
            }

            /* Social Icons */
            .social-icon {
                background: #d32f2f !important;
                color: #fff !important;
                transition: 0.3s;
            }

            .social-icon:hover {
                background: #ffd700 !important;
                color: #d32f2f !important;
                transform: translateY(-3px);
            }

            /* Badge trang trí nhỏ cho các mục */
            #main-footer ul li::before {
                content: "🌸";
                margin-right: 8px;
                font-size: 12px;
            }
        `;
        document.head.appendChild(style);
    },

    createSnowfall() {
        const symbols = ['🧧', '🌸', '🌼', '🧧', '✨', '🏮'];
        setInterval(() => {
            const flake = document.createElement('div');
            flake.className = 'tet-flake';
            flake.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.animationDuration = Math.random() * 3 + 5 + 's';
            flake.style.fontSize = Math.random() * 20 + 10 + 'px';
            document.body.appendChild(flake);
            setTimeout(() => flake.remove(), 8000);
        }, 800);
    },

    initFireworkOnClick() {
        document.addEventListener('click', (e) => {
            for (let i = 0; i < 15; i++) {
                const p = document.createElement('div');
                p.className = 'firework-particle';
                const colors = ['#FFD700', '#FF4500', '#FF0000', '#FFFFFF', '#00FF00'];
                p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                p.style.left = e.clientX + 'px';
                p.style.top = e.clientY + 'px';
                document.body.appendChild(p);
                const dx = (Math.random() - 0.5) * 200;
                const dy = (Math.random() - 0.5) * 200;
                p.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }], { duration: 1000, easing: 'ease-out' }).onfinish = () => p.remove();
            }
        });
    }
};

TetEffects.init();