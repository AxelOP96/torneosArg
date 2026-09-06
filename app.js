window.rawMatches = [];
window.currentLeague = "ALL";
window.currentCategory = 'all';

document.addEventListener('DOMContentLoaded', ()=>{
    bindGlobalEvents();
    fetchMatches();
})

function bindGlobalEvents(){
    const leagueSelect = document.getElementById('league-filter');
    if(leagueSelect){
        leagueSelect.onchange = (e) =>{
            window.currentLeague = String(e.target.value).trim().toUpperCase();
            applyFilters();
        }
    }

    document.addEventListener('click', (e)=>{
        const tabBtn = e.target.closest('.tab-btn');
        if(tabBtn){
            document.querySelector('.tab-btn').forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');

            window.currentCategory = String(tabBtn.dataset.category || 'all').toLowerCase();
        }
        if(e.target.closest('#refresh-btn')){
            fetchMatches();
        }
    });
}

async function fetchMatches(){
    const grid = document.getElementById('matches-grid') || document.querySelector('.matches-grid');
    const alertBox = document.getElementById('alert-box') || document.querySelector('.alert');
    const refreshBtn = document.getElementById('refresh-btn');

    if(refreshBtn){
        refreshBtn.classList.add('loading');
        refreshBtn.disable = true;
    }
    if(alertBox){
        alertBox.style.display = 'none';
    }
    try{
        const response = await fetch('api.php?t='+new Date().getTime());
        let rawText = await response.text;

        rawText = rawText.replace(/^\uFEFF/,'').trim();
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');

        if(firstBrace !== -1 && lastBrace !== -1){
            rawText = rawText.substring(firstBrace, lastBrace +1);
        }

        const data = JSON.parse(rawText);

        if(data.error){
            throw new Error(data.error);

        
        }

        window.rawMatches = data.matches || [];

        applyFilters();
    }catch(err){
        console.error('Fetch Error', err);
        if(alertBox){
            alertBox.textContent = err.message;
            alertBox.style.display = 'block';
        }
    } finally{
        if(refreshBtn){
            refreshBtn.classList.remove('loading');
            refreshBtn.disable = false;
        }
    }
}

function applyFilters(){
    const grid = document.getElementById('matches-grid') || document.querySelector('.matches-grid');

    if(!grid){
        return ;
    }
    let filtered= [...(window.rawMatches || [])];
    const targetLeague = String(window.currentLeague || 'ALL').trim().toUpperCase();

    if(targetLeague !== 'ALL'){
        filtered = filtered.filter(m => {
            const matchCode = String(m.competitionCode || '').trim().toUpperCase();
            const matchName = String(m.competition || '').trim().toUpperCase();
            return matchCode === targetLeague || matchName === targetLeague;
        })
    }
    updateCounts({
        all:filtered.length,
        live: filtered.filter(m => String(m.category).toLowerCase() === 'live').length,
        finished: filtered.filter(m => String(m.category).toLowerCase() ==='finished').length,
        upcoming: filtered.filter(m => String(m.category).toLowerCase() === 'upcoming').length
    });
    const targetCategory = String(window.currentCategory || 'all').toLowerCase();
    if(targetCategory !== 'all'){
        filtered = filtered.filter(m => String(m.category || '').toLowerCase() === targetCategory);
    }

    renderMatches(filtered, grid);
}

function updateCounts(counts = {}){
    const elAll = document.getElementById('count-all');
    const elLive = document.getElementById('count-live');
    const elFinished = document.getElementById('count-finished');
    const elUpcoming = document.getElementById('count-upcoming');

    if(elAll) elAll.textContent = `(${counts.all ?? 0})`;
    if(elLive) elLive.textContent = `(${counts.live ?? 0})`;
    if(elFinished) elFinished.textContent = `(${counts.finished ?? 0})`;
    if(elUpcoming) elUpcoming.textContent = `(${counts.upcoming ?? 0})`;
}

