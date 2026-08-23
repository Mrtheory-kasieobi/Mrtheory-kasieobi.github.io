const SEARCH_INDEX_URL = "search-index.json";

let globalSearchIndex = null;
let searchIndexLoaded = false;

// Levenshtein distance, capped early for performance on short strings.
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
            dp[j] = a[i - 1] === b[j - 1]
                ? prev
                : 1 + Math.min(prev, dp[j], dp[j - 1]);
            prev = temp;
        }
    }
    return dp[n];
}

function loadSearchIndex() {
    if (searchIndexLoaded && globalSearchIndex) {
        return Promise.resolve(globalSearchIndex);
    }
    
    return fetch(SEARCH_INDEX_URL)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load search-index.json');
            }
            return response.json();
        })
        .then(function(data) {
            globalSearchIndex = data;
            searchIndexLoaded = true;
            return data;
        })
        .catch(function(error) {
            console.warn('Search index failed to load, using fallback');
            return null;
        });
}

function getTokenFields(text) {
    if (!text) return [];
    return text.toLowerCase().split(/[\s\-_.,:()]+/).filter(Boolean);
}

function calculateRelevance(item, query) {
    const queryLower = query.toLowerCase();
    const titleLower = item.title ? item.title.toLowerCase() : '';
    const sectionLower = item.section ? item.section.toLowerCase() : '';
    const contentLower = item.content ? item.content.toLowerCase() : '';
    const descriptionLower = item.description ? item.description.toLowerCase() : '';
    const keywordsLower = item.keywords ? item.keywords.map(k => k.toLowerCase()) : [];
    
    let score = 0;
    
    if (titleLower === queryLower) return 1500 + (item.priority || 100);
    if (titleLower.startsWith(queryLower)) return 1300 + (item.priority || 100);
    if (titleLower.includes(queryLower)) score += 250;
    
    const titleWords = getTokenFields(titleLower);
    if (titleWords.some(w => w.startsWith(queryLower))) score += 500;
    
    if (sectionLower === queryLower) score += 200;
    if (sectionLower.startsWith(queryLower)) score += 150;
    if (sectionLower.includes(queryLower)) score += 100;
    
    if (contentLower) {
        const contentWords = getTokenFields(contentLower);
        const exactWordMatches = contentWords.filter(w => w === queryLower).length;
        score += exactWordMatches * 80;
        
        const containsQuery = contentLower.includes(queryLower);
        if (containsQuery) score += 150;
        
        if (titleWords.some(tw => contentLower.includes(tw + ' ' + queryLower) || contentLower.includes(queryLower + ' ' + tw))) {
            score += 100;
        }
    }
    
    for (const kw of keywordsLower) {
        const kwLower = kw.toLowerCase();
        if (kwLower === queryLower) score += 120;
        if (kwLower.startsWith(queryLower)) score += 100;
        if (kwLower.includes(queryLower)) score += 60;
    }
    
    const titleFuzzy = titleWords.reduce((best, word) => {
        const dist = editDistance(queryLower, word);
        if (dist <= 2) {
            return Math.max(best, 200 - dist * 30);
        }
        return best;
    }, 0);
    score += titleFuzzy;
    
    const contentFuzzy = contentLower ? contentLower.split(/[\s\-_.,:()]+/).reduce((best, word) => {
        const dist = editDistance(queryLower, word);
        if (dist <= 2) {
            return Math.max(best, 100 - dist * 20);
        }
        return best;
    }, 0) : 0;
    score += contentFuzzy;
    
    return score + (item.priority || 0);
}

function extractSnippet(content, query, maxLength) {
    if (!content) return '';
    
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    
    let idx = contentLower.indexOf(queryLower);
    if (idx === -1) {
        idx = 0;
        var preview = content.substring(0, maxLength - 3) + '...';
        return preview;
    }
    
    var start = Math.max(0, idx - Math.floor(maxLength / 3));
    var end = Math.min(content.length, idx + Math.ceil(maxLength * 2 / 3));
    
    if (start > 0) {
        content = '...' + content.substring(start, end);
    }
    if (end < content.length) {
        content = content + '...';
    }
    
    return content;
}

function highlightMatch(text, query) {
    if (!text || !query) return text;
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    let idx = textLower.indexOf(queryLower);
    if (idx === -1) return escapeHtml(text);
    
    const before = escapeHtml(text.substring(0, idx));
    const match = escapeHtml(text.substring(idx, idx + query.length));
    const after = escapeHtml(text.substring(idx + query.length));
    
    return before + '<mark>' + match + '</mark>' + after;
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(c) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c];
    });
}

function formatSectionName(section) {
    if (!section) return 'General';
    
    const sectionMap = {
        'home': 'Home',
        'about': 'About',
        'notes': 'Notes',
        'teaching': 'Teaching',
        'expository writing': 'Expository Writing',
        'olympiad': 'Olympiad',
        'undergraduate': 'Undergraduate',
        'graduate': 'Graduate',
        'research': 'Research',
        'research notebook': 'Research Notebook',
        'track and field': 'Track and Field',
        'contact': 'Contact'
    };
    
    const lower = section.toLowerCase();
    return sectionMap[lower] || section;
}

