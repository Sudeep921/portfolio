
// ========================================
// PORTFOLIO ANIMATIONS
// ========================================

document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;


  // ========================================
  // LOADER
  // ========================================

  const loader = document.getElementById("loader");
  const loadNum = document.getElementById("loadNum");

  let count = 0;

  const loading = setInterval(() => {

    count += 5;

    if (loadNum) {
      loadNum.textContent = Math.min(count, 100);
    }

    if (count >= 100) {

      clearInterval(loading);

      if (loader) {
        loader.classList.add("done");
      }

      body.classList.add("ready");

    }

  }, 35);


  // ========================================
  // PROGRESS BAR
  // ========================================

  const progress = document.getElementById("progress");

  window.addEventListener("scroll", () => {

    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage = totalHeight > 0
      ? (window.scrollY / totalHeight) * 100
      : 0;

    if (progress) {
      progress.style.width = percentage + "%";
    }

  });


  // ========================================
  // TYPING EFFECT
  // ========================================

  const typing = document.getElementById("typing");

  if (typing) {

    const words = [
      "WEB DEVELOPER",
      "CREATIVE DESIGNER",
      "PROBLEM SOLVER"
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeEffect() {

      const word = words[wordIndex];

      typing.textContent = word.substring(0, charIndex);

      if (!deleting) {

        charIndex++;

        if (charIndex > word.length) {

          deleting = true;

          setTimeout(typeEffect, 1200);

          return;
        }

      } else {

        charIndex--;

        if (charIndex < 0) {

          deleting = false;

          wordIndex = (wordIndex + 1) % words.length;

          charIndex = 0;

        }

      }

      setTimeout(typeEffect, deleting ? 50 : 100);

    }

    typeEffect();

  }


  // ========================================
  // LETTER ANIMATION
  // ========================================

  document.querySelectorAll(".name .line").forEach(line => {

    const text = line.textContent;

    line.textContent = "";

    [...text].forEach((letter, index) => {

      const span = document.createElement("span");

      span.textContent = letter === " " ? "\u00a0" : letter;

      span.className = "l";

      span.style.setProperty("--i", index);

      line.appendChild(span);

    });

  });


  // ========================================
  // SCROLL REVEAL
  // ========================================

  window.initReveal = function () {

    const observer = new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("show");

          observer.unobserve(entry.target);

        }

      });

    }, {
      threshold: 0.12
    });

    document.querySelectorAll(".reveal:not(.show)").forEach(element => {

      observer.observe(element);

    });

  };

  initReveal();


  // ========================================
  // COUNTERS ANIMATION
  // ========================================

  const counters = document.querySelectorAll(".nums strong");

  const counterObserver = new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if (!entry.isIntersecting) return;

      const element = entry.target;

      const target = Number(element.dataset.n);

      let current = 0;

      const duration = 1500;

      const startTime = performance.now();

      function animateCounter(time) {

        const elapsed = time - startTime;

        const progress = Math.min(elapsed / duration, 1);

        current = Math.floor(progress * target);

        element.textContent = current;

        if (progress < 1) {

          requestAnimationFrame(animateCounter);

        } else {

          element.textContent = target;

        }

      }

      requestAnimationFrame(animateCounter);

      counterObserver.unobserve(element);

    });

  }, {
    threshold: 0.3
  });

  counters.forEach(counter => {

    counterObserver.observe(counter);

  });


  // ========================================
  // MAGNETIC BUTTONS
  // ========================================

  document.querySelectorAll(".btn").forEach(button => {

    button.addEventListener("mousemove", event => {

      const rect = button.getBoundingClientRect();

      const x = event.clientX - rect.left - rect.width / 2;

      const y = event.clientY - rect.top - rect.height / 2;

      button.style.transform =
        `translate(${x * 0.12}px, ${y * 0.12}px)`;

    });

    button.addEventListener("mouseleave", () => {

      button.style.transform = "";

    });

  });


  // ========================================
  // HERO SCROLL EFFECT
  // ========================================

  const hero = document.querySelector(".hero");

  const big = document.getElementById("big");

  const heroText = document.getElementById("heroText");

  window.addEventListener("scroll", () => {

    if (!hero) return;

    const rect = hero.getBoundingClientRect();

    const maxScroll = hero.offsetHeight - window.innerHeight;

    const progressValue = maxScroll > 0
      ? Math.min(1, Math.max(0, -rect.top / maxScroll))
      : 0;

    if (big) {

      big.style.transform =
        `translateX(-50%) translateY(${progressValue * -100}px)`;

    }

    if (heroText) {

      heroText.style.transform =
        `translateY(${progressValue * 80}px)`;

    }

  });


  // ========================================
  // END PORTFOLIO ANIMATIONS
  // ========================================

});
