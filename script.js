const fs = require('fs');
const { JSDOM } = require('jsdom');

async function processWebsite(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // WCAG Fixes
        removeOrientationAttributes(document);
        addAutocompleteAttributes(document);
        addRoleAttributes(document);
        modifyMetaForTextResizing(document);
        modifyCSSForReflow(document);
        addLabelToTitleAttribute(document);
        modifyFocusCSS(document);
        addLanguageAttribute(document);
        modifyLanguagePartsAttribute(document);
        disableTimerCountdown(document);
        addOpensInNewTabText(document);
        addAriaRequiredToInputs(document);
        addParsingIdAttribute(document);

        const issues = findFocusVisibleIssues(document);
        applyFocusVisibleFixes(issues);

        const fixedHTML = dom.serialize();

        fs.writeFileSync('fixed_output.html', fixedHTML);
        console.log('✅ The fixed HTML has been saved to "fixed_output.html"');

    } catch (error) {
        console.error('❌ Error processing the website:', error);
    }
}

// Remove orientation related attributes (WCAG 1.3.4)
function removeOrientationAttributes(document) {
    document.querySelectorAll('[orientation]').forEach(el => el.removeAttribute('orientation'));
}

// Add or change autocomplete attribute (WCAG 1.3.5)
function addAutocompleteAttributes(document) {
    document.querySelectorAll('input').forEach(el => {
        if (!el.hasAttribute('autocomplete')) {
            el.setAttribute('autocomplete', 'on');
        }
    });
}

// Add or change role attribute (WCAG 1.3.6)
function addRoleAttributes(document) {
    document.querySelectorAll('div').forEach(el => {
        if (el.id && !el.hasAttribute('role')) {
            el.setAttribute('role', 'region');
        }
    });
}

// Modify <meta> for text resizing (WCAG 1.4.4, 1.4.10)
function modifyMetaForTextResizing(document) {
    const metaTag = document.querySelector('meta[name="viewport"]');
    if (metaTag) {
        metaTag.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes');
    }
}

// Modify CSS for content reflow (WCAG 1.4.10)
function modifyCSSForReflow(document) {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        body { font-size: 100%; }
        .row { display: flex; flex-wrap: wrap; }
        .col { flex: 1; }
    `;
    document.head.appendChild(styleTag);
}

// Add title to labels (WCAG 3.3.2)
function addLabelToTitleAttribute(document) {
    document.querySelectorAll('label').forEach(el => {
        if (!el.hasAttribute('title')) {
            el.setAttribute('title', el.textContent);
        }
    });
}

// Modify CSS for focus visibility (WCAG 2.4.7, 1.4.11)
function modifyFocusCSS(document) {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        a:focus, button:focus, input:focus, select:focus, textarea:focus {
            outline: 2px solid #00f;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(styleTag);
}

// Add language attribute (WCAG 3.1.1)
function addLanguageAttribute(document) {
    if (!document.documentElement.hasAttribute('lang')) {
        document.documentElement.setAttribute('lang', 'en');
    }
}

// Add language attribute to parts (WCAG 3.1.2)
function modifyLanguagePartsAttribute(document) {
    document.querySelectorAll('[lang]').forEach(el => {
        if (!el.hasAttribute('lang')) {
            el.setAttribute('lang', 'en');
        }
    });
}

// Disable timer countdown (WCAG 2.2.1)
function disableTimerCountdown(document) {
    document.querySelectorAll('[role="timer"]').forEach(el => {
        el.setAttribute('aria-live', 'off');
    });
}

// Add "opens in a new tab" text to links (WCAG 3.2.5)
function addOpensInNewTabText(document) {
    document.querySelectorAll('a[target="_blank"]').forEach(el => {
        el.setAttribute('title', 'Opens in a new tab');
    });
}

// Add aria-required true to input fields with "*" or "required" (WCAG 3.3.2)
function addAriaRequiredToInputs(document) {
    document.querySelectorAll('label').forEach(el => {
        if (el.textContent.includes('*') || el.textContent.includes('required')) {
            const input = el.nextElementSibling;
            if (input && input.tagName === 'INPUT') {
                input.setAttribute('aria-required', 'true');
            }
        }
    });
}

// Generate new id for elements with no id (WCAG 4.1.1)
function addParsingIdAttribute(document) {
    document.querySelectorAll('[id]').forEach(el => {
        if (!el.id) {
            el.id = `generated-id-${Math.random().toString(36).substr(2, 9)}`;
        }
    });
}

// Find focus-visible issues (WCAG 2.4.7)
function findFocusVisibleIssues(document) {
    const issues = [];
    document.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(el => {
        const computedStyle = el.ownerDocument.defaultView.getComputedStyle(el);
        const outlineStyle = computedStyle.outlineStyle;
        if (!outlineStyle || outlineStyle === 'none') {
            issues.push(el);
        }
    });
    return issues;
}

// Apply fixes for focus-visible issues
function applyFocusVisibleFixes(issues) {
    issues.forEach(el => {
        el.style.outline = '2px solid #00f';
        el.style.outlineOffset = '2px';
        el.title = 'Focus visible fix applied';
    });
}

const filePath = './test.html';
processWebsite(filePath);