function initEnhancedSearch(searchInput) {
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

    let activeIndex = 0;
    let debounceTimer = null;
    let currentIndex = 0;

    function closeResults() {
        resultsBox.classList.remove("visible");
        searchInput.setAttribute("aria-expanded", "false");
        activeIndex = 0;
    }

    function setActive(newIndex) {
        const links = resultsBox.querySelectorAll(".search-results__item");
        if (!links.length) return;
        
        links.forEach(function(el) {
            el.classList.remove("is-active");
        });
        
        activeIndex = newIndex;
        currentIndex = newIndex;
        
        if (activeIndex >= links.length) activeIndex = 0;
        if (activeIndex < 0) activeIndex = links.length - 1;
        
        const activeLink = links[activeIndex];
        if (activeLink) {
            activeLink.classList.add("is-active");
            activeLink.scrollIntoView({ block: "nearest" });
            searchInput.setAttribute("aria-activedescendant", activeLink.id);
        }
    }

    function renderResultsForQuery(query, items) {
        if (!items.length) {
            resultsBox.innerHTML = '<div class="search-results__empty">No results found for "' + escapeHtml(query) + '". Try a different mathematical term or phrase.</div>';
            resultsBox.classList.add("visible");
            searchInput.setAttribute("aria-expanded", "true");
            return;
        }
        
        const grouped = {};
        items.forEach(function(item) {
            const page = item.item;
            const section = page.section || 'General';
            if (!grouped[section]) {
                grouped[section] = [];
            }
            grouped[section].push({page: page, score: item._score});
        });
        
        // Sort sections by their highest scoring item
        const sectionKeys = Object.keys(grouped).sort(function(a, b) {
            const maxScoreA = grouped[a].reduce(function(max, item) {
                return Math.max(max, item.score);
            }, 0);
            const maxScoreB = grouped[b].reduce(function(max, item) {
                return Math.max(max, item.score);
            }, 0);
            return maxScoreB - maxScoreA;
        });
        
        var html = '';
        let firstSection = true;
        
        sectionKeys.forEach(function(section) {
            // Sort items within each section by score
            grouped[section].sort(function(a, b) {
                return b.score - a.score;
            });
            
            if (firstSection) {
                html += '<div class="search-results__instruction">Search mathematical content across my website...</div>';
                firstSection = false;
            }
            
            html += '<div class="search-results__section">';
            html += '<div class="search-results__section-header">' + highlightMatch(formatSectionName(section), query) + '</div>';
            
            var totalInSection = grouped[section].length;
            const sectionResults = grouped[section].slice(0, 10);
            sectionResults.forEach(function(result, itemIdx) {
                const item = result.page;
                const excerpt = extractSnippet(item.content || item.description || '', query, 160);
                
                html += '<a class="search-results__item" href="' + item.url + '" id="sr-' + section.replace(/\s+/g, '-') + '-' + itemIdx + '">';
                html += '<strong class="search-results__title">' + highlightMatch(item.title, query) + '</strong>';
                
                if (item.description) {
                    html += '<div class="search-results__excerpt">' + highlightMatch(item.description, query) + '</div>';
                } else if (excerpt) {
                    html += '<div class="search-results__excerpt">' + highlightMatch(excerpt, query) + '</div>';
                }
                
                html += '</a>';
            });
            
            if (totalInSection > 10) {
                html += '<div class="search-results__more">and ' + (totalInSection - 10) + ' more results in this section</div>';
            }
            
            html += '</div>';
        });
        
        resultsBox.innerHTML = html;
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

        debounceTimer = setTimeout(function() {
            loadSearchIndex().then(function(indexData) {
                if (!indexData || !indexData.pages) return;
                
                const allItems = indexData.pages.map(function(page) {
                    const score = calculateRelevance(page, query);
                    if (score <= 0) return null;
                    return {
                        item: page,
                        score: score,
                        _score: score
                    };
                }).filter(function(r) {
                    return r !== null;
                }).sort(function(a, b) {
                    return b.score - a.score || (a.item.title || '').localeCompare(b.item.title || '');
                });

                if (allItems.length === 0) {
                    resultsBox.innerHTML = '<div class="search-results__empty">No results found for "' + escapeHtml(query) + '". Try a different mathematical term or phrase.</div>';
                    resultsBox.classList.add("visible");
                    searchInput.setAttribute("aria-expanded", "true");
                } else {
                    renderResultsForQuery(query, allItems);
                    setActive(0);
                }
            });
        }, 150);
    });

    searchInput.addEventListener("keydown", function(event) {
        const links = resultsBox.querySelectorAll(".search-results__item");
        if (!links.length) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (currentIndex < links.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            setActive(currentIndex);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = links.length - 1;
            }
            setActive(currentIndex);
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (currentIndex >= 0 && currentIndex < links.length) {
                window.location.href = links[currentIndex].href;
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

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("site-search");
    if (searchInput) {
        initEnhancedSearch(searchInput);
    }
});