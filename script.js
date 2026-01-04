// Hijri date calculation functions
function getHijriDate(gregorianDate) {
    const day = gregorianDate.getDate();
    const month = gregorianDate.getMonth() + 1;
    const year = gregorianDate.getFullYear();

    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    let l = jd - 1948440 + 10632;
    let n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;

    const hijriMonth = Math.floor((24 * l) / 709);
    const hijriDay = l - Math.floor((709 * hijriMonth) / 24);
    const hijriYear = 30 * n + j - 30;

    const hijriMonthNames = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
                            'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'];

    return {
        day: hijriDay,
        month: hijriMonth,
        monthName: hijriMonthNames[hijriMonth - 1],
        year: hijriYear
    };
}

function updateDateTime() {
    const now = new Date();
    const gmt7Offset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const gmt7Time = new Date(now.getTime() + (gmt7Offset + localOffset) * 60000);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[gmt7Time.getDay()];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[gmt7Time.getMonth()];
    const day = gmt7Time.getDate();
    const year = gmt7Time.getFullYear();

    const hijri = getHijriDate(gmt7Time);

    const dayDateElement = document.getElementById('dayDate');
    if (dayDateElement) {
        dayDateElement.innerHTML = `${dayName}, ${month} ${day}, ${year}<br>${hijri.day} ${hijri.monthName} ${hijri.year} H`;
    }

    const hours = String(gmt7Time.getHours()).padStart(2, '0');
    const minutes = String(gmt7Time.getMinutes()).padStart(2, '0');
    const seconds = String(gmt7Time.getSeconds()).padStart(2, '0');

    const timeElement = document.getElementById('time');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

setInterval(updateDateTime, 1000);
updateDateTime();

function getGoalsFromURL() {
    const params = new URLSearchParams(window.location.search);
    const goalsParam = params.get('goals');
    if (!goalsParam) return [];
    return goalsParam.split('|').map(goal => goal.trim()).filter(goal => goal.length > 0);
}

function getTrelloParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        listId: params.get('listId'),
        apiKey: params.get('apiKey'),
        token: params.get('token')
    };
}

async function fetchTrelloCards(listId, apiKey, token) {
    try {
        const url = `https://api.trello.com/1/lists/${listId}/cards?key=${apiKey}&token=${token}&fields=all&members=true&member_fields=all&checklists=all&attachments=true`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Trello API error: ${response.status} ${response.statusText}`);
        const cards = await response.json();
        const cardsWithDetails = await Promise.all(cards.map(async (card) => {
            let checklists = [];
            if (card.idChecklists && card.idChecklists.length > 0) {
                checklists = await Promise.all(
                    card.idChecklists.map(async (checklistId) => {
                        const checklistUrl = `https://api.trello.com/1/checklists/${checklistId}?key=${apiKey}&token=${token}`;
                        const checklistResponse = await fetch(checklistUrl);
                        return checklistResponse.json();
                    })
                );
            }
            return { ...card, checklists };
        }));
        return cardsWithDetails;
    } catch (error) {
        console.error('Error fetching Trello cards:', error);
        return [];
    }
}

function getBackgroundFromLabels(labels) {
    if (!labels || labels.length === 0) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const colors = labels.filter(label => label.color).map(label => getTrelloColor(label.color));
    if (colors.length === 0) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (colors.length === 1) return `linear-gradient(135deg, ${colors[0]} 0%, ${adjustBrightness(colors[0], -20)} 100%)`;
    const step = 100 / colors.length;
    const gradientStops = colors.map((color, index) => `${color} ${index * step}%`).join(', ');
    return `linear-gradient(135deg, ${gradientStops})`;
}

function getTrelloColor(colorName) {
    const colorMap = {
        'green': '#61bd4f', 'yellow': '#f2d600', 'orange': '#ff9f1a', 'red': '#eb5a46',
        'purple': '#c377e0', 'blue': '#0079bf', 'sky': '#00c2e0', 'lime': '#51e898',
        'pink': '#ff78cb', 'black': '#344563'
    };
    return colorMap[colorName] || '#667eea';
}

function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    return { formatted, diffDays, isPast: diffTime < 0 };
}

