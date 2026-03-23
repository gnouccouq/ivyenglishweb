import { auth, onAuthStateChanged, signOut, db, doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, orderBy, onSnapshot, updateDoc, where, getDocs } from './firebase-config.js';

// !!! QUAN TRỌNG: Export danh sách này để dùng bên admin.html
export const ADMIN_EMAILS = ['cuongnguyenc.n1612@gmail.com'];

// --- [PHẦN MỚI] INJECT FLOATING WIDGETS (CHAT & CONTACT BUTTONS) ---
function injectFloatingWidgets() {
    // Prevent duplicate injection by checking if one of the elements already exists
    if (document.getElementById('live-chat-box')) return;

    // --- 1. Inject Chat Box ---
    const chatBoxHTML = `
        <div id="live-chat-box" class="chat-widget-container">
            <div class="chat-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="position:relative;">
                        <img src="images/favicon.png" style="width:30px; height:30px; border-radius:50%; background:white; padding:2px;">
                        <span style="position:absolute; bottom:0; right:0; width:8px; height:8px; background:#2ecc71; border-radius:50%; border:1px solid white;"></span>
                    </div>
                    <div>
                        <h4 style="margin:0;">Tư vấn viên</h4>
                        <small style="font-size:0.7rem; opacity:0.9;">Thường trả lời ngay</small>
                    </div>
                </div>
                <i class="fas fa-times chat-close" id="close-chat-btn"></i>
            </div>
            <div class="chat-body" id="chat-messages-area">
                <div class="chat-login-overlay" id="chat-login-req">
                    <i class="fas fa-lock" style="font-size:3rem; color:#1a237e; margin-bottom:15px;"></i>
                    <p style="margin-bottom:20px; color:#555;">Vui lòng đăng nhập để chat trực tiếp với tư vấn viên.</p>
                    <a href="login.html" class="btn-primary-auth" style="text-decoration:none; padding:10px 25px; display:inline-block; width:auto; font-size:0.9rem; background: #1a237e; color: white; border-radius: 5px;">Đăng Nhập Ngay</a>
                </div>
            </div>
            <div class="chat-quick-replies" id="quick-replies-area">
                <button class="quick-reply-btn" disabled>Tư vấn khóa học</button>
                <button class="quick-reply-btn" disabled>Học phí bao nhiêu?</button>
                <button class="quick-reply-btn" disabled>Lịch khai giảng</button>
                <button class="quick-reply-btn" disabled>Tôi muốn test đầu vào</button>
            </div>
            <div class="chat-footer">
                <input type="text" id="chat-input-text" class="chat-input" placeholder="Nhập tin nhắn..." disabled>
                <button id="chat-send-btn" class="chat-send-btn" disabled><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatBoxHTML);

    // --- 2. Inject Floating Buttons Container ---
    const floatContainer = document.createElement('div');
    floatContainer.className = 'floating-contact';
    
    const buttonsHTML = `
        <div id="live-chat-btn" class="chat-toggle-btn" title="Chat với tư vấn viên">
            <i class="fas fa-comment-dots"></i>
            <span id="chat-unread-badge" class="chat-badge" style="display:none">0</span>
        </div>
        <a href="#" class="float-btn scroll-to-top" title="Lên đầu trang">
            <i class="fas fa-arrow-up"></i>
        </a>
        <a href="tel:0969730433" class="float-btn hotline" title="Hotline">
            <i class="fas fa-phone-alt"></i>
        </a>
        <a href="https://zalo.me/0969730433" target="_blank" rel="noopener noreferrer" class="float-btn zalo" title="Chat Zalo">
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" style="width: 28px; height: 28px;">
        </a>
        <a href="https://www.facebook.com/profile.php?id=61576482823082" target="_blank" rel="noopener noreferrer" class="float-btn facebook-messenger" title="Nhắn tin Messenger">
            <i class="fab fa-facebook-messenger"></i>
        </a>
    `;
    floatContainer.innerHTML = buttonsHTML;
    document.body.appendChild(floatContainer);

    // --- 3. Attach Chat Event Listeners ---
    const btn = document.getElementById('live-chat-btn');
    const box = document.getElementById('live-chat-box');
    const close = document.getElementById('close-chat-btn');

    if(btn && box && close) {
        btn.addEventListener('click', () => {
            box.classList.toggle('active');
            if(box.classList.contains('active')) {
                const area = document.getElementById('chat-messages-area');
                if(area) area.scrollTop = area.scrollHeight;
            }
        });
        close.addEventListener('click', () => box.classList.remove('active'));
    }
}

// Gọi hàm inject ngay khi file này chạy
injectFloatingWidgets();

// --- [PHẦN MỚI] LOGIC CHAT REALTIME ---
let chatUnsubscribe = null;

async function initChat(user) {
    const loginOverlay = document.getElementById('chat-login-req');
    const input = document.getElementById('chat-input-text');
    const sendBtn = document.getElementById('chat-send-btn');
    const msgArea = document.getElementById('chat-messages-area');
    const quickBtns = document.querySelectorAll('.quick-reply-btn'); // Lấy danh sách nút nhanh

    if (!user) {
        if(loginOverlay) loginOverlay.style.display = 'flex';
        return;
    }

    // Đã đăng nhập
    if(loginOverlay) loginOverlay.style.display = 'none';
    if(input) input.disabled = false;
    if(sendBtn) sendBtn.disabled = false;
    // Bật các nút tin nhắn nhanh
    quickBtns.forEach(btn => btn.disabled = false);

    // Lắng nghe tin nhắn
    const chatId = user.uid;
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    chatUnsubscribe = onSnapshot(q, (snapshot) => {
        if(!msgArea) return;
        msgArea.innerHTML = ''; // Clear cũ (hoặc tối ưu hơn là append)
        
        if (snapshot.empty) {
            msgArea.innerHTML = `<div style="text-align:center; color:#999; margin-top:20px; font-size:0.85rem;">Xin chào ${user.displayName || 'bạn'}!<br>Hãy để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất.</div>`;
        }

        snapshot.forEach(doc => {
            const msg = doc.data();
            const div = document.createElement('div');
            const isMe = msg.senderId === user.uid; // Tin của mình
            
            div.className = `message-bubble ${isMe ? 'sent' : 'received'}`;
            div.innerHTML = `
                ${msg.text}
                <span class="message-time">
                    ${msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                </span>
            `;
            msgArea.appendChild(div);
        });

        // Scroll xuống dưới cùng
        msgArea.scrollTop = msgArea.scrollHeight;
    });

    // Hàm gửi tin nhắn
    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        try {
            // 1. Lưu tin nhắn vào subcollection
            await addDoc(messagesRef, {
                text: text,
                senderId: user.uid,
                senderName: user.displayName || user.email,
                timestamp: serverTimestamp(),
                isAdmin: false // Đây là tin từ user
            });

            // 2. Cập nhật thông tin User để Admin biết có tin mới (quan trọng cho sắp xếp)
            const chatMetaRef = doc(db, "chats", chatId); // Dùng chính ID user làm ID chat
            await setDoc(chatMetaRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp(),
                userName: user.displayName || user.email,
                userAvatar: user.photoURL || 'images/avatar-profile.png',
                userId: user.uid,
                hasUnread: true // Đánh dấu để admin biết chưa đọc
            }, { merge: true });

        } catch (e) {
            console.error("Lỗi gửi tin:", e);
            alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
        }
    };

    // Sự kiện gửi
    if(sendBtn) sendBtn.onclick = sendMessage;
    if(input) input.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    // Xử lý sự kiện click cho tin nhắn nhanh
    quickBtns.forEach(btn => {
        btn.onclick = () => {
            if(input) input.value = btn.innerText; // Điền nội dung vào ô
            sendMessage(); // Gửi luôn
        };
    });
}

// --- [PHẦN MỚI] GLOBAL NOTIFICATIONS (THÔNG BÁO TOÀN TRANG) ---
let notifUnsubscribe = null;

// Helper: Hiển thị Toast Notification góc phải
function showToastNotification(notif) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <img src="${notif.senderAvatar || 'images/avatar-profile.png'}" class="toast-avatar">
        <div class="toast-content">
            <h4>Thông báo mới</h4>
            <p>${notif.message}</p> 
        </div>
    `;
    
    toast.onclick = () => {
        if(notif.postId) window.location.href = `forums.html?id=${notif.postId}`; 
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 400);
    };

    container.appendChild(toast);
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        if(toast.parentElement) {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove());
        }
    }, 5000);
}

