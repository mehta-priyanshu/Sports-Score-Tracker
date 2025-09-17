// Global toast function
function showToast(message) {
    const toastMessage = document.getElementById("toastMessage");
    toastMessage.textContent = message;

    const toastElement = document.getElementById("popupToast");
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 }); // auto-hide after 3s
    toast.show();
}

document.addEventListener("DOMContentLoaded", async () => {
    // Choose Game
    document.getElementById("chooseGame").addEventListener("click", () => {
        const selectedGame = document.getElementById('gameSelection').value;
        if (!selectedGame) {
            showToast("Please select a game!");
            return;
        }
        document.querySelector(".game-selection-container").style.display = "none";
        document.querySelector(".selection-container").style.display = "block";
    });

    // Load Players
    try {
        const response = await fetch("/get-player");
        const players = await response.json();
        if (!players.success) throw new Error("Failed to load players");

        const playerSelection = document.getElementById("player-selection");
        const selectedPlayers = [];

        players.data.forEach(player => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = player.name;
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    selectedPlayers.push(player.name);
                } else {
                    selectedPlayers.splice(selectedPlayers.indexOf(player.name), 1);
                }
            });
            
            const label = document.createElement("label");
            label.textContent = player.name;
            label.prepend(checkbox);
            
            playerSelection.appendChild(label);
        });

        // Start Game
        document.getElementById("startGame").addEventListener("click", () => {
            if (selectedPlayers.length < 2) {
                showToast("Select at least 2 players!");
                return;
            }

            document.querySelector(".selection-container").style.display = "none";
            document.getElementById("gameContainer").style.display = "block";

            // Display selected players in a circle around the center deck
            const selectedGame = document.getElementById('gameSelection').value.toUpperCase();
            document.getElementById('centerDeck').textContent = selectedGame;
            
            const gameContainer = document.getElementById("gameContainer");
            const totalPlayers = selectedPlayers.length;
            const radius = Math.min(window.innerWidth, window.innerHeight) / 2.5;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            selectedPlayers.forEach((player, index) => {
                const angle = (index / totalPlayers) * (2 * Math.PI);
                const posX = centerX + radius * Math.cos(angle);
                const posY = centerY + radius * Math.sin(angle);

                const playerDiv = document.createElement("div");
                playerDiv.classList.add("player");
                playerDiv.innerText = player;
                playerDiv.style.left = `${posX}px`;
                playerDiv.style.top = `${posY}px`;
                playerDiv.style.transform = "translate(-50%, -50%)";

                playerDiv.addEventListener("click", async () => {
                    if (!confirm(`Declare ${player} as the winner?`)) return;

                    try {
                        const response = await fetch("/winner", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ winner: player, matchPlayers: selectedPlayers })
                        });

                        const result = await response.json();
                        if (result.success) {
                            showToast(`${player} is the winner!`);
                        } else {
                            showToast("Failed to save winner.");
                        }
                    } catch (error) {
                        console.error("Error saving winner:", error);
                        showToast("Error saving winner.");
                    }
                });

                gameContainer.appendChild(playerDiv);
            });
        });
    } catch (error) {
        console.error("Error loading players:", error);
        showToast("Error loading players.");
    }
});
