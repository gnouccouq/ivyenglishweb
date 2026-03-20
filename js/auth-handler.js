import { auth, onAuthStateChanged, signOut } from './firebase-config.js';

// Hàm này sẽ chạy mỗi khi trạng thái đăng nhập thay đổi
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-nav-btn');
    const userProfile = document.getElementById('user-profile-nav');
    const userName = document.getElementById('nav-user-name');
    const userImg = document.getElementById('nav-user-img');

    if (user) {
        // Nếu có user: Hiện avatar, ẩn nút login
        if(loginBtn) loginBtn.style.display = 'none';
        if(userProfile) userProfile.style.display = 'flex';
        
        if(userName) userName.innerText = user.displayName || user.email.split('@')[0];
        if(userImg && user.photoURL) userImg.src = user.photoURL;
        
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
            window.location.href = 'index.html';
        });
    }
});