function initGlobalNotifications(user) {
    // Kiểm tra xem các phần tử HTML của thông báo có tồn tại không (Header đã load chưa)
    const notifBtn = document.getElementById('notif-btn');
    const notifList = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    const dropdown = document.getElementById('notif-dropdown');
    const markReadBtn = document.getElementById('mark-all-read');

    // Nếu chưa có (do Header load chậm), thử lại sau 500ms
    if (!notifBtn || !notifList) {
        setTimeout(() => initGlobalNotifications(user), 800);
        return;
    }

    // Xử lý sự kiện click vào chuông (Clone node để xóa các event listener cũ tránh trùng lặp)
    const newBtn = notifBtn.cloneNode(true);
    notifBtn.parentNode.replaceChild(newBtn, notifBtn);
    
    newBtn.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    };

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.contains(e.target) && e.target !== newBtn) {
            dropdown.classList.remove('active');
        }
    });

    // Xử lý "Đánh dấu tất cả đã đọc"
    if(markReadBtn) {
        markReadBtn.onclick = async () => {
            // Ẩn badge ngay lập tức cho mượt
            if(badge) badge.style.display = 'none';
            
            try {
                const qUnread = query(collection(db, "notifications"), where("receiverId", "==", user.uid), where("isRead", "==", false));
                const snaps = await getDocs(qUnread);
                const batchPromises = [];
                snaps.forEach(d => {
                    batchPromises.push(updateDoc(doc(db, "notifications", d.id), { isRead: true }));
                });
                await Promise.all(batchPromises);
            } catch (e) { console.error("Lỗi update status:", e); }
        };
    }

    // Lắng nghe Realtime
    if (notifUnsubscribe) notifUnsubscribe(); // Hủy lắng nghe cũ nếu có

    // Query thông báo của user hiện tại
    const q = query(collection(db, "notifications"), where("receiverId", "==", user.uid));

    let isFirstLoad = true; // Cờ để tránh hiện toast cho các thông báo cũ khi vừa F5

    notifUnsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = [];
        let unreadCount = 0;

        snapshot.forEach(doc => {
            const n = doc.data();
            n.id = doc.id;
            notifs.push(n);
            if (!n.isRead) unreadCount++;
        });

        // Sắp xếp client-side (Mới nhất lên đầu)
        notifs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        // Update Badge
        if (badge) {
            if (unreadCount > 0) {
                badge.style.display = 'block';
                badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
                // [NEW] Kích hoạt hiệu ứng rung
                newBtn.classList.add('shaking');
            } else {
                badge.style.display = 'none';
                // [NEW] Tắt hiệu ứng rung
                newBtn.classList.remove('shaking');
            }
        }

        // Render danh sách
        notifList.innerHTML = '';
        if (notifs.length === 0) {
            notifList.innerHTML = '<div style="padding:20px; text-align:center; color:#999; font-size:0.9rem;">Không có thông báo mới</div>';
        } else {
            notifs.slice(0, 10).forEach(n => { // Chỉ hiện 10 tin mới nhất
                const item = document.createElement('div');
                item.className = `notif-item ${!n.isRead ? 'unread' : ''}`;
                item.innerHTML = `
                    <img src="${n.senderAvatar || 'images/avatar-profile.png'}" class="notif-avatar">
                    <div class="notif-content">
                        <p>${n.message}</p>
                        <span class="notif-time">${n.timestamp ? new Date(n.timestamp.seconds * 1000).toLocaleString('vi-VN') : ''}</span>
                    </div>
                `;
                item.onclick = async () => {
                    if(!n.isRead) await updateDoc(doc(db, "notifications", n.id), { isRead: true });
                    if(n.postId) window.location.href = `forums.html`; // Chuyển hướng đơn giản
                };
                notifList.appendChild(item);
            });
        }

        // Xử lý Toast cho thông báo MỚI (Realtime)
        if (!isFirstLoad) {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const newNotif = change.doc.data();
                    // Chỉ hiện toast nếu chưa đọc (tránh duplicate logic nếu có)
                    if (!newNotif.isRead) {
                        showToastNotification(newNotif);
                    }
                }
            });
        }
        isFirstLoad = false;

    }, (error) => {
        console.warn("Lỗi tải thông báo (Có thể do chưa đăng nhập hoặc quyền truy cập):", error);
    });
}

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
        // [CHAT] Khởi tạo Chat khi có user
        initChat(user);
        
        // [NOTIF] Khởi tạo Thông báo Realtime
        initGlobalNotifications(user);

        // Kiểm tra/Tạo tài khoản người dùng trong Firestore
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                // User đã tồn tại, kiểm tra trạng thái khóa
                if (userSnap.data().isBanned) {
                    const reason = userSnap.data().banReason || "Vi phạm quy định.";
                    sessionStorage.setItem('ivy_banned_reason', reason);
                    await signOut(auth);
                    window.location.href = 'index.html';
                    return; // Dừng thực thi tiếp
                }
            } else {
                // User chưa tồn tại (lần đầu đăng nhập), tự động tạo document
                const newUserPayload = {
                    ID: user.uid,
                    "Họ Tên": user.displayName || user.email.split('@')[0],
                    Email: user.email,
                    Avatar: user.photoURL || 'images/avatar-profile.png',
                    "Số Điện Thoại": "",
                    "Giới Tính": "",
                    "Ngày Sinh": "",
                    isBanned: false,
                    "Thời Gian": serverTimestamp() // Dùng timestamp của server cho đồng bộ
                };
                await setDoc(userRef, newUserPayload);
                console.log("Tài khoản mới được tạo tự động trong Firestore:", user.email);
            }
        } catch (error) {
            console.error("Lỗi kiểm tra hoặc tạo tài khoản người dùng:", error);
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
        // [CHAT] Hủy lắng nghe nếu logout
        if (chatUnsubscribe) chatUnsubscribe();
        
        // [NOTIF] Hủy lắng nghe thông báo
        if (notifUnsubscribe) notifUnsubscribe();

        const loginOverlay = document.getElementById('chat-login-req');
        if(loginOverlay) loginOverlay.style.display = 'flex';
        
        // Vô hiệu hóa nút chat nhanh khi logout
        const quickBtns = document.querySelectorAll('.quick-reply-btn');
        quickBtns.forEach(btn => btn.disabled = true);

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