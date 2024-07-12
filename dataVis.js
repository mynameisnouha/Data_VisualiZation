/*
* Data Visualization - Framework
* Copyright (C) University of Passau
*   Faculty of Computer Science and Mathematics
*   Chair of Cognitive sensor systems
* Maintenance:
*   2024, Alexander Gall <alexander.gall@uni-passau.de>
*
* All rights reserved.
*/ 
/* In this project we are going to use two datasets:
*df1_10: A sample of downsampled energy consumption data
*df_clustered: A summerized dataset after applying a clustering algorithm
*/
let xAxis, yAxis, xAxisLabel, yAxisLabel, data, x, y;
let channels = ["scatterX", "scatterY", "size"];
let selectedPoints = new Map();
let parsedData1, parsedData2;
let dimensions1, dimensions2;
let currentDataset = 2; // 2 for second dataset, 1 for first dataset

function init() {
    margin = { top: 10, right: 50, bottom: 50, left: 50 }; // Increased right margin
    width = 700; // Increased width
    height = 700; // Increased height
    radius = Math.min(width, height) / 2 - 150; // Reduced radius to add more padding
    

    dataTable1 = d3.select('#dataTable1');
    dataTable2 = d3.select('#dataTable2');

    scatter = d3.select("#sp").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // Adjusted transform

    radar = d3.select("#radar").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");//centering the radar in the svg element

    let fileInput1 = document.getElementById("upload1");
    let fileInput2 = document.getElementById("upload2");

    fileInput1.addEventListener('change', () => readFile("upload1", handleFile1));
    fileInput2.addEventListener('change', () => readFile("upload2", handleFile2));

    let defaultTab = document.getElementById("defaultOpen");
    if (defaultTab) {
        defaultTab.click();
    }

    document.getElementById('toggleDatasetBtn').addEventListener('click', toggleDataset);

    // Load the second dataset by default
    if (parsedData2) {
        initVis(parsedData2, dimensions2);
    }
}

function readFile(fileInputId, callback) {
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
}

function handleFile1(data, dimensions) {
    console.log("File 1 data loaded:", data);
    parsedData1 = data;
    dimensions1 = dimensions;
    CreateDataTable(data, "dataTable1", "paginationControls1");
    document.getElementById("rowCount1").innerText = `Number of rows loaded: ${data.length}`;
    checkIfBothFilesLoaded();
}

function handleFile2(data, dimensions) {
    console.log("File 2 data loaded:", data);
    parsedData2 = data;
    dimensions2 = dimensions;
    CreateDataTable(data, "dataTable2", "paginationControls2");
    document.getElementById("rowCount2").innerText = `Number of rows loaded: ${data.length}`;
    checkIfBothFilesLoaded();
}


function checkIfBothFilesLoaded() {
    if (parsedData1 && parsedData2) {
        if (currentDataset === 1) {
            initVis(parsedData1, dimensions1);
            initDashboard(null);

        } else {
            initVis(parsedData2, dimensions2);
            initDashboard(null);

        }
    }
}


function toggleDataset() {
    currentDataset = currentDataset === 1 ? 2 : 1;
    if (currentDataset === 1) {
        console.log("Switching to dataset 1");
        initVis(parsedData1, dimensions1);
    } else {
        console.log("Switching to dataset 2");
        initVis(parsedData2, dimensions2);
    }
}


function initVis(_data, _dimensions) {
    if (!_data || _data.length === 0) {
        console.error("Invalid data provided to initVis.");
        return;
    }
    data = _data;
    dimensions = _dimensions; // Set dimensions according to the current dataset
    console.log('data for viz', data);
    console.log('dimensions for viz', dimensions);

    scatter.selectAll("*").remove();
    radar.selectAll("*").remove();

    y = d3.scaleLinear().range([height - margin.bottom - margin.top, margin.top]);
    x = d3.scaleLinear().range([margin.left, width - margin.left - margin.right]);

    yAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ")")
        .call(d3.axisLeft(y));

    yAxisLabel = yAxis.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -margin.top - height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .text("y");

    xAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom(x));

    xAxisLabel = xAxis.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", margin.bottom + 30)  // Adjusted position
        .style("text-anchor", "middle")
        .text("x");

    radarAxesAngle = Math.PI * 2 / dimensions.length;

    channels.forEach(function(c) {
        initMenu(c, dimensions);
    });

    channels.forEach(function(c) {
        refreshMenu(c);
    });

    renderScatterplot();
    renderRadarGrid();
    renderRadarAxes(dimensions);
}

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

