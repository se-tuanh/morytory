(function () {
  // Prevent run on servers or if canvas is not supported
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Style the canvas
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  let particles = [];
  let lastMouseX = null;
  let lastMouseY = null;
  let isLooping = false;

  // Custom colors matching the Etsy design (warm terracotta) + magical wibu pastel vibes
  const COLORS = [
    '#ffd700', // Bright Gold
    '#ffb7b2', // Pastel Coral/Pink
    '#b5ead7', // Mint Green
    '#c7ceea', // Lavender Blue
    '#ffc6ff', // Bright Pastel Purple
    '#d15816', // Etsy Terracotta
    '#ffffff'  // Pure Light
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      
      // Random velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;
      this.vx = Math.cos(angle) * speed;
      // Slight upward lift + gravity later
      this.vy = Math.sin(angle) * speed - 0.5; 
      
      // Particle properties
      this.size = Math.random() * 12 + 6; // Outer radius
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015; // Fade out speed
      this.rotation = Math.random() * Math.PI;
      this.rotationSpeed = (Math.random() - 0.5) * 0.1;
      
      // Particle type: 70% stars, 30% simple circles
      this.type = Math.random() < 0.7 ? 'star' : 'circle';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Apply slight gravity (drift downward)
      this.vy += 0.03;
      
      // Decay opacity
      this.alpha -= this.decay;
      
      // Rotate
      this.rotation += this.rotationSpeed;
      
      // Shrink size slightly
      this.size *= 0.98;
    }

    draw() {
      if (this.alpha <= 0) return;

      if (this.type === 'star') {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        // Add soft glow around the sparkles
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        const r = this.size;
        const c = r * 0.25; // Control offset (the thinner the cooler)
        
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, -c, c, 0);
        ctx.quadraticCurveTo(c, 0, r, 0);
        ctx.quadraticCurveTo(c, 0, 0, c);
        ctx.quadraticCurveTo(0, c, 0, r);
        ctx.quadraticCurveTo(0, c, -c, 0);
        ctx.quadraticCurveTo(-c, 0, -r, 0);
        ctx.quadraticCurveTo(-c, 0, 0, -c);
        ctx.quadraticCurveTo(0, -c, 0, -r);
        
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Simple stardust circle
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function spawnParticles(x, y) {
    // Generate 2 particles per mouse event
    for (let i = 0; i < 2; i++) {
      particles.push(new Particle(x, y));
    }
    // Limit total particles to prevent overhead
    if (particles.length > 100) {
      particles.shift();
    }
    startLoop();
  }

  function handleMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    
    if (lastMouseX === null || lastMouseY === null) {
      lastMouseX = x;
      lastMouseY = y;
      spawnParticles(x, y);
      return;
    }

    const dist = Math.hypot(x - lastMouseX, y - lastMouseY);
    // Throttling: only spawn when moved at least 6 pixels
    if (dist > 6) {
      spawnParticles(x, y);
      lastMouseX = x;
      lastMouseY = y;
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      
      if (lastMouseX === null || lastMouseY === null) {
        lastMouseX = x;
        lastMouseY = y;
        spawnParticles(x, y);
        return;
      }
      
      const dist = Math.hypot(x - lastMouseX, y - lastMouseY);
      if (dist > 8) {
        spawnParticles(x, y);
        lastMouseX = x;
        lastMouseY = y;
      }
    }
  }

  function handleTouchEnd() {
    lastMouseX = null;
    lastMouseY = null;
  }

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchend', handleTouchEnd);

  function startLoop() {
    if (!isLooping) {
      isLooping = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
    
    if (particles.length > 0) {
      requestAnimationFrame(tick);
    } else {
      isLooping = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
})();
