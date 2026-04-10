// ============================================================
// INFO MODAL
// ============================================================
function initInfoModal() {
  const hasVisited = localStorage.getItem('allObjects_visited');

  const modal = document.getElementById('info-modal');
  const closeBtn = document.getElementById('info-close');
  const startBtn = document.getElementById('info-start');
  const tourBtn = document.getElementById('tour-btn');

  function openModal() {
    modal.style.display = 'flex';
    modal.style.opacity = '1';
  }

  function closeModal() {
    modal.classList.remove('modal-animate');
    // Hide card instantly
    modal.querySelector(':scope > div').style.display = 'none';
    // Fade out backdrop blur
    modal.style.transition = 'opacity 0.18s ease-out';
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
      modal.style.transition = '';
      modal.style.opacity = '';
      modal.querySelector(':scope > div').style.display = '';
    }, 190);
    localStorage.setItem('allObjects_visited', 'true');
  }

  closeBtn.onclick = closeModal;
  startBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  if (tourBtn) {
    tourBtn.onclick = openModal;
  }

  // For first visit, the modal is already visible via HTML defaults.
  // No need to call openModal() — it's only needed for the tour button.
}

function zoomToRegion(x0, x1, y0, y1, duration) {
  const xScale = App.width / (makeX()(x1) - makeX()(x0));
  const yScale = App.height / (makeY()(y0) - makeY()(y1));
  const k = Math.min(xScale, yScale) * 0.9;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const tx = App.width / 2 - makeX()(cx) * k;
  const ty = App.height / 2 - makeY()(cy) * k;
  const transform = d3.zoomIdentity.translate(tx, ty).scale(k);
  if (duration > 0) {
    App.svg.transition().duration(duration).call(App.zoom.transform, transform);
  } else {
    App.svg.call(App.zoom.transform, transform);
  }
}

