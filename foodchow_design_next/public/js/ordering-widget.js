/* ── Dropdown ── */
function toggleDropdown(id, e) {
    e.stopPropagation();
    const d = document.getElementById(id);
    const wasOpen = d.classList.contains('show');
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
    if (!wasOpen) d.classList.add('show');
}
window.addEventListener('click', () => document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show')));

function selectViewOption(val, e) {
    e.preventDefault();
    document.getElementById('selectedViewText').textContent = val;
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
}



/* ── Tab / Code ── */
const fullCode = `<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,shrink-to-fit=no" />
<title>Order Online</title>
</head>
<body>
<style type="text/css">
html { overflow: scroll }
html, body, div, iframe { margin: 0px; padding: 0px; height: 100%; border: none }
iframe { display: block; width: 100%; border: none; }
</style>
<iframe
src="https://foodchowdemoindia.foodchow.com"
style="overflow: auto!important; -webkit-overflow-scrolling: touch!important;"
frameborder="0" marginheight="0" marginwidth="0">
</iframe>

</body>
</html>`;

const codes = {
    website: fullCode,
    wordpress: `[foodchow_ordering_widget url="https://foodchowdemoindia.foodchow.com" width="100%" height="100vh"]`
};

function switchTab(btn, type) {
    document.querySelectorAll('.ow-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('codeContent').textContent = codes[type];
}

function copyCode() {
    const text = document.getElementById('codeContent').textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.btn-copy-code');
        const original = btn.innerHTML;
        btn.innerHTML = 'COPIED!';
        setTimeout(() => { btn.innerHTML = original; }, 1500);
    });
}

function emailCode() {
    document.getElementById('emailModal').classList.add('show');
}
function closeEmailModal() {
    document.getElementById('emailModal').classList.remove('show');
}
function sendInstructions() {
    const email = document.getElementById('developerEmail').value;
    if (!email.trim()) { alert('Please enter email address'); return; }
    const subject = encodeURIComponent('FoodChow Ordering Widget Integration');
    const body = encodeURIComponent(`Greetings from FoodChow!!\n\nPlease go through the following link so that you can embed our code into your website:\n\nhttps://foodchowdemoindia.foodchow.com\n\nCopy and paste the below code into your HTML file:\n\n${fullCode}\n\nFor any queries, feel free to contact us at support@foodchow.com.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}
window.addEventListener('click', function (e) {
    const modal = document.getElementById('emailModal');
    if (e.target === modal) closeEmailModal();
});

function openHelpModal() { alert('Help documentation coming soon!'); }

/* ── Step nav ── */
let currentStep = 6, totalSteps = 25;
document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentStep > 1) { currentStep--; document.getElementById('stepValue').textContent = currentStep + '/' + totalSteps; }
});
document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentStep < totalSteps) { currentStep++; document.getElementById('stepValue').textContent = currentStep + '/' + totalSteps; }
});
