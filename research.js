const SITE_VERSION = "1.0";

class ResearchPage {
  constructor() {
    this.publications = [];
    this.notes = [];
    this.init();
  }

  init() {
    this.initSiteFooter();
    this.initNavHighlights();
    this.initPublicationFilter();
    this.initNotesSearch();
    this.initNotesFilter();
    this.initSmoothScrolling();
  }

  initSiteFooter() {
    document.querySelectorAll("[data-site-version]").forEach(el => {
      el.textContent = "v" + SITE_VERSION;
      el.setAttribute("title", "Site version " + SITE_VERSION);
      el.setAttribute("aria-label", "Site version " + SITE_VERSION);
    });
  }

  initNavHighlights() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href === currentPath || (href === "index.html" && currentPath === "")) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  initPublicationFilter() {
    const filterToggle = document.getElementById("pub-filter-toggle");
    const filters = document.getElementById("pub-filters");
    const filterButtons = document.querySelectorAll(".pub-filter-btn");
    const publications = document.querySelectorAll(".publication-card");
    const countEl = document.getElementById("pub-count");

    if (!filters) return;

    filterToggle?.addEventListener("click", () => {
      const isExpanded = filterToggle.getAttribute("aria-expanded") === "true";
      filterToggle.setAttribute("aria-expanded", !isExpanded);
      filters.hidden = isExpanded;
      filterToggle.querySelector("span")?.textContent = isExpanded ? "Filter Publications" : "Close Filter";
    });

    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        publications.forEach(pub => {
          const category = pub.dataset.category;
          if (filter === "all" || category === filter) {
            pub.style.display = "block";
            pub.setAttribute("aria-hidden", "false");
          } else {
            pub.style.display = "none";
            pub.setAttribute("aria-hidden", "true");
          }
        });

        this.updatePublicationCount();
      });
    });

    this.updatePublicationCount();
  }

  updatePublicationCount() {
    const countEl = document.getElementById("pub-count");
    const visiblePubs = document.querySelectorAll(".publication-card:not([style*='display: none'])").length;
    if (countEl) {
      countEl.querySelector(".count-value").textContent = visiblePubs;
    }
  }

  initNotesSearch() {
    const searchInput = document.getElementById("notes-search");
    const notesGrid = document.getElementById("notes-grid");
    
    if (!searchInput || !notesGrid) return;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const notes = notesGrid.querySelectorAll(".note-card");

      notes.forEach(note => {
        const title = note.querySelector(".note-title")?.textContent.toLowerCase() || "";
        const summary = note.querySelector(".note-summary")?.textContent.toLowerCase() || "";
        const tags = note.querySelector(".note-tags")?.textContent.toLowerCase() || "";
        const date = note.querySelector(".note-date")?.textContent.toLowerCase() || "";

        const matches = query === "" || 
          title.includes(query) || 
          summary.includes(query) || 
          tags.includes(query) ||
          date.includes(query);

        note.style.display = matches ? "block" : "none";
        note.setAttribute("aria-hidden", !matches);
      });

      this.updateNotesCount();
    });
  }

  initNotesFilter() {
    const categorySelect = document.getElementById("notes-category-filter");
    const notesGrid = document.getElementById("notes-grid");
    
    if (!categorySelect || !notesGrid) return;

    categorySelect.addEventListener("change", (e) => {
      const category = e.target.value;
      const notes = notesGrid.querySelectorAll(".note-card");

      notes.forEach(note => {
        const noteCategory = note.dataset.category;
        const tags = note.dataset.tags || "";

        const matches = category === "all" || 
          noteCategory === category || 
          tags.includes(category);

        note.style.display = matches ? "block" : "none";
        note.setAttribute("aria-hidden", !matches);
      });

      this.updateNotesCount();
    });
  }

  updateNotesCount() {
    const countEl = document.getElementById("notes-count");
    const visibleNotes = document.querySelectorAll(".note-card:not([style*='display: none'])").length;
    if (countEl) {
      countEl.querySelector(".count-value").textContent = visibleNotes;
    }
  }

  initSmoothScrolling() {
    const navLinks = document.querySelectorAll("nav a[href^='#']");
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          history.pushState({}, '', window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + targetId);
        }
      });
    });
  }
}

