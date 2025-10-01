// script.js — احترافي لموقع Python Terminal (ACE + Pyodide)
// Prepared for: abdelhamed nada — 01086144345

let pyodide = null;
let running = false;
const statusEl = document.getElementById('status');
const outputEl = document.getElementById('output');
const runBtn = document.getElementById('runBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const installBtn = document.getElementById('installBtn');
const pkgInput = document.getElementById('pkgInput');

// إعداد محرر ACE
const editor = ace.edit("editor", {
  mode: "ace/mode/python",
  theme: "ace/theme/monokai",
  value: document.getElementById('editor').textContent || '',
  showPrintMargin: false,
  fontSize: 14,
  tabSize: 4,
  useSoftTabs: true
});
editor.setOption("wrap", true);

// أداة مساعد لطباعة بالـ output
function appendOutput(text, cls = '') {
  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.margin = '0 0 8px 0';
  pre.className = cls;
  pre.textContent = text;
  outputEl.appendChild(pre);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function setStatus(s) {
  statusEl.textContent = s;
}

// تحميل Pyodide
async function loadPyodideIfNeeded() {
  if (pyodide) return;
  setStatus('تحميل Pyodide...');
  try {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
    });
    // تحميل micropip مبكرًا لتسهيل تثبيت الباكيجات لاحقًا
    await pyodide.loadPackage('micropip').catch(()=>{});
    setStatus('جاهز');
    appendOutput('✅ Pyodide محمل - جاهز للتشغيل');
  } catch (err) {
    appendOutput('❌ فشل في تحميل Pyodide: ' + String(err));
    setStatus('خطأ في التحميل');
    console.error(err);
  }
}

// دالة لتشغيل الكود (تلتقط stdout/stderr)
async function runCode() {
  await loadPyodideIfNeeded();
  if (!pyodide) return;
  if (running) {
    appendOutput('— هناك عملية تشغيل جارية —');
    return;
  }
  running = true;
  setStatus('تشغيل...');
  outputEl.innerHTML = ''; // نعرض مخرجات جديدة
  appendOutput('--- بدء التنفيذ ---');

  const userCode = editor.getValue();

  // Wrap to capture stdout/stderr reliably
  const wrapped = `
import sys, io, traceback
_buf = io.StringIO()
_old_out, _old_err = sys.stdout, sys.stderr
sys.stdout = _buf
sys.stderr = _buf
try:
${userCode.split('\n').map(l => '    ' + l).join('\n')}
except Exception:
    traceback.print_exc()
finally:
    sys.stdout = _old_out
    sys.stderr = _old_err
_output = _buf.getvalue()
`;

  try {
    // runPythonAsync may throw if code blocks; timeouts not supported — keep simple
    await pyodide.runPythonAsync(wrapped);
    const out = pyodide.globals.get('_output');
    appendOutput(out || '<لا يوجد مخرجات>');
  } catch (err) {
    appendOutput('❌ خطأ أثناء التنفيذ:\n' + String(err), 'error');
    console.error(err);
  } finally {
    running = false;
    setStatus('جاهز');
  }
}

// تثبيت باكيج عبر micropip
async function installPackage(pkgName) {
  if (!pkgName) {
    appendOutput('اكتب اسم الباكيج في الحقل ثم اضغط تثبيت.');
    return;
  }
  await loadPyodideIfNeeded();
  if (!pyodide) return;
  setStatus(`تثبيت ${pkgName}...`);
  appendOutput(`⏳ تثبيت ${pkgName} ...`);
  try {
    await pyodide.runPythonAsync(`
import micropip
await micropip.install(${JSON.stringify(pkgName)})
`);
    appendOutput(`✅ تم تثبيت ${pkgName}`);
  } catch (err) {
    appendOutput(`❌ فشل تثبيت ${pkgName}: ${err}`);
    console.error(err);
  } finally {
    setStatus('جاهز');
  }
}

// أزرار الأحداث
runBtn.addEventListener('click', runCode);
clearBtn.addEventListener('click', () => { outputEl.innerHTML = ''; appendOutput('تم مسح الأوتبوت.'); });
installBtn.addEventListener('click', () => { installPackage(pkgInput.value.trim()); });
stopBtn.addEventListener('click', () => {
  // ملاحظة: Pyodide لا يدعم إيقاف الـ Python بسهولة من الواجهة. فقط إعلام المستخدم.
  appendOutput('إيقاف غير مدعوم حالياً — استخدم كود أقصر أو أعد تحميل الصفحة.');
});

// تحميل آلي للـ Pyodide عند فتح الصفحة (خلفي)
window.addEventListener('load', () => {
  loadPyodideIfNeeded();
});