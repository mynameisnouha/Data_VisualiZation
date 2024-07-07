let xAxis, yAxis, xAxisLabel, yAxisLabel, data, x, y;
let channels = ["scatterX", "scatterY", "size"]; // Define channels here
let selectedPoints = new Map(); // Map to keep track of selected points
let parsedData1, parsedData2;
let dimensions1, dimensions2;

function init() {
    // Define size of plots
    margin = { top: 10, right: 10, bottom: 10, left: 50 };
    width = 600;
    height = 600;
    radius = width / 2;

    // Data table
    dataTable1 = d3.select('#dataTable1');
    dataTable2 = d3.select('#dataTable2');

    // Scatterplot SVG container and axes
    scatter = d3.select("#sp").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    // Radar chart SVG container and axes
    radar = d3.select("#radar").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

    // Add event listeners for file inputs
    let fileInput1 = document.getElementById("upload1");
    let fileInput2 = document.getElementById("upload2");

    fileInput1.addEventListener('change', () => readFile("upload1", handleFile1));
    fileInput2.addEventListener('change', () => readFile("upload2", handleFile2));

    // Start at default tab
    let defaultTab = document.getElementById("defaultOpen");
    if (defaultTab) {
        defaultTab.click();
    }
}


// File reading function
let readFile = function (fileInputId, callback) {


    let fileInput = document.getElementById(fileInputId);
    let reader = new FileReader();
    reader.onloadend = function () {
        let csvData = reader.result;
        let parsedData = d3.csvParse(csvData, d3.autoType);
        let dimensions = Object.keys(parsedData[0]).filter(key => !isNaN(parsedData[0][key]));
        console.log(`Numerical attributes for ${fileInputId}:`, dimensions);
        callback(parsedData, dimensions);
    };
    reader.readAsBinaryString(fileInput.files[0]);
};
// Handlers for file inputs
function handleFile1(data, dimensions) {
    console.log("File 1 data loaded:", data);
    parsedData1 = data;
    dimensions1 = dimensions;
    CreateDataTable(data, "dataTable1", "paginationControls1");
    checkIfBothFilesLoaded();
}

function handleFile2(data, dimensions) {
    console.log("File 2 data loaded:", data);
    parsedData2 = data;
    dimensions2 = dimensions;
    CreateDataTable(data, "dataTable2", "paginationControls2");
    checkIfBothFilesLoaded();
}

// Check if both files are loaded, then initialize the visualization
function checkIfBothFilesLoaded() {
    if (parsedData1 && parsedData2) {
        // Combine dimensions from both datasets
        let combinedDimensions = [...new Set([...dimensions1, ...dimensions2])];
        initVis(parsedData1);
        initDashboard(null)
    }
}

// Visualization initialization
function initVis(_data) {
    data=_data
    y = d3.scaleLinear().range([height - margin.bottom - margin.top, margin.top]);
    x = d3.scaleLinear().range([margin.left, width - margin.left - margin.right]);

    yAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ")")
        .call(d3.axisLeft(y));

    yAxisLabel = yAxis.append("text")
        .style("text-anchor", "middle")
        .attr("y", margin.top / 2)
        .text("x");

    xAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom(x));

    xAxisLabel = xAxis.append("text")
        .style("text-anchor", "middle")
        .attr("x", width - margin.right)
        .text("y");

    radarAxesAngle = Math.PI * 2 / dimensions1.length;
    let axisRadius = d3.scaleLinear().range([0, radius]);
    let maxAxisRadius = 0.75,
        textRadius = 0.8;
    gridRadius = 0.1;

    // Initialize menu for the visual channels
    channels.forEach(function(c){
        initMenu(c, dimensions1);
    });

    channels.forEach(function(c){
        refreshMenu(c);
    });

    renderScatterplot();
    renderRadarGrid();
    renderRadarAxes();
}


// Clear visualizations before loading a new file
function clearTable(tableId) {
    if (tableId === "dataTable1") {
        dataTable1.selectAll("*").remove();
    } else if (tableId === "dataTable2") {
        dataTable2.selectAll("*").remove();
    }
}

let currentPage1 = 1;
let currentPage2 = 1;
const rowsPerPage = 100;