function CreateDataTable(_data, tableId, paginationId) {
    clearTable(tableId);

    if (!_data || _data.length === 0) {
        console.error("No data provided.");
        return;
    }

    let tableContainer = document.getElementById(tableId);
    tableContainer.innerHTML = "";

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
        tbody.innerHTML = "";

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
        paginationControls.innerHTML = "";

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
            } else
            {
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
    console.log("Rendering legend with selected points:", Array.from(selectedPoints.entries()));

    d3.select("#legend").selectAll("*").remove();

    selectedPoints.forEach((color, point) => {
        let legendItem = d3.select("#legend").append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "5px");

        legendItem.append("div")
            .attr("class", "color-circle")
            .style("background-color", color)
            .style("width", "12px")
            .style("height", "12px")
            .style("border-radius", "50%")
            .style("margin-right", "10px");

        legendItem.append("span")
            .text(point.LCLid)
            .style("flex-grow", "1");

        legendItem.append("span")
            .attr("class", "close-button")
            .style("cursor", "pointer")
            .style("margin-left", "10px")
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
    console.log("Data point clicked:", d);
    console.log("Element clicked:", element);

    if (selectedPoints.has(d)) {
        console.log("Removing selected point:", d);
        selectedPoints.delete(d);
        element.style("fill", "black");
    } else {
        console.log("Adding selected point:", d);
        let color = d3.schemeCategory10[selectedPoints.size % 10];
        selectedPoints.set(d, color);
        element.style("fill", color);
    }

    console.log("Current selected points:", Array.from(selectedPoints.entries()));

    renderLegend();
    renderRadarChart(); 
    
}


function renderScatterplot() {
    let xAttribute = readMenu("scatterX");
    let yAttribute = readMenu("scatterY");
    let sizeAttribute = readMenu("size");

    console.log("Data for scatterplot:", data);
    console.log("xAttribute:", xAttribute);
    console.log("yAttribute:", yAttribute);
    console.log("sizeAttribute:", sizeAttribute);

    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("Invalid data provided for scatterplot.");
        return;
    }

    if (!data[0].hasOwnProperty(xAttribute) || !data[0].hasOwnProperty(yAttribute) || !data[0].hasOwnProperty(sizeAttribute)) {
        console.error("Invalid attributes provided for scatterplot.");
        return;
    }

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
        .on("mouseover", function(event, d) {
            d3.select(this).style("stroke", "black").style("stroke-width", 1.5);
            tooltip.transition()
                .duration(1000)
                .style("opacity", .9);
            tooltip.html(`${xAttribute}: ${d[xAttribute]}<br>${yAttribute}: ${d[yAttribute]}<br>${sizeAttribute}: ${d[sizeAttribute]}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", null);
            tooltip.transition()
                .duration(1000)
                .style("opacity", 0);
        })
        .on("click", function(event, d) {
            handlePointClick(d, d3.select(this));
        });

    dots.exit().remove();
}

// Add a tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    function renderRadarChart() {
        console.log("Rendering radar chart with selected points:", Array.from(selectedPoints.entries()));
    
        radar.selectAll(".radarLine").remove();
        radar.selectAll(".radarPoint").remove();
    
        selectedPoints.forEach((color, point) => {
            let pointData = dimensions.map(attr => {
                let value = point[attr];
                if (value === undefined || value === null || isNaN(value)) {
                    console.error(`Invalid value for attribute ${attr}:`, value);
                    value = 0; // Handle invalid values
                }
                let extent = d3.extent(data, d => d[attr]);
                let normalizedValue = (value - extent[0]) / (extent[1] - extent[0]);
                console.log(`Attribute: ${attr}, Value: ${value}, Extent: ${extent}, Normalized Value: ${normalizedValue}`);
                return { value: normalizedValue, axis: attr };
            });
    
            console.log("Point data for radar chart:", pointData);
    
            pointData.push(pointData[0]);
    
            let radarLine = d3.lineRadial()
                .radius(d => radius * d.value)
                .angle((d, i) => i * radarAxesAngle);
    
            radar.append("path")
                .datum(pointData)
                .attr("class", "radarLine")
                .attr("d", radarLine)
                .style("stroke", color)
                .style("fill", "none")
                .style("stroke-width", 2);
    
            pointData.forEach((d, i) => {
                if (i < pointData.length - 1) {
                    radar.append("circle")
                        .attr("class", "radarPoint")
                        .attr("cx", radarX(radius * d.value, i))
                        .attr("cy", radarY(radius * d.value, i))
                        .attr("r", 4)
                        .style("fill", color)
                        .style("stroke", "none");
                }
            });
        });
    }
    
    
    

    function renderRadarGrid() {
        let levels = 5;
        let gridlines = radar.selectAll(".grid")
            .data(d3.range(1, levels + 1).reverse());
    
        gridlines.enter()
            .append("circle")
            .attr("class", "grid radar-grid")
            .merge(gridlines)
            .attr("r", d => radius / levels * d)
            .style("stroke", "lightgray")
            .style("fill", "none");
    
        gridlines.exit().remove();
    }
    
    
    
    function renderRadarAxes(dimensions) {
        radarAxesAngle = Math.PI * 2 / dimensions.length;
    
        let axis = radar.selectAll(".axis")
            .data(dimensions);
    
        let axisEnter = axis.enter().append("g")
            .attr("class", "axis");
    
        axisEnter.append("line")
            .attr("class", "radar-axis")
            .merge(axis.select("line"))
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => radarX(radius, i))
            .attr("y2", (d, i) => radarY(radius, i));
    
        axisEnter.append("text")
            .attr("class", "radar-label")
            .merge(axis.select("text"))
            .attr("x", function(d, i) { return radarX(radius + 20, i); }) // Adding margin to labels
            .attr("y", function(d, i) { return radarY(radius + 20, i); }) // Adding margin to labels
            .style("text-anchor", (d, i) => {
                const angle = radarAngle(i);
                if (angle > Math.PI / 2 && angle < 3 * Math.PI / 2) {
                    return "end";
                }
                return "start";
            })
            .attr("dy", ".35em")
            .text(d => d);
    
        axis.exit().remove();
    }
    
    function radarX(radius, index) {
        return radius * Math.cos(radarAngle(index));
    }
    
    function radarY(radius, index) {
        return radius * Math.sin(radarAngle(index));
    }
    
    function radarAngle(index) {
        return radarAxesAngle * index - Math.PI / 2;
    }
    

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

function refreshMenu(id) {
    $("#" + id).selectmenu("refresh");
}

function readMenu(id) {
    return $("#" + id).val();
}

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

init();
