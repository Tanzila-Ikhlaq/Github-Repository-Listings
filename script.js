const image = document.querySelector("img");
const details = document.querySelector(".details");
const loader = document.querySelector(".loader");
const pagination = document.querySelector("nav[aria-label='Page navigation example']");
const btn = document.querySelector("button");
const repositories = document.querySelector(".repositories");
const itemsPerPageSelect = document.querySelector("#itemsPerPage");
const searchInput = document.querySelector("#search");
const previousPageButton = document.getElementById("previousPage");
const currentPageButton = document.getElementById("currentPage");

let currentPage = 1;
let itemsPerPage = 10; // Default

// Setting default search value
searchInput.value = "johnpapa";

// Function to show/hide the loader
const toggleLoader = (show) => {
    loader.style.display = show ? "block" : "none";
};

// Function to update the pagination buttons
const updatePaginationButtons = () => {
    previousPageButton.classList.toggle("disabled", currentPage === 1);
    currentPageButton.classList.toggle("disabled", currentPage === 1);
};

// Function to perform the GitHub API request
const fetchGitHubData = (username) => {
    toggleLoader(true);

    const userUrl = `https://api.github.com/users/${username.trim()}`;
    const apiUrl = `https://api.github.com/users/${username.trim()}/repos?page=${currentPage}&per_page=${itemsPerPage}`;

    Promise.all([fetch(userUrl), fetch(apiUrl)])
        .then(([userResponse, repositoryResponse]) => {
            if (!userResponse.ok) {
                throw new Error(`Error fetching user data: ${userResponse.status} - ${userResponse.statusText}`);
            }
            if (!repositoryResponse.ok) {
                throw new Error(`Error fetching repositories: ${repositoryResponse.status} - ${repositoryResponse.statusText}`);
            }

            return Promise.all([userResponse.json(), repositoryResponse.json()]);
        })
        .then(([userData, repositoryData]) => {
            details.innerHTML = `
                <img src="${userData.avatar_url}" alt="Profile Image">
                <label>Name: ${userData.name || "N/A"}</label>
                <label>Company: ${userData.company || "N/A"}</label>
                <label>Location: ${userData.location || "N/A"}</label>
            `;

            repositories.innerHTML = ""; 
            repositoryData.forEach(async (element) => {
                const repositoryElement = document.createElement("div");
                repositoryElement.classList.add("repo");

                const lngUrl = `https://api.github.com/repos/${username.trim()}/${element.name}/languages`;
                const languagesResponse = await fetch(lngUrl);
                const languagesData = await languagesResponse.json();

                repositoryElement.innerHTML = `
                    <div class="card text mb-3" style="width: 18rem;">
                        <div class="card-body ">
                            <h5 class="card-title">${element.name}</h5>
                            <p class="card-text">${element.description || "No description available"}</p>
                            <p class="card-text">Languages: ${Object.keys(languagesData).join(", ") || "No languages available"}</p>
                            <a href="${element.html_url}" target="_blank">View on GitHub</a>
                        </div>
                    </div>
                `;
                repositories.appendChild(repositoryElement);
            });

            // Show pagination if there are repositories
            if (repositoryData.length > 0) {
                pagination.style.display = "block";
            } else {
                // Hide pagination if there are no repositories
                pagination.style.display = "none";
            }

            updatePaginationButtons();
            toggleLoader(false); 
        })
        .catch((error) => {
            console.error("Error fetching data:", error.message);
            alert("User not found or an error occurred. Please try again.");
            toggleLoader(false); 
        });
};


fetchGitHubData(searchInput.value);

btn.addEventListener("click", (e) => {
    e.preventDefault();
    currentPage = 1; 
    fetchGitHubData(searchInput.value);
});

pagination.addEventListener("click", (e) => {
    e.preventDefault();
    if (!e.target.classList.contains("disabled") && e.target.classList.contains("page-link")) {
        currentPage++;
        fetchGitHubData(searchInput.value);
        updatePaginationButtons(); 

    }
});
