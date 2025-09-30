class PythonTerminal {
    constructor() {
        this.pyodide = null;
        this.isLoading = true;
        this.history = [];
        this.historyIndex = -1;
        this.output = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadPyodide();
    }

    initializeElements() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.terminalInterface = document.getElementById('terminalInterface');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.terminalOutput = document.getElementById('terminalOutput');
        this.codeInput = document.getElementById('codeInput');
        this.runBtn = document.getElementById('runBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.packageInput = document.getElementById('packageInput');
        this.installBtn = document.getElementById('installBtn');
        this.exampleBtns = document.querySelectorAll('.example-btn');
    }

    setupEventListeners() {
        // Run button
        this.runBtn.addEventListener('click', () => this.runCode());
        
        // Clear button
        this.clearBtn.addEventListener('click', () => this.clearTerminal());
        
        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetPython());
        
        // Copy button
        this.copyBtn.addEventListener('click', () => this.copyOutput());
        
        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadOutput());
        
        // Install package button
        this.installBtn.addEventListener('click', () => this.installPackage());
        
        // Code input keyboard shortcuts
        this.codeInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Package input enter key
        this.packageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.installPackage();
        });
        
        // Example buttons
        this.exampleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code').replace(/&#10;/g, '\n');
                this.codeInput.value = code;
                this.codeInput.focus();
            });
        });
    }

    async loadPyodide() {
        try {
            // Simulate loading progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
                this.loadingProgress.style.width = progress + '%';
            }, 200);

            // Load Pyodide
            this.pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/',
                stdout: (text) => this.addOutput('output', text),
                stderr: (text) => this.addOutput('error', text)
            });

            // Load basic packages
            await this.pyodide.loadPackage(['numpy', 'matplotlib']);

            clearInterval(progressInterval);
            this.loadingProgress.style.width = '100%';

            setTimeout(() => {
                this.isLoading = false;
                this.loadingScreen.classList.add('hidden');
                this.terminalInterface.classList.remove('hidden');
                
                this.addOutput('system', 'تم تحميل Python بنجاح! يمكنك الآن تشغيل كود Python.');
                this.addOutput('system', `إصدار Python: ${this.pyodide.runPython('import sys; sys.version.split()[0]')}`);
                
                this.codeInput.focus();
            }, 500);

        } catch (error) {
            console.error('Failed to load Pyodide:', error);
            this.addOutput('error', `فشل في تحميل Python: ${error.message}`);
        }
    }

    addOutput(type, content) {
        const timestamp = new Date().toLocaleTimeString('ar-EG');
        const outputItem = {
            type,
            content: content.trim(),
            timestamp
        };
        
        this.output.push(outputItem);
        this.renderOutput();
    }

    renderOutput() {
        if (this.output.length === 0) {
            this.terminalOutput.innerHTML = `
                <div class="text-gray-500 text-center py-8">
                    مرحبا بك في Python Terminal! اكتب كود Python وانقر على "تشغيل" أو اضغط Ctrl+Enter
                </div>
            `;
            return;
        }

        this.terminalOutput.innerHTML = this.output.map(item => {
            const typeClass = this.getTypeClass(item.type);
            const typeLabel = this.getTypeLabel(item.type);
            
            return `
                <div class="output-line mb-2">
                    <div class="text-xs text-gray-500 mb-1">
                        [${item.timestamp}] ${typeLabel}
                    </div>
                    <div class="${typeClass} whitespace-pre-wrap ${item.type === 'input' ? 'input-line' : ''}">
                        ${this.escapeHtml(item.content)}
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }

    getTypeClass(type) {
        switch (type) {
            case 'input': return 'text-blue-400';
            case 'output': return 'text-green-400';
            case 'result': return 'text-yellow-400';
            case 'error': return 'text-red-400';
            case 'system': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    }

    getTypeLabel(type) {
        switch (type) {
            case 'input': return 'INPUT';
            case 'output': return 'OUTPUT';
            case 'result': return 'RESULT';
            case 'error': return 'ERROR';
            case 'system': return 'SYSTEM';
            default: return 'UNKNOWN';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async runCode() {
        if (!this.codeInput.value.trim() || this.isLoading || !this.pyodide) return;

        const code = this.codeInput.value;
        
        // Add to history
        this.history.push(code);
        this.historyIndex = -1;

        // Add input to output
        this.addOutput('input', code);

        // Disable run button
        this.runBtn.disabled = true;
        this.runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري التشغيل...</span>';

        try {
            // Run Python code
            const result = this.pyodide.runPython(code);
            
            // If there's a return value (not None)
            if (result !== undefined && result !== null && result.toString() !== 'None') {
                this.addOutput('result', result.toString());
            }

        } catch (error) {
            this.addOutput('error', `خطأ: ${error.message}`);
        }

        // Re-enable run button
        this.runBtn.disabled = false;
        this.runBtn.innerHTML = '<i class="fas fa-play"></i> <span>تشغيل</span>';
        
        // Clear input
        this.codeInput.value = '';
        this.codeInput.focus();
    }

    async installPackage() {
        if (!this.packageInput.value.trim() || this.isLoading || !this.pyodide) return;

        const packageName = this.packageInput.value.trim();
        
        this.addOutput('system', `جاري تثبيت المكتبة: ${packageName}...`);
        
        // Disable install button
        this.installBtn.disabled = true;
        this.installBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري التثبيت...</span>';

        try {
            await this.pyodide.loadPackage(packageName);
            this.addOutput('system', `تم تثبيت المكتبة ${packageName} بنجاح`);
        } catch (error) {
            this.addOutput('error', `فشل في تثبيت المكتبة ${packageName}: ${error.message}`);
        }

        // Re-enable install button
        this.installBtn.disabled = false;
        this.installBtn.innerHTML = '<i class="fas fa-download"></i> <span>تثبيت</span>';
        
        this.packageInput.value = '';
    }

    clearTerminal() {
        this.output = [];
        this.renderOutput();
    }

    resetPython() {
        if (this.pyodide) {
            try {
                this.pyodide.runPython(`
                    import sys
                    # Clear user-defined variables
                    user_vars = [var for var in globals() if not var.startswith('_') and var not in sys.modules]
                    for var in user_vars:
                        del globals()[var]
                `);
                this.addOutput('system', 'تم إعادة تعيين بيئة Python.');
            } catch (error) {
                this.addOutput('error', `خطأ في إعادة التعيين: ${error.message}`);
            }
        }
    }

    copyOutput() {
        const outputText = this.output
            .filter(item => item.type === 'output' || item.type === 'result')
            .map(item => item.content)
            .join('\n');
        
        navigator.clipboard.writeText(outputText).then(() => {
            this.addOutput('system', 'تم نسخ المخرجات إلى الحافظة');
        });
    }

    downloadOutput() {
        const outputText = this.output
            .map(item => `[${item.timestamp}] ${item.type.toUpperCase()}: ${item.content}`)
            .join('\n');
        
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'python_output.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            this.runCode();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.history.length > 0) {
                const newIndex = this.historyIndex === -1 ? this.history.length - 1 : Math.max(0, this.historyIndex - 1);
                this.historyIndex = newIndex;
                this.codeInput.value = this.history[newIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex !== -1) {
                const newIndex = this.historyIndex + 1;
                if (newIndex >= this.history.length) {
                    this.historyIndex = -1;
                    this.codeInput.value = '';
                } else {
                    this.historyIndex = newIndex;
                    this.codeInput.value = this.history[newIndex];
                }
            }
        }
    }
}

// Initialize the terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PythonTerminal();
});

// Dark mode toggle (optional)
document.getElementById('darkModeBtn')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});
