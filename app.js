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
      if (window.innerWidth <= 768) return; // Disable tilt on mobile so cards never bleed off-screen
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
  // 5. HERO DEVICE 3D PARALLAX TRACKING
  // --------------------------------------------------------------------------
  const heroDeviceWrapper = document.querySelector('.hero-device-levitate-wrapper');

  if (heroDeviceWrapper) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      mouseX = (e.clientX - innerWidth / 2) / 45;
      mouseY = (e.clientY - innerHeight / 2) / 45;
    }, { passive: true });

    function renderParallax() {
      currentX += (mouseX - currentX) * 0.06;
      currentY += (mouseY - currentY) * 0.06;

      heroDeviceWrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(renderParallax);
    }
    requestAnimationFrame(renderParallax);
  }

  // --------------------------------------------------------------------------
  // HERO CHAT ANIMATION LOOP
  // --------------------------------------------------------------------------
  const heroChatContainer = document.getElementById('heroChatContainer');
  if (heroChatContainer) {
    const replayChat = () => {
      const step1 = heroChatContainer.querySelector('.chat-step-1');
      const step2 = heroChatContainer.querySelector('.chat-step-2');
      const stepTyping = heroChatContainer.querySelector('.chat-step-typing');
      const step3 = heroChatContainer.querySelector('.chat-step-3');

      [step1, step2, stepTyping, step3].forEach(el => {
        if (el) {
          el.style.animation = 'none';
          void el.offsetHeight; // trigger reflow
        }
      });

      if (step1) step1.style.animation = 'chatBubblePop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both';
      if (step2) step2.style.animation = 'chatBubblePop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 1.5s both';
      if (stepTyping) stepTyping.style.animation = 'typingIndicatorFlow 1.6s ease 2.3s both';
      if (step3) step3.style.animation = 'chatBubblePop 0.55s cubic-bezier(0.16, 1, 0.3, 1) 3.8s both';
    };

    setInterval(replayChat, 9500);
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
    
    // Cylindrical radius in 3D perspective (dynamic based on viewport)
    function getRadius() {
      const isMobile = window.innerWidth <= 640;
      const isTablet = window.innerWidth <= 992;
      const cardW = isMobile ? 82 : (isTablet ? 105 : 135);
      const extraPad = isMobile ? 50 : (isTablet ? 80 : 120);
      return Math.round((cardW / 2) / Math.tan(Math.PI / totalCards)) + extraPad;
    }

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

      const radius = getRadius();

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
  let currentModalPlanKey = 'pro';

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

    if (typeof updateModalPlan === 'function') {
      updateModalPlan(currentModalPlanKey);
    }
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

  // --------------------------------------------------------------------------
  // 12. JOIN EMAIL LIST MODAL HANDLER
  // --------------------------------------------------------------------------
  const openEmailModalBtns = document.querySelectorAll('.js-open-email-modal');
  const emailModal = document.getElementById('emailListModal');
  const closeEmailModalBtn = document.getElementById('closeEmailModal');
  const emailForm = document.getElementById('emailListForm');
  const emailInput = document.getElementById('emailInput');
  const emailSuccessMessage = document.getElementById('emailSuccessMessage');

  if (emailModal) {
    const openModal = () => {
      emailModal.classList.add('active');
      emailModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (emailInput) setTimeout(() => emailInput.focus(), 150);
    };

    const closeModal = () => {
      emailModal.classList.remove('active');
      emailModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (emailSuccessMessage) {
        setTimeout(() => {
          emailSuccessMessage.style.display = 'none';
          if (emailForm) {
            emailForm.style.display = 'block';
            emailForm.reset();
          }
        }, 300);
      }
    };

    openEmailModalBtns.forEach(btn => btn.addEventListener('click', openModal));
    if (closeEmailModalBtn) closeEmailModalBtn.addEventListener('click', closeModal);

    emailModal.addEventListener('click', (e) => {
      if (e.target === emailModal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && emailModal.classList.contains('active')) {
        closeModal();
      }
    });

    if (emailForm) {
      emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailVal = emailInput ? emailInput.value.trim() : '';
        if (emailVal && emailVal.includes('@')) {
          emailForm.style.display = 'none';
          if (emailSuccessMessage) {
            emailSuccessMessage.style.display = 'flex';
          }
          setTimeout(() => {
            closeModal();
          }, 3200);
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // 13. MOBILE HAMBURGER MENU TOGGLE
  // --------------------------------------------------------------------------
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNavMenu = document.getElementById('mobileNavMenu');

  if (mobileMenuToggle && mobileNavMenu) {
    const toggleMenu = (e) => {
      e.stopPropagation();
      const isOpen = mobileNavMenu.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
      mobileMenuToggle.setAttribute('aria-expanded', isOpen.toString());
      mobileNavMenu.setAttribute('aria-hidden', (!isOpen).toString());
    };

    mobileMenuToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking any mobile link
    const mobileLinks = mobileNavMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileNavMenu.setAttribute('aria-hidden', 'true');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenuToggle.contains(e.target) && !mobileNavMenu.contains(e.target)) {
        if (mobileNavMenu.classList.contains('active')) {
          mobileNavMenu.classList.remove('active');
          mobileMenuToggle.classList.remove('active');
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
          mobileNavMenu.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 14. PLAN CHECKOUT & TRIAL ACTIVATION MODAL
  // --------------------------------------------------------------------------
  const planCheckoutModal = document.getElementById('planCheckoutModal');
  const closeCheckoutModal = document.getElementById('closeCheckoutModal');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutEmailInput = document.getElementById('checkoutEmailInput');
  const checkoutSuccessView = document.getElementById('checkoutSuccessView');
  const confirmedEmail = document.getElementById('confirmedEmail');
  const modalPlanName = document.getElementById('modalPlanName');
  const modalPlanPrice = document.getElementById('modalPlanPrice');
  const modalPlanFeatures = document.getElementById('modalPlanFeatures');
  const modalSubmitBtn = document.getElementById('modalSubmitBtn');
  const checkoutTabs = document.querySelectorAll('.checkout-tab-btn');
  const checkoutTriggers = document.querySelectorAll('.js-open-checkout');

  const planDetails = {
    starter: {
      name: 'Starter',
      price: '$0 / forever',
      features: [
        'Full access to essential day planning',
        'Up to 3 calendar connections',
        'Native Mac & iPhone apps with offline mode'
      ],
      buttonText: 'Start Free with Starter'
    },
    pro: {
      name: 'Vali Pro',
      price: '$12 / mo',
      annualPrice: '$9 / mo (billed annually)',
      features: [
        'Full 14-day unrestricted trial',
        'Unlimited calendar sync & AI dynamic rescheduling',
        'Distraction-Free Focus Shield & ambient soundscapes'
      ],
      buttonText: 'Start 14-Day Free Trial'
    },
    teams: {
      name: 'Vali Teams',
      price: '$24 / user / mo',
      annualPrice: '$19 / user / mo (billed annually)',
      features: [
        '14-day squad trial for up to 10 seats',
        'Shared schedule transparency & team focus rooms',
        'Centralized billing, SAML SSO & dedicated support'
      ],
      buttonText: 'Start Free Teams Trial'
    }
  };

  function updateModalPlan(planKey) {
    if (planKey) currentModalPlanKey = planKey;
    const plan = planDetails[currentModalPlanKey] || planDetails.pro;

    const modalHeadline = document.getElementById('checkoutModalHeadline');
    if (modalHeadline) modalHeadline.textContent = `Activate ${plan.name}`;
    if (modalPlanName) modalPlanName.textContent = plan.name;
    if (modalPlanPrice) {
      modalPlanPrice.textContent = (isAnnual && plan.annualPrice) ? plan.annualPrice : plan.price;
    }

    const modalBillingBadge = document.getElementById('modalBillingBadge');
    if (modalBillingBadge) {
      modalBillingBadge.style.display = (isAnnual && currentModalPlanKey !== 'starter') ? 'inline-block' : 'none';
    }

    const tabPro = document.getElementById('tabPro');
    const tabTeams = document.getElementById('tabTeams');
    if (tabPro) tabPro.textContent = isAnnual ? 'Vali Pro ($9/mo)' : 'Vali Pro ($12/mo)';
    if (tabTeams) tabTeams.textContent = isAnnual ? 'Vali Teams ($19/mo)' : 'Vali Teams ($24/mo)';

    if (modalPlanFeatures && plan.features) {
      modalPlanFeatures.innerHTML = plan.features.map(f => `
        <li>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${f}</span>
        </li>
      `).join('');
    }

    if (modalSubmitBtn) {
      const span = modalSubmitBtn.querySelector('span');
      if (span) span.textContent = plan.buttonText;
    }

    checkoutTabs.forEach(tab => {
      if (tab.dataset.plan === currentModalPlanKey) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  function openCheckout(preferredPlan = 'pro') {
    if (!planCheckoutModal) return;
    updateModalPlan(preferredPlan);
    if (checkoutForm) checkoutForm.style.display = 'flex';
    if (checkoutSuccessView) checkoutSuccessView.style.display = 'none';
    if (checkoutEmailInput) checkoutEmailInput.value = '';

    planCheckoutModal.classList.add('active');
    planCheckoutModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (checkoutEmailInput) checkoutEmailInput.focus();
    }, 120);
  }

  const closeCheckout = () => {
    if (!planCheckoutModal) return;
    planCheckoutModal.classList.remove('active');
    planCheckoutModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  checkoutTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.dataset.plan || 'pro';
      openCheckout(plan);
    });
  });

  checkoutTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const plan = tab.dataset.plan || 'pro';
      updateModalPlan(plan);
    });
  });

  if (closeCheckoutModal) {
    closeCheckoutModal.addEventListener('click', closeCheckout);
  }

  if (planCheckoutModal) {
    planCheckoutModal.addEventListener('click', (e) => {
      if (e.target === planCheckoutModal) {
        closeCheckout();
      }
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = checkoutEmailInput ? checkoutEmailInput.value.trim() : '';
      if (email && email.includes('@')) {
        checkoutForm.style.display = 'none';
        if (confirmedEmail) confirmedEmail.textContent = email;
        if (checkoutSuccessView) checkoutSuccessView.style.display = 'flex';
        setTimeout(() => {
          closeCheckout();
        }, 3600);
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && planCheckoutModal && planCheckoutModal.classList.contains('active')) {
      closeCheckout();
    }
  });

});
