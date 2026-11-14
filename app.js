// ==========================================================================
// VALI APP FRAMER MOTION & INTERACTION SUITE
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. SCROLL-DRIVEN SPRING REVEALS (whileInView)
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Once animated into view, we can unobserve
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // --------------------------------------------------------------------------
  // 2. MAGNETIC PROXIMITY ACTION BUTTONS
  // --------------------------------------------------------------------------
  const magneticButtons = document.querySelectorAll('.magnetic-btn');

  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      // Distance from center
      const deltaX = e.clientX - btnCenterX;
      const deltaY = e.clientY - btnCenterY;

      // Magnetic pull factor (smooth elastic displacement)
      const pullFactor = 0.28;
      const translateX = deltaX * pullFactor;
      const translateY = deltaY * pullFactor;

      btn.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });

  // --------------------------------------------------------------------------
  // 3. INTERACTIVE BENTO CARD CURSOR SPOTLIGHT & 3D TILT
  // --------------------------------------------------------------------------
  const bentoCards = document.querySelectorAll('.interactive-bento');

  bentoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update cursor spotlight gradient coordinates
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Gentle 3D perspective tilt
      const width = rect.width;
      const height = rect.height;
      const rotateX = -((y - height / 2) / height) * 5;
      const rotateY = ((x - width / 2) / width) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });

  // --------------------------------------------------------------------------
  // 4. INTERACTIVE FOCUS ACCORDION & DEPTH ZOOM
  // --------------------------------------------------------------------------
  const accordionItems = document.querySelectorAll('.accordion-item');
  const focusPortrait = document.querySelector('.focus-portrait-img');

  accordionItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('active')) return;

      accordionItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Trigger cinematic depth zoom pulse on portrait image
      if (focusPortrait) {
        focusPortrait.classList.add('is-zooming');
        setTimeout(() => {
          focusPortrait.classList.remove('is-zooming');
        }, 550);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. HERO DEVICE 3D PARALLAX & LIVING GRADIENT MESH TRACKING
  // --------------------------------------------------------------------------
  const heroDeviceWrapper = document.querySelector('.hero-device-levitate-wrapper');
  const heroGradientBg = document.getElementById('heroGradientBg');

  if (heroDeviceWrapper || heroGradientBg) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let gradX = 0;
    let gradY = 0;

    window.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      mouseX = (e.clientX - innerWidth / 2) / 45;
      mouseY = (e.clientY - innerHeight / 2) / 45;
    }, { passive: true });

    function renderParallax() {
      // Smooth lerp interpolation
      currentX += (mouseX - currentX) * 0.06;
      currentY += (mouseY - currentY) * 0.06;

      if (heroDeviceWrapper) {
        heroDeviceWrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      // Hero gradient drifts in subtle opposing direction for layered optical depth
      if (heroGradientBg) {
        gradX += (-mouseX * 0.75 - gradX) * 0.04;
        gradY += (-mouseY * 0.75 - gradY) * 0.04;
        heroGradientBg.style.transform = `translate3d(calc(-50% + ${gradX}px), calc(-36% + ${gradY}px), 0)`;
      }

      requestAnimationFrame(renderParallax);
    }
    requestAnimationFrame(renderParallax);
  }

  // --------------------------------------------------------------------------
  // 6. 3D REVOLVING CYLINDRICAL CAROUSEL (MOMENTUM & CLICK-TO-CENTER)
  // --------------------------------------------------------------------------
  const stage = document.getElementById('arc3dStage');
  const cards = document.querySelectorAll('.arc-card');
  const wrapper = document.querySelector('.arc-gallery-wrapper');

  if (stage && cards.length && wrapper) {
    const totalCards = cards.length;
    const angleStep = 360 / totalCards;
    
    // Cylindrical radius in 3D perspective
    const cardWidth = 135;
    const radius = Math.round((cardWidth / 2) / Math.tan(Math.PI / totalCards)) + 120; // ~370px

    cards.forEach((card, i) => {
      card.dataset.baseAngle = (i * angleStep).toString();
      card.dataset.index = i.toString();
    });

    let currentRotation = 0;
    let targetRotation = 0;
    let isDragging = false;
    let startX = 0;
    let lastX = 0;
    let startRotation = 0;
    let velocity = 0;
    let autoRotate = true;
    let autoSpeed = 0.22; // smooth baseline rotation

    function updateCarousel() {
      if (autoRotate && !isDragging) {
        // Continuous smooth auto-rotation
        targetRotation -= autoSpeed;
      }

      // Physics drag inertia release
      if (!isDragging && Math.abs(velocity) > 0.01) {
        targetRotation += velocity;
        velocity *= 0.94; // friction decay
      }

      // Smooth Framer Motion spring physics / lerp
      currentRotation += (targetRotation - currentRotation) * 0.085;

      cards.forEach((card, i) => {
        const baseAngle = i * angleStep;
        const totalAngle = (baseAngle + currentRotation) % 360;
        const normalizedAngle = ((totalAngle + 540) % 360) - 180; // range -180 to +180

        // 3D positioning
        card.style.transform = `rotateY(${baseAngle + currentRotation}deg) translateZ(${radius}px)`;

        // Depth lighting, shadows, and z-index ordering
        const absAngle = Math.abs(normalizedAngle);
        if (absAngle < 85) {
          // Front facing cards: full opacity, crisp shadow
          const factor = Math.cos(normalizedAngle * Math.PI / 180);
          card.style.opacity = Math.max(0.65, factor);
          card.style.filter = `brightness(${0.88 + (factor * 0.14)})`;
          card.style.zIndex = Math.round(factor * 10);
        } else {
          // Back cards fade down smoothly
          card.style.opacity = '0.22';
          card.style.filter = 'brightness(0.7)';
          card.style.zIndex = '1';
        }
      });

      requestAnimationFrame(updateCarousel);
    }
    requestAnimationFrame(updateCarousel);

    // Click-to-center: clicking any card smoothly rotates it to the front
    cards.forEach((card, i) => {
      card.addEventListener('click', (e) => {
        if (Math.abs(velocity) > 0.5) return; // Prevent triggering if user was swiping fast
        const baseAngle = i * angleStep;
        // Calculate nearest alignment to 0 degrees facing forward
        const currentMod = currentRotation % 360;
        let delta = - (baseAngle + currentMod);
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        targetRotation = currentRotation + delta;
        velocity = 0;
      });
    });

    // Mouse drag controls with velocity tracking
    wrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      lastX = e.clientX;
      startRotation = targetRotation;
      velocity = 0;
      autoRotate = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      velocity = (e.clientX - lastX) * 0.35;
      lastX = e.clientX;
      targetRotation = startRotation + deltaX * 0.35;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        setTimeout(() => { autoRotate = true; }, 2000);
      }
    });

    // Touch controls for mobile
    wrapper.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      lastX = e.touches[0].clientX;
      startRotation = targetRotation;
      velocity = 0;
      autoRotate = false;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentTouchX = e.touches[0].clientX;
      const deltaX = currentTouchX - startX;
      velocity = (currentTouchX - lastX) * 0.35;
      lastX = currentTouchX;
      targetRotation = startRotation + deltaX * 0.35;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        setTimeout(() => { autoRotate = true; }, 2000);
      }
    });

    // Slow down on hover
    wrapper.addEventListener('mouseenter', () => { autoSpeed = 0.06; });
    wrapper.addEventListener('mouseleave', () => { autoSpeed = 0.22; });
  }

  // --------------------------------------------------------------------------
  // 7. SMOOTH SCROLLING FOR INTERNAL ANCHORS
  // --------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 8. LOGO BADGES MICRO-HOVER
  // --------------------------------------------------------------------------
  const logoBadges = document.querySelectorAll('.logo-badge');
  logoBadges.forEach(badge => {
    badge.addEventListener('mouseenter', () => {
      badge.style.transform = 'translateY(-3px) scale(1.03)';
    });
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = 'translateY(0) scale(1)';
    });
  });

  // --------------------------------------------------------------------------
  // 9. PRICING BILLING FREQUENCY TOGGLE (MONTHLY VS ANNUAL)
  // --------------------------------------------------------------------------
  const billingToggleBtn = document.getElementById('billingToggle');
  const monthlyLabel = document.querySelector('.monthly-label');
  const annualLabel = document.querySelector('.annual-label');
  const priceAmounts = document.querySelectorAll('.price-display .amount');
  const annualNotes = document.querySelectorAll('.billing-annual-note');

  let isAnnual = false;

  function setBillingMode(annual) {
    isAnnual = annual;
    if (billingToggleBtn) {
      billingToggleBtn.classList.toggle('annual', isAnnual);
    }
    if (monthlyLabel && annualLabel) {
      monthlyLabel.classList.toggle('active', !isAnnual);
      annualLabel.classList.toggle('active', isAnnual);
    }

    priceAmounts.forEach(amountEl => {
      const targetVal = isAnnual ? amountEl.dataset.annual : amountEl.dataset.monthly;
      if (targetVal !== undefined) {
        amountEl.style.opacity = '0';
        amountEl.style.transform = 'translateY(-6px)';
        setTimeout(() => {
          amountEl.textContent = targetVal;
          amountEl.style.opacity = '1';
          amountEl.style.transform = 'translateY(0)';
        }, 150);
      }
    });

    annualNotes.forEach(note => {
      note.style.display = isAnnual ? 'block' : 'none';
    });
  }

  if (billingToggleBtn) {
    billingToggleBtn.addEventListener('click', () => {
      setBillingMode(!isAnnual);
    });
  }
  if (monthlyLabel) {
    monthlyLabel.addEventListener('click', () => setBillingMode(false));
  }
  if (annualLabel) {
    annualLabel.addEventListener('click', () => setBillingMode(true));
  }

  // --------------------------------------------------------------------------
  // 10. INTERACTIVE FAQ ACCORDION
  // --------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close other open items for clean single-focus accordion
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherBtn = otherItem.querySelector('.faq-question-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('active', !isActive);
        questionBtn.setAttribute('aria-expanded', (!isActive).toString());
      });
    }
  });

  // --------------------------------------------------------------------------
  // 11. "GET VALI FREE" SMART SCROLL & CARD PULSE HIGHLIGHT (OPTION 4)
  // --------------------------------------------------------------------------
  const getFreeButtons = document.querySelectorAll('.js-get-vali-free, a[href="#pricing"]');
  const starterCard = document.getElementById('plan-starter');
  const starterTooltip = document.getElementById('starterFreeTooltip');

  getFreeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Don't intercept if it's the nav link itself or already in pricing section
      if (btn.classList.contains('nav-link')) return;

      e.preventDefault();

      if (starterCard) {
        starterCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Trigger spring pulse glow
        starterCard.classList.remove('card-pulse-highlight');
        void starterCard.offsetWidth; // Force DOM reflow to re-trigger CSS keyframe
        starterCard.classList.add('card-pulse-highlight');

        if (starterTooltip) {
          starterTooltip.classList.add('show');
          setTimeout(() => {
            starterTooltip.classList.remove('show');
          }, 3600);
        }

        setTimeout(() => {
          starterCard.classList.remove('card-pulse-highlight');
        }, 2600);
      }
    });
  });

});