// Create Table
function CreateDataTable(_data, tableId, paginationId) {
    clearTable(tableId); // Clear only the relevant table

    if (!_data || _data.length === 0) {
        console.error("No data provided.");
        return;
    }

    let tableContainer = document.getElementById(tableId);
    tableContainer.innerHTML = "";  // Clear previous table if any

    let table = document.createElement("table");
    table.classList.add("dataTableClass");
    tableContainer.appendChild(table);

    let headers = Object.keys(_data[0]);
    let thead = table.createTHead();
    let headerRow = thead.insertRow();
    headers.forEach(headerText => {
        let th = document.createElement("th");
        th.textContent = headerText;
        th.classList.add("tableHeaderClass");
        headerRow.appendChild(th);
    });

    let tbody = document.createElement("tbody");
    table.appendChild(tbody);

    function updateTable(page, paginationId) {
        tbody.innerHTML = "";  // Clear previous rows

        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let pageData = _data.slice(start, end);

        pageData.forEach(rowData => {
            let row = tbody.insertRow();
            headers.forEach(header => {
                let cell = row.insertCell();
                cell.textContent = rowData[header];
                cell.classList.add("tableBodyClass");
            });
        });
    }

    function createPaginationControls(totalRows, paginationId) {
        let paginationControls = document.getElementById(paginationId);
        paginationControls.innerHTML = "";  // Clear previous controls if any

        let totalPages = Math.ceil(totalRows / rowsPerPage);
        if (totalPages <= 1) return;

        function createButton(page, text = page, isActive = false, isDisabled = false) {
            let pageButton = document.createElement("button");
            pageButton.textContent = text;
            pageButton.classList.add("pageButtonClass");
            if (isActive) pageButton.classList.add("active");
            if (isDisabled) pageButton.disabled = true;

            pageButton.addEventListener("click", function () {
                if (paginationId === "paginationControls1") {
                    currentPage1 = page;
                    updateTable(currentPage1, paginationId);
                } else {
                    currentPage2 = page;
                    updateTable(currentPage2, paginationId);
                }
                createPaginationControls(totalRows, paginationId);
            });
            paginationControls.appendChild(pageButton);
        }

        createButton(1, '«', false, (paginationId === "paginationControls1" ? currentPage1 : currentPage2) === 1);

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                createButton(i, i, (paginationId === "paginationControls1" ? currentPage1 : currentPage2) === i);
            }
        } else {
            if ((paginationId === "paginationControls1" ? currentPage1 : currentPage2) <= 4) {
                for (let i = 1; i <= 5; i++) {
                    createButton(i, i, (paginationId === "paginationControls1" ? currentPage1 : currentPage2) === i);
                }
                createButton(null, '...');
                createButton(totalPages);
            } else if ((paginationId === "paginationControls1" ? currentPage1 : currentPage2) > totalPages - 4) {
                createButton(1);
                createButton(null, '...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    createButton(i, i, (paginationId === "paginationControls1" ? currentPage1 : currentPage2) === i);
                }
            } else {
                createButton(1);
                createButton(null, '...');
                for (let i = (paginationId === "paginationControls1" ? currentPage1 : currentPage2) - 1; i <= (paginationId === "paginationControls1" ? currentPage1 : currentPage2) + 1; i++) {
                    createButton(i, i, (paginationId === "paginationControls1" ? currentPage1 : currentPage2) === i);
                }
                createButton(null, '...');
                createButton(totalPages);
            }
        }

        createButton(totalPages, '»', false, (paginationId === "paginationControls1" ? currentPage1 : currentPage2) === totalPages);
    }

    if (paginationId === "paginationControls1") {
        updateTable(currentPage1, paginationId);
        createPaginationControls(_data.length, paginationId);
    } else {
        updateTable(currentPage2, paginationId);
        createPaginationControls(_data.length, paginationId);
    }

    tbody.addEventListener("mouseover", function (event) {
        let targetCell = event.target.closest("td");
        if (targetCell) {
            targetCell.classList.add("hovered-cell");
        }
    });

    tbody.addEventListener("mouseout", function (event) {
        let targetCell = event.target.closest("td");
        if (targetCell) {
            targetCell.classList.remove("hovered-cell");
        }
    });
}


function renderLegend() {
    d3.select("#legend").selectAll("*").remove();

    selectedPoints.forEach((color, point) => {
        let legendItem = d3.select("#legend").append("div")
            .style("display", "flex")
            .style("align-items", "center");

        legendItem.append("div")
            .attr("class", "color-circle")
            .style("background-color", color);

        legendItem.append("span")
            .text(point.LCLid);

        legendItem.append("span")
            .attr("class", "close")
            .text("x")
            .on("click", () => {
                selectedPoints.delete(point);
                renderLegend();
                renderScatterplot();
                renderRadarChart();
            });
    });
}

function handlePointClick(d, element) {
    if (selectedPoints.has(d)) {
        selectedPoints.delete(d);
        element.style("fill", "black");
    } else {
        let color = d3.schemeCategory10[selectedPoints.size % 10];
        selectedPoints.set(d, color);
        element.style("fill", color);
    }
    renderLegend();
    renderRadarChart(); // Update radar chart when a point is clicked
}

