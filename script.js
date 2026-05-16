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

const SUPABASE_URL = 'https://xwwlegzacxevmlmtceqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3d2xlZ3phY3hldm1sbXRjZXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDA2NzEsImV4cCI6MjA5Mzk3NjY3MX0.C9qCfFVN9j8gtvsLVBFGh4I28gIRvJkYlp546-ssEgw';
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

async function loadArticles() {
    const blogContainer = document.getElementById('blog-container');
    if (!blogContainer) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/tabel_artikel?select=*&order=id.desc`, { headers });
        const articles = await response.json();

        blogContainer.innerHTML = '';

        if (articles && articles.length > 0) {
            articles.forEach(article => {
                let dateObj = new Date(article.tanggal);
                let formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                
                let imageUrl = '';

                // ====================================================================
                // LOGIKA SAKTI BARU: NYOMOT GAMBAR PERTAMA DARI DALAM KETIKAN ARTIKEL
                // ====================================================================
                if (article.isi_artikel) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = article.isi_artikel; // Masukin isi artikel ke elemen virtual
                    const firstImg = tempDiv.querySelector('img'); // Cari tag <img ...> urutan pertama
                    
                    if (firstImg) {
                        imageUrl = firstImg.src; // Kalau ketemu, curi source gambarnya!
                    }
                }

                // Kalau di dalam artikel gak ada gambar sama sekali, baru cek kolom cover
                if (!imageUrl && article.link_gambar) {
                    imageUrl = perbaikiLinkDrive(article.link_gambar);
                }
                // ====================================================================

                // Render Thumbnail: Kalau ada gambar tampilkan, kalau nggak ada biarkan bersih tanpa gambar
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
                            <p class="card-excerpt">${article.deskripsi_singkat || 'Baca selengkapnya mengenai kajian teknis pada artikel ini.'}</p>
                            <a href="baca.html?id=${article.id}" class="read-more">Baca Artikel <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                `;
                blogContainer.innerHTML += articleHTML;
            });
        } else {
            blogContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 12px;">
                    <i class="fas fa-pen-nib" style="font-size: 2rem; margin-bottom: 15px; color: var(--accent-color);"></i>
                    <p>Belum ada artikel yang dipublikasikan.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Gagal memuat artikel:", error);
    }
}
