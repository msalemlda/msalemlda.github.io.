document.addEventListener('DOMContentLoaded', () => {
  // Navigation State
  let currentPage = 1;
  const totalPages = 22;
  let viewMode = 'catalog'; // 'catalog' or 'scroll'

  // DOM Elements
  const body = document.body;
  const pages = document.querySelectorAll('.portfolio-page');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const currentPageNumSpan = document.getElementById('current-page-num');
  const catalogNav = document.getElementById('catalog-navigation');
  
  const btnCatalogMode = document.getElementById('btn-catalog-mode');
  const btnScrollMode = document.getElementById('btn-scroll-mode');
  const btnPrint = document.getElementById('btn-print');

  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const projectCards = document.querySelectorAll('.project-card');

  const methodSteps = document.querySelectorAll('.method-step');
  const methodProgress = document.getElementById('methodology-progress');
  const chartNodes = document.querySelectorAll('.chart-node');

  // --- CATALOG NAVIGATION ENGINE ---
  function updatePageVisibility() {
    if (viewMode !== 'catalog') return;

    pages.forEach((page, idx) => {
      if (idx === currentPage - 1) {
        page.classList.add('active');
        // Trigger specific page animations
        triggerPageAnimations(currentPage);
      } else {
        page.classList.remove('active');
      }
    });

    // Update controls
    currentPageNumSpan.textContent = currentPage;
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages;
  }

  function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;
    currentPage = pageNum;
    updatePageVisibility();
    
    // Scroll page back to top (useful if content overflowed)
    const activePage = document.querySelector('.portfolio-page.active');
    if (activePage) {
      activePage.scrollTop = 0;
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  // Bind navigation buttons
  btnPrev.addEventListener('click', prevPage);
  btnNext.addEventListener('click', nextPage);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (viewMode === 'catalog') {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      }
    }
  });

  // Touch Navigation (Mobile Swipe Support)
  let touchStartX = 0;
  let touchEndX = 0;

  const pagesContainer = document.getElementById('pages-container');
  pagesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  pagesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50; // pixels
    if (viewMode === 'catalog') {
      if (touchStartX - touchEndX > swipeThreshold) {
        // Swiped Left -> Show next page
        nextPage();
      } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swiped Right -> Show prev page
        prevPage();
      }
    }
  }

  // --- VIEW MODE SWITCHER ---
  btnCatalogMode.addEventListener('click', () => {
    if (viewMode === 'catalog') return;
    viewMode = 'catalog';
    body.classList.remove('mode-scroll');
    body.classList.add('mode-catalog');
    btnScrollMode.classList.remove('active');
    btnCatalogMode.classList.add('active');
    catalogNav.style.display = 'flex';
    
    // Reset pages
    goToPage(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnScrollMode.addEventListener('click', () => {
    if (viewMode === 'scroll') return;
    viewMode = 'scroll';
    body.classList.remove('mode-catalog');
    body.classList.add('mode-scroll');
    btnCatalogMode.classList.remove('active');
    btnScrollMode.classList.add('active');
    catalogNav.style.display = 'none';

    // Remove active visibility overrides from catalog mode
    pages.forEach(page => page.classList.remove('active'));

    // Trigger all progress animations once since we are in continuous view
    animateMethodologyProgress(100);
    animateResourceBars();
  });

  // --- PRINT / SAVE PDF ACTION ---
  btnPrint.addEventListener('click', () => {
    // If in catalog mode, we don't need to change state, print stylesheet handles layout
    window.print();
  });

  // --- INTERACTIVE METHODOLOGY FLOW ---
  function animateMethodologyProgress(targetPercent) {
    if (methodProgress) {
      methodProgress.style.width = `${targetPercent}%`;
    }
    
    methodSteps.forEach((step, idx) => {
      const stepNum = parseInt(step.getAttribute('data-step'));
      const activeThreshold = (stepNum - 1) * 25; // 0, 25, 50, 75, 100
      
      setTimeout(() => {
        if (targetPercent >= activeThreshold) {
          step.classList.add('active');
          if (targetPercent > activeThreshold) {
            step.classList.add('completed');
          } else {
            step.classList.remove('completed');
          }
        } else {
          step.classList.remove('active', 'completed');
        }
      }, idx * 250);
    });
  }

  function triggerPageAnimations(pageNum) {
    // Reset/Trigger methodology flow when showing page 13
    if (pageNum === 13) {
      if (methodProgress) methodProgress.style.width = '0%';
      methodSteps.forEach(s => s.classList.remove('active', 'completed'));
      
      setTimeout(() => {
        animateMethodologyProgress(100);
      }, 400);
    }
    
    // Trigger resources/HR bar graphs when showing page 10
    if (pageNum === 10) {
      animateResourceBars();
    }
  }

  function animateResourceBars() {
    const bars = document.querySelectorAll('.resource-bar-fill');
    bars.forEach(bar => {
      // Get the width from the inline style or property
      const targetWidth = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = targetWidth;
      }, 200);
    });
  }

  // --- INTERACTIVE ORGANOGRAM TOOLTIPS ---
  chartNodes.forEach(node => {
    node.addEventListener('click', () => {
      const roleName = node.querySelector('.node-role').textContent;
      const roleDesc = node.getAttribute('data-desc') || "Profissional integrante da equipa técnica da M. SALEM.";
      
      // Create a modern temporary modal/toast for details
      showModalMessage(roleName, roleDesc);
    });
  });

  function showModalMessage(title, text) {
    // We can reuse the lightbox modal or create a simple custom alert
    lightboxImg.style.display = 'none';
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = text;
    lightboxModal.classList.add('active');
  }

  // --- LIGHTBOX GALLERY SYSTEM ---
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgPath = card.getAttribute('data-img');
      const title = card.getAttribute('data-title');
      const desc = card.getAttribute('data-desc');

      lightboxImg.src = imgPath;
      lightboxImg.style.display = 'block';
      lightboxTitle.textContent = title;
      lightboxDesc.textContent = desc;

      lightboxModal.classList.add('active');
    });
  });

  function closeLightbox() {
    lightboxModal.classList.remove('active');
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal || e.target === lightboxClose) {
      closeLightbox();
    }
  });

  // Initialize
  goToPage(1);
});
