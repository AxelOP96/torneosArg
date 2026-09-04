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