/**
 * content-loader.js
 * 
 * Injects text content from content.json into HTML pages.
 * Elements with data-content attributes are populated with
 * the corresponding values from content.json.
 * 
 * This allows editing text via editor.html without touching
 * HTML structure, CSS, or any styling.
 */

(function() {
    'use strict';

    // Cache for loaded content
    let contentCache = null;

    /**
     * Get a nested value from an object using a dot-separated path.
     * e.g. getNested(obj, "index.paragraphs.0") returns obj.index.paragraphs[0]
     */
    function getNested(obj, path) {
        return path.split('.').reduce(function(current, key) {
            if (current === null || current === undefined) return null;
            // Handle array indices
            if (Array.isArray(current)) {
                const idx = parseInt(key, 10);
                return current[idx];
            }
            return current[key];
        }, obj);
    }

    /**
     * Load content from content.json
     */
    function loadContent() {
        if (contentCache) {
            return Promise.resolve(contentCache);
        }

        return fetch('content.json')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load content.json');
                }
                return response.json();
            })
            .then(function(data) {
                contentCache = data;
                return data;
            })
            .catch(function() {
                // If content.json fails to load, silently fall back
                // to the hardcoded text in the HTML
                console.warn('content-loader: Could not load content.json, using hardcoded text.');
                return null;
            });
    }

    /**
     * Inject content into all elements with data-content attributes
     */
    function injectContent(content) {
        if (!content) return;

        var elements = document.querySelectorAll('[data-content]');
        elements.forEach(function(el) {
            var path = el.getAttribute('data-content');
            var value = getNested(content, path);
            
            if (value !== null && value !== undefined) {
                // Only replace text content, not HTML structure
                el.textContent = value;
            }
        });
    }

    /**
     * Initialize the content loader
     */
    function init() {
        loadContent().then(function(content) {
            injectContent(content);
        });
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();