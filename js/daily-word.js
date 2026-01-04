(function() {
    // 1. CSS Giao diện (Giữ nguyên và tối ưu scannability)
    const style = document.createElement('style');
    style.innerHTML = `
        :root { --p-blue: #1a237e; --accent: #5b8cff; }
        .daily-word-widget {
            position: fixed; z-index: 9999; font-family: 'Roboto', sans-serif;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            left: 30px; bottom: 30px;
        }
        .daily-word-widget:not(.active) { 
            width: 58px; height: 58px; border-radius: 50%; background: var(--p-blue); 
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            animation: dw-pulse 2s infinite;
        }
        .daily-word-widget.active { 
            width: 320px; height: auto; border-radius: 16px; 
            background: white; display: block; border: 1px solid rgba(0,0,0,0.1); 
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        @keyframes dw-pulse {
            0% { box-shadow: 0 0 0 0 rgba(26, 35, 126, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(26, 35, 126, 0); }
            100% { box-shadow: 0 0 0 0 rgba(26, 35, 126, 0); }
        }
        .dw-icon-trigger { color: #ffd700; font-size: 26px; }
        .daily-word-widget.active .dw-icon-trigger { display: none; }
        .daily-word-widget:not(.active) .dw-content-wrapper { display: none; }
        .dw-header { 
            background: linear-gradient(135deg, var(--p-blue) 0%, #2a3eb1 100%); 
            color: white; padding: 12px 18px; font-size: 0.85rem; font-weight: 700; 
            display: flex; justify-content: space-between; align-items: center;
            border-top-left-radius: 15px; border-top-right-radius: 15px;
        }
        .dw-body { padding: 15px 20px 20px; }
        .dw-word { color: var(--accent); font-size: 1.6rem; font-weight: 900; cursor: pointer; }
        .dw-phonetic { color: #64748b; font-style: italic; font-size: 0.95rem; margin-bottom: 8px; display: block; font-family: serif; }
        .dw-meaning { font-weight: 700; color: #1e293b; font-size: 1.1rem; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
        .dw-example-box { background: #f8fafc; padding: 10px; border-radius: 10px; border-left: 3px solid var(--accent); }
        .dw-example-en { font-size: 0.85rem; color: #475569; font-style: italic; line-height: 1.4; margin-bottom: 5px; display: block; }
        .dw-example-vi { font-size: 0.85rem; color: var(--accent); font-weight: 500; display: block; }
        .dw-close-btn { cursor: pointer; font-size: 20px; }
        @media (max-width: 768px) {
            .daily-word-widget { left: 20px; bottom: 20px; }
            .daily-word-widget.active { width: calc(100% - 40px); max-width: 300px; }
        }
    `;
    document.head.appendChild(style);

    // 2. Kho từ vựng & Chọn từ
    const seedWords = ["Innovation", "Resilient", "Eloquent", "Sustainable", "Ambiguous", "Pragmatic", "Meticulous", "Vibrant", "Proactive", "Empower", "Persistence", "Acumen", "Diligence"];
    const randomWord = seedWords[Math.floor(Math.random() * seedWords.length)];

    const widget = document.createElement('div');
    widget.id = 'dailyWordWidget';
    widget.className = 'daily-word-widget';
    widget.innerHTML = `
        <div class="dw-icon-trigger"><i class="fas fa-lightbulb"></i></div>
        <div class="dw-content-wrapper" id="dwContent">
            <div style="padding:20px; text-align:center;"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</div>
        </div>`;
    document.body.appendChild(widget);

    // 3. Logic phát âm (Fix giọng đọc Việt sang Anh)
    function speakEnglish(text) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        // Tìm giọng Mỹ (en-US) hoặc Anh (en-GB)
        const enVoice = voices.find(v => v.lang === 'en-US' || v.name.includes('Google US English')) || 
                        voices.find(v => v.lang.startsWith('en'));
        if (enVoice) msg.voice = enVoice;
        msg.lang = 'en-US';
        msg.rate = 0.9;
        window.speechSynthesis.speak(msg);
    }

    // 4. Hàm Dịch thuật & API
    async function translate(text, pair = 'en|vi') {
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`);
            const data = await res.json();
            return data.responseData.translatedText;
        } catch { return ""; }
    }

    async function fetchAndRender(word) {
        try {
            const meaning = await translate(word);
            let phonetic = "", exampleEn = "", exampleVi = "";

            const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            if (dictRes.ok) {
                const dictData = await dictRes.json();
                phonetic = dictData[0].phonetic || (dictData[0].phonetics.find(p => p.text)?.text) || "";
                for (let m of dictData[0].meanings) {
                    for (let d of m.definitions) {
                        if (d.example) { 
                            exampleEn = d.example; 
                            exampleVi = await translate(exampleEn);
                            break; 
                        }
                    }
                    if (exampleEn) break;
                }
            }

            document.getElementById('dwContent').innerHTML = `
                <div class="dw-header">
                    <span><i class="fas fa-graduation-cap"></i> TỪ VỰNG MỖI NGÀY</span>
                    <span class="dw-close-btn" id="closeDailyWord">&times;</span>
                </div>
                <div class="dw-body">
                    <div class="dw-word-wrapper" id="dwSpeakBtn" style="cursor:pointer; display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                        <span class="dw-word">${word}</span>
                        <i class="fas fa-volume-up" style="color:var(--accent); font-size:1.2rem;"></i>
                    </div>
                    ${phonetic ? `<span class="dw-phonetic">[ ${phonetic} ]</span>` : ''}
                    <div class="dw-meaning">${meaning}</div>
                    ${exampleEn ? `
                        <div class="dw-example-box">
                            <span style="font-size:0.7rem; font-weight:900; color:#94a3b8; display:block; margin-bottom:5px; text-transform:uppercase;">Ví dụ</span>
                            <span class="dw-example-en">"${exampleEn}"</span>
                            <span class="dw-example-vi">${exampleVi}</span>
                        </div>` : ''}
                </div>`;

            document.getElementById('dwSpeakBtn').onclick = (e) => { e.stopPropagation(); speakEnglish(word); };
            document.getElementById('closeDailyWord').onclick = (e) => { e.stopPropagation(); widget.classList.remove('active'); };
        } catch (e) {
            document.getElementById('dwContent').innerHTML = `<div style="padding:20px;">Không thể tải dữ liệu.</div>`;
        }
    }

    // 5. Tự động mở trên màn hình lớn (Desktop)
    function initWidget() {
        if (window.innerWidth > 768) {
            widget.classList.add('active');
            fetchAndRender(randomWord);
        }
    }

    // Sự kiện mở khi nhấn (cho mobile hoặc khi đã đóng)
    widget.onclick = function() {
        if (!this.classList.contains('active')) {
            this.classList.add('active');
            fetchAndRender(randomWord);
        }
    };

    // Chạy khởi tạo
    if (document.readyState === 'complete') {
        initWidget();
    } else {
        window.addEventListener('load', initWidget);
    }
    
    // Nạp danh sách giọng nói cho trình duyệt
    window.speechSynthesis.getVoices();
})();