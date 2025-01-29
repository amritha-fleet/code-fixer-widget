const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');
const fs = require('fs');

async function processWebsite(url) {
    try {
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        
        await page.goto(url, { waitUntil: 'domcontentloaded' });

      
        const html = await page.content();

        
        await browser.close();

       
        const dom = new JSDOM(html);
        const document = dom.window.document;

        
        removeOrientationAttributes(document);
        addAutocompleteAttributes(document);
        addRoleAttributes(document);
        modifyMetaForTextResizing(document);
        modifyCSSForReflow(document);
        addLabelToTitleAttribute(document);
        modifyFocusCSS(document);
        addLanguageAttribute(document);
        const issues = findFocusVisibleIssues(document);
        applyFocusVisibleFixes(issues);

        
        const fixedHTML = dom.serialize();

        
        fs.writeFileSync('fixed_output.html', fixedHTML);
        console.log('✅ The fixed HTML has been saved to "fixed_output.html"');

    } catch (error) {
        console.error('❌ Error processing the website:', error);
    }
}


function removeOrientationAttributes(document) {
    document.querySelectorAll('[orientation]').forEach(el => el.removeAttribute('orientation'));
}

function addAutocompleteAttributes(document) {
    document.querySelectorAll('input').forEach(el => {
        if (!el.hasAttribute('autocomplete')) {
            el.setAttribute('autocomplete', 'on');
        }
    });
}

function addRoleAttributes(document) {
    document.querySelectorAll('div').forEach(el => {
        if (el.id && !el.hasAttribute('role')) {
            el.setAttribute('role', 'region');
        }
    });
}

function modifyMetaForTextResizing(document) {
    const metaTag = document.querySelector('meta[name="viewport"]');
    if (metaTag) {
        metaTag.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes');
    }
}

function modifyCSSForReflow(document) {
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        body { font-size: 100%; }
        .row { display: flex; flex-wrap: wrap; }
        .col { flex: 1; }
    `;
    document.head.appendChild(styleTag);
}

function addLabelToTitleAttribute(document) {
    document.querySelectorAll('label').forEach(el => {
        if (!el.hasAttribute('title')) {
            el.setAttribute('title', el.textContent);
        }
    });
}

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

function addLanguageAttribute(document) {
    if (!document.documentElement.hasAttribute('lang')) {
        document.documentElement.setAttribute('lang', 'en');
    }
}

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

function applyFocusVisibleFixes(issues) {
    issues.forEach(el => {
        el.style.outline = '2px solid #00f';
        el.style.outlineOffset = '2px';
        el.title = 'Focus visible fix applied';
    });
}


const url = 'https://test.wallyax.com/';
processWebsite(url);
