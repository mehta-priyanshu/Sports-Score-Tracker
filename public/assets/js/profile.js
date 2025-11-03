function showToast(message) {
    const toastMessage = document.getElementById("toastMessage");
    toastMessage.textContent = message;

    const toastElement = document.getElementById("popupToast");
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 }); // auto-hide after 3s
    toast.show();
}

function displayData(players) {
    const tbody = document.getElementById("DataTableBody");
    tbody.innerHTML = ""; // Clear table before adding new rows

    if (players.length > 0) {
        players.forEach((player, index) => {
            const row = document.createElement("tr");
            row.setAttribute("data-id", player._id);
            row.innerHTML = `
                <td data-label="S.No.">${index + 1}</td>
                <td data-label="Name">${player.name}</td>
                <td data-label="Email">${player.email}</td>
                <td data-label="Contact">${player.contact}</td>
                <td data-label="Action" class="action-buttons">
                    <button class="edit-button">Edit</button>
                    <button class="delete-button">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    } else {
        console.warn("No players available to display."); // ✅ Debugging step
        tbody.innerHTML = `<tr><td colspan="5">No players found</td></tr>`;
    }
}


fetch("/get-player")
    .then(response => response.json()) 
    .then(data => {
        //console.log("API Response:", data); // ✅ Debugging step

        // ✅ Extract player data properly
        if (data.success && Array.isArray(data.data)) {
            //console.log("Players fetched from API:", data.data); // ✅ Debugging step
            displayData(data.data);
        } else {
            console.warn("No player found.");
            displayData([]); // Shows "No data found"
        }
    })
    .catch(error => console.error("Error fetching players:", error));

    //Delete the player
    document.addEventListener("DOMContentLoaded", function () {
        document.querySelector("tbody").addEventListener("click", function (event) {
            if (event.target.classList.contains("delete-button")) {
                //console.log("Delete button clicked!");
    
                const row = event.target.closest("tr"); // Get the <tr> element
                const itemId = row ? row.getAttribute("data-id") : null; // Get player ID
    
                //console.log("Item ID:", itemId);
    
                if (!itemId) {
                    console.error("Data ID not found for deletion.");
                    return;
                }
    
                let userConfirmed = window.confirm("Are you sure you want to delete this player?");
                //console.log("User choice:", userConfirmed);
    
                if (userConfirmed) {
                    deletePlayer(itemId, row);
                } else {
                    console.log("User canceled.");
                }
            }
        });
    });
    
    function deletePlayer(itemId, row) {
        //console.log(`Attempting to delete player with ID: ${itemId}`);
    
        fetch(`/api/player/${itemId}`, { method: "DELETE" })
            .then(response => {
                //console.log(`Response status: ${response.status}`);
                if (response.ok) {
                    //console.log(`Player with ID ${itemId} deleted successfully.`);
                    
                    if (row) {
                        row.remove(); // Remove the row only if it exists
                        //console.log("Row removed from table.");
                    } else {
                        console.error("Row not found in the table.");
                    }
                } else {
                    console.error("Failed to delete player on the server.");
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
    }
    // Open Edit Form and Pre-fill Data(Update the Player)
    document.addEventListener("DOMContentLoaded", function () {
        document.querySelector("tbody").addEventListener("click", function (event) {
            if (event.target.classList.contains("edit-button")) {
                console.log("Edit button clicked!");
    
                const row = event.target.closest("tr"); // Get the selected row
                const playerId = row.getAttribute("data-id"); // Get player ID
                const playerName = row.children[1].textContent.trim(); // Get name
                const playerEmail = row.children[2].textContent.trim(); // Get email
                const playerContact = row.children[3].textContent.trim(); // Get contact
    
                console.log("Editing player:", playerId);
    
                // Fill form fields with selected player's data
                document.getElementById("player-id").value = playerId;
                document.getElementById("name").value = playerName;
                document.getElementById("email").value = playerEmail;
                document.getElementById("contact").value = playerContact;
    
                // Show edit form
                document.getElementById("edit-form").style.display = "block";
            }
        });
    
        // Close Edit Form on Cancel Button Click
        document.getElementById("cancel-edit-button").addEventListener("click", function () {
            document.getElementById("edit-form").style.display = "none";
        });
    
        // Handle Form Submission
        document.getElementById("edit-player-form").addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent page refresh
    
            const playerId = document.getElementById("player-id").value;
            const updatedName = document.getElementById("name").value;
            const updatedEmail = document.getElementById("email").value;
            const updatedContact = document.getElementById("contact").value;
    
            console.log(`Updating Player ${playerId}...`);
    
            fetch(`/api/player/${playerId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: updatedName, email: updatedEmail, contact: updatedContact })
            })
            .then(response => {
                if(!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    //console.log("Player updated successfully!");
                    showToast("Player updated successfully!");

                    const row = document.querySelector(`tr[data-id="${playerId}"]`);
                    if(row) {
                        row.children[1].textContent = updatedName;
                        row.children[2].textContent = updatedEmail;
                        row.children[3].textContent = updatedContact;
                    }
                    document.getElementById("edit-form").style.display = "none";
                    //location.reload(); // Refresh table data
                } else {
                    console.error("Failed to update player.");
                    showToast("Error updating player.");
                }
            })
            .catch(error => console.error("Fetch error:", error));
        });
    });
    