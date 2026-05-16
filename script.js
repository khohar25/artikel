/* ==========================================================================
   AIFORA BLOG - LOGIKA JAVASCRIPT & SUPABASE FETCH (FIXED)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. TEMA DARK/LIGHT MODE
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    let savedTheme = localStorage.getItem('blogTheme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('blogTheme', newTheme);
        });
    }

    // Panggil fungsi tarik data artikel
    loadArticles();
});

// 2. KONEKSI SUPABASE
const SUPABASE_URL = 'https://xwwlegzacxevmlmtceqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3d2xlZ3phY3hldm1sbXRjZXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDA2NzEsImV4cCI6MjA5Mzk3NjY3MX0.C9qCfFVN9j8gtvsLVBFGh4I28gIRvJkYlp546-ssEgw';
const headers = { 
    'apikey': SUPABASE_KEY, 
    'Authorization': `Bearer ${SUPABASE_KEY}`, 
    'Content-Type': 'application/json' 
};

// FITUR SAKTI: Otomatis ubah link Google Drive biasa jadi Direct Link Gambar
function perbaikiLinkDrive(url) {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
            return `https://docs.google.com/uc?export=view&id=${match[1]}`;
        }
    }
    return url;
}

// 3. FUNGSI RENDER ARTIKEL
async function loadArticles() {
    const blogContainer = document.getElementById('blog-container');
    if (!blogContainer) return; // Mencegah error jika div container tidak ada di halaman

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/tabel_artikel?select=*&order=id.desc`, { headers });
        const articles = await response.json();

        // Bersihkan tulisan "Loading..."
        blogContainer.innerHTML = '';

        if (articles && articles.length > 0) {
            articles.forEach(article => {
                let dateObj = new Date(article.tanggal);
                let formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                
                // PERBAIKAN 1: Terapkan fungsi pembongkar link Drive
                let imageUrl = perbaikiLinkDrive(article.link_gambar) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

                let articleHTML = `
                    <div class="article-card">
                        <img src="${imageUrl}" alt="Cover ${article.judul}" class="card-img">
                        <div class="card-body">
                            <div class="card-meta">
                                <span class="card-tag">${article.kategori || 'Teknologi'}</span>
                                <span><i class="far fa-calendar-alt"></i> ${formattedDate !== 'Invalid Date' ? formattedDate : article.tanggal}</span>
                            </div>
                            <h3 class="card-title">${article.judul}</h3>
                            <p class="card-excerpt">${article.deskripsi_singkat || 'Baca selengkapnya mengenai kajian teknis dan eksplorasi komputasional pada artikel ini.'}</p>
                            
                            <a href="baca.html?id=${article.id}" class="read-more">Baca Artikel <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                `;
                blogContainer.innerHTML += articleHTML;
            });
        } else {
            // Jika tabel kosong
            blogContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 12px;">
                    <i class="fas fa-pen-nib" style="font-size: 2rem; margin-bottom: 15px; color: var(--accent-color);"></i>
                    <p>Belum ada artikel yang dipublikasikan. Data sedang disiapkan dari server AIFORA.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
        blogContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #ef4444; border: 1px dashed #ef4444; border-radius: 12px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                <p>Gagal terhubung ke database. Pastikan tabel <b>tabel_artikel</b> sudah dibuat di Supabase.</p>
            </div>
        `;
    }
}