function initResearchSearch() {
  const searchInput = document.getElementById('site-search');
  if (!searchInput) return;

  const searchableItems = [
    { label: "Home", url: "index.html", keywords: ["home", "welcome", "about"] },
    { label: "About me", url: "about.html", keywords: ["about", "bio", "background"] },
    { label: "Notes", url: "notes.html", keywords: ["notes", "mathematics", "theory"] },
    { label: "Teaching", url: "teaching.html", keywords: ["teaching", "lessons", "education"] },
    { label: "Research", url: "research.html", keywords: ["research", "interests", "projects", "publications", "notes"] },
    { label: "Track and field", url: "Track.html", keywords: ["track", "field", "athletics", "sprint"] },
    { label: "Contact", url: "contact.html", keywords: ["contact", "email", "reach"] }
  ];

  const resultsBox = document.createElement("div");
  resultsBox.className = "search-results";
  resultsBox.setAttribute("role", "listbox");
  searchInput.setAttribute("role", "combobox");
  searchInput.setAttribute("aria-expanded", "false");
  searchInput.setAttribute("aria-autocomplete", "list");
  searchInput.setAttribute("aria-controls", "site-search-results");
  resultsBox.id = "site-search-results";
  searchInput.parentElement.style.position = "relative";
  searchInput.parentElement.appendChild(resultsBox);

  const index = searchableItems.map((item, i) => ({
    item,
    id: "search-result-" + i,
    labelLower: item.label.toLowerCase(),
    wordsLower: item.label.toLowerCase().split(/[\s\-\/]+/).filter(Boolean),
    keywordsLower: item.keywords.map(k => k.toLowerCase())
  }));

  let activeIndex = -1;
  let currentResults = [];
  let debounceTimer = null;

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function editDistance(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 3) return Infinity;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const temp = dp[j];
        dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
        prev = temp;
      }
    }
    return dp[n];
  }

  function isSubsequence(query, text) {
    let qi = 0;
    for (let i = 0; i < text.length && qi < query.length; i++) {
      if (text[i] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  function fuzzyScore(query, words) {
    let best = 0;
    for (const word of words) {
      if (!word) continue;
      const maxAllowed = query.length <= 4 ? 1 : query.length <= 7 ? 2 : 3;
      const dist = editDistance(query, word.slice(0, query.length + maxAllowed));
      if (dist <= maxAllowed) {
        const closeness = 1 - dist / Math.max(query.length, word.length);
        best = Math.max(best, 200 * closeness);
      } else if (isSubsequence(query, word)) {
        best = Math.max(best, 120);
      }
    }
    return best;
  }

  function scoreItem(entry, query) {
    const { labelLower, wordsLower, keywordsLower } = entry;

    if (labelLower === query) return 1200;
    if (labelLower.startsWith(query)) return 1000;

    for (const word of wordsLower) {
      if (word.startsWith(query)) return 850;
    }

    for (const kw of keywordsLower) {
      if (kw.startsWith(query)) return 800;
      const kwWords = kw.split(/[\s\-\/]+/);
      for (const w of kwWords) {
        if (w.startsWith(query)) return 750;
      }
    }

    if (labelLower.includes(query)) return 550;

    for (const kw of keywordsLower) {
      if (kw.includes(query)) return 450;
    }

    const labelFuzzy = fuzzyScore(query, wordsLower);
    if (labelFuzzy > 0) return labelFuzzy;

    const keywordFuzzy = fuzzyScore(query, keywordsLower.flatMap(k => k.split(/[\s\-\/]+/)));
    if (keywordFuzzy > 0) return keywordFuzzy * 0.8;

    return 0;
  }

  function highlightLabel(label, query) {
    const labelLower = label.toLowerCase();
    const idx = labelLower.indexOf(query);
    if (idx === -1) return escapeHtml(label);
    return (
      escapeHtml(label.slice(0, idx)) +
      "<mark>" + escapeHtml(label.slice(idx, idx + query.length)) + "</mark>" +
      escapeHtml(label.slice(idx + query.length))
    );
  }

  function closeResults() {
    resultsBox.classList.remove("visible");
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
    activeIndex = -1;
    currentResults = [];
  }

  function setActive(newIndex) {
    const links = resultsBox.querySelectorAll(".search-results__item");
    if (!links.length) return;
    links.forEach(el => el.classList.remove("is-active"));
    activeIndex = ((newIndex % links.length) + links.length) % links.length;
    const activeLink = links[activeIndex];
    activeLink.classList.add("is-active");
    activeLink.scrollIntoView({ block: "nearest" });
    searchInput.setAttribute("aria-activedescendant", activeLink.id);
  }

  function renderResults(query) {
    const scored = index
      .map(entry => ({ entry, score: scoreItem(entry, query) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.labelLower.localeCompare(b.entry.labelLower));

    currentResults = scored;
    activeIndex = -1;

    if (!scored.length) {
      resultsBox.innerHTML = '<div class="search-results__empty">No results found for "' + escapeHtml(query) + '".</div>';
      resultsBox.classList.add("visible");
      searchInput.setAttribute("aria-expanded", "true");
      searchInput.removeAttribute("aria-activedescendant");
      return;
    }

    const topResults = scored.slice(0, 12);
    resultsBox.innerHTML = topResults.map(({ entry }) => `
      <a class="search-results__item" id="${entry.id}" role="option" href="${entry.item.url}">
        <strong>${highlightLabel(entry.item.label, query)}</strong>
      </a>
    `).join("");
    resultsBox.classList.add("visible");
    searchInput.setAttribute("aria-expanded", "true");
  }

  searchInput.addEventListener("input", function() {
    const query = this.value.trim().toLowerCase();
    clearTimeout(debounceTimer);

    if (!query) {
      resultsBox.innerHTML = "";
      closeResults();
      return;
    }

    debounceTimer = setTimeout(() => renderResults(query), 16);
  });

  searchInput.addEventListener("keydown", function(event) {
    const isOpen = resultsBox.classList.contains("visible") && currentResults.length;

    if (event.key === "ArrowDown") {
      if (!isOpen) return;
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      if (!isOpen) return;
      event.preventDefault();
      setActive(activeIndex - 1);
    } else if (event.key === "Enter") {
      if (isOpen && activeIndex >= 0) {
        event.preventDefault();
        window.location.href = currentResults[activeIndex].entry.item.url;
      } else if (isOpen) {
        event.preventDefault();
        window.location.href = currentResults[0].entry.item.url;
      }
    } else if (event.key === "Escape") {
      closeResults();
      this.blur();
    }
  });

  searchInput.addEventListener("focus", function() {
    if (this.value.trim() && resultsBox.innerHTML) {
      resultsBox.classList.add("visible");
    }
  });

  document.addEventListener("click", function(event) {
    if (!searchInput.parentElement.contains(event.target)) {
      closeResults();
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  if (document.body.classList.contains("research-page")) {
    new ResearchPage();
    initResearchSearch();
  }
});