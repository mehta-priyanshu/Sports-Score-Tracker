function displayData(players) {
    const tbody = document.getElementById("DataTableBody")
    tbody.innerHTML = "";

    if(players.length > 0) {
        players.forEach((player, index) => {
            const row = document.createElement("tr");
            row.setAttribute("data-id", player._id);
            row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            `;
            tbody.appendChild(row);
        });
    } else {
        console.warn ("No player available to display.");
        tbody.innerHTML = '<tr><td colspan="2">No player found</td></tr>';
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

    //Fetch and Update the table
    async function fetchPlayersForTable() {
        try {
            const response = await fetch("/get-player");
            if (!response.ok) throw new Error("Failed to fetch player data");
    
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                displayData(data.data);
            } else {
                console.warn("No player found.");
                displayData([]);
            }
        } catch (error) {
            console.error("Error fetching players for table:", error);
        }
    }
    
    // Update Table UI
    function displayData(players) { 
        const tbody = document.getElementById("DataTableBody");
        tbody.innerHTML = "";
    
        if (players.length > 0) {
            players.forEach((player, index) => {
                const row = document.createElement("tr");
                row.setAttribute("data-id", player._id);
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${player.totalMatches || 0}</td>
                    <td>${player.wins || 0}</td>
                    <td>${player.losses || 0}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No player found</td></tr>';
        }
    }