const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');
const book = document.querySelector('#book');
const pages = document.querySelectorAll('.page');
const slider = document.querySelector('#page-slider');
const tooltip = document.querySelector('#slider-tooltip');
const fullscreenBtn = document.querySelector('#fullscreen-btn');
const mainContainer = document.querySelector('.main-container');
const iconMaximize = document.querySelector('.icon-maximize');
const iconMinimize = document.querySelector('.icon-minimize');

// Cấu trúc dữ liệu theo dõi trang
let currentSpread = 1;      // Dùng cho máy tính (1 tới 9)
let currentView = 1;        // Dùng cho điện thoại (1 tới 16)
const numOfPages = pages.length; // 8 lá
const maxSpread = numOfPages + 1; // 9 trang đôi
const maxViews = numOfPages * 2;  // 16 góc nhìn đơn
let isTransitioning = false;

slider.max = maxSpread;

const pageLabels = {
    1: "Bìa trước", 2: "Trang 01 - 02", 3: "Trang 03 - 04", 
    4: "Trang 05 - 06", 5: "Trang 07 - 08", 6: "Trang 09 - 10", 
    7: "Trang 11 - 12", 8: "Trang 13 - 14", 9: "Bìa sau"
};

// FULL MÀN HÌNH
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.error(err.message));
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        mainContainer.classList.add('fullscreen-active');
        iconMaximize.style.display = 'none';
        iconMinimize.style.display = 'block';
    } else {
        mainContainer.classList.remove('fullscreen-active');
        iconMaximize.style.display = 'block';
        iconMinimize.style.display = 'none';
    }
    setTimeout(resizeBook, 50);
});

// KIỂM TRA ĐIỆN THOẠI DỌC
function isMobilePortrait() {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isPortrait = window.innerHeight > window.innerWidth;
    // Tăng hạn mức kiểm tra lên 932px (mức tối đa của iPhone 14/15 Pro Max hiện tại)
    const isMobileWidth = window.innerWidth <= 952; 
    
    return isTouchDevice && isPortrait && isMobileWidth;
}

// CẬP NHẬT GIAO DIỆN & PANNING (TRƯỢT) TRÊN MOBILE
function updateView() {
    const mobileMode = isMobilePortrait();
    
    // Ánh xạ từ View hiện tại (1-16) ra Trang Đôi (1-9)
    let targetSpread;
    if (currentView === 1) targetSpread = 1;
    else if (currentView === maxViews) targetSpread = maxSpread;
    else targetSpread = Math.floor(currentView / 2) + 1;

    // Nếu thay đổi trang đôi, thực hiện hiệu ứng lật 3D
    if (currentSpread !== targetSpread) {
        goToSpread(targetSpread);
    }

    // Xử lý góc nhìn (trượt qua lại) khi ở trên điện thoại dọc
    if (mobileMode) {
        mainContainer.classList.add('mobile-portrait-mode');
        const focusLeft = (currentView % 2 === 0);

        if (currentView === 1) {
            mainContainer.classList.remove('focus-left');
            mainContainer.classList.add('focus-right');
        } else if (currentView === maxViews) {
            mainContainer.classList.remove('focus-right');
            mainContainer.classList.add('focus-left');
        } else {
            if (focusLeft) {
                mainContainer.classList.remove('focus-right');
                mainContainer.classList.add('focus-left');
            } else {
                mainContainer.classList.remove('focus-left');
                mainContainer.classList.add('focus-right');
            }
        }
    } else {
        // Chế độ máy tính/ngang: xóa hết class của mobile
        mainContainer.classList.remove('mobile-portrait-mode', 'focus-left', 'focus-right');
    }

    updateMuiTenVaSlider();
}

function updateMuiTenVaSlider() {
    if (currentView === 1) {
        prevBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
    } else if (currentView === maxViews) {
        nextBtn.classList.add('hidden');
        prevBtn.classList.remove('hidden');
    } else {
        prevBtn.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    }
    slider.value = currentSpread;
}

function openBook() {
    book.style.transform = "";
    book.classList.add('is-open');
    book.classList.remove('is-closed-right');
}

function closeBook(isAtBeginning) {
    book.style.transform = "";
    book.classList.remove('is-open');
    if (isAtBeginning) {
        book.classList.remove('is-closed-right');
    } else {
        book.classList.add('is-closed-right');
    }
}

// ĐIỀU HƯỚNG TRANG KẾ TIẾP / QUAY LẠI
function prevView() {
    if (isTransitioning) return;
    if (isMobilePortrait()) {
        if (currentView > 1) {
            currentView--;
            updateView();
        }
    } else {
        if (currentView > 1) {
            let targetSpread = Math.floor(currentView / 2) + 1;
            if (currentView === maxViews) targetSpread = maxSpread;
            targetSpread--;
            if (targetSpread <= 1) currentView = 1;
            else currentView = (targetSpread - 1) * 2;
            updateView();
        }
    }
}

function nextView() {
    if (isTransitioning) return;
    if (isMobilePortrait()) {
        if (currentView < maxViews) {
            currentView++;
            updateView();
        }
    } else {
        if (currentView < maxViews) {
            let targetSpread = currentView === 1 ? 1 : Math.floor(currentView / 2) + 1;
            targetSpread++;
            if (targetSpread >= maxSpread) currentView = maxViews;
            else currentView = (targetSpread - 1) * 2; // Snap tới trang chẵn bên trái
            updateView();
        }
    }
}

prevBtn.addEventListener("click", prevView);
nextBtn.addEventListener("click", nextView);

// HIỆU ỨNG LẬT TRANG LÕI 3D
function goToSpread(newSpread) {
    if (newSpread === currentSpread) return;
    isTransitioning = true;
    book.classList.add('is-flipping');
    
    const isForward = newSpread > currentSpread;
    let startIndex = isForward ? currentSpread - 1 : currentSpread - 2;
    let endIndex = isForward ? newSpread - 2 : newSpread - 1;
    let step = isForward ? 1 : -1;
    let delay = 0;
    const timeBetweenFlips = 60;

    if (currentSpread === 1 && isForward) openBook();
    if (currentSpread === maxSpread && !isForward) openBook();

    let sequence = [];
    for (let i = startIndex; isForward ? i <= endIndex : i >= endIndex; i += step) {
        sequence.push(i);
    }

    sequence.forEach((pageIndex, idx) => {
        setTimeout(() => {
            let page = pages[pageIndex];
            page.style.zIndex = 50 - idx;
            page.classList.remove('hover-lift-next', 'hover-lift-prev');

            if (isForward) page.classList.add('flipped');
            else page.classList.remove('flipped');

            setTimeout(() => { page.style.zIndex = 50 + idx; }, 400);

            if (idx === sequence.length - 1) {
                setTimeout(() => {
                    if (newSpread === 1) closeBook(true);
                    else if (newSpread === maxSpread) closeBook(false);
                }, 400);

                setTimeout(() => {
                    pages.forEach((p, i) => {
                        let pageNum = i + 1;
                        if (p.classList.contains('flipped')) {
                            p.style.zIndex = pageNum;
                        } else {
                            p.style.zIndex = numOfPages - pageNum + 1;
                        }
                    });
                    isTransitioning = false;
                    book.classList.remove('is-flipping');
                }, 800);
            }
        }, delay);
        delay += timeBetweenFlips;
    });
    currentSpread = newSpread;
}

// HOVER GÓC TRANG
pages.forEach((page, index) => {
    const frontFace = page.querySelector('.front-face');
    const backFace = page.querySelector('.back-face');
    
    const nextZone = document.createElement('div');
    nextZone.className = 'click-zone next-zone';
    frontFace.appendChild(nextZone);
    
    const prevZone = document.createElement('div');
    prevZone.className = 'click-zone prev-zone';
    backFace.appendChild(prevZone);

    nextZone.addEventListener('mouseenter', () => {
        if (!isTransitioning && !page.classList.contains('flipped') && currentSpread === index + 1 && !isMobilePortrait()) {
            page.classList.add('hover-lift-next');
        }
    });
    nextZone.addEventListener('mouseleave', () => page.classList.remove('hover-lift-next'));

    prevZone.addEventListener('mouseenter', () => {
        if (!isTransitioning && page.classList.contains('flipped') && currentSpread === index + 2 && !isMobilePortrait()) {
            page.classList.add('hover-lift-prev');
        }
    });
    prevZone.addEventListener('mouseleave', () => page.classList.remove('hover-lift-prev'));

    nextZone.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!page.classList.contains('flipped') && currentSpread === index + 1) {
            page.classList.remove('hover-lift-next');
            nextView();
        }
    });
    prevZone.addEventListener('click', (e) => {
        e.stopPropagation();
        if (page.classList.contains('flipped') && currentSpread === index + 2) {
            page.classList.remove('hover-lift-prev');
            prevView();
        }
    });
});

// SỰ KIỆN THANH TRƯỢT
slider.addEventListener('change', (e) => {
    const targetSpread = parseInt(e.target.value);
    if (targetSpread === 1) currentView = 1;
    else if (targetSpread === maxSpread) currentView = maxViews;
    else currentView = (targetSpread - 1) * 2;
    updateView();
});

slider.addEventListener('mousemove', (e) => {
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    let hoveredValue = Math.round(min + percentage * (max - min));
    hoveredValue = Math.max(min, Math.min(max, hoveredValue));
    
    tooltip.style.display = 'block';
    tooltip.style.left = `${x}px`;
    tooltip.textContent = pageLabels[hoveredValue] || `Trang ${hoveredValue}`;
});
slider.addEventListener('mouseleave', () => tooltip.style.display = 'none');

// TỰ ĐỘNG CHỈNH KÍCH THƯỚC (Responsive)
function resizeBook() {
    const baseWidth = 1040;  // Máy tính (2 trang)
    const singleWidth = 520; // Điện thoại dọc (1 trang)
    const baseHeight = 780;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let scale;

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isMobilePortrait()) {
        // Zoom khít 1 trang khi cầm dọc
        let availableWidth = windowWidth;
        let availableHeight = windowHeight - 80; // Trừ không gian cho slider di động
        let scaleX = availableWidth / singleWidth;
        let scaleY = availableHeight / baseHeight;
        scale = Math.min(scaleX, scaleY);
    } else if (isTouch && isLandscape) {
        // ĐIỆN THOẠI XOAY NGANG: Tính toán khít theo chiều cao để không bị đẩy lên trên
        let availableWidth = windowWidth - 20;
        let availableHeight = windowHeight - 70; // Trừ khoảng trống cho slider nằm dưới gọn gàng
        let scaleX = availableWidth / baseWidth;
        let scaleY = availableHeight / baseHeight;
        scale = Math.min(scaleX, scaleY);
    } else {
        // Máy tính/Desktop mặc định
        let scaleX = windowWidth / baseWidth;
        let scaleY = windowHeight / baseHeight;
        scale = Math.min(scaleX, scaleY);
        if (!document.fullscreenElement && scale > 1) scale = 1;
        if (document.fullscreenElement && scale > 1.5) scale = 1.5;
    }

    document.documentElement.style.setProperty('--book-scale', scale);
    updateView();
}

window.addEventListener('resize', resizeBook);
window.addEventListener('orientationchange', () => setTimeout(resizeBook, 150));
document.addEventListener('DOMContentLoaded', resizeBook);
document.addEventListener('contextmenu', (e) => { if (e.target.tagName === 'IMG' || e.target.closest('.book')) e.preventDefault(); });
document.addEventListener('dragstart', (e) => { if (e.target.tagName === 'IMG' || e.target.closest('.book')) e.preventDefault(); });
document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
document.addEventListener('keydown', (e) => { if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) e.preventDefault(); });