function renderMatches(matches, container){
    if(matches.length === 0){
        container.innerHTML = '<div class="no-matches-msg" style="padding: 2rem; text-align:center; color: #888;">No se encontraron partidos.</div>';
        return ;
    }
    container.innerHTML = matches.map( match => `
        <div class="match-card">
            <div class="match-header">
                <span class="league-title">${escapeHtml(match.competition)}</span>
                ${getStatusBadge(match)}
            </div>
            <div class="match-body">
                <div class="team home">
                    <span class="team-name">${escapeHtml(match.homeTeam.name)}</span>
                    ${match.homeTeam.crest ? `<img class="team-logo" src="${match.homeTeam.crest}" alt="crest" onerror="this.style.display='none'">` : ''}
                </div>
            <div class="score-board">
                ${String(match.category).toLowerCase() === 'live'
                ? `<div class="score">${match.score.home} - ${match.score.away}</div>
                    <div class="live-time-ticker">${getLiveMinute(match)}</div>`
                : String(match.category).toLowerCase() === 'finished'
                    ? `<div class="score">${match.score.home} - ${match.score.away}</div>`
                    :   `<div class="upcoming-time-box">
                            <span class="match-time">${formatToGMT(match.utcDate || match.time)}</span>
                            <span class="match-date">${formatMatchDate(match.utcDate)}</span>
                        </div>`}
            </div>
            <div class="team-away">
                ${match.awayTeam.crest ? `<img class="team-logo" src="${match.awayTeam.crest}" alt="crest" onerror="this.style.display='none'">` : ''}
                <span class="team-name">${escapeHtml(match.awayTeam.name)}</span>
            </div>
            </div>
            ${renderGoals(match)}
        </div>

    `).join('');
}

function renderGoals(match){
    const goals = match.goals || [];
    const totalScore = (match.score?.home || 0) + (match.score?.away || 0);

    if(goals.length === 0){
        if(totalScore > 0 && (String(match.category).toLowerCase() === 'live' || String(match.category).toLowerCase() === 'finished')){
            return `<div class="match-goals no-details" style="text-align:center; font-size:0.75rem; color:#888;">Detalles de goles no provistos</div>`;
        }
        return '';
    }

    const homeGoals = goals.filter(g => g.team === 'home');
    const awayGoals = goals.filter(g => g.team === 'away');

    return `
        <div class="match-goals">
            <div class="goals-col home-goals">
                ${homeGoals.map(g => `<div>⚽ <strong>${escapeHtml(g.scorer)}</strong>${g.minute}´</div>`).join('') }
            </div>
            <div class="goals-col away-goals">
                ${awayGoals.map(g => `<div>${g.minute}´ <strong>${escapeHtml(g.scorer)}</strong> ⚽</div>`).join('')}
            </div>
        </div>
    `;
}

function formatToGMT(dateStr){
    if(!dateStr) return 'TBD';

    const date = new Date(dateStr);

    if(isNaN(date.getTime())) return dateStr;

    const hours = String(date.getUTCHours()).padStart(2,'0');
    const minutes = String(date.getUTCMinutes().padStart(2,'0'));

    return `${hours}:${minutes} GMT`;
}

function getStatusBadge(match){
    const cat = String(match.category || '').toLowerCase();

    if(cat === 'live'){
        return `<span class="status-badge live"> ${getLiveMinute(match)}</span>`
    }
    else if(cat === 'finished'){
        return `<span class="status-badge finished"> FT}</span>`
    }
    else{
        const timeStr = formatToGMT(match.utcDate || match.time);
        const dateStr = formatMatchDate(match.utcDate);
        return `<span class="status-badge upcoming"> ${timeStr}<small style="display:block; font-size:0.65rem; opacity:0.8;">${dateStr}</small></span>`;
    }
}

function escapeHtml(str){
    if(!str) return '';
    return String(str)
        .replace(/&/g/'&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getLiveMinute(match){
    if(match.minute){
        return `${match.minute}´`;
    }
    if(!match.utcDate) return 'LIVE';

    const matchStart = new Date(match.utcDate).getTime();
    const now = new Date().getTime();

    const diffMinutes = Math.floor((now - matchStart) / (1000 * 60));

    if(diffMinutes < 0) return '0\'';
    if(diffMinutes <= 45) return `${diffMinutes}'`;
    if(diffMinutes >45 && diffMinutes <=60) return 'ET';
    if(diffMinutes >60 && diffMinutes <=105) return `${diffMinutes -15}´`;
    return '90+\'';
}

function formatMatchDate(dateStr){
    if(!dateStr){
        return '';
    }
    const date = new Date(dateStr);
    if(isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-US', {
        timeZone : 'UTC',
        month: 'short',
        day: 'numeric'
    });
}

