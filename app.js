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

        
    }catch()
}