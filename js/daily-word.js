(function() {
    // 1. CSS tích hợp - Giao diện và Hiệu ứng
    const style = document.createElement('style');
    style.innerHTML = `
        :root { --p-blue: #1a237e; --accent: #5b8cff; }
        
        .daily-word-widget {
            position: fixed; z-index: 9999; font-family: 'Roboto', sans-serif;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            left: 30px; bottom: 30px;
        }

        .daily-word-widget:not(.active) { 
            width: 58px; height: 58px; 
            border-radius: 50%; background: var(--p-blue); 
            box-shadow: 0 0 0 0 rgba(26, 35, 126, 0.7);
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            animation: dw-pulse 2s infinite, dw-wiggle 6s infinite 3s;
        }

        @keyframes dw-pulse {
            0% { box-shadow: 0 0 0 0 rgba(26, 35, 126, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(26, 35, 126, 0); }
            100% { box-shadow: 0 0 0 0 rgba(26, 35, 126, 0); }
        }

        @keyframes dw-wiggle {
            0%, 90%, 100% { transform: rotate(0); }
            92% { transform: rotate(-15deg); }
            95% { transform: rotate(15deg); }
            97% { transform: rotate(-15deg); }
        }

        .daily-word-widget.active { 
            width: 300px; height: auto; border-radius: 16px; 
            background: white; display: block; cursor: default;
            border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            animation: none;
        }

        .dw-icon-trigger { color: #ffd700; font-size: 26px; display: block; filter: drop-shadow(0 0 5px rgba(255,215,0,0.6)); }
        .daily-word-widget.active .dw-icon-trigger { display: none; }
        .daily-word-widget:not(.active) .dw-content-wrapper { display: none; }

        .dw-header { 
            background: linear-gradient(135deg, var(--p-blue) 0%, #2a3eb1 100%); 
            color: white; padding: 12px 18px; font-size: 0.85rem; font-weight: 700; 
            display: flex; justify-content: space-between; align-items: center;
            border-top-left-radius: 15px; border-top-right-radius: 15px;
        }
        
        .dw-body { padding: 20px; }
        .dw-word-wrapper { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .dw-word { color: var(--accent); font-size: 1.5rem; font-weight: 900; cursor: pointer; }
        .dw-speaker { color: var(--accent); cursor: pointer; font-size: 1.2rem; transition: 0.2s; }
        .dw-speaker:hover { transform: scale(1.2); color: var(--p-blue); }
        
        .dw-phonetic { color: #7f8c8d; font-style: italic; font-size: 0.9rem; margin-bottom: 12px; display: block; }
        .dw-meaning { font-weight: 700; color: #2c3e50; font-size: 1rem; margin-bottom: 10px; }
        .dw-example { font-size: 0.85rem; color: #5d6d7e; line-height: 1.5; background: #f8f9fa; padding: 10px; border-radius: 10px; border-left: 3px solid var(--accent); }
        .dw-close-btn { cursor: pointer; font-size: 20px; padding: 5px; line-height: 1; transition: 0.2s; }
        .dw-close-btn:hover { color: #ff5b5b; transform: scale(1.2); }

        @media (max-width: 768px) {
            .daily-word-widget { left: 20px; bottom: 20px; }
            .daily-word-widget.active { width: calc(100% - 40px); max-width: 300px; left: 20px; bottom: 30px; }
        }
    `;
    document.head.appendChild(style);

    const vocabList = [
        { w: "Acumen", p: "/ˈækjʊmən/", m: "Sự nhạy bén", e: "His business acumen helped the company grow." },
        { w: "Benevolent", p: "/bəˈnevələnt/", m: "Nhân từ, rộng lượng", e: "A benevolent uncle paid for her education." },
        { w: "Capricious", p: "/kəˈprɪʃəs/", m: "Thất thường, dễ thay đổi", e: "The weather here is very capricious." },
        { w: "Diligence", p: "/ˈdɪlɪdʒəns/", m: "Sự cần cù, siêng năng", e: "She showed great diligence in her work." },
        { w: "Eloquent", p: "/ˈeləkwənt/", m: "Hùng hồn, thuyết phục", e: "An eloquent speech against the war." },
        { w: "Frugal", p: "/ˈfruːɡl/", m: "Tiết kiệm, thanh đạm", e: "He has always been hard-working and frugal." },
        { w: "Gullible", p: "/ˈɡʌləbl/", m: "Nhẹ dạ, cả tin", e: "Don't be so gullible as to believe everything." },
        { w: "Hypocrisy", p: "/hɪˈpɒkrəsi/", m: "Sự đạo đức giả", e: "It’s sheer hypocrisy to criticize others for this." },
        { w: "Inevitable", p: "/ɪnˈevɪtəbl/", m: "Không thể tránh khỏi", e: "Change is an inevitable part of life." },
        { w: "Jubilant", p: "/ˈdʒuːbɪlənt/", m: "Hân hoan, vui sướng", e: "The fans were in jubilant mood sau chiến thắng." },
        { w: "Kinship", p: "/ˈkɪnʃɪp/", m: "Quan hệ họ hàng, tương đồng", e: "They feel a deep sense of kinship." },
        { w: "Lucid", p: "/ˈluːsɪd/", m: "Rõ ràng, dễ hiểu", e: "A lucid explanation of a complex subject." },
        { w: "Meticulous", p: "/məˈtɪkjələs/", m: "Tỉ mỉ, kỹ lưỡng", e: "He is meticulous about his appearance." },
        { w: "Nostalgia", p: "/nɒˈstældʒə/", m: "Nỗi nhớ, hoài niệm", e: "A wave of nostalgia when hearing that song." },
        { w: "Obsolete", p: "/ˈɒbsəliːt/", m: "Lỗi thời, không còn dùng", e: "Gas lamps became obsolete years ago." },
        { w: "Pragmatic", p: "/præɡˈmætɪk/", m: "Thực dụng, thực tế", e: "A pragmatic approach to management." },
        { w: "Quaint", p: "/kweɪnt/", m: "Độc đáo, cổ kính", e: "The town has many quaint little streets." },
        { w: "Resilient", p: "/rɪˈzɪliənt/", m: "Kiên cường, mau phục hồi", e: "The economy has proved remarkably resilient." },
        { w: "Scrutinize", p: "/ˈskruːtənaɪz/", m: "Xem xét kỹ lưỡng", e: "He scrutinized the document for any errors." },
        { w: "Trivial", p: "/ˈtrɪviəl/", m: "Tầm thường, không quan trọng", e: "Don't waste time on trivial matters." },
        { w: "Ubiquitous", p: "/juːˈbɪkwɪtəs/", m: "Phổ biến mọi nơi", e: "Coffee shops are ubiquitous these days." },
        { w: "Vibrant", p: "/ˈvaɪbrənt/", m: "Sôi động, đầy sức sống", e: "The city has a vibrant nightlife." },
        { w: "Whimsical", p: "/ˈwɪmzɪkl/", m: "Kỳ quái, bất thường", e: "A whimsical sense of humor." },
        { w: "Zealous", p: "/ˈzeləs/", m: "Sốt sắng, hăng hái", e: "A zealous supporter of the cause." },
        { w: "Abundant", p: "/əˈbʌndənt/", m: "Phong phú, dồi dào", e: "Abundant evidence to prove his guilt." },
        { w: "Coherent", p: "/kəʊˈhɪərənt/", m: "Mạch lạc, chặt chẽ", e: "A coherent economic strategy." },
        { w: "Deviate", p: "/ˈdiːvieɪt/", m: "Chệch hướng, khác biệt", e: "Do not deviate from the original plan." },
        { w: "Exacerbate", p: "/ɪɡˈzæsəbeɪt/", m: "Làm trầm trọng thêm", e: "The weather exacerbated his cough." },
        { w: "Feasible", p: "/ˈfiːzəbl/", m: "Khả thi", e: "It's just not feasible to finish this today." },
        { w: "Grandeur", p: "/ˈɡrændʒə(r)/", m: "Sự vĩ đại, tráng lệ", e: "The grandeur of the royal palace." }
    ];

    const dayIndex = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000) % vocabList.length;
    const item = vocabList[dayIndex];

    const widget = document.createElement('div');
    widget.id = 'dailyWordWidget';
    widget.className = 'daily-word-widget';
    
    if (window.innerWidth > 768) { widget.classList.add('active'); }

    widget.onclick = function() {
        if (!this.classList.contains('active')) { this.classList.add('active'); }
    };

    widget.innerHTML = `
        <div class="dw-icon-trigger"><i class="fas fa-lightbulb"></i></div>
        <div class="dw-content-wrapper">
            <div class="dw-header">
                <span><i class="fas fa-graduation-cap"></i> DAILY VOCAB</span>
                <span class="dw-close-btn" id="closeDailyWord">&times;</span>
            </div>
            <div class="dw-body">
                <div class="dw-word-wrapper" id="speakTrigger">
                    <span class="dw-word">${item.w}</span>
                    <i class="fas fa-volume-up dw-speaker"></i>
                </div>
                <span class="dw-phonetic">${item.p}</span>
                <div class="dw-meaning">${item.m}</div>
                <div class="dw-example"><b>Ví dụ:</b> ${item.e}</div>
            </div>
        </div>
    `;

    document.body.appendChild(widget);

    // Hàm phát âm
    function speakWord() {
        if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance();
            msg.text = item.w;
            msg.lang = 'en-US';
            msg.rate = 0.9; // Tốc độ hơi chậm lại tí cho dễ nghe
            window.speechSynthesis.speak(msg);
        }
    }

    // Gán sự kiện click cho từ và loa
    document.getElementById('speakTrigger').onclick = function(e) {
        e.stopPropagation();
        speakWord();
    };

    document.getElementById('closeDailyWord').onclick = function(e) {
        e.stopPropagation(); 
        document.getElementById('dailyWordWidget').classList.remove('active');
    };
})();