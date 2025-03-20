
document.addEventListener('DOMContentLoaded', () => {
    const moodBtns = document.querySelectorAll('.mood-button');
    const moodMsg = document.getElementById('mood-message');
    const moodListEl = document.getElementById('mood-list');
    const viewDayBtn = document.getElementById('view-day');
    const viewWeekBtn = document.getElementById('view-week');
    const viewMonthBtn = document.getElementById('view-month');
    const calendarDiv = document.getElementById('calendar');

    const LOG_KEY = 'moodLogs';

    const getLogs = () =>{
        try {
            return JSON.parse(localStorage.getItem(LOG_KEY)) || {};
        } catch (error) {
            console.error('Error loading mood data:', error);
            return {}
        }
    }
    const formatDate = (d) => {
        const yr = d.getFullYear();
        const mon = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${yr}-${mon}-${day}`;
    };

    const isSameDay = (d1, d2) => formatDate(d1) === formatDate(d2);
    const isSameWeek = (d1, d2) => {
        const startOfWeek = (date) => {
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
            return new Date(date.setDate(diff));
        };
        return formatDate(startOfWeek(d1)) === formatDate(startOfWeek(d2));
    };
    const isSameMonth = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();

    const saveMood = (mood) => {
        const today = new Date();
        const logs = getLogs();
        logs[formatDate(today)] = mood;
        localStorage.setItem(LOG_KEY, JSON.stringify(logs));
        moodMsg.textContent = `Mood saved: ${mood} for ${formatDate(today)}`;
        loadMoods('day');
        generateCalendar();
    };

    const displayMoods = (filter = 'day') => {
        const logs = getLogs();
        moodListEl.innerHTML = '';
        const today = new Date();
        const logEntries = Object.entries(logs).sort(([, ], [, ]) => -1); // Sort by date descending

        const filteredLogs = logEntries.filter(([dateStr]) => {
            const logDate = new Date(dateStr);
            if (filter === 'day') return isSameDay(logDate, today);
            if (filter === 'week') return isSameWeek(logDate, today);
            if (filter === 'month') return isSameMonth(logDate, today);
            return true; // Should not happen, but for safety
        });

        if (filteredLogs.length === 0) {
            moodListEl.innerHTML = '<p>No moods logged for this view.</p>';
            return;
        }

        filteredLogs.forEach(([date, mood]) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${date}: ${mood}`;
            moodListEl.appendChild(listItem);
        });

        document.querySelectorAll('.view-options button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view-${filter}`).classList.add('active');
    };

    const generateCalendar = () => {
        calendarDiv.innerHTML = '';
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        const logs = getLogs();

        for (let i = 0; i < startDayOfWeek; i++) {
            calendarDiv.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';

            const dateSpan = document.createElement('span');
            dateSpan.textContent = day;
            dayCell.appendChild(dateSpan);

            if (logs[dateStr]) {
                const moodEmojiSpan = document.createElement('span');
                moodEmojiSpan.className = 'calendar-mood-emoji';
                moodEmojiSpan.textContent = logs[dateStr];
                dayCell.appendChild(moodEmojiSpan);
                dayCell.title = `Mood: ${logs[dateStr]}`;
            }
            calendarDiv.appendChild(dayCell);
        }
    };

    moodBtns.forEach(btn => btn.addEventListener('click', () => saveMood(btn.dataset.mood)));
    viewDayBtn.addEventListener('click', () => displayMoods('day'));
    viewWeekBtn.addEventListener('click', () => displayMoods('week'));
    viewMonthBtn.addEventListener('click', () => displayMoods('month'));

    displayMoods('day');
    generateCalendar();
});