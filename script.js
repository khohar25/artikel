/* ==========================================================================
   AIFORA BLOG & RESEARCH PORTAL - JAVASCRIPT ENGINE
   Author: Khohar Muhamad Fatahurrohman
   ========================================================================== */

let allArticles = [];

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupFilters();
    loadArticles();
});

function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    let savedTheme = localStorage.getItem('blogTheme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            if (themeIcon) themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('blogTheme', newTheme);
        });
    }
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            filterArticles(category);
        });
    });
}

function filterArticles(category) {
    if (!allArticles || allArticles.length === 0) return;
    if (category === 'all') {
        renderArticleCards(allArticles);
        return;
    }
    
    const filtered = allArticles.filter(art => {
        const cat = (art.kategori || '').toLowerCase();
        const title = (art.judul || '').toLowerCase();
        if (category === 'ai') return cat.includes('ai') || cat.includes('intelligence') || title.includes('kecerdasan');
        if (category === 'mcp') return cat.includes('mcp') || cat.includes('enterprise') || title.includes('context protocol');
        if (category === 'cyber') return cat.includes('cyber') || cat.includes('soc') || title.includes('keamanan');
        if (category === 'banking') return cat.includes('bank') || cat.includes('fintech') || title.includes('perbankan');
        if (category === 'scm') return cat.includes('scm') || cat.includes('supply') || cat.includes('software') || title.includes('sdlc') || title.includes('rantai');
        return true;
    });
    
    renderArticleCards(filtered);
}

// Render cards into container
function renderArticleCards(articles) {
    const blogContainer = document.getElementById('blog-container');
    if (!blogContainer) return;

    if (!Array.isArray(articles) || articles.length === 0) {
        blogContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 12px;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 15px; color: var(--accent-color);"></i>
                <p>Tidak ada artikel dalam kategori ini.</p>
            </div>
        `;
        return;
    }

    blogContainer.innerHTML = '';
    articles.forEach(article => {
        let dateObj = new Date(article.tanggal);
        let formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        let imageUrl = article.link_gambar || '';

        if (!imageUrl && article.isi_artikel) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.isi_artikel;
            const firstImg = tempDiv.querySelector('img');
            if (firstImg) imageUrl = firstImg.src;
        }

        let imgHTML = imageUrl ? `<a href="${article.link || ('baca.html?id=' + article.id)}"><img src="${imageUrl}" alt="Cover ${article.judul}" class="card-img" style="object-fit: cover; object-position: center; width: 100%; height: 210px; display: block;" onerror="this.onerror=null; this.src='assets/' + this.src.split('/').pop();" loading="lazy"></a>` : '';

        const targetLink = article.link || `baca.html?id=${article.id}`;

        let articleHTML = `
            <div class="article-card">
                ${imgHTML}
                <div class="card-body">
                    <div class="card-meta">
                        <span class="card-tag">${article.kategori || 'Riset AI'}</span>
                        <span><i class="far fa-calendar-alt"></i> ${formattedDate !== 'Invalid Date' ? formattedDate : article.tanggal}</span>
                    </div>
                    <h3 class="card-title">
                        <a href="${targetLink}" style="color: inherit; text-decoration: none;">${article.judul}</a>
                    </h3>
                    <p class="card-excerpt">${article.deskripsi_singkat || article.deskripsi || 'Baca selengkapnya mengenai kajian teknis pada artikel ini.'}</p>
                    <a href="${targetLink}" class="read-more">Baca Riset & Artikel <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
        blogContainer.innerHTML += articleHTML;
    });
}

// Instant Local-First Article Loader
async function loadArticles() {
    const blogContainer = document.getElementById('blog-container');
    if (!blogContainer) return;

    try {
        const localRes = await fetch('artikel.json');
        if (localRes.ok) {
            const localData = await localRes.json();
            if (Array.isArray(localData) && localData.length > 0) {
                allArticles = localData;
                renderArticleCards(allArticles);
                return;
            }
        }
    } catch (e) {
        console.warn("Local fetch warning:", e);
    }

    blogContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 12px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px; color: var(--accent-color);"></i>
            <p>Gagal memuat repositori artikel. Silakan muat ulang halaman.</p>
        </div>
    `;
}