import { auth, onAuthStateChanged, signOut } from './firebase-config.js';

// !!! QUAN TRỌNG: Export danh sách này để dùng bên admin.html
export const ADMIN_EMAILS = ['cuongnguyenc.n1612@gmail.com'];

// Hàm này sẽ chạy mỗi khi trạng thái đăng nhập thay đổi
onAuthStateChanged(auth, (user) => {
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