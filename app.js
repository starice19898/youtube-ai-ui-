  // Navigation State
  let navStack = [];
  let currentScreen = 's1';
  let lastQuery = '';

  function showScreen(id, animate) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'flex';
    el.classList.add('active');
    if (animate) {
      el.style.opacity = '0';
      el.style.transform = 'translateX(30px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
        setTimeout(() => {
          el.style.transition = '';
        }, 200);
      });
    }
    const scrollArea = el.querySelector('.scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;
    currentScreen = id;
  }

  function goTo(screenId) {
    navStack.push(currentScreen);
    showScreen(screenId, true);
    if (screenId === 's-search') {
      setTimeout(() => {
        const inp = document.getElementById('s-search-input');
        if (inp) { inp.value = ''; inp.focus(); }
      }, 220);
    }
    if (screenId === 's5') {
      // 헤더에 마지막 검색어 반영 (없으면 기본 텍스트 유지)
      const titleEl = document.querySelector('#s5 .s5-header-title');
      if (titleEl && lastQuery) titleEl.textContent = lastQuery;
      // 영상 처음부터 재생
      const vid = document.querySelector('#s5 .s5-video');
      if (vid) { vid.currentTime = 0; vid.play(); }
    }
  }

  function goBack() {
    if (navStack.length === 0) return;
    const prev = navStack.pop();
    const el = document.getElementById(prev);
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    if (el) {
      el.style.display = 'flex';
      el.classList.add('active');
      el.style.opacity = '0';
      el.style.transform = 'translateX(-20px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
        setTimeout(() => { el.style.transition = ''; }, 200);
      });
    }
    currentScreen = prev;
  }

  // Regular search: navigate from s-search → s2a
  function searchRegular(query) {
    lastQuery = query;
    const el = document.querySelector('#s2a .search-bar-input input');
    if (el) el.value = query;
    // s2a 비디오 카드 제목 동기화
    const cardTitle = document.getElementById('s2a-video-title');
    if (cardTitle && query) cardTitle.textContent = '부산 VS 제주도 여행지 비교';
    // 더보기 pill 텍스트 동기화
    const pillText = document.querySelector('#s2a-more-btn .s2a-pill-text');
    if (pillText && query) pillText.textContent = query + ' 관련 영상 요약';
    goTo('s2a');
  }

  // Chips
  function appendChip(inputId, text) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const current = input.value.trim();
    input.value = current ? current + ' ' + text : text;
    input.focus();
  }

  // Subscribe toggle
  function toggleSubscribe(btn) {
    if (btn.classList.contains('subscribed')) {
      btn.classList.remove('subscribed');
      btn.textContent = '구독';
    } else {
      btn.classList.add('subscribed');
      btn.textContent = '구독중';
    }
  }

  // Toast notification
  function showToast(msg) {
    document.querySelectorAll('.yt-toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'yt-toast';
    toast.textContent = msg;
    document.getElementById('phone-frame').appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
  }

  // Open original video (thumbnail click in s6)
  function openVideo(channelId, title) {
    showToast('원본 영상으로 이동합니다');
    setTimeout(() => {
      window.open('https://www.youtube.com/' + (channelId || ''), '_blank');
    }, 700);
  }

  // Open channel home (channel name click in s6)
  function openChannel(name, channelId) {
    showToast(name + ' 채널 홈으로 이동합니다');
    setTimeout(() => {
      window.open('https://www.youtube.com/' + (channelId || ''), '_blank');
    }, 700);
  }

  // Toggle the 더보기 expandable section in s2a
  function toggleMoreSection(btn) {
    const section = document.getElementById('s2a-more-section');
    if (!section) return;
    if (section.classList.contains('open')) {
      section.classList.remove('open');
      btn.classList.remove('open');
    } else {
      section.classList.add('open');
      btn.classList.add('open');
    }
  }

  // S5 바텀 시트 검색창
  function openS5Search() {
    const overlay = document.getElementById('s5-search-overlay');
    const sheet   = document.getElementById('s5-search-sheet');
    if (!overlay || !sheet) return;
    overlay.classList.add('open');
    sheet.classList.add('open');
    setTimeout(() => {
      const inp = document.getElementById('s5-search-input');
      if (inp) { inp.value = ''; inp.focus(); }
    }, 340);
  }

  function closeS5Search() {
    const overlay = document.getElementById('s5-search-overlay');
    const sheet   = document.getElementById('s5-search-sheet');
    if (!overlay || !sheet) return;
    overlay.classList.remove('open');
    sheet.classList.remove('open');
  }

  function s5SearchSubmit(query) {
    closeS5Search();
    setTimeout(() => searchRegular(query), 180);
  }

  // s6: click delegation — thumbnail → openVideo
  document.getElementById('s6').addEventListener('click', function(e) {
    if (e.target.closest('.subscribe-btn')) return;
    if (e.target.closest('.channel-name')) return;
    const thumb = e.target.closest('.source-thumb');
    if (thumb) {
      const item = thumb.closest('.source-item');
      const channelLink = item ? item.querySelector('.channel-name') : null;
      let channelId = '';
      if (channelLink) {
        const match = channelLink.getAttribute('onclick').match(/'(@[^']+)'/);
        if (match) channelId = match[1];
      }
      openVideo(channelId);
    }
  });

  // S5: 영상 재생 진행률 → 프로그레스 바 동기화
  (function () {
    const vid  = document.querySelector('#s5 .s5-video');
    const fill = document.querySelector('#s5 .s5-progress-fill');
    if (!vid || !fill) return;

    vid.addEventListener('timeupdate', function () {
      if (!vid.duration) return;
      fill.style.width = (vid.currentTime / vid.duration * 100) + '%';
    });

    // 영상이 끝나면 처음으로
    vid.addEventListener('ended', function () {
      fill.style.width = '0%';
    });
  })();

  // Init
  showScreen('s1', false);