async function refreshTrelloCards() {
    const trelloParams = getTrelloParams();
    if (trelloParams.listId && trelloParams.apiKey && trelloParams.token) {
        console.log('Refreshing Trello cards...');
        const trelloCards = await fetchTrelloCards(trelloParams.listId, trelloParams.apiKey, trelloParams.token);
        if (trelloCards.length > 0) {
            const oldCardsLength = cards.length;
            cards = trelloCards;
            if (currentIndex >= rotationQueue.length) currentIndex = 0;
            refreshDisplay();
            console.log(`Refreshed: ${cards.length} cards loaded (previously ${oldCardsLength})`);
        }
    }
}

function startAutoRefresh() {
    const trelloParams = getTrelloParams();
    if (trelloParams.listId && trelloParams.apiKey && trelloParams.token) {
        stopAutoRefresh();
        refreshInterval = setInterval(() => {
            refreshTrelloCards();
        }, REFRESH_TIME);
        console.log('Auto-refresh enabled: Trello cards will refresh every 5 minutes');
    }
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

async function initializeGoals() {
    const trelloParams = getTrelloParams();
    if (trelloParams.listId && trelloParams.apiKey && trelloParams.token) {
        const trelloCards = await fetchTrelloCards(trelloParams.listId, trelloParams.apiKey, trelloParams.token);
        cards = trelloCards.length > 0 ? trelloCards : [];
        startAutoRefresh();
    } else {
        const goals = getGoalsFromURL();
        cards = goals.map(goal => ({ name: goal, isSimple: true }));
    }
    refreshDisplay();
    if (rotationQueue.length > 1) startRotation();
}

let cards = [];
let currentIndex = 0;
let rotationInterval = null;
let refreshInterval = null;
let rotationQueue = [];
let folderPhotos = [];
const ROTATION_TIME = 10000;
const REFRESH_TIME = 300000;
let cardDisplay = document.getElementById('cardDisplay');

// Load photos from global FOLDER_PHOTOS variable (from photos.js)
function loadPhotosFromFile() {
    if (typeof FOLDER_PHOTOS !== 'undefined') {
        folderPhotos = FOLDER_PHOTOS || [];
        console.log('Loaded photos from photos.js:', folderPhotos.length);
    } else {
        folderPhotos = [];
        console.warn('photos.js not loaded - no photos available');
    }
}

function buildRotationQueue() {
    let queue = [];
    const maxLength = Math.max(cards.length, folderPhotos.length);
    for (let i = 0; i < maxLength; i++) {
        if (i < cards.length) queue.push({ type: 'card', data: cards[i], index: i });
        if (i < folderPhotos.length) queue.push({ type: 'photo', data: folderPhotos[i], index: i });
    }
    return queue;
}

function refreshDisplay() {
    loadPhotosFromFile();
    rotationQueue = buildRotationQueue();
    if (currentIndex >= rotationQueue.length) currentIndex = 0;
    displayCard();
}

function displayCard() {
    if (rotationQueue.length === 0) rotationQueue = buildRotationQueue();
    
    if (rotationQueue.length === 0) {
        cardDisplay.innerHTML = '<div class="no-goals">No goals or photos set.<br><br>Add ?goals=goal1|goal2|goal3<br>or<br>?listId=YOUR_LIST_ID&apiKey=YOUR_API_KEY&token=YOUR_TOKEN<br><br>Use CLI: node add-photo.js &lt;image&gt;</div>';
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        return;
    }

    const item = rotationQueue[currentIndex];
    if (!item) {
        currentIndex = 0;
        if (rotationQueue.length > 0) displayCard();
        return;
    }

    if (item.type === 'photo') {
        const photo = item.data;
        document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${photo.dataUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        const html = `<div class="card-content photo-display"><div class="photo-label">${escapeHtml(photo.name)}</div></div>`;
        replaceCardContent(html);
        return;
    }

    const card = item.data;
    if (!card.isSimple && card.labels) {
        document.body.style.background = getBackgroundFromLabels(card.labels);
    } else {
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    if (card.isSimple) {
        const html = `<div class="card-content"><div class="card-title">${escapeHtml(card.name)}</div></div>`;
        replaceCardContent(html);
        return;
    }

    let html = '<div class="card-content">';
    html += `<div class="card-title">${escapeHtml(card.name)}</div>`;

    const hasLabels = card.labels && card.labels.length > 0;
    const hasDueDate = card.due;
    const hasMembers = card.members && card.members.length > 0;

    if (hasLabels || hasDueDate || hasMembers) {
        html += '<div class="card-info-row">';
        if (hasLabels) {
            html += '<div class="card-labels">';
            card.labels.forEach(label => {
                const bgColor = getTrelloColor(label.color);
                const textColor = isLightColor(bgColor) ? '#333' : '#fff';
                const labelName = label.name || label.color;
                html += `<span class="label" style="background-color: ${bgColor}; color: ${textColor}">${escapeHtml(labelName)}</span>`;
            });
            html += '</div>';
        }
        if (hasDueDate) {
            const dueDate = formatDate(card.due);
            let dueClass = '';
            let dueText = `Due: ${dueDate.formatted}`;
            if (dueDate.isPast) {
                dueClass = 'overdue';
                dueText = `Overdue: ${dueDate.formatted}`;
            } else if (dueDate.diffDays <= 2) {
                dueClass = 'due-soon';
                dueText = `Due soon: ${dueDate.formatted}`;
            }
            html += `<div class="card-meta-item ${dueClass}">${dueText}</div>`;
        }
        if (hasMembers) {
            html += '<div class="card-members">';
            card.members.forEach(member => {
                const avatarUrl = member.avatarUrl ? `${member.avatarUrl}/50.png` : '';
                html += `<div class="member">${avatarUrl ? `<img src="${avatarUrl}" class="member-avatar" alt="${escapeHtml(member.fullName)}">` : '<div class="member-avatar"></div>'}<span>${escapeHtml(member.fullName)}</span></div>`;
            });
            html += '</div>';
        }
        html += '</div>';
    }

    if (card.desc) html += `<div class="card-description">${escapeHtml(card.desc)}</div>`;

    if (card.checklists && card.checklists.length > 0) {
        const twoColumnClass = card.checklists.length >= 2 ? 'two-column' : '';
        html += `<div class="card-checklists ${twoColumnClass}">`;
        card.checklists.forEach(checklist => {
            const total = checklist.checkItems.length;
            const completed = checklist.checkItems.filter(item => item.state === 'complete').length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            html += `<div class="checklist"><div class="checklist-title">${escapeHtml(checklist.name)}</div><div class="checklist-progress"><div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${percentage}%"></div></div><span>${completed}/${total}</span></div><div class="checklist-items">`;
            checklist.checkItems.forEach(item => {
                const isComplete = item.state === 'complete';
                html += `<div class="checklist-item ${isComplete ? 'completed' : ''}"><div class="checkbox ${isComplete ? 'checked' : ''}">${isComplete ? '✓' : ''}</div><span>${escapeHtml(item.name)}</span></div>`;
            });
            html += `</div></div>`;
        });
        html += '</div>';
    }
    html += '</div>';
    replaceCardContent(html);
}

function replaceCardContent(html) {
    const parent = cardDisplay;
    const clone = cardDisplay.cloneNode(false);
    clone.innerHTML = html;
    parent.parentNode.replaceChild(clone, parent);
    cardDisplay = clone;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isLightColor(hex) {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 180;
}

function startRotation() {
    if (rotationQueue.length <= 1) return;
    stopRotation();
    rotationInterval = setInterval(() => {
        nextCard();
    }, ROTATION_TIME);
}

function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
    }
}

function nextCard() {
    if (rotationQueue.length === 0) return;
    currentIndex = (currentIndex + 1) % rotationQueue.length;
    displayCard();
}

function previousCard() {
    if (rotationQueue.length === 0) return;
    currentIndex = (currentIndex - 1 + rotationQueue.length) % rotationQueue.length;
    displayCard();
}

document.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        refreshTrelloCards();
        refreshDisplay();
        return;
    }
    if (rotationQueue.length <= 1) return;
    if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextCard();
        if (rotationInterval) startRotation();
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previousCard();
        if (rotationInterval) startRotation();
    }
});

initializeGoals();
