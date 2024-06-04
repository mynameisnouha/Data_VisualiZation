// scatterplot axes
let xAxis, yAxis, xAxisLabel, yAxisLabel, data, x, y;
let channels = ["scatterX", "scatterY","size"]; // Define channels here
// TO do
// *fix the lengends column that corresponds to the chosen axis: in cars we have: point.Name  
// *fix the intialisation: after changing the dataset all the data vis should be reset
// * add a filter of number of rows, visible number of rows
function init() {
    // define size of plots
    margin = {top: 20, right: 20, bottom: 20, left: 50};
    width = 600;
    height = 500;
    radius = width / 2;

    // Start at default tab
    document.getElementById("defaultOpen").click();

	// data table
	dataTable = d3.select('#dataTable');
 
    // scatterplot SVG container and axes
    scatter = d3.select("#sp").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    // radar chart SVG container and axes
    radar = d3.select("#radar").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

    // read and parse input file
    let fileInput = document.getElementById("upload"), readFile = function () {

        // clear existing visualizations
        clear();

        let reader = new FileReader();
        reader.onloadend = function () {
            // Parse CSV data using d3-dsv
            let csvData = reader.result;
            let parsedData = d3.csvParse(csvData, d3.autoType);

            // Extract numerical attributes and store them in the dimensions array
            dimensions = Object.keys(parsedData[0]).filter(key => !isNaN(parsedData[0][key]));

            // Log the dimensions array to verify
            console.log("Numerical attributes:", dimensions);
           
            // Call the initVis function with the parsed data
            initVis(parsedData);
            CreateDataTable(parsedData);
            initDashboard(null); // Adjust this call as necessary
        };
        reader.readAsBinaryString(fileInput.files[0]);
    };
    fileInput.addEventListener('change', readFile);
    
}

function initVis(_data){
    // Assign data to the global variable
    data = _data;

    // y scalings for scatterplot
    y = d3.scaleLinear()
        .range([height - margin.bottom - margin.top, margin.top]);

    // x scalings for scatter plot
    x = d3.scaleLinear()
        .range([margin.left, width - margin.left - margin.right]);
   
    // radius scalings for radar chart
    let r = d3.scaleLinear()
        .range([0, radius]);

    // scatterplot axes
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

    // radar chart axes
    radarAxesAngle = Math.PI * 2 / dimensions.length;
    let axisRadius = d3.scaleLinear()
        .range([0, radius]);
    let maxAxisRadius = 0.75,
        textRadius = 0.8;
    gridRadius = 0.1;

    // radar axes
    radarAxes = radar.selectAll(".axis")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class", "axis");

    radarAxes.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function(d, i){ return radarX(axisRadius(maxAxisRadius), i); })
        .attr("y2", function(d, i){ return radarY(axisRadius(maxAxisRadius), i); })
        .attr("class", "line")
        .style("stroke", "black");

    // Render grid lines and labels
    radar.selectAll(".axisLabel")
        .data(dimensions)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function(d, i){ return radarX(axisRadius(textRadius), i); })
        .attr("y", function(d, i){ return radarY(axisRadius(textRadius), i); })
        .text(d => d);

    // Initialize menu for the visual channels
    channels.forEach(function(c){
        initMenu(c, dimensions);
    });

    // Refresh all select menus
    channels.forEach(function(c){
        refreshMenu(c);
    });

    // Render the scatterplot and radar chart
    renderScatterplot();
    renderRadarChart();
}

// clear visualizations before loading a new file
function clear(){
    scatter.selectAll("*").remove();
    radar.selectAll("*").remove();
    dataTable.selectAll("*").remove();
}

