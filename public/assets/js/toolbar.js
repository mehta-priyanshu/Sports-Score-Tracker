document.addEventListener("DOMContentLoaded", function () {
    fetch("toolbar.html")  // ✅ Relative path because it's inside public
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById("toolbar-container").innerHTML = data;
        })
        .catch(error => console.error("Error loading toolbar:", error));
});
