// Parse URL parameters
function getGoalsFromURL() {
    const params = new URLSearchParams(window.location.search);
    const goalsParam = params.get('goals');

    if (!goalsParam) {
        return [];
    }

    return goalsParam.split('|').map(goal => goal.trim()).filter(goal => goal.length > 0);
}

// Get Trello parameters from URL
function getTrelloParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        listId: params.get('listId'),
        apiKey: params.get('apiKey'),
        token: params.get('token')
    };
}

// Fetch detailed cards from Trello
async function fetchTrelloCards(listId, apiKey, token) {
    try {
        const url = `https://api.trello.com/1/lists/${listId}/cards?key=${apiKey}&token=${token}&fields=all&members=true&member_fields=all&checklists=all&attachments=true`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Trello API error: ${response.status} ${response.statusText}`);
        }

        const cards = await response.json();

        // Fetch checklists for each card
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

            return {
                ...card,
                checklists
            };
        }));

        return cardsWithDetails;
    } catch (error) {
        console.error('Error fetching Trello cards:', error);
        return [];
    }
}

// Get background gradient from labels
function getBackgroundFromLabels(labels) {
    if (!labels || labels.length === 0) {
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    const colors = labels
        .filter(label => label.color)
        .map(label => getTrelloColor(label.color));

    if (colors.length === 0) {
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    if (colors.length === 1) {
        return `linear-gradient(135deg, ${colors[0]} 0%, ${adjustBrightness(colors[0], -20)} 100%)`;
    }

    // Create gradient with multiple colors
    const step = 100 / colors.length;
    const gradientStops = colors.map((color, index) =>
        `${color} ${index * step}%`
    ).join(', ');

    return `linear-gradient(135deg, ${gradientStops})`;
}

// Convert Trello color names to hex
function getTrelloColor(colorName) {
    const colorMap = {
        'green': '#61bd4f',
        'yellow': '#f2d600',
        'orange': '#ff9f1a',
        'red': '#eb5a46',
        'purple': '#c377e0',
        'blue': '#0079bf',
        'sky': '#00c2e0',
        'lime': '#51e898',
        'pink': '#ff78cb',
        'black': '#344563'
    };
    return colorMap[colorName] || '#667eea';
}

// Adjust brightness of a hex color
function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return {
        formatted,
        diffDays,
        isPast: diffTime < 0
    };
}

// Refresh Trello cards
async function refreshTrelloCards() {
    const trelloParams = getTrelloParams();

    // Only refresh if we're using Trello
    if (trelloParams.listId && trelloParams.apiKey && trelloParams.token) {
        console.log('Refreshing Trello cards...');

        const trelloCards = await fetchTrelloCards(
            trelloParams.listId,
            trelloParams.apiKey,
            trelloParams.token
        );

        if (trelloCards.length > 0) {
            const oldCardsLength = cards.length;
            cards = trelloCards;

            // Reset index if it's out of bounds
            if (currentIndex >= cards.length) {
                currentIndex = 0;
            }

            // Refresh the current display
            displayCard();

            console.log(`Refreshed: ${cards.length} cards loaded (previously ${oldCardsLength})`);
        }
    }
}

// Start auto-refresh
function startAutoRefresh() {
    const trelloParams = getTrelloParams();

    // Only set up auto-refresh if we're using Trello
    if (trelloParams.listId && trelloParams.apiKey && trelloParams.token) {
        stopAutoRefresh();

        refreshInterval = setInterval(() => {
            refreshTrelloCards();
        }, REFRESH_TIME);

        console.log('Auto-refresh enabled: Trello cards will refresh every 5 minutes');
    }
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Initialize goals
async function initializeGoals() {
    const trelloParams = getTrelloParams();

    // Check if Trello parameters are provided
    if (trelloParams.listId && trelloParams.apiKey && trelloParams.token) {
        const trelloCards = await fetchTrelloCards(
            trelloParams.listId,
            trelloParams.apiKey,
            trelloParams.token
        );

        if (trelloCards.length > 0) {
            cards = trelloCards;
        } else {
            cards = [];
        }

        // Start auto-refresh for Trello cards
        startAutoRefresh();
    } else {
        // Fall back to URL goals parameter
        const goals = getGoalsFromURL();
        cards = goals.map(goal => ({ name: goal, isSimple: true }));
    }

    // Initialize display
    displayCard();
    if (cards.length > 1) {
        startRotation();
    }
}

// App state
let cards = [];
let currentIndex = 0;
let rotationInterval = null;
let refreshInterval = null;
const ROTATION_TIME = 10000; // 10 seconds per card (increased for detailed content)
const REFRESH_TIME = 300000; // 5 minutes in milliseconds

// Elements
let cardDisplay = document.getElementById('cardDisplay');

// Display current card
function displayCard() {
    if (cards.length === 0) {
        cardDisplay.innerHTML = '<div class="no-goals">No goals set.<br><br>Add ?goals=goal1|goal2|goal3<br>or<br>?listId=YOUR_LIST_ID&apiKey=YOUR_API_KEY&token=YOUR_TOKEN</div>';
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        return;
    }

    const card = cards[currentIndex];

    // Update background based on labels
    if (!card.isSimple && card.labels) {
        document.body.style.background = getBackgroundFromLabels(card.labels);
    } else {
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    // For simple text goals
    if (card.isSimple) {
        const html = `
            <div class="card-content">
                <div class="card-title">${escapeHtml(card.name)}</div>
            </div>
        `;
        replaceCardContent(html);
        return;
    }

    // Build detailed card HTML
    let html = '<div class="card-content">';

    // Title
    html += `<div class="card-title">${escapeHtml(card.name)}</div>`;

    // Labels
    if (card.labels && card.labels.length > 0) {
        html += '<div class="card-labels">';
        card.labels.forEach(label => {
            const bgColor = getTrelloColor(label.color);
            const textColor = isLightColor(bgColor) ? '#333' : '#fff';
            const labelName = label.name || label.color;
            html += `<span class="label" style="background-color: ${bgColor}; color: ${textColor}">${escapeHtml(labelName)}</span>`;
        });
        html += '</div>';
    }

    // Meta information
    const metaItems = [];

    // Due date
    if (card.due) {
        const dueDate = formatDate(card.due);
        let dueClass = '';
        let dueText = `📅 Due: ${dueDate.formatted}`;

        if (dueDate.isPast) {
            dueClass = 'overdue';
            dueText = `⚠️ Overdue: ${dueDate.formatted}`;
        } else if (dueDate.diffDays <= 2) {
            dueClass = 'due-soon';
            dueText = `⏰ Due soon: ${dueDate.formatted}`;
        }

        metaItems.push(`<div class="card-meta-item ${dueClass}">${dueText}</div>`);
    }

    if (metaItems.length > 0) {
        html += `<div class="card-meta">${metaItems.join('')}</div>`;
    }

    // Description
    if (card.desc) {
        html += `<div class="card-description">${escapeHtml(card.desc)}</div>`;
    }

    // Members
    if (card.members && card.members.length > 0) {
        html += '<div class="card-members">';
        card.members.forEach(member => {
            const avatarUrl = member.avatarUrl ? `${member.avatarUrl}/50.png` : '';
            html += `
                <div class="member">
                    ${avatarUrl ? `<img src="${avatarUrl}" class="member-avatar" alt="${escapeHtml(member.fullName)}">` : '<div class="member-avatar"></div>'}
                    <span>${escapeHtml(member.fullName)}</span>
                </div>
            `;
        });
        html += '</div>';
    }

    // Checklists
    if (card.checklists && card.checklists.length > 0) {
        html += '<div class="card-checklists">';
        card.checklists.forEach(checklist => {
            const total = checklist.checkItems.length;
            const completed = checklist.checkItems.filter(item => item.state === 'complete').length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;

            html += `
                <div class="checklist">
                    <div class="checklist-title">${escapeHtml(checklist.name)}</div>
                    <div class="checklist-progress">
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span>${completed}/${total}</span>
                    </div>
                    <div class="checklist-items">
            `;

            checklist.checkItems.forEach(item => {
                const isComplete = item.state === 'complete';
                html += `
                    <div class="checklist-item ${isComplete ? 'completed' : ''}">
                        <div class="checkbox ${isComplete ? 'checked' : ''}">${isComplete ? '✓' : ''}</div>
                        <span>${escapeHtml(item.name)}</span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    html += '</div>';

    replaceCardContent(html);
}

// Replace card content with animation reset
function replaceCardContent(html) {
    const parent = cardDisplay;
    const clone = cardDisplay.cloneNode(false);
    clone.innerHTML = html;
    parent.parentNode.replaceChild(clone, parent);
    cardDisplay = clone;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Check if color is light
function isLightColor(hex) {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 180;
}

// Start rotation
function startRotation() {
    if (cards.length <= 1) return;

    stopRotation();

    rotationInterval = setInterval(() => {
        nextCard();
    }, ROTATION_TIME);
}

// Stop rotation
function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
    }
}

// Next card
function nextCard() {
    currentIndex = (currentIndex + 1) % cards.length;
    displayCard();
}

// Initialize
initializeGoals();
