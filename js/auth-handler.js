import { auth, onAuthStateChanged, signOut, db, doc, getDoc } from './firebase-config.js';

// !!! QUAN TRỌNG: Export danh sách này để dùng bên admin.html
export const ADMIN_EMAILS = ['cuongnguyenc.n1612@gmail.com'];

// --- POPUP KHÓA TÀI KHOẢN ---
function showLockedAccountPopup(reason) {
    let popup = document.getElementById('custom-popup');
    if (!popup) {
        const div = document.createElement('div');
        div.innerHTML = `
            <div id="custom-popup" class="popup-overlay" style="z-index: 99999;">
                <div class="popup-content">
                    <span id="popup-icon" class="popup-icon"></span>
                    <h3 id="popup-title"></h3>
                    <p id="popup-message"></p>
                    <button id="popup-close-btn" class="btn-close-popup">Đóng</button>
                </div>
            </div>`;
        document.body.appendChild(div.firstElementChild);
        popup = document.getElementById('custom-popup');
    }

    const iconEl = popup.querySelector('#popup-icon');
    const titleEl = popup.querySelector('#popup-title');
    const messageEl = popup.querySelector('#popup-message');
    const closeBtn = popup.querySelector('#popup-close-btn');

    iconEl.innerHTML = '<i class="fas fa-user-lock" style="color: #e74c3c;"></i>';
    titleEl.innerText = 'Tài Khoản Bị Khóa';
    messageEl.innerHTML = `Tài khoản của bạn đã bị vô hiệu hóa.<br><br><strong>Lý do:</strong> ${reason}<br><br>Vui lòng liên hệ quản trị viên.`;
    
    popup.style.display = 'flex';

    const newBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newBtn, closeBtn);
    newBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });
}

const storedBanReason = sessionStorage.getItem('ivy_banned_reason');
if (storedBanReason) {
    sessionStorage.removeItem('ivy_banned_reason');
    setTimeout(() => showLockedAccountPopup(storedBanReason), 500);
}

// --- GLOBAL MAINTENANCE CHECK (KIỂM TRA BẢO TRÌ TOÀN TRANG) ---
(async () => {
    const path = window.location.pathname;
    // Không chặn trang Admin, Login và chính trang Bảo trì để tránh lặp vô tận
    if (path.includes('admin.html') || path.includes('login.html') || path.includes('ivyenglish-maintenance.html')) return;

    try {
        const docRef = doc(db, "settings", "maintenance");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.status === 'ON') {
                const now = new Date().getTime();
                const until = new Date(data.until).getTime();
                // Nếu đang BẬT và chưa hết giờ -> Chuyển hướng
                if (now < until) {
                    window.location.href = 'ivyenglish-maintenance.html';
                }
            }
        }
    } catch (error) {
        console.error("Maintenance check error:", error);
    }
})();

// Hàm này sẽ chạy mỗi khi trạng thái đăng nhập thay đổi
onAuthStateChanged(auth, async (user) => {
    const loginBtn = document.getElementById('login-nav-btn');
    const userProfile = document.getElementById('user-profile-nav');
    const userName = document.getElementById('nav-user-name');
    const userImg = document.getElementById('nav-user-img');
    const userDropdown = document.querySelector('.user-dropdown');

    // Xóa link admin cũ (nếu có) để tránh trùng lặp khi re-render
    const existingAdminLink = document.getElementById('admin-nav-link');
    if (existingAdminLink) {
        existingAdminLink.remove();
    }

    // Xóa huy hiệu admin cũ (nếu có) - Xử lý cho cả header và profile
    ['admin-nav-badge', 'admin-profile-badge'].forEach(id => {
        const badge = document.getElementById(id);
        if (badge) badge.remove();
    });

    if (user) {
        // Kiểm tra xem tài khoản có bị khóa không
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().isBanned) {
                const reason = userSnap.data().banReason || "Vi phạm quy định.";
                sessionStorage.setItem('ivy_banned_reason', reason);
                await signOut(auth);
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            console.log("Lỗi kiểm tra trạng thái tài khoản:", error);
        }

        // Nếu có user: Hiện avatar, ẩn nút login
        if(loginBtn) loginBtn.style.display = 'none';
        if(userProfile) userProfile.style.display = 'flex';
        
        // Ưu tiên lấy tên từ LocalStorage (tên đã đổi), nếu không có mới lấy tên Google/Email
        const savedName = localStorage.getItem('ivy_user_name');
        if(userName) userName.innerText = savedName || user.displayName || user.email.split('@')[0];
        
        if(userImg && user.photoURL) userImg.src = user.photoURL;

        // Nếu là admin, thêm link "Quản trị viên" vào menu
        if (ADMIN_EMAILS.includes(user.email)) {
            // Thêm link vào dropdown
            if (userDropdown) {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.id = 'admin-nav-link';
                adminLink.innerHTML = '<i class="fas fa-user-shield"></i> Quản trị viên';
                userDropdown.prepend(adminLink);
            }
            
            // Thêm huy hiệu Admin vào Header và Profile
            const badgeTargets = [
                { element: userName, id: 'admin-nav-badge' },
                { element: document.getElementById('display-name'), id: 'admin-profile-badge' }
            ];

            badgeTargets.forEach(target => {
                if (target.element) {
                    const badge = document.createElement('span');
                    badge.id = target.id;
                    badge.className = 'admin-badge';
                    badge.innerText = 'Admin';
                    if(target.id === 'admin-profile-badge') {
                        target.element.style.display = 'inline-block'; // Để huy hiệu nằm cùng dòng
                        badge.style.marginLeft = '8px';
                        badge.style.verticalAlign = 'middle';
                    } else {
                        badge.style.marginLeft = '5px';
                    }
                    target.element.insertAdjacentElement('afterend', badge);
                }
            });
        }
        
        console.log("Đã đăng nhập:", user.email);
    } else {
        // Nếu không có user: Hiện nút login, ẩn avatar
        if(loginBtn) loginBtn.style.display = 'block';
        if(userProfile) userProfile.style.display = 'none';
    }
});

// Xử lý sự kiện Log out
document.addEventListener('click', (e) => {
    if (e.target.id === 'logout-btn') {
        signOut(auth).then(() => {
            localStorage.removeItem('ivy_user_name'); // Xóa tên đã lưu khi đăng xuất
            window.location.href = 'index.html';
        });
    }
});