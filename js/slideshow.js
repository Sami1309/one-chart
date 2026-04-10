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
    requestAnimationFrame(() => { modal.style.opacity = '1'; });
  }

  function closeModal() {
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; }, 400);
    localStorage.setItem('allObjects_visited', 'true');
  }

  closeBtn.onclick = closeModal;
  startBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  if (tourBtn) {
    tourBtn.onclick = openModal;
  }

  // Auto-show on first visit
  if (!hasVisited) {
    openModal();
  }
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

