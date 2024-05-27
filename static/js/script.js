function clearRiskScanResults() {
    var resultsDiv = document.getElementById("risk-scan-results");
    resultsDiv.innerHTML = "";
}

function getCompanies() {
    var sector = document.getElementById("sector").value;
    var companyDropdown = document.getElementById("company");
    var urlDisplay = document.getElementById("url");

    // Clear the company dropdown, URL display, and risk scan results
    companyDropdown.innerHTML = "<option value=''>Select Company</option>";
    urlDisplay.innerHTML = "";
    clearRiskScanResults();

    if (!sector) {
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_companies/" + sector, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var companies = JSON.parse(xhr.responseText);

                companies.forEach(function(company) {
                    var option = document.createElement("option");
                    option.text = company;
                    option.value = company;
                    companyDropdown.appendChild(option);
                });

                companyDropdown.value = "";
            } else {
                console.error("Error fetching companies:", xhr.status, xhr.statusText);
            }
        }
    };
    xhr.send();
}

function getURL() {
    var company = document.getElementById("company").value; // Get selected company value
    var urlDisplay = document.getElementById("url");

    // Clear risk scan results
    clearRiskScanResults();

    if (!company) {
        urlDisplay.innerHTML = "Please select a company.";
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_url/" + company, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var url = JSON.parse(xhr.responseText);
                if (url && typeof url === 'string') {
                    urlDisplay.innerHTML = "<a href='" + url + "' target='_blank'>" + url + "</a>";
                } else {
                    urlDisplay.innerHTML = "Invalid URL format received.";
                    console.error("Invalid URL format:", xhr.responseText);
                }
            } else {
                urlDisplay.innerHTML = "Error fetching URL.";
                console.error("Error fetching URL:", xhr.status, xhr.statusText);
            }
        }
    };
    xhr.send();
}

function performRiskScan() {
    var url = document.getElementById('url').innerText;
    if (url) {
        initiateRiskScan(url);
    } else {
        alert("Please select a company to perform risk scan.");
    }
}


function initiateRiskScan(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/risk_scan/" + encodeURIComponent(url), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var spinner = document.getElementById('spinner');
            var resultsDiv = document.getElementById('risk-scan-results');
            if (xhr.status == 200) {
                resultsDiv.innerHTML = xhr.responseText; // Display the results
            } else {
                resultsDiv.innerHTML = "Error performing risk scan.";
                console.error("Error performing risk scan:", xhr.status, xhr.statusText);
            }
            spinner.style.display = 'none'; // Hide spinner
            resultsDiv.style.display = 'block'; // Show results
        }
    };
    document.getElementById('spinner').style.display = 'block'; // Show spinner
    document.getElementById('risk-scan-results').style.display = 'none'; // Hide results
    xhr.send();
}

function performRiskScan() {
    var url = document.getElementById('url').innerText;
    if (url) {
        initiateRiskScan(url);
    } else {
        alert("Please select a company to perform risk scan.");
    }
}

function displayRiskScanResults(html_data) {
    var resultsDiv = document.getElementById("risk-scan-results");
    resultsDiv.innerHTML = html_data; // Append HTML received from server
    document.getElementById('spinner').style.display = 'none'; // Hide spinner
    resultsDiv.style.display = 'block'; // Show results
}

function downloadCSV() {
    // Get the HTML table containing the risk scan results
    var table = document.getElementById("risk-scan-results").querySelector("table");

    if (!table) {
        alert("No table found in the risk-scan-results div.");
        return;
    }

    // Create a CSV content from the table
    var csvContent = "data:text/csv;charset=utf-8,";

    // Get the table headers including the first empty header cell
    var headers = [];
    table.querySelectorAll("thead th").forEach(function(th) {
        headers.push(th.innerText.trim());
    });
    csvContent += headers.join(",") + "\n";

    // Iterate over the table rows
    table.querySelectorAll("tbody tr").forEach(function(row) {
        var rowData = [];
        // Iterate over the cells in the row
        row.querySelectorAll("th, td").forEach(function(cell) {
            // Replace any commas in the cell text with spaces
            var cellText = cell.innerText.trim().replace(/,/g, ' ');
            rowData.push(cellText);
        });
        csvContent += rowData.join(",") + "\n";
    });

    // Create a data URI for the CSV content
    var encodedURI = encodeURI(csvContent);

    // Create a temporary link element and trigger a download
    var link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", "risk_scan_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', function() {
    const sectorDropdown = document.getElementById('sector');
    const companyDropdown = document.getElementById('company');
    const contentDiv = document.getElementById('risk-scan-results');
    const myButton = document.getElementById('secondbutton');

    // Function to check if contentDiv has content
    function checkContent() {
        if (contentDiv.innerHTML.trim() !== '') {
            contentDiv.style.height = 'auto'; // Auto height to fit content
            myButton.style.display = 'block'; // Show the button
            contentDiv.style.padding = '10px';
        } else {
            contentDiv.style.height = '0'; // Zero height to hide content
            contentDiv.style.padding = '0';
            myButton.style.display = 'none'; // Hide the button
        }
    }

    // Initial check when the page loads
    checkContent();

    // Observe changes to contentDiv
    const observer = new MutationObserver(checkContent);
    observer.observe(contentDiv, { childList: true, subtree: true });

    // Clear risk scan results when dropdowns change
    sectorDropdown.addEventListener('change', clearRiskScanResults);
    companyDropdown.addEventListener('change', clearRiskScanResults);
});

