(function() {
    // 1. Create and inject the CSS styles for the toast/tooltip
    const style = document.createElement('style');
    style.innerHTML = `
        .custom-toast-tooltip {
            position: fixed;
            background-color: var(--input-bg);
            color: var(--accent);
            padding: 8px 12px;
            border-radius: 6px;
            font-family: sans-serif;
            font-size: 12px;
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            max-width: 300px;
            white-space: pre-wrap;
            transform: translate(15px, 15px);
        }
        .custom-toast-tooltip.visible {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // 2. Create the single tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-toast-tooltip';
    document.body.appendChild(tooltip);

    // 3. Variables to track state
    let activeElement = null;

    // 4. Event Listener: Mouse Over (Detects entry)
    document.addEventListener('mouseover', function(e) {
        // Find the closest element with a title or one we've already converted
        const target = e.target.closest('[title], [data-toast-title]');
        
        if (target) {
            // If it still has a native title attribute, swap it
            if (target.hasAttribute('title')) {
                const text = target.getAttribute('title');
                if (text) {
                    target.setAttribute('data-toast-title', text);
                    target.removeAttribute('title'); // Remove native tooltip
                }
            }

            // Get the text to display
            const text = target.getAttribute('data-toast-title');
            
            if (text) {
                activeElement = target;
                tooltip.textContent = text;
                tooltip.classList.add('visible');
            }
        }
    });

    // 5. Event Listener: Mouse Move (Follows cursor)
    document.addEventListener('mousemove', function(e) {
        if (tooltip.classList.contains('visible')) {
            // Keep tooltip within viewport bounds (Optional logic)
            const x = e.clientX;
            const y = e.clientY;
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        }
    });

    // 6. Event Listener: Mouse Out (Hides tooltip)
    document.addEventListener('mouseout', function(e) {
        const target = e.target.closest('[data-toast-title]');
        
        // Only hide if we are leaving the active element
        if (target && target === activeElement) {
            tooltip.classList.remove('visible');
            activeElement = null;
        }
    });

})();



