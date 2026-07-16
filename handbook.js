/*
 * handbook.js — long-form user-guide engine (companion to deck.js / scroll.js)
 *
 * For documentation pages: builds the table of contents from the h2/h3
 * headings in .hb-content, highlights the section you're reading, and
 * provides full-text search with match highlighting.
 *
 * Usage:
 *   <body class="handbook">
 *     <aside class="hb-sidebar">
 *       <div class="hb-brand"> ...your title... </div>
 *       <nav class="hb-toc"></nav>          <!-- filled automatically -->
 *     </aside>
 *     <main class="hb-main">
 *       <header class="hb-hero"> ... </header>
 *       <div class="hb-content"> h2/h3 + content ... </div>
 *     </main>
 *   <script src="handbook.js"></script>
 *
 * Keys: /  or Ctrl/Cmd+K  focus search | T  show/hide ToC
 *       in search: Enter next match, Shift+Enter previous, Esc clear
 */
(function () {
  'use strict';

  const content = document.querySelector('.hb-content');
  const sidebar = document.querySelector('.hb-sidebar');
  const tocNav = document.querySelector('.hb-toc');
  if (!content || !sidebar || !tocNav) return;

  /* ---------- table of contents from h2/h3 ---------- */

  const headings = Array.from(content.querySelectorAll('h2, h3'));
  const usedIds = {};

  function slugify(text) {
    let s = text.toLowerCase().trim()
      .replace(/[^a-z0-9À-ɏ]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';
    if (usedIds[s]) s += '-' + (++usedIds[s]);
    else usedIds[s] = 1;
    return s;
  }

  const tocList = document.createElement('ul');
  let currentH2Item = null;

  headings.forEach(function (h) {
    if (!h.id) h.id = slugify(h.textContent);
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);

    if (h.tagName === 'H2') {
      tocList.appendChild(li);
      currentH2Item = li;
    } else if (currentH2Item) {
      let sub = currentH2Item.querySelector('ul');
      if (!sub) { sub = document.createElement('ul'); currentH2Item.appendChild(sub); }
      sub.appendChild(li);
    } else {
      tocList.appendChild(li);
    }
  });

  tocNav.appendChild(tocList);
  const tocLinks = Array.from(tocNav.querySelectorAll('a'));

  // close overlay ToC after picking a section on small screens
  tocNav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && window.innerWidth < 900) {
      document.body.classList.add('hb-toc-hidden');
    }
  });

  /* ---------- injected chrome: toggle button + search box ---------- */

  document.body.insertAdjacentHTML('beforeend',
    '<button class="hb-toggle" aria-label="Show or hide table of contents" title="Show/hide contents (T)">&#9776;</button>');
  const toggleBtn = document.querySelector('.hb-toggle');

  sidebar.insertBefore(
    Object.assign(document.createElement('div'), {
      className: 'hb-search',
      innerHTML:
        '<input type="search" placeholder="Search this guide&hellip;" aria-label="Search this guide">' +
        '<div class="hb-search-status" aria-live="polite"></div>'
    }),
    tocNav
  );
  const searchInput = sidebar.querySelector('.hb-search input');
  const searchStatus = sidebar.querySelector('.hb-search-status');

  function toggleToc() {
    document.body.classList.toggle('hb-toc-hidden');
  }
  toggleBtn.addEventListener('click', toggleToc);

  // start collapsed on small screens
  if (window.innerWidth < 900) document.body.classList.add('hb-toc-hidden');

  /* ---------- search with match highlighting ---------- */

  let hits = [];
  let currentHit = -1;

  function clearHits() {
    const parents = new Set();
    document.querySelectorAll('mark.hb-hit').forEach(function (m) {
      parents.add(m.parentNode);
      m.replaceWith(document.createTextNode(m.textContent));
    });
    parents.forEach(function (p) { p.normalize(); });
    hits = [];
    currentHit = -1;
  }

  function updateStatus() {
    if (hits.length === 0) {
      searchStatus.textContent = searchInput.value.trim().length >= 2 ? 'No matches' : '';
    } else {
      searchStatus.textContent =
        (currentHit >= 0 ? (currentHit + 1) + ' of ' : '') + hits.length +
        (hits.length === 1 ? ' match' : ' matches') +
        ' — Enter jumps';
    }
  }

  function doSearch(query) {
    clearHits();
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) { updateStatus(); return; }

    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return node.nodeValue.toLowerCase().includes(needle)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      const text = node.nodeValue;
      const lower = text.toLowerCase();
      const frag = document.createDocumentFragment();
      let pos = 0, idx;
      while ((idx = lower.indexOf(needle, pos)) !== -1) {
        frag.appendChild(document.createTextNode(text.slice(pos, idx)));
        const mark = document.createElement('mark');
        mark.className = 'hb-hit';
        mark.textContent = text.slice(idx, idx + needle.length);
        frag.appendChild(mark);
        hits.push(mark);
        pos = idx + needle.length;
      }
      frag.appendChild(document.createTextNode(text.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });

    updateStatus();
  }

  function jumpTo(i) {
    if (hits.length === 0) return;
    if (currentHit >= 0) hits[currentHit].classList.remove('current');
    currentHit = ((i % hits.length) + hits.length) % hits.length;
    hits[currentHit].classList.add('current');
    hits[currentHit].scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateStatus();
  }

  let debounce = null;
  searchInput.addEventListener('input', function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () { doSearch(searchInput.value); }, 200);
  });

  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      jumpTo(e.shiftKey ? currentHit - 1 : currentHit + 1);
    } else if (e.key === 'Escape') {
      searchInput.value = '';
      clearHits();
      updateStatus();
      searchInput.blur();
    }
  });

  /* ---------- reading position (scrollspy) ---------- */

  let activeLink = null;

  function onScroll() {
    let current = null;
    for (let i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top < window.innerHeight * 0.25) {
        current = headings[i];
      } else break;
    }
    const link = current
      ? tocLinks.find(function (a) { return a.hash === '#' + current.id; })
      : null;
    if (link !== activeLink) {
      if (activeLink) activeLink.classList.remove('active');
      if (link) link.classList.add('active');
      activeLink = link;
    }
  }

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- keyboard ---------- */

  document.addEventListener('keydown', function (e) {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      document.body.classList.remove('hb-toc-hidden');
      searchInput.focus();
      searchInput.select();
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === '/') {
      e.preventDefault();
      document.body.classList.remove('hb-toc-hidden');
      searchInput.focus();
      searchInput.select();
    } else if (e.key === 't' || e.key === 'T') {
      toggleToc();
    }
  });
})();
