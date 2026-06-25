const messages = [
  "Chúc mừng sinh nhật 26/06 nhé Phận 💖",
  "Học xa nhà vất vả rồi, cô gái nhỏ cố lên nhé! 🌸",
  "Lúc nào nhớ nhà hay mệt mỏi, cứ khóc một chút rồi lại mạnh mẽ nha 💗",
  "Nhìn bề ngoài hay nói cứng vậy thôi, chứ mong manh lắm đúng không? 🥺",
  "Dù ở xa, nhưng mọi người ở nhà luôn yêu thương và ủng hộ Phận 💖",
  "Cố gắng lên nhé, hãy luôn giữ nụ cười thật tươi trên môi! ✨",
  "Bạn là một cô gái rất tuyệt vời, đừng cố gồng gánh mọi thứ một mình 🌷",
  "Sinh nhật vui vẻ, tuổi mới thật bình an và đạt được ước mơ nhé! 🎁"
];

const imageURLs = [
  "assets/images/photo_1.jpg",
  "assets/images/photo_2.jpg",
  "assets/images/photo_3.jpg",
  "assets/images/photo_4.jpg"
];

const icons = ["❤️", "❤", "💗"];

const fonts = [
  "'Outfit', sans-serif",
  "'Playfair Display', serif",
  "'Dancing Script', cursive",
  "'Pacifico', cursive",
  "'Great Vibes', cursive",
  "'Sacramento', cursive",
  "'Montserrat', sans-serif",
  "'Caveat', cursive"
];

const colors = [
  { text: "#ff7597", shadow: "rgba(255, 117, 151, 0.8)" },
  { text: "#ffd700", shadow: "rgba(255, 215, 0, 0.8)" },
  { text: "#b388ff", shadow: "rgba(179, 136, 255, 0.8)" },
  { text: "#80deea", shadow: "rgba(128, 222, 234, 0.8)" },
  { text: "#ffab91", shadow: "rgba(255, 171, 145, 0.8)" },
  { text: "#a5d6a7", shadow: "rgba(165, 214, 167, 0.8)" },
  { text: "#f48fb1", shadow: "rgba(244, 143, 177, 0.8)" },
  { text: "#e0f7fa", shadow: "rgba(224, 247, 250, 0.8)" }
];

const maxParticles = 30; // Giảm số lượng tối đa để không quá dày đặc
const activeParticles = new Set();

/**
 * Hiển thị phóng to ảnh ở giữa màn hình
 * @param {string} src - Đường dẫn ảnh
 */
function showImageCenter(src) {
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';
  const bigImg = document.createElement('img');
  bigImg.className = 'image-center';
  bigImg.src = src;
  bigImg.loading = "eager";
  overlay.appendChild(bigImg);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('active'));

  // Tự động đóng popup sau 1 giây
  setTimeout(() => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 400);
  }, 1000);
}

/**
 * Tạo một hạt bay lên/rơi xuống (văn bản hoặc hình ảnh)
 * @param {HTMLElement} container - Thẻ HTML chứa hạt
 * @param {'text'|'image'} type - Loại hạt
 */
export function createParticle(container, type = 'text') {
  const isMobile = window.innerWidth < 768;
  const currentMaxParticles = isMobile ? 15 : maxParticles;
  if (activeParticles.size >= currentMaxParticles) return;

  const el = type === 'text' ? document.createElement('div') : document.createElement('img');
  if (type === 'text') {
    const isIcon = Math.random() < 0.3;
    el.className = 'text-particle';
    el.textContent = isIcon ? icons[Math.floor(Math.random() * icons.length)] : messages[Math.floor(Math.random() * messages.length)];
    
    // Giới hạn độ rộng chữ để tự xuống dòng, giúp dễ đọc
    if (!isIcon) {
      el.style.maxWidth = '300px';
      el.style.textAlign = 'center';
      el.style.lineHeight = '1.5';
      el.style.wordWrap = 'break-word';
    }

    // Scale font size down on mobile
    const baseFontSize = isIcon ? (isMobile ? 14 : 20) : (isMobile ? 12 : 18);
    const randomAddition = Math.random() * (isMobile ? 6 : 12);
    el.style.fontSize = (baseFontSize + randomAddition) + 'px';

    // Random font style
    const selectedFont = fonts[Math.floor(Math.random() * fonts.length)];
    el.style.fontFamily = selectedFont;

    // Random colorful palette
    const selectedColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.color = selectedColor.text;
    el.style.textShadow = `0 0 8px ${selectedColor.shadow}, 0 0 16px ${selectedColor.shadow}`;

    // Add dynamic slight tilt
    const tilt = (Math.random() - 0.5) * 30; // -15deg to 15deg
    el.style.setProperty('--tilt', `${tilt}deg`);

    // Add click listener for firework
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2;
      const clickY = rect.top + rect.height / 2;
      createFirework(clickX, clickY);

      // Animate popping out
      el.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease';
      el.style.transform = `${el.style.transform} scale(0)`;
      el.style.opacity = 0;
      setTimeout(() => {
        el.remove();
        activeParticles.delete(el);
      }, 250);
    });
  } else {
    el.className = 'image-particle';
    el.src = imageURLs[Math.floor(Math.random() * imageURLs.length)];
    el.loading = "lazy";
    el.addEventListener('click', () => showImageCenter(el.src));
  }

  el.style.opacity = 0;
  container.appendChild(el);

  const w = el.offsetWidth || 40;
  el.style.left = Math.random() * (window.innerWidth - w) + 'px';

  const z = -Math.random() * 300;
  const startY = -50;
  const endY = window.innerHeight + 50;
  const duration = 18000 + Math.random() * 12000; // Tăng thời gian trôi (từ 18s đến 30s) để chữ trôi chậm hơn
  const t0 = performance.now();

  function animate(t) {
    const p = (t - t0) / duration;
    if (p >= 1) {
      el.remove();
      activeParticles.delete(el);
    } else {
      const y = startY + p * (endY - startY);
      const op = p < 0.1 ? p * 10 : (p > 0.9 ? (1 - p) * 10 : 1);
      el.style.opacity = op;

      const tilt = el.style.getPropertyValue('--tilt') || '0deg';
      const scale = 0.8 + Math.sin(p * Math.PI) * 0.4;
      el.style.transform = `translate3d(0, ${y}px, ${z}px) rotate(${tilt}) scale(${scale})`;

      requestAnimationFrame(animate);
    }
  }

  activeParticles.add(el);
  requestAnimationFrame(animate);
}

let loopStarted = false;

/**
 * Bắt đầu vòng lặp tạo hạt liên tục
 * @param {HTMLElement} container - Thẻ HTML chứa hạt
 */
export function startParticlesLoop(container) {
  if (loopStarted) return;
  loopStarted = true;

  let last = 0;
  function tick(t) {
    const isMobile = window.innerWidth < 768;
    const interval = isMobile ? 2500 : 1500; // Tăng khoảng thời gian xuất hiện để giảm mật độ
    if (t - last > interval) {
      createParticle(container, 'text');
      const imageChance = isMobile ? 0.35 : 0.5; // Fewer images on mobile
      if (Math.random() < imageChance) createParticle(container, 'image');
      last = t;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/**
 * Tạo hiệu ứng pháo hoa nổ tại vị trí (x, y)
 * @param {number} x - Tọa độ X
 * @param {number} y - Tọa độ Y
 */
export function createFirework(x, y) {
  const particleCount = 24;
  const sparkColors = ["#ff5252", "#ff4081", "#e040fb", "#7c4dff", "#53d3ff", "#52ffb8", "#ffd740", "#ff6e40"];
  const shapes = ["❤️", "✨", "⭐", "🌸", "❤", "💗", "💙", "💚", "💛"];

  for (let i = 0; i < particleCount; i++) {
    const spark = document.createElement('div');
    spark.className = 'spark-particle';
    spark.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    spark.style.fontSize = 12 + Math.random() * 12 + 'px';
    const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    spark.style.color = color;
    spark.style.textShadow = `0 0 6px ${color}, 0 0 12px ${color}`;

    document.body.appendChild(spark);

    // Initial position
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';

    // Physics
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed - 1.5; // Slight upward bias
    const gravity = 0.12;

    let curX = x;
    let curY = y;
    const duration = 800 + Math.random() * 500;
    const t0 = performance.now();

    function animateSpark(t) {
      const elapsed = t - t0;
      const progress = elapsed / duration;
      if (progress >= 1) {
        spark.remove();
      } else {
        vy += gravity;
        curX += vx;
        curY += vy;

        vx *= 0.97;
        vy *= 0.97;

        spark.style.transform = `translate3d(${curX - x}px, ${curY - y}px, 0) scale(${1 - progress * 0.5}) rotate(${progress * 360}deg)`;
        spark.style.opacity = 1 - progress;

        requestAnimationFrame(animateSpark);
      }
    }
    requestAnimationFrame(animateSpark);
  }
}

// Click anywhere on body to trigger a firework burst
document.addEventListener('click', (e) => {
  // If clicked on an interactive image particle, popup, or inside popup overlay, skip
  if (e.target.closest('.image-particle') || e.target.closest('.image-center') || e.target.closest('.popup-overlay')) {
    return;
  }
  createFirework(e.clientX, e.clientY);
});
