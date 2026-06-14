import { startStars } from './galaxy.js';
import { startParticlesLoop } from './particles.js';

/**
 * Xử lý xoay container 3D dựa trên cử chỉ chuột hoặc cảm ứng
 * @param {HTMLElement} container 
 */
function initRotation(container) {
  function updateRotation(x, y) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const rotY = ((x - cx) / cx) * 10;
    const rotX = (-(y - cy) / cy) * 10;
    container.style.transform = `translate(-50%, -50%) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  document.addEventListener('mousemove', e => updateRotation(e.clientX, e.clientY));
  document.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      updateRotation(t.clientX, t.clientY);
    }
  }, { passive: true });
}

/**
 * Tạo hiệu ứng cánh hoa đào rơi trong màn hình giới thiệu
 */
function startFallingPetals() {
  const container = document.getElementById('petal-container');
  if (!container) return;

  const petalCount = 35; // Số lượng cánh hoa trên màn hình
  for (let i = 0; i < petalCount; i++) {
    createPetal(container);
  }
}

/**
 * Tạo một cánh hoa đào riêng lẻ
 * @param {HTMLElement} container 
 */
function createPetal(container) {
  const petal = document.createElement('div');
  petal.className = 'sakura-petal';
  
  // Random kích thước từ 8px đến 16px
  const size = Math.random() * 8 + 8;
  petal.style.width = `${size}px`;
  petal.style.height = `${size}px`;
  
  // Random vị trí bắt đầu
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.top = `${-Math.random() * 20 - 5}%`;
  
  // Random thời gian trễ và tốc độ rơi
  const delay = Math.random() * 8;
  const duration = Math.random() * 5 + 6; // Rơi trong 6s - 11s
  petal.style.animationDelay = `${delay}s`;
  petal.style.animationDuration = `${duration}s`;
  
  // Random góc quay ban đầu
  petal.style.transform = `rotate(${Math.random() * 360}deg)`;
  
  container.appendChild(petal);
  
  // Lặp lại hiệu ứng ở vị trí ngẫu nhiên mới khi hoàn thành một chu kỳ rơi
  petal.addEventListener('animationiteration', () => {
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.top = `${-Math.random() * 10 - 5}%`;
  });
}

/**
 * Quản lý các màn hình chào mừng và kích hoạt nhạc nền, hiệu ứng theo từng giai đoạn
 * @param {string} audioPath 
 * @param {HTMLElement} rotatingContainer 
 */
function initGiftBox(audioPath, rotatingContainer) {
  const giftOverlay = document.getElementById('gift-overlay');
  const giftBox = document.querySelector('.gift-box');
  const introOverlay = document.getElementById('intro-overlay');
  const openLetterBtn = document.querySelector('.open-letter-btn');
  const globalControls = document.getElementById('global-controls');
  const backBtn = document.getElementById('back-btn');
  const musicBtn = document.getElementById('music-btn');
  const exploreBtn = document.getElementById('explore-btn');
  
  if (!giftOverlay || !giftBox) return;

  let openedGift = false;
  let openedLetter = false;
  let audio = null;
  let isPlaying = false;

  // Giai đoạn 1: Người dùng nhấn vào màn hình mở quà (gift-overlay)
  giftOverlay.addEventListener('click', () => {
    if (openedGift) return;
    openedGift = true;

    // Phát nhạc nền
    audio = new Audio(audioPath);
    audio.loop = true;
    audio.play().then(() => {
      isPlaying = true;
      if (musicBtn) musicBtn.textContent = 'Tạm dừng nhạc';
    }).catch(err => console.log("Không thể tự động phát nhạc:", err));

    // Chạy hiệu ứng mở nắp hộp quà
    giftBox.classList.add('open-animation');

    // Chuyển tiếp sang màn hình giới thiệu
    setTimeout(() => {
      giftOverlay.classList.add('fade-out');
      
      if (introOverlay) {
        introOverlay.classList.remove('hidden');
        startFallingPetals(); // Chạy hoa đào rơi
      }
      
      setTimeout(() => {
        giftOverlay.remove();
      }, 800);
    }, 700);
  });

  // Giai đoạn 2: Người dùng nhấn nút "Mở thư" ở màn hình giới thiệu
  if (openLetterBtn && introOverlay) {
    openLetterBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
      if (openedLetter) return;
      openedLetter = true;

      // Ẩn màn hình giới thiệu sinh nhật
      introOverlay.classList.add('fade-out');

      // Khởi động các hạt bay 3D ở màn hình Galaxy phía sau
      if (rotatingContainer) {
        startParticlesLoop(rotatingContainer);
      }

      setTimeout(() => {
        introOverlay.style.display = 'none'; // Không remove để có thể quay lại
        if (globalControls) globalControls.classList.remove('hidden'); // Hiện nút điều khiển
      }, 850);
    });
  }

  // Nút Quay lại
  if (backBtn && introOverlay) {
    backBtn.addEventListener('click', () => {
      if (globalControls) globalControls.classList.add('hidden'); // Ẩn nút điều khiển
      
      introOverlay.style.display = 'flex'; // Hiện lại container
      // Đợi một chút để trình duyệt áp dụng display block, rồi mới xóa class fade-out để kích hoạt CSS transition
      requestAnimationFrame(() => {
        introOverlay.classList.remove('fade-out');
      });
      
      openedLetter = false; // Cho phép mở thư lại
    });
  }

  // Nút Tạm dừng / Phát nhạc
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        musicBtn.textContent = 'Phát nhạc';
      } else {
        audio.play();
        isPlaying = true;
        musicBtn.textContent = 'Tạm dừng nhạc';
      }
    });
  }

  // Nút Khám phá vũ trụ: Tắt nhạc khi nhấn
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      if (audio && isPlaying) {
        audio.pause();
        isPlaying = false;
        if (musicBtn) musicBtn.textContent = 'Phát nhạc';
      }
    });
  }
}

// Chạy ứng dụng sau khi DOM đã sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
  const rotatingContainer = document.getElementById('rotatingContainer');
  
  // 1. Khởi chạy tinh vân 3D ở thẻ có ID 'galaxy' (chạy nền)
  startStars('galaxy');
  
  // 2. Khởi tạo tương tác xoay 3D
  initRotation(rotatingContainer);
  
  // 3. Kích hoạt chu trình mở quà và nhạc nền
  initGiftBox('assets/audio/background.mp3', rotatingContainer);

  // 4. Yêu cầu full màn hình và xoay ngang cho thiết bị di động khi chạm vào màn hình
  document.addEventListener('click', function requestLandscapeFullscreen() {
    // Nhận diện điện thoại hoặc màn hình nhỏ
    if (window.innerWidth <= 900 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const docElm = document.documentElement;
      
      const tryLockOrientation = () => {
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(err => console.log("Không thể khóa hướng:", err));
        }
      };

      if (docElm.requestFullscreen) {
        docElm.requestFullscreen().then(tryLockOrientation).catch(err => console.log("Lỗi fullscreen:", err));
      } else if (docElm.webkitRequestFullscreen) { /* Safari */
        docElm.webkitRequestFullscreen();
        setTimeout(tryLockOrientation, 500);
      } else if (docElm.msRequestFullscreen) { /* IE11 */
        docElm.msRequestFullscreen();
        setTimeout(tryLockOrientation, 500);
      }
    }
    // Gỡ bỏ sự kiện sau khi đã chạy lần đầu
    document.removeEventListener('click', requestLandscapeFullscreen);
  }, { once: true });
});
