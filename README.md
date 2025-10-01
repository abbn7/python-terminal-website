# Python Terminal - تشغيل كود بايثون في المتصفح

موقع ويب تفاعلي يتيح لك تشغيل كود Python مباشرة في المتصفح باستخدام Pyodide.

## 🌟 المميزات

- 🚀 **سريع وفوري**: تشغيل فوري للكود بدون الحاجة لتثبيت Python محلياً
- 🎨 **واجهة جميلة**: terminal ملون مع تأثيرات بصرية متقدمة وتجربة مستخدم ممتازة
- 📦 **دعم المكتبات**: إمكانية تثبيت مكتبات Python الشائعة مثل NumPy و Matplotlib
- 💾 **حفظ المخرجات**: نسخ وتحميل نتائج التشغيل
- 🔄 **تاريخ الأوامر**: التنقل في تاريخ الأوامر المنفذة باستخدام الأسهم
- 🌈 **تأثيرات بصرية**: خلفية متحركة وجسيمات عائمة وانتقالات سلسة
- 📱 **متجاوب**: يعمل بشكل مثالي على جميع الأجهزة

## 🛠️ التقنيات المستخدمة

- **Pyodide v0.28.3**: لتشغيل Python في المتصفح
- **HTML5/CSS3/JavaScript**: للواجهة الأمامية
- **Tailwind CSS**: للتصميم المتجاوب
- **Font Awesome**: للأيقونات
- **Google Fonts (Cairo & Fira Code)**: للخطوط العربية والبرمجية
- **Cloudflare Pages**: للاستضافة والنشر

## 🚀 الاستخدام

### الوصول المباشر
زر الموقع على: [https://python-terminal-website.pages.dev](https://python-terminal-website.pages.dev)

### التشغيل محلياً
```bash
# استنساخ المستودع
git clone https://github.com/abbn7/python-terminal-website.git
cd python-terminal-website

# تشغيل خادم محلي
python3 -m http.server 8080

# فتح المتصفح على http://localhost:8080
```

## 📝 كيفية الاستخدام

1. **انتظار التحميل**: عند فتح الموقع، انتظر تحميل Python (قد يستغرق بضع ثوانٍ)
2. **كتابة الكود**: اكتب كود Python في المنطقة المخصصة
3. **التشغيل**: انقر على "تشغيل" أو اضغط `Ctrl+Enter`
4. **مشاهدة النتائج**: شاهد النتائج في terminal الملون
5. **استخدام المكتبات**: ثبت مكتبات إضافية حسب الحاجة

## 💡 أمثلة

### مثال بسيط
```python
print("مرحبا بك في Python Terminal!")
for i in range(5):
    print(f"العدد: {i}")
```

### استخدام المكتبات
```python
import math
import numpy as np

# العمليات الرياضية
print(f"قيمة π = {math.pi:.4f}")

# NumPy arrays
arr = np.array([1, 2, 3, 4, 5])
print(f"المتوسط: {np.mean(arr)}")
print(f"الانحراف المعياري: {np.std(arr):.2f}")
```

### رسم بياني بسيط
```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2*np.pi, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6))
plt.plot(x, y, 'b-', linewidth=2)
plt.title('دالة الجيب')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.grid(True)
plt.show()
```

## 🔧 النشر على Cloudflare Pages

### الطريقة الأولى: GitHub Integration
1. ادفع الكود إلى GitHub
2. اربط المستودع بـ Cloudflare Pages
3. سيتم النشر تلقائياً عند كل تحديث

### الطريقة الثانية: Wrangler CLI
```bash
# تثبيت Wrangler
npm install -g wrangler

# تسجيل الدخول
wrangler login

# النشر
wrangler pages publish . --project-name=python-terminal-website
```

## 📁 هيكل المشروع

```
python-terminal-website/
├── index.html              # الصفحة الرئيسية
├── script.js              # منطق JavaScript
├── styles.css             # التصميم والتأثيرات
├── _headers               # إعدادات Cloudflare
├── wrangler.toml          # تكوين Cloudflare
├── functions/
│   └── _middleware.js     # Middleware للأمان
├── package.json           # معلومات المشروع
└── README.md             # هذا الملف
```

## 🔒 الأمان والخصوصية

- جميع العمليات تتم في المتصفح محلياً
- لا يتم إرسال أي كود إلى الخادم
- استخدام CORS headers للأمان
- حماية من XSS وهجمات أخرى

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. عمل Fork للمستودع
2. إنشاء branch جديد للميزة
3. إجراء التغييرات المطلوبة.

## 🙏 شكر وتقدير

- [Pyodide Team](https://pyodide.org/) لتوفير Python في المتصفح
- [Cloudflare](https://pages.cloudflare.com/) للاستضافة المجانية
- [Tailwind CSS](https://tailwindcss.com/) للتصميم
- [Font Awesome](https://fontawesome.com/) للأيقونات

## 📞 التواصل

- GitHub: [abbn7/python-terminal-website](https://github.com/abbn7/python-terminal-website)
- الموقع المباشر: [python-terminal-website.pages.dev](https://python-terminal-website.pages.dev)

---

**تم تطوير هذا المشروع بـ ❤️ باستخدام Pyodide و Cloudflare Pages**
