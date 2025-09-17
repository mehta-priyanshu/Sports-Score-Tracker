document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('player-info').addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const contact = document.getElementById('contact').value;
        const email = document.getElementById('email').value;

        const response = await fetch ('/add-player', {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({name, contact, email})
        });
        const result = await response.json();
        if(response.ok) {
            document.getElementById('player-info').reset();
        }
    });
});