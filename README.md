# StudentOS 🎓
> **"Your college life, organized."**

StudentOS is a complete, modern, 100% frontend static student dashboard designed for college students to manage their studies, tasks, assignments, exams, study schedules, CGPA, quick notes, and learning resources all in one place.

Built with pure vanilla web technologies (**HTML5, CSS3, JavaScript**), StudentOS requires **no backend, no API keys, no build process, and no registration**. It stores all user data persistent in the browser via **LocalStorage** and is 100% compatible with **GitHub Pages**.

---

## ✨ Features

### 📊 1. Dashboard
- Real-time date display and custom greeting (Morning, Afternoon, Evening).
- Dynamic motivational quotes engine with one-click quote refresh.
- Quick statistical summary counters (Pending Tasks, Pending Assignments, Upcoming Exams, Today's Planned Study Hours).
- Quick Action buttons for fast item creation.
- Summary widgets for Today's Tasks, Urgent Assignments, Next Exam Countdown, and Today's Study Timeline.

### ✅ 2. Task Manager
- Create tasks with Title, Subject, Priority level (**Low**, **Medium**, **High**), and Due Date.
- Filter tasks by status (**All**, **Pending**, **Completed**) and live keyword search.
- Interactive checkboxes with completion strikethrough.
- Delete and update tasks stored persistently in LocalStorage.

### 📚 3. Assignment Tracker
- Track coursework deadlines and submission status (**Pending**, **Submitted**).
- Automatic **"⚡ Due Soon"** badge indicator for assignments due within 48 hours.
- One-click submission status toggle.

### ⏱️ 4. Exam Countdown
- Add upcoming midterms and finals with Subject, Exam Title, Date, and Time.
- Real-time ticking live countdown (e.g., `5d 12h 30m 15s remaining`).
- Automatic chronological sorting so the nearest exam is always presented first.

### 📅 5. Daily Study Planner
- Schedule revision sessions with Subject, Topic, Start Time, and End Time.
- Automatic computation of **Today's Planned Study Hours**.
- Visual vertical timeline view of the day's schedule.

### 🧮 6. CGPA & GPA Calculator
- Multi-grading scale support:
  - **10-Point Scale** (O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0)
  - **4.0 Scale** (A=4, B=3, C=2, D=1, F=0)
- Add custom courses with Credit weight and Grade dropdowns.
- Real-time calculation of Total Credits, Total Grade Points, and CGPA score.
- Dynamic Academic Standing indicator (e.g. *First Class with Distinction*).
- Reset and update functionality.

### 🛠️ 7. Useful Student Tools
- **⏱️ Pomodoro Focus Timer**:
  - Modes: 25-min Focus Study, 5-min Short Break, 15-min Long Break.
  - Interactive circular SVG ring fill animation.
  - Web Audio API synthesized completion chime.
  - Completed focus sessions counter.
- **📝 Text & Word Counter**:
  - Real-time computation of Words, Characters, Characters (no space), Sentences, and Estimated Reading Time.
- **🔢 Percentage Calculator**:
  - Exam marks score percentage calculator (Marks Obtained / Total Marks).
  - Simple percentage calculator ($X\%$ of $Y$).
- **📌 Quick Notes**:
  - Sticky note grid with 5 color choices (Yellow, Blue, Purple, Green, Pink).
  - Auto-saves while typing into LocalStorage.

### 🔗 8. Personal Resource Hub
- Save reference links, lecture slide drives, and textbook URLs.
- Direct "Open Link ↗️" buttons opening links safely in new browser tabs.

---

## 🎨 Theme & Accessibility
- **Light & Dark Mode**: Modern Indigo/Violet accent aesthetic with seamless dark mode toggle.
- **Responsive Layout**: Collapsible sidebar navigation on desktop and touch-friendly sliding menu drawer on mobile.
- **Sample Data Loader**: Includes a `⚡ Load Sample Data` button for instant testing and demonstration.

---

## 🛠️ Technology Stack
- **HTML5**: Semantic markup, modal overlays, accessibility structure.
- **CSS3**: Vanilla CSS, Custom Properties (CSS variables), CSS Grid & Flexbox, smooth keyframe animations, glassmorphism elements.
- **Vanilla JavaScript (ES6+)**: Modular standard JS functions, interval tickers, Web Audio API synthesis, dynamic DOM manipulation.
- **LocalStorage API**: Persistent client-side data storage without any external dependencies.

---

## 🚀 How to Run Locally

1. Clone or download this repository to your computer.
2. Open the project folder (`studentos`).
3. Double-click **`index.html`** to open it directly in any web browser (Chrome, Firefox, Edge, Safari).

*Or serve using any static server (e.g. VS Code Live Server or Python HTTP server):*
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## 🌐 How to Deploy to GitHub Pages

Deploying **StudentOS** to GitHub Pages takes less than 2 minutes:

1. **Create a Repository**:
   - Go to [GitHub](https://github.com) and create a new repository named `studentos`.
2. **Push Code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of StudentOS"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/studentos.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Navigate to your repository **Settings** → **Pages**.
   - Under **Source**, select `Deploy from a branch`.
   - Choose `main` branch and `/ (root)` folder.
   - Click **Save**.
4. **Access your site**:
   - Your live website will be available at:
     `https://YOUR_USERNAME.github.io/studentos/`

---

## 🔮 Future Improvements
- Export/Import student data backup as JSON file.
- Push browser notifications for upcoming exam alerts.
- Weekly study analytics chart.
- Custom grading scale editor.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
