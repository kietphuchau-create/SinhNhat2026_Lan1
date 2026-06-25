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
 * Quản lý màn hình chọn bài hát
 * @param {HTMLElement} rotatingContainer 
 */
function initSongSelection(rotatingContainer, defaultAudio = null) {
  const songOverlay = document.getElementById('song-selection-overlay');
  const giftOverlay = document.getElementById('gift-overlay');
  
  // Lấy danh sách các thẻ bài hát
  const songBtns = document.querySelectorAll('.song-card');
  
  const listContainer = document.getElementById('song-list-container');
  const confirmContainer = document.getElementById('song-confirm-container');
  const countdownContainer = document.getElementById('song-countdown-container');
  const selectedSongNameEl = document.getElementById('selected-song-name');
  const countdownNumberEl = document.getElementById('countdown-number');
  const progressCircle = document.querySelector('.progress-active');
  const circumference = 326; // Tính theo công thức chu vi đường tròn r=52
  
  const btnCancel = document.getElementById('btn-cancel-song');
  const btnConfirm = document.getElementById('btn-confirm-song');
  const btnCancelCountdown = document.getElementById('btn-cancel-countdown');

  if (!songOverlay || !songBtns.length) {
    if (giftOverlay) giftOverlay.classList.remove('hidden');
    initGiftBox('assets/audio/background.mp3', rotatingContainer);
    return;
  }

  let currentSelectedAudio = null;
  let previewAudio = null;
  let countdownTimer = null;

  // Hàm dừng nhạc nghe thử
  const stopPreview = () => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }
  };

  songBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentSelectedAudio = btn.getAttribute('data-audio');
      const songName = btn.getAttribute('data-name') || "Bài hát";
      
      // Xóa trạng thái active của các bài khác, thêm cho bài hiện tại
      songBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Dừng nhạc mặc định nếu đang phát
      if (defaultAudio) {
        defaultAudio.pause();
      }
      
      // Phát nhạc nghe thử
      stopPreview();
      previewAudio = new Audio(currentSelectedAudio);
      previewAudio.play().catch(e => console.log("Không thể tự phát nhạc nghe thử:", e));
      
      // Chuyển sang màn hình xác nhận
      selectedSongNameEl.textContent = `${songName}`;
      listContainer.classList.add('hidden');
      confirmContainer.classList.remove('hidden');
    });
  });

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      stopPreview();
      // Bỏ đánh dấu bài hát đang chọn
      songBtns.forEach(b => b.classList.remove('active'));
      // Quay lại màn hình chọn
      confirmContainer.classList.add('hidden');
      listContainer.classList.remove('hidden');
      currentSelectedAudio = null;
    });
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      if (!currentSelectedAudio) return;
      
      // Chuyển sang màn hình đếm ngược
      confirmContainer.classList.add('hidden');
      countdownContainer.classList.remove('hidden');
      
      let timeLeft = 3;
      countdownNumberEl.textContent = timeLeft;
      if (progressCircle) {
        progressCircle.style.strokeDashoffset = '0';
      }

      countdownTimer = setInterval(() => {
        timeLeft--;
        countdownNumberEl.textContent = timeLeft;
        
        if (progressCircle) {
           const offset = circumference - (timeLeft / 3) * circumference;
           progressCircle.style.strokeDashoffset = offset;
        }
        
        if (timeLeft <= 0) {
          clearInterval(countdownTimer);
          // Không gọi stopPreview() ở đây nữa để nhạc tiếp tục phát mượt mà
          
          // Ẩn màn hình chọn bài
          songOverlay.classList.add('fade-out');
          setTimeout(() => {
            songOverlay.style.display = 'none';
            
            // Hiện hộp quà
            if (giftOverlay) {
              giftOverlay.classList.remove('hidden');
              requestAnimationFrame(() => {
                // Truyền trực tiếp đối tượng previewAudio vào hộp quà
                initGiftBox(previewAudio || currentSelectedAudio, rotatingContainer);
              });
            }
          }, 600); // Đợi hiệu ứng fade-out hoàn tất
        }
      }, 1000);
    });
  }

  if (btnCancelCountdown) {
    btnCancelCountdown.addEventListener('click', () => {
      clearInterval(countdownTimer);
      stopPreview();
      
      // Bỏ đánh dấu bài hát đang chọn
      songBtns.forEach(b => b.classList.remove('active'));
      
      // Quay lại màn hình chọn bài
      countdownContainer.classList.add('hidden');
      listContainer.classList.remove('hidden');
      currentSelectedAudio = null;
    });
  }
}

/**
 * Quản lý các màn hình chào mừng và kích hoạt nhạc nền, hiệu ứng theo từng giai đoạn
 * @param {string|HTMLAudioElement} audioData - Đường dẫn file mp3 hoặc đối tượng Audio đã khởi tạo
 * @param {HTMLElement} rotatingContainer 
 */
function initGiftBox(audioData, rotatingContainer) {
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

    // Thiết lập nhạc nền
    if (audioData instanceof Audio) {
      audio = audioData;
    } else {
      audio = new Audio(audioData);
    }
    audio.loop = true;
    
    // Nếu nhạc đang không phát thì phát lên
    if (audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        if (musicBtn) musicBtn.textContent = 'Tạm dừng nhạc';
      }).catch(err => console.log("Không thể tự động phát nhạc:", err));
    } else {
      // Nhạc đang phát sẵn (từ lúc nghe thử), chỉ cần cập nhật trạng thái
      isPlaying = true;
      if (musicBtn) musicBtn.textContent = 'Tạm dừng nhạc';
    }

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
  
  // 3. Kích hoạt màn hình chào sân
  initStartScreen(rotatingContainer);
});

function initStartScreen(rotatingContainer) {
  const startOverlay = document.getElementById('start-overlay');
  const songOverlay = document.getElementById('song-selection-overlay');
  const btnStart = document.getElementById('btn-start');

  if (!startOverlay || !btnStart) {
    if (songOverlay) songOverlay.classList.remove('hidden');
    initSongSelection(rotatingContainer, null);
    return;
  }

  btnStart.addEventListener('click', () => {
    // 1. Yêu cầu full màn hình và xoay ngang cho thiết bị di động
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

    // 2. Phát nhạc mặc định
    let defaultAudio = new Audio('assets/audio/Mặc định/Ừ Có Anh Đây.mp3');
    defaultAudio.loop = true;
    defaultAudio.play().catch(e => console.log("Lỗi phát nhạc:", e));

    // 3. Ẩn màn hình Start và hiện màn hình Chọn Bài
    startOverlay.classList.add('fade-out');
    setTimeout(() => {
      startOverlay.style.display = 'none';
      if (songOverlay) songOverlay.classList.remove('hidden');
      initSongSelection(rotatingContainer, defaultAudio);
    }, 600);
  });
}