// Create Table
function CreateDataTable(_data) {
    if (!_data || _data.length === 0) {
        console.error("No data provided.");
        return;
    }

    let tableContainer = document.getElementById("dataTable");
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
    _data.forEach(rowData => {
        let row = tbody.insertRow();
        headers.forEach(header => {
            let cell = row.insertCell();
            cell.textContent = rowData[header];
            cell.classList.add("tableBodyClass");
        });
    });
    table.appendChild(tbody);

    tbody.addEventListener("mouseover", function(event) {
        let targetCell = event.target.closest("td");
        if (targetCell) {
            targetCell.classList.add("hovered-cell");
        }
    });

    tbody.addEventListener("mouseout", function(event) {
        let targetCell = event.target.closest("td");
        if (targetCell) {
            targetCell.classList.remove("hovered-cell");
        }
    });
}
let selectedPoints = new Map(); // Set to keep track of selected points
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
            .text(point.Name);

        legendItem.append("span")
            .attr("class", "close")
            .text("x")
            .on("click", () => {
                selectedPoints.delete(point);
                renderLegend();
                renderScatterplot(); // Only update the scatterplot
                renderRadarChart(); // Only update the radar chart
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
}

function renderScatterplot(){
    let xAttribute = readMenu("scatterX");
    let yAttribute = readMenu("scatterY");
    let sizeAttribute = readMenu("size"); // Renamed variable for clarity

    // Update x and y domains based on selected attributes
    x.domain(d3.extent(data, d => d[xAttribute])).nice();
    y.domain(d3.extent(data, d => d[yAttribute])).nice();

    // Update the axes with new domains
    xAxis.transition().call(d3.axisBottom(x));
    yAxis.transition().call(d3.axisLeft(y));

    // Scale for the size of the dots based on the selected size attribute
    let sizeScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[sizeAttribute])) // Ensure size scale is based on size attribute
        .range([3, 10]); // Adjust the range as needed

    // Update axis labels
    xAxisLabel.text(xAttribute);
    yAxisLabel.text(yAttribute);

    // Bind data to the scatterplot dots and update their attributes
    let dots = scatter.selectAll(".dot")
        .data(data);

    dots.enter().append("circle")
        .attr("class", "dot")
        .merge(dots)
        .attr("cx", d => x(d[xAttribute]))
        .attr("cy", d => y(d[yAttribute]))
        .attr("r", d => sizeScale(d[sizeAttribute])) // Use size scale for the radius
        .attr("opacity", 0.6)
        .style("fill", d => selectedPoints.has(d) ? selectedPoints.get(d) : "black")  // Update the fill color based on selection
        .on("click", function(event, d) {
            handlePointClick(d, d3.select(this));
        });

    dots.exit().remove();
}


function renderRadarChart(){
    radarAxesAngle = Math.PI * 2 / dimensions.length;
    
    let rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, d3.max(data, d => d3.max(dimensions, attr => d[attr]))]);

    let levels = 5;
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

    let axis = radar.selectAll(".axis")
        .data(dimensions);

    let axisEnter = axis.enter().append("g")
        .attr("class", "axis");

    axisEnter.append("line")
        .merge(axis.select("line"))
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radarX(rScale(1), i))
        .attr("y2", (d, i) => radarY(rScale(1), i))
        .style("stroke", "black");

    axisEnter.append("text")
        .merge(axis.select("text"))
        .attr("x", (d, i) => radarX(rScale(1.1), i))
        .attr("y", (d, i) => radarY(rScale(1.1), i))
        .style("text-anchor", "middle")
        .text(d => d);

    axis.exit().remove();

    let radarLine = d3.lineRadial()
        .radius(d => rScale(d.value))
        .angle((d, i) => i * radarAxesAngle)
        .curve(d3.curveLinearClosed);

    let radarData = data.map(d => dimensions.map(attr => ({ value: d[attr], axis: attr })));

    let radarArea = radar.selectAll(".radarArea")
        .data(radarData);

    radarArea.enter()
        .append("path")
        .attr("class", "radarArea")
        .merge(radarArea)
        .attr("d", radarLine)
        .style("fill-opacity", 0.3)
        .style("stroke-width", 1.5)
        .style("stroke", "black")
        .style("fill", (d, i) => d3.schemeCategory10[i % 10]);
    renderLegend();

    radarArea.exit().remove();
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
function openPage(pageName,elmnt,color) {
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
