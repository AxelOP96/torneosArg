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
        }
    }
}