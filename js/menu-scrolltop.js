/**
 * ivyEnglish Main Script
 * Quản lý: Header/Footer, Menu Mobile, Scroll to Top
 */

async function includeHTML() {
    const components = [
        { id: 'header-placeholder', file: 'header.html' },
        { id: 'footer-placeholder', file: 'footer.html' }
    ];

    for (const comp of components) {
        const element = document.getElementById(comp.id);
        if (element) {
            try {
                const response = await fetch(comp.file);
                if (response.ok) {
                    element.innerHTML = await response.text();
                }
            } catch (err) {
                console.error("Lỗi khi tải file: " + comp.file, err);
            }
        }
    }

    // Khởi tạo logic Menu sau khi Header đã tải xong
    initMenuLogic();
    // Khởi tạo nút Scroll To Top sau khi Footer đã tải xong
    initScrollToTop();

    // Ẩn Preloader
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            setTimeout(() => preloader.style.display = 'none', 500);
        }
    }, 600);
}

function initMenuLogic() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.getElementById('main-nav');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (!menuToggle || !nav) return;

    // Toggle Menu Mobile
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('nav-open'); 
        menuToggle.classList.toggle('menu-active'); 
        
        if (menuToggle.classList.contains('menu-active')) {
            menuToggle.classList.replace('fa-bars', 'fa-times');
        } else {
            menuToggle.classList.replace('fa-times', 'fa-bars');
        }
        document.body.classList.toggle('no-scroll');
    });

    // Xử lý Dropdown trên Mobile
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    if (!dropdown.classList.contains('active')) {
                        e.preventDefault();
                        dropdowns.forEach(d => d.classList.remove('active'));
                        dropdown.classList.add('active');
                    } 
                }
            });
        }
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });

    // Đóng menu khi click vào link
    nav.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            menuToggle.classList.remove('menu-active');
            menuToggle.classList.replace('fa-times', 'fa-bars');
            document.body.classList.remove('no-scroll');
        });
    });

    // Reset menu khi thay đổi kích thước màn hình
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.classList.remove('nav-open');
            menuToggle.classList.remove('menu-active');
            menuToggle.classList.replace('fa-times', 'fa-bars');
            document.body.classList.remove('no-scroll');
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
}

function initScrollToTop() {
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    if (!scrollToTopButton) return;

    // Hiện/Ẩn nút khi cuộn chuột
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopButton.style.display = "flex";
        } else {
            scrollToTopButton.style.display = "none";
        }
    });

    // Click để lên đầu trang
    scrollToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Chạy hàm chính khi trang đã load xong DOM
document.addEventListener("DOMContentLoaded", includeHTML);