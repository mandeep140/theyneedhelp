const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("suggestions");

searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    if (query.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/search?q=${query}`);
        const states = await response.json();
        showSuggestions(states);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});

function showSuggestions(states) {
    if (states.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    suggestionsBox.innerHTML = "";
    states.forEach(state => {
        const div = document.createElement("div");
        div.textContent = state;
        div.addEventListener("click", () => {
            searchInput.value = state; // Set input value
            suggestionsBox.style.display = "none";
        });
        suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
}

document.addEventListener("click", (event) => {
    if (!event.target.closest(".autocomplete-container")) {
        suggestionsBox.style.display = "none";
    }
});