function renderScatterplot(){
    let xAttribute = readMenu("scatterX");
    let yAttribute = readMenu("scatterY");
    let sizeAttribute = readMenu("size");

    x.domain(d3.extent(data, d => d[xAttribute])).nice();
    y.domain(d3.extent(data, d => d[yAttribute])).nice();

    xAxis.transition().call(d3.axisBottom(x));
    yAxis.transition().call(d3.axisLeft(y));

    let sizeScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[sizeAttribute]))
        .range([3, 10]);

    xAxisLabel.text(xAttribute);
    yAxisLabel.text(yAttribute);

    let dots = scatter.selectAll(".dot")
        .data(data);

    dots.enter().append("circle")
        .attr("class", "dot")
        .merge(dots)
        .attr("cx", d => x(d[xAttribute]))
        .attr("cy", d => y(d[yAttribute]))
        .attr("r", d => sizeScale(d[sizeAttribute]))
        .attr("opacity", 0.6)
        .style("fill", d => selectedPoints.has(d) ? selectedPoints.get(d) : "black")
        .on("click", function(event, d) {
            handlePointClick(d, d3.select(this));
        });

    dots.exit().remove();
}

function renderRadarGrid() {
    let levels = 5; // Number of concentric circles

    let gridlines = radar.selectAll(".grid")
        .data(d3.range(1, levels + 1).reverse());

    gridlines.enter()
        .append("circle")
        .attr("class", "grid")
        .merge(gridlines)
        .attr("r", d => radius / levels * d)
        .style("stroke", "lightgray")
        .style("fill", "none");

    gridlines.exit().remove();
}

function renderRadarAxes() {
    radarAxesAngle = Math.PI * 2 / dimensions1.length;

    let axis = radar.selectAll(".axis")
        .data(dimensions1);

    let axisEnter = axis.enter().append("g")
        .attr("class", "axis");

    axisEnter.append("line")
        .merge(axis.select("line"))
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radarX(radius, i))
        .attr("y2", (d, i) => radarY(radius, i))
        .style("stroke", "black");

    axisEnter.append("text")
        .merge(axis.select("text"))
        .attr("x", (d, i) => radarX(radius * 1.1, i))
        .attr("y", (d, i) => radarY(radius * 1.1, i))
        .style("text-anchor", "middle")
        .text(d => d);

    axis.exit().remove();
}

function renderRadarChart() {
    // Remove existing radar lines before drawing new ones
    radar.selectAll(".radarLine").remove();
    radar.selectAll(".radarPoint").remove(); // Remove existing radar points before drawing new ones

    selectedPoints.forEach((color, point) => {
        let pointData = dimensions1.map(attr => {
            let value = point[attr];
            let extent = d3.extent(data, d => d[attr]);
            let normalizedValue = (value - extent[0]) / (extent[1] - extent[0]);
            return { value: normalizedValue, axis: attr };
        });

        // Close the shape by adding the first point at the end
        pointData.push(pointData[0]);

        let radarLine = d3.lineRadial()
            .radius(d => radius * d.value) // Adjust scaling as necessary
            .angle((d, i) => i * radarAxesAngle);

        radar.append("path")
            .datum(pointData)
            .attr("class", "radarLine")
            .attr("d", radarLine)
            .style("stroke", color)
            .style("fill", "none")
            .style("stroke-width", 2);

        // Add dots for each point on the radar line
        pointData.forEach((d, i) => {
            if (i < pointData.length - 1) { // Avoid duplicating the first point added at the end
                radar.append("circle")
                    .attr("class", "radarPoint")
                    .attr("cx", radarX(radius * d.value, i))
                    .attr("cy", radarY(radius * d.value, i))
                    .attr("r", 4) // Radius of the points
                    .style("fill", color)
                    .style("stroke", "none");
            }
        });
    });
}

function radarX(radius, index){
    return radius * Math.cos(radarAngle(index));
}

function radarY(radius, index){
    return radius * Math.sin(radarAngle(index));
}

function radarAngle(index){
    return radarAxesAngle * index - Math.PI / 2;
}

// init scatterplot select menu
function initMenu(id, entries) {
    let select = document.getElementById(id);
    select.innerHTML = '';

    entries.forEach(entry => {
        let option = document.createElement("option");
        option.value = entry;
        option.text = entry;
        select.appendChild(option);
    });

    $("#" + id).selectmenu({
        select: function () {
            renderScatterplot();
        }
    }).selectmenu("refresh");
}

// refresh menu after reloading data
function refreshMenu(id){
    $( "#"+id ).selectmenu("refresh");
}

// read current scatterplot parameters
function readMenu(id){
    return $( "#" + id ).val();
}

// switches and displays the tabs
function openPage(pageName, elmnt, color) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    elmnt.style.backgroundColor = color;
}

init(); // Initialize the visualization