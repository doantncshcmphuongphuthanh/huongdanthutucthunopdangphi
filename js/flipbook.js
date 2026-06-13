const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');
const book = document.querySelector('#book');
const pages = document.querySelectorAll('.page');

const slider = document.querySelector('#page-slider');
const tooltip = document.querySelector('#slider-tooltip');

// Nút Fullscreen
const fullscreenBtn = document.querySelector('#fullscreen-btn');
const mainContainer = document.querySelector('.main-container');
const iconMaximize = document.querySelector('.icon-maximize');
const iconMinimize = document.querySelector('.icon-minimize');

let currentLocation = 1;
const numOfPages = pages.length;
const maxLocation = numOfPages + 1;

let isTransitioning = false; 
let flipTimeout = null;
slider.max = maxLocation;

const pageLabels = {
    1: "Bìa trước",
    2: "Trang 01 - 02",
    3: "Trang 03 - 04",
    4: "Trang 05 - 06",
    5: "Trang 07 - 08",
    6: "Trang 09 - 10",
    7: "Trang 11 - 12",
    8: "Trang 13 - 14",
    9: "Bìa sau"
};

// FULL MÀN HÌNH
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Lỗi Fullscreen: ${err.message}`);
        });
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
});

function updateMuiTenVaSlider() {
    if (currentLocation === 1) {
        prevBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
    } else if (currentLocation === maxLocation) {
        nextBtn.classList.add('hidden');
        prevBtn.classList.remove('hidden');
    } else {
        prevBtn.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    }
    slider.value = currentLocation;
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

// HIỆU ỨNG LẬT TRANG 
function goToLocation(newLocation) {
    if (newLocation === currentLocation) return;

    if (isTransitioning) return;
    
    isTransitioning = true;
    book.classList.add('is-flipping');

    const isForward = newLocation > currentLocation;
    
    // Xác định số trang cần lật
    let startIndex = isForward ? currentLocation - 1 : currentLocation - 2;
    let endIndex = isForward ? newLocation - 2 : newLocation - 1;

    let step = isForward ? 1 : -1;
    let delay = 0;
    
    // Độ trễ giữa các trang 
    const timeBetweenFlips = 60; 

    // Mở sách ra giữa màn hình nếu đang đóng ở bìa
    if (currentLocation === 1 && isForward) openBook();
    if (currentLocation === maxLocation && !isForward) openBook();

    let sequence = [];
    for (let i = startIndex; isForward ? i <= endIndex : i >= endIndex; i += step) {
        sequence.push(i);
    }

    sequence.forEach((pageIndex, idx) => {
        setTimeout(() => {
            let page = pages[pageIndex];

            page.style.zIndex = 50 - idx; 

            page.classList.remove('hover-lift-next', 'hover-lift-prev');

            if (isForward) {
                page.classList.add('flipped');
            } else {
                page.classList.remove('flipped');
            }

            setTimeout(() => {
                page.style.zIndex = 50 + idx;
            }, 400);

            if (idx === sequence.length - 1) {
                
                setTimeout(() => {
                    if (newLocation === 1) closeBook(true);
                    else if (newLocation === maxLocation) closeBook(false);
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

    // Cập nhật giá trị hiển thị trên UI ngay lập tức
    currentLocation = newLocation;
    updateMuiTenVaSlider();
}

// Map các nút bấm với hàm lật trang mới
prevBtn.addEventListener("click", () => {
    if (currentLocation > 1) goToLocation(currentLocation - 1);
});
nextBtn.addEventListener("click", () => {
    if (currentLocation < maxLocation) goToLocation(currentLocation + 1);
});

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
        if (!isTransitioning && !page.classList.contains('flipped') && currentLocation === index + 1) {
            page.classList.add('hover-lift-next');
        }
    });
    nextZone.addEventListener('mouseleave', () => {
        page.classList.remove('hover-lift-next');
    });

    prevZone.addEventListener('mouseenter', () => {
        if (!isTransitioning && page.classList.contains('flipped') && currentLocation === index + 2) {
            page.classList.add('hover-lift-prev');
        }
    });
    prevZone.addEventListener('mouseleave', () => {
        page.classList.remove('hover-lift-prev');
    });

    nextZone.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!page.classList.contains('flipped') && currentLocation === index + 1) {
            page.classList.remove('hover-lift-next');
            if (currentLocation < maxLocation) goToLocation(currentLocation + 1);
        }
    });

    prevZone.addEventListener('click', (e) => {
        e.stopPropagation();
        if (page.classList.contains('flipped') && currentLocation === index + 2) {
            page.classList.remove('hover-lift-prev');
            if (currentLocation > 1) goToLocation(currentLocation - 1);
        }
    });
});

// SỰ KIỆN KÉO THANH TRƯỢT SKIP ANIMATION
slider.addEventListener('change', (e) => {
    const targetLocation = parseInt(e.target.value);
    goToLocation(targetLocation);
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

slider.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
});

function resizeBook() {
    const baseWidth = 1040; // Tổng chiều ngang 2 trang sách
    const baseHeight = 780; // Chiều cao sách

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let scaleX = windowWidth / baseWidth;
    let scaleY = windowHeight / baseHeight;

    let scale = Math.min(scaleX, scaleY);

    if (windowWidth < 768) {
        // KIỂM TRA HƯỚNG MÀN HÌNH ĐIỆN THOẠI
        if (windowHeight > windowWidth) {
            // MÀN HÌNH DỌC: Ép scale theo đúng chiều rộng màn hình (chạm mép 100%)
            scale = windowWidth / baseWidth;
        } else {
            // MÀN HÌNH NGANG: Ưu tiên hiển thị trọn vẹn theo chiều cao
            scale = windowHeight / baseHeight;
        }
    } else {
        // TRÊN MÁY TÍNH
        if (!document.fullscreenElement) {
            if (scale > 1) scale = 1;
        } else {
            if (scale > 1.5) scale = 1.5;
        }
    }

    document.documentElement.style.setProperty('--book-scale', scale);
}

window.addEventListener('orientationchange', () => {
    setTimeout(resizeBook, 100);
});

window.addEventListener('resize', resizeBook);
window.addEventListener('orientationchange', resizeBook);

document.addEventListener('DOMContentLoaded', resizeBook);

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        mainContainer.classList.add('fullscreen-active');
        if(iconMaximize && iconMinimize) {
            iconMaximize.style.display = 'none';
            iconMinimize.style.display = 'block';
        }
    } else {
        mainContainer.classList.remove('fullscreen-active');
        if(iconMaximize && iconMinimize) {
            iconMaximize.style.display = 'block';
            iconMinimize.style.display = 'none';
        }
    }
    setTimeout(resizeBook, 50); 
});

document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('.book')) {
        e.preventDefault();
    }
});

document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('.book')) {
        e.preventDefault();
    }
});

document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false }); 

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
    }
});

updateMuiTenVaSlider();

// ==========================================
// TÍNH NĂNG VUỐT TRÊN ĐIỆN THOẠI (SWIPE)
// ==========================================
let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

const bookArea = document.querySelector('.main-container');

bookArea.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
}, { passive: true });

bookArea.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    touchendY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    // Đo khoảng cách vuốt ngang và dọc
    const diffX = touchendX - touchstartX;
    const diffY = touchendY - touchstartY;
    
    // Chỉ kích hoạt lật trang nếu vuốt ngang nhiều hơn vuốt dọc (tránh nhầm với cuộn trang)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX < 0) {
            // Vuốt sang trái -> Trang tiếp theo
            if (currentLocation < maxLocation) goToLocation(currentLocation + 1);
        } else {
            // Vuốt sang phải -> Trang trước
            if (currentLocation > 1) goToLocation(currentLocation - 1);
        }
    }
}

// Xử lý nút tắt màn hình yêu cầu xoay điện thoại
const rotateMsg = document.getElementById('rotate-message');
const closeRotateBtn = document.getElementById('close-rotate');
if(closeRotateBtn && rotateMsg) {
    closeRotateBtn.addEventListener('click', () => {
        rotateMsg.style.display = 'none';
    });
}

// Cải tiến hàm resizeBook để hiển thị to hơn trên Mobile
const originalResizeBook = resizeBook;
window.resizeBook = function() {
    const baseWidth = 1120; 
    const baseHeight = 860; 

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Trên mobile, trừ bớt padding đi để sách vừa khít màn hình hơn
    let availableWidth = windowWidth < 768 ? windowWidth - 10 : windowWidth;
    let availableHeight = windowWidth < 768 ? windowHeight - 80 : windowHeight;

    let scaleX = availableWidth / baseWidth;
    let scaleY = availableHeight / baseHeight;

    let scale = Math.min(scaleX, scaleY);

    if (!document.fullscreenElement) {
        if (scale > 1) scale = 1;
    } else {
        if (scale > 1.5) scale = 1.5;
    }

    document.documentElement.style.setProperty('--book-scale', scale);
};

// Gọi lại 1 lần để cập nhật tỷ lệ ngay khi thêm script
resizeBook();