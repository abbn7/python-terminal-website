// تهيئة Pyodide وتشغيل بايثون في المتصفح
let pyodide;
let isPyodideLoading = false;

// تهيئة التطبيق
async function initializeApp() {
    updateStatus('جاري تحميل بيئة بايثون...', 'loading');
    
    try {
        // تحميل Pyodide
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
        });
        
        // تحميل الحزم الأساسية
        await pyodide.loadPackage(["micropip"]);
        
        // إعداد بيئة بايثون
        await setupPythonEnvironment();
        
        updateStatus('جاهز - بايثون 3.11', 'ready');
        addTerminalOutput('✅ تم تحميل بيئة بايثون بنجاح!', 'success');
        addTerminalOutput('🐍 يمكنك الآن كتابة وتنفيذ كود بايثون', 'info');
        addTerminalOutput('💡 استخدم المحرر للأكواد الطويلة أو التيرمينال للأوامر السريعة', 'info');
        
    } catch (error) {
        console.error('خطأ في تحميل Pyodide:', error);
        updateStatus('خطأ في التحميل', 'error');
        addTerminalOutput('❌ فشل في تحميل بيئة بايثون. يرجى تحديث الصفحة.', 'error');
    }
}

// إعداد بيئة بايثون
async function setupPythonEnvironment() {
    // إعادة توجيه الإخراج إلى التيرمينال
    pyodide.runPython(`
        import sys
        import js
        
        class OutputLogger:
            def __init__(self, output_type):
                self.output_type = output_type
                
            def write(self, text):
                if text.strip():
                    js.addTerminalOutput(text, self.output_type)
                    
            def flush(self):
                pass
        
        sys.stdout = OutputLogger('output')
        sys.stderr = OutputLogger('error')
    `);
}

// تحديث حالة التطبيق
function updateStatus(message, type = 'ready') {
    const statusElement = document.getElementById('status');
    statusElement.textContent = `● ${message}`;
    statusElement.className = `status-indicator ${type}`;
}

// إضافة نص إلى التيرمينال
function addTerminalOutput(text, type = 'output') {
    const terminalOutput = document.getElementById('terminal-output');
    const outputLine = document.createElement('div');
    outputLine.className = `output-line ${type}`;
    
    // معالجة النص للحفاظ على المسافات
    outputLine.innerHTML = text.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    
    terminalOutput.appendChild(outputLine);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// تشغيل كود بايثون من المحرر
async function runPythonCode() {
    const code = document.getElementById('code-input').value;
    
    if (!code.trim()) {
        addTerminalOutput('⚠️ يرجى كتابة كود بايثون أولاً', 'warning');
        return;
    }
    
    updateStatus('جاري التشغيل...', 'loading');
    addTerminalOutput('🚀 تشغيل الكود...', 'info');
    
    try {
        await pyodide.runPythonAsync(code);
        updateStatus('جاهز - بايثون 3.11', 'ready');
    } catch (error) {
        addTerminalOutput(`❌ خطأ: ${error.message}`, 'error');
        updateStatus('خطأ في التنفيذ', 'error');
        
        // إعادة تعيين الحالة بعد ثانيتين
        setTimeout(() => {
            updateStatus('جاهز - بايثون 3.11', 'ready');
        }, 2000);
    }
}

// تشغيل أمر من التيرمينال
async function runTerminalCommand() {
    const terminalInput = document.getElementById('terminal-input');
    const command = terminalInput.value.trim();
    
    if (!command) return;
    
    // عرض الأمر في التيرمينال
    addTerminalOutput(`>>> ${command}`, 'command');
    
    try {
        await pyodide.runPythonAsync(command);
    } catch (error) {
        addTerminalOutput(`❌ خطأ: ${error.message}`, 'error');
    }
    
    // مسح حقل الإدخال
    terminalInput.value = '';
}

// تحديث أرقام الأسطر
function updateLineNumbers() {
    const codeInput = document.getElementById('code-input');
    const lineNumbers = document.getElementById('line-numbers');
    const lines = codeInput.value.split('\n').length;
    
    let numbersHTML = '';
    for (let i = 1; i <= Math.max(lines, 1); i++) {
        numbersHTML += `<span>${i}</span>`;
    }
    
    lineNumbers.innerHTML = numbersHTML;
    
    // تحديث عدد الأسطر في شريط الحالة
    document.getElementById('line-count').textContent = `${lines} سطر`;
}

// حفظ الكود
function saveCode() {
    const code = document.getElementById('code-input').value;
    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'python_code.py';
    a.click();
    
    URL.revokeObjectURL(url);
    addTerminalOutput('💾 تم حفظ الكود بنجاح', 'success');
}

// فتح ملف
function openFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('code-input').value = e.target.result;
        updateLineNumbers();
        addTerminalOutput(`📂 تم فتح الملف: ${file.name}`, 'success');
    };
    reader.readAsText(file);
}

// تحميل مثال
function loadExample(code) {
    document.getElementById('code-input').value = code;
    updateLineNumbers();
    closeModal('examples-modal');
    addTerminalOutput('📝 تم تحميل المثال', 'success');
}

// فتح نافذة
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

// إغلاق نافذة
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// مسح التيرمينال
function clearTerminal() {
    document.getElementById('terminal-output').innerHTML = '';
    addTerminalOutput('🧹 تم مسح التيرمينال', 'info');
}

// تحديث استخدام الذاكرة (محاكاة)
function updateMemoryUsage() {
    const usage = Math.floor(Math.random() * 50) + 10;
    document.getElementById('memory-usage').textContent = `${usage}MB`;
}

// تهيئة الأحداث
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة Pyodide
    initializeApp();
    
    // تحديث أرقام الأسطر
    updateLineNumbers();
    
    // إعداد مستمعي الأحداث
    document.getElementById('run-code').addEventListener('click', runPythonCode);
    document.getElementById('clear-terminal').addEventListener('click', clearTerminal);
    document.getElementById('save-code').addEventListener('click', saveCode);
    document.getElementById('examples-btn').addEventListener('click', () => openModal('examples-modal'));
    document.getElementById('help-btn').addEventListener('click', () => openModal('help-modal'));
    document.getElementById('execute-terminal').addEventListener('click', runTerminalCommand);
    
    // إغلاق النوافذ
    document.getElementById('close-examples').addEventListener('click', () => closeModal('examples-modal'));
    document.getElementById('close-help').addEventListener('click', () => closeModal('help-modal'));
    
    // النقر خارج النوافذ لإغلاقها
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // تحميل الأمثلة
    document.querySelectorAll('.example-item').forEach(item => {
        item.addEventListener('click', function() {
            loadExample(this.getAttribute('data-code'));
        });
    });
    
    // تحديث أرقام الأسطر عند الكتابة
    document.getElementById('code-input').addEventListener('input', updateLineNumbers);
    
    // اختصارات لوحة المفاتيح
    document.getElementById('code-input').addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            runPythonCode();
        }
        
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveCode();
        }
        
        // Tab support
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });
    
    // تشغيل الأوامر في التيرمينال بالضغط على Enter
    document.getElementById('terminal-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            runTerminalCommand();
        }
    });
    
    // فتح الملفات
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.py,.txt';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    document.getElementById('load-code').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', openFile);
    
    // تحديث استخدام الذاكرة كل 5 ثواني
    setInterval(updateMemoryUsage, 5000);
    
    // إضافة تأثير كتابة للترحيب
    setTimeout(() => {
        addTerminalOutput('🎉 ابدأ بكتابة كود بايثون في المحرر أو التيرمينال!', 'success');
    }, 1000);
});

// التعامل مع الأخطاء غير المتوقعة
window.addEventListener('error', function(e) {
    addTerminalOutput(`⚠️ خطأ غير متوقع: ${e.message}`, 'error');
});

// تحديث حالة Pyodide
window.addEventListener('pyodide-loaded', function() {
    updateStatus('بايثون جاهز', 'ready');
});