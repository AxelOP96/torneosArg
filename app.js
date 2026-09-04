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