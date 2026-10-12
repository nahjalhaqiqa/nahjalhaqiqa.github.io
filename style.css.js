document.addEventListener('DOMContentLoaded', () => {
    // تحديث السنة تلقائياً في الفوتر
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // إعدادات الاتصال بـ Supabase (ضع بيانات مشروعك هنا)
    const SUPABASE_URL = 'YOUR_SUPABASE_URL'; 
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; 

    let supabaseClient = null;
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error('خطأ في تهيئة سوبابيس:', e);
    }

    let allDocs = [];

    // جلب البيانات من جدول documents
    async function fetchDocuments() {
        if (!supabaseClient) return;
        const { data, error } = await supabaseClient
            .from('documents')
            .select('*');

        if (error) {
            console.error('خطأ في جلب البيانات:', error);
            document.getElementById('count').textContent = 'خطأ في الاتصال بالقاعدة';
            return;
        }

        allDocs = data || [];
        renderDocs(allDocs);
    }

    // عرض البطاقات في الواجهة
    function renderDocs(docs) {
        const grid = document.getElementById('docs');
        if (!grid) return;
        grid.innerHTML = '';

        if (docs.length === 0) {
            document.getElementById('empty').style.display = 'block';
            document.getElementById('count').textContent = '0 نتائج';
            return;
        }

        document.getElementById('empty').style.display = 'none';
        document.getElementById('count').textContent = docs.length + ' ملفات';

        docs.forEach(doc => {
            let symbol = '📕';
            if (doc.category === 'بحوث عقائدية') symbol = '📘';
            else if (doc.category === 'كتب ومراجع') symbol = '📗';

            const card = document.createElement('article');
            card.className = 'doc-card';
            card.dataset.category = doc.category || '';
            
            card.innerHTML = `
                <span class="tag">${doc.category || 'متنوع'}</span>
                <div class="symbol">${symbol}</div>
                <h3>${doc.title}</h3>
                <div class="doc-meta">المؤلف: ${doc.author || 'غير معروف'} · التاريخ: ${doc.date || 'غير محدد'}</div>
                <p>${doc.description || ''}</p>
                <div class="doc-actions"><a class="btn" href="${doc.file_url}" target="_blank" rel="noopener">قراءة / تحميل PDF</a></div>
            `;
            grid.appendChild(card);
        });
    }

    // تفعيل البحث والتصفية الفورية
    const q = document.getElementById('q');
    const cat = document.getElementById('category');

    function filterDocs() {
        if (!q || !cat) return;
        let term = q.value.trim().toLocaleLowerCase('ar');
        let category = cat.value;

        let filtered = allDocs.filter(doc => {
            let textMatch = (doc.title + ' ' + (doc.author || '') + ' ' + (doc.description || '')).toLocaleLowerCase('ar').includes(term);
            let catMatch = !category || doc.category === category;
            return textMatch && catMatch;
        });

        renderDocs(filtered);
    }

    if (q) q.addEventListener('input', filterDocs);
    if (cat) cat.addEventListener('change', filterDocs);

    // البدء بجلب البيانات
    fetchDocuments();
});