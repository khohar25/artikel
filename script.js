/* ==========================================================================
   AIFORA BLOG - LOGIKA JAVASCRIPT (EKSTRAK GAMBAR OTOMATIS DARI ISI)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('blogTheme', newTheme);
        });
    }

    loadArticles();
});

const SUPABASE_URL = 'https://whbmyhxjinbyakwyuxnrd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYm15aHhpbmJ5YWt3eXV4bnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDQxMzksImV4cCI6MjEwNjAyMDEzOX0.XsSwtCZCdIviu1opTvGynnvECrYKrGIRugy2CiN_gec';
const headers = { 
    'apikey': SUPABASE_KEY, 
    'Authorization': `Bearer ${SUPABASE_KEY}`, 
    'Content-Type': 'application/json' 
};

// Fungsi jaga-jaga kalau ternyata ada link Google Drive
function perbaikiLinkDrive(url) {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
        return match && match[1] ? `https://drive.google.com/uc?id=${match[1]}` : url;
    }
    return url;
}

// Fungsi Render Daftar Kartu Artikel
function renderArticleCards(articles) {
    const blogContainer = document.getElementById('blog-container');
    if (!blogContainer || !Array.isArray(articles) || articles.length === 0) return;

    blogContainer.innerHTML = '';
    articles.forEach(article => {
        let dateObj = new Date(article.tanggal);
        let formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        let imageUrl = '';

        if (article.isi_artikel) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.isi_artikel;
            const firstImg = tempDiv.querySelector('img');
            if (firstImg) imageUrl = firstImg.src;
        }

        if (!imageUrl && article.link_gambar) {
            imageUrl = perbaikiLinkDrive(article.link_gambar);
        }

        let imgHTML = imageUrl ? `<img src="${imageUrl}" alt="Cover ${article.judul}" class="card-img" style="object-fit: cover; object-position: center;">` : '';

        let articleHTML = `
            <div class="article-card">
                ${imgHTML}
                <div class="card-body">
                    <div class="card-meta">
                        <span class="card-tag">${article.kategori || 'Teknologi'}</span>
                        <span><i class="far fa-calendar-alt"></i> ${formattedDate !== 'Invalid Date' ? formattedDate : article.tanggal}</span>
                    </div>
                    <h3 class="card-title">${article.judul}</h3>
                    <p class="card-excerpt">${article.deskripsi_singkat || article.deskripsi || 'Baca selengkapnya mengenai kajian teknis pada artikel ini.'}</p>
                    <a href="baca.html?id=${article.id}" class="read-more">Baca Artikel <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
        blogContainer.innerHTML += articleHTML;
    });
}

// Fungsi Muat Artikel Cepat (Local-First + Background Supabase Revalidation)
async function loadArticles() {
    const blogContainer = document.getElementById('blog-container');
    if (!blogContainer) return;

    let hasRendered = false;

    // 1. Muat data lokal instan (0 ms) agar pembaca langsung bisa melihat artikel
    try {
        const localRes = await fetch('artikel.json');
        if (localRes.ok) {
            const localData = await localRes.json();
            if (Array.isArray(localData) && localData.length > 0) {
                renderArticleCards(localData);
                hasRendered = true;
            }
        }
    } catch (e) {
        // Lanjutkan jika offline
    }

    // 2. Ambil pembaruan dari Supabase secara non-blocking dengan batas waktu 1.5 detik
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const response = await fetch(`${SUPABASE_URL}/rest/v1/tabel_artikel?select=*&order=id.desc`, {
            headers,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const articles = await response.json();
            if (Array.isArray(articles) && articles.length > 0) {
                renderArticleCards(articles);
                hasRendered = true;
            }
        }
    } catch (error) {
        console.warn("Supabase background sync:", error.message || error);
    }

    // Jika sama sekali tidak ada data yang bisa dimuat (baik lokal maupun remote)
    if (!hasRendered) {
        blogContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 12px;">
                <i class="fas fa-pen-nib" style="font-size: 2rem; margin-bottom: 15px; color: var(--accent-color);"></i>
                <p>Belum ada artikel yang dipublikasikan.</p>
            </div>
        `;
    }
}
