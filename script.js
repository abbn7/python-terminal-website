// تنفيذ بايثون في المتصفح باستخدام Pyodide
let pyodide;

// تهيئة Pyodide
async function initializePyodide() {
    try {
        // عرض رسالة تحميل
        addOutputLine("جاري تحميل بيئة بايثون...", "info");
        
        // تحميل Pyodide
        pyodide = await loadPyodide();
        
        // إضافة مكتبات Python المطلوبة
        await pyodide.loadPackage(["micropip"]);
        
        // إخفاء رسالة التحميل وإظهار رسالة الترحيب
        clearOutput();
        addOutputLine("✅ تم تحميل بيئة بايثون بنجاح!", "success");
        addOutputLine("يمكنك الآن كتابة وتشغيل كود بايثون مباشرة في المتصفح.", "info");
        addOutputLine("اضغط على زر 'تشغيل' أو Ctrl+Enter لتشغيل الكود.", "info");
    } catch (error) {
        console.error("خطأ في تحميل Pyodide:", error);
        addOutputLine("❌ حدث خطأ أثناء تحميل بيئة بايثون. يرجى تحديث الصفحة والمحاولة مرة أخرى.", "error");
    }
}

// تشغيل كود بايثون
async function runPythonCode() {
    if (!pyodide) {
        addOutputLine("⏳ بيئة بايثون仍在 التحميل، يرجى الانتظار...", "warning");
        return;
    }
    
    const code = document.getElementById('python-code').value;
    
    if (!code.trim()) {
        addOutputLine("⚠️ يرجى كتابة كود بايثون أولاً.", "warning");
        return;
    }
    
    // إضافة فاصل للإخراج
    addOutputLine("=".repeat(50), "info");
    addOutputLine("تشغيل الكود...", "info");
    
    try {
        // محاكاة دالة input
        let inputValues = [];
        const originalInput = pyodide.globals.get('input');
        
        pyodide.globals.set('input', function(prompt) {
            // في بيئة المتصفح، نستخدم prompt بدلاً من input
            const value = window.prompt(prompt || "أدخل قيمة:");
            inputValues.push(value);
            return value || "";
        });
        
        // تنفيذ الكود
        const result = await pyodide.runPythonAsync(code);
        
        // استعادة دالة input الأصلية
        pyodide.globals.set('input', originalInput);
        
        // عرض النتيجة إذا كانت موجودة
        if (result !== undefined) {
            addOutputLine(`النتيجة: ${result}`, "success");
        }
        
        addOutputLine("✅ تم تنفيذ الكود بنجاح!", "success");
    } catch (error) {
        addOutputLine(`❌ خطأ: ${error.message}`, "error");
        console.error("Python error:", error);
    }
}

// إضافة سطر إلى منطقة الإخراج
function addOutputLine(text, type = "normal") {
    const outputContainer = document.getElementById('output');
    const line = document.createElement('div');
    line.className = `output-line ${type}-line`;
    line.textContent = text;
    outputContainer.appendChild(line);
    
    // التمرير إلى الأسفل
    outputContainer.scrollTop = outputContainer.scrollHeight;
}

// مسح منطقة الإخراج
function clearOutput() {
    document.getElementById('output').innerHTML = '';
}

// تحديث أرقام الأسطر في المحرر
function updateLineNumbers() {
    const editor = document.getElementById('python-code');
    const lineNumbers = document.querySelector('.line-numbers');
    
    const lines = editor.value.split('\n').length;
    let lineNumbersHTML = '';
    
    for (let i = 1; i <= Math.max(lines, 10); i++) {
        lineNumbersHTML += `<div class="line-number">${i}</div>`;
    }
    
    lineNumbers.innerHTML = lineNumbersHTML;
}

// فتح نافذة الأمثلة
function openExamplesModal() {
    document.getElementById('examples-modal').classList.add('active');
}

// إغلاق نافذة الأمثلة
function closeExamplesModal() {
    document.getElementById('examples-modal').classList.remove('active');
}

// تحميل مثال في المحرر
function loadExample(code) {
    document.getElementById('python-code').value = code;
    updateLineNumbers();
    closeExamplesModal();
}

// نسخ الإخراج
function copyOutput() {
    const outputContainer = document.getElementById('output');
    const text = outputContainer.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        // عرض رسالة نجاح مؤقتة
        const copyBtn = document.getElementById('copy-output');
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    });
}

// التبديل بين وضع الدارك واللايت
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        body.classList.add('light-theme');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// التبديل بين وضع الشاشة الكاملة
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`خطأ في تفعيل وضع الشاشة الكاملة: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// تهيئة الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة Pyodide
    initializePyodide();
    
    // تحديث أرقام الأسطر
    updateLineNumbers();
    
    // إضافة مستمعي الأحداث
    document.getElementById('run-btn').addEventListener('click', runPythonCode);
    document.getElementById('clear-btn').addEventListener('click', function() {
        document.getElementById('python-code').value = '';
        updateLineNumbers();
    });
    document.getElementById('clear-output').addEventListener('click', clearOutput);
    document.getElementById('copy-output').addEventListener('click', copyOutput);
    document.getElementById('examples-btn').addEventListener('click', openExamplesModal);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('fullscreen-toggle').addEventListener('click', toggleFullscreen);
    
    // إغلاق نافذة الأمثلة
    document.querySelector('.close-modal').addEventListener('click', closeExamplesModal);
    
    // إغلاق نافذة الأمثلة بالنقر خارجها
    document.getElementById('examples-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeExamplesModal();
        }
    });
    
    // تحميل الأمثلة
    document.querySelectorAll('.example-item').forEach(item => {
        item.addEventListener('click', function() {
            loadExample(this.getAttribute('data-code'));
        });
    });
    
    // تحديث أرقام الأسطر عند الكتابة
    document.getElementById('python-code').addEventListener('input', updateLineNumbers);
    
    // اختصار لوحة المفاتيح لتشغيل الكود (Ctrl+Enter)
    document.getElementById('python-code').addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            runPythonCode();
        }
    });
    
    // إضافة تأثيرات عند التمرير
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(15, 20, 25, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = '';
            navbar.style.backdropFilter = '';
        }
    });
});

// إضافة أنيميشن للعناصر عند التمرير
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// مراقبة العناصر لإضافة الأنيميشن
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.sidebar, .editor-section, .output-section');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});

// CSS للوضع الفاتح
const lightThemeStyles = `
    .light-theme {
        --bg-dark: #f5f7fa;
        --bg-darker: #e4e7eb;
        --bg-card: #ffffff;
        --text-primary: #2d3748;
        --text-secondary: #4a5568;
        --border-color: #cbd5e0;
    }
    
    .light-theme .navbar {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .light-theme .sidebar,
    .light-theme .editor-section,
    .light-theme .output-section {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
`;

// إضافة أنماط الوضع الفاتح إلى الصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = lightThemeStyles;
document.head.appendChild(styleSheet);