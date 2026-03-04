(function() {
    // --- 1. CHÈN CSS (Giữ nguyên như cũ) ---
    const style = document.createElement('style');
    style.innerHTML = `
        .auth-overlay { display: none; position: fixed; z-index: 99999; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); }
        .auth-container { background: #fff; width: 95%; max-width: 400px; margin: 100px auto; padding: 30px; border-radius: 20px; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.5); font-family: 'Roboto', sans-serif; }
        .close-auth { position: absolute; right: 20px; top: 15px; font-size: 28px; cursor: pointer; color: #aaa; }
        .auth-tabs { display: flex; margin-bottom: 25px; background: #f0f2f5; border-radius: 10px; padding: 5px; }
        .auth-tab { flex: 1; padding: 10px; border: none; background: none; cursor: pointer; font-weight: bold; border-radius: 8px; color: #666; transition: 0.3s; }
        .auth-tab.active { background: #5b8cff; color: #fff; }
        .auth-form input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
        .auth-btn { width: 100%; padding: 14px; background: #5b8cff; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px; }
        .user-nav-box { display: flex; align-items: center; gap: 8px; background: #f0f4f8; padding: 5px 15px; border-radius: 50px; cursor: pointer; border: 1px solid #5b8cff; }
        .user-nav-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
        .user-nav-name { font-size: 14px; font-weight: bold; color: #1a237e; }
    `;
    document.head.appendChild(style);

    // --- 2. CHÈN HTML POPUP ---
    const popupHTML = `
        <div id="authOverlay" class="auth-overlay">
            <div class="auth-container">
                <span class="close-auth">&times;</span>
                <div class="auth-tabs">
                    <button class="auth-tab active" id="tabLogin">ĐĂNG NHẬP</button>
                    <button class="auth-tab" id="tabRegister">ĐĂNG KÝ</button>
                </div>
                <form id="formLogin">
                    <input type="text" id="loginUser" placeholder="Tên đăng nhập hoặc Email" required>
                    <input type="password" id="loginPass" placeholder="Mật khẩu" required>
                    <button type="submit" class="auth-btn">Đăng Nhập</button>
                </form>
                <form id="formRegister" style="display:none;">
                    <input type="text" id="regFullName" placeholder="Họ và tên" required>
                    <input type="text" id="regUser" placeholder="Tên đăng nhập" required>
                    <input type="email" id="regEmail" placeholder="Email" required>
                    <input type="tel" id="regPhone" placeholder="Số điện thoại" required>
                    <input type="password" id="regPass" placeholder="Mật khẩu" required>
                    <button type="submit" class="auth-btn" style="background:#2ecc71">Tạo Tài Khoản</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    // --- 3. HÀM GẮN SỰ KIỆN (BINDING) ---
    function bindAuthEvents() {
        const overlay = document.getElementById('authOverlay');
        const ctaBtn = document.getElementById('auth-trigger-btn');
        
        if (!ctaBtn) return; // Nếu chưa thấy nút thì thoát ra để chờ tiếp

        const user = localStorage.getItem('ivyUser');
        if (user) {
            const userData = JSON.parse(user);
            ctaBtn.outerHTML = `
                <div class="user-nav-box" onclick="window.location.href='profile.html'">
                    <img src="${userData.avatar}" class="user-nav-avatar">
                    <span class="user-nav-name">${userData.fullname.split(' ').pop()}</span>
                </div>
            `;
        } else {
            ctaBtn.onclick = (e) => {
                e.preventDefault();
                overlay.style.display = 'block';
            };
        }

        // Logic đóng mở tab (chỉ gán 1 lần)
        document.querySelector('.close-auth').onclick = () => overlay.style.display = 'none';
        document.getElementById('tabLogin').onclick = () => {
            document.getElementById('formLogin').style.display = 'block';
            document.getElementById('formRegister').style.display = 'none';
            document.getElementById('tabLogin').classList.add('active');
            document.getElementById('tabRegister').classList.remove('active');
        };
        document.getElementById('tabRegister').onclick = () => {
            document.getElementById('formLogin').style.display = 'none';
            document.getElementById('formRegister').style.display = 'block';
            document.getElementById('tabRegister').classList.add('active');
            document.getElementById('tabLogin').classList.remove('active');
        };
    }

    // --- 4. CƠ CHẾ THEO DÕI (MUTATION OBSERVER) ---
    // Cái này sẽ tự động chạy bindAuthEvents mỗi khi header.html được load xong
    const observer = new MutationObserver(() => {
        if (document.getElementById('auth-trigger-btn')) {
            bindAuthEvents();
            // observer.disconnect(); // Có thể ngắt nếu muốn tối ưu
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Gọi thử một lần ngay khi file js load
    bindAuthEvents();
})();