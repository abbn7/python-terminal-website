// script.js
// إصدار مبسط وعملي للتشغيل مع Pyodide داخل المتصفح
// Author: prepared for abdelhamed nada (01086144345)

const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const installBtn = document.getElementById('installBtn');
const statusEl = document.getElementById('status');
const codeEditor = document.getElementById('codeEditor');
const outputEl = document.getElementById('output');
const pkgInput = document.getElementById('pkgInput');

let pyodide = null;
let isLoading = false;

function appendOutput(text, kind = 'log') {
  // نوع: log / err / info
  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.margin = '0 0 8px 0';
  pre.className = kind === 'err' ? 'text-red-400' : 'text-green-200';
  pre.textContent = text;
  outputEl.appendChild(pre);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function setStatus(s) {
  statusEl.textContent = s;
}

// تحميل Pyodide ديناميكيًا
async function loadPyodideAndPackages() {
  if (pyodide || isLoading) return;
  isLoading = true;
  setStatus('جارِ تحميل Pyodide...');
  try {
    await import(window.PYODIDE_URL);
    // globalThis.loadPyodide is provided by script
    pyodide = await globalThis.loadPyodide({
      indexURL: window.PYODIDE_URL.replace('/pyodide.js', '/')
    });
    setStatus('Pyodide جاهز.');
    appendOutput('✅ Pyodide محمل وجاهز للعمل.', 'info');
  } catch (e) {
    console.error(e);
    setStatus('فشل تحميل Pyodide');
    appendOutput('❌ خطأ في تحميل Pyodide: ' + (e.message || e), 'err');
  } finally {
    isLoading = false;
  }
}

// تشغيل الكود الموجود في المحرر
async function runCode() {
  if (!pyodide) {
    appendOutput('Pyodide لم يُحمّل بعد — جاري التحميل الآن...', 'info');
    await loadPyodideAndPackages();
  }
  const code = codeEditor.value || '';
  if (!code.trim()) {
    appendOutput('لا يوجد كود لتشغيله.', 'info');
    return;
  }

  setStatus('تشغيل...');
  appendOutput('--- تشغيل الكود ---', 'info');

  // نغلف الكود لالتقاط stdout/stderr
  const wrapped = `
import sys, io, traceback
_buf = io.StringIO()
_old_out, _old_err = sys.stdout, sys.stderr
sys.stdout = _buf
sys.stderr = _buf
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception:
    traceback.print_exc()
finally:
    sys.stdout = _old_out
    sys.stderr = _old_err
_output = _buf.getvalue()
`;

  try {
    await pyodide.runPythonAsync(wrapped);
    const out = pyodide.globals.get('_output');
    appendOutput(out || '<لا يوجد مخرجات>', 'log');
  } catch (err) {
    appendOutput(String(err), 'err');
    console.error(err);
  } finally {
    setStatus('جاهز');
  }
}

// تثبيت باكيج عبر micropip
async function installPackage(pkgName) {
  if (!pyodide) {
    appendOutput('لم يُحمّل Pyodide بعد. سيتم تحميله الآن...', 'info');
    await loadPyodideAndPackages();
  }
  if (!pkgName || !pkgName.trim()) {
    appendOutput('اكتب اسم الباكيج في الحقل ثم اضغط تثبيت.', 'info');
    return;
  }

  setStatus(`تثبيت ${pkgName} ...`);
  appendOutput(`جاري تثبيت: ${pkgName} ...`, 'info');

  try {
    await pyodide.loadPackage('micropip');
    await pyodide.runPythonAsync(`
import micropip
await micropip.install(${JSON.stringify(pkgName)})
`);
    appendOutput(`✅ تم تثبيت ${pkgName}`, 'info');
  } catch (err) {
    appendOutput(`❌ فشل تثبيت ${pkgName}: ${err}`, 'err');
    console.error(err);
  } finally {
    setStatus('جاهز');
  }
}

// أحداث الأزرار
runBtn.addEventListener('click', async () => {
  runBtn.disabled = true;
  runBtn.classList.add('opacity-70');
  await runCode();
  runBtn.disabled = false;
  runBtn.classList.remove('opacity-70');
});

clearBtn.addEventListener('click', () => {
  outputEl.innerHTML = '';
  appendOutput('تم مسح الأوتبوت.', 'info');
});

installBtn.addEventListener('click', async () => {
  const pkg = pkgInput.value.trim();
  await installPackage(pkg);
});

// تحميل تلقائي عند الدخول (غير متزامن)
window.addEventListener('DOMContentLoaded', () => {
  loadPyodideAndPackages();
});