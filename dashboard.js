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

// TODO: File for Part 2
// TODO: You can edit this file as you wish - add new methods, variables etc. or change/delete existing ones.

// TODO: use descriptive names for variables

let counter, chart1, chart2, chart3, chart4;
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function initDashboard(_data) {


    // TODO: Initialize the environment (SVG, etc.) and call the nedded methods
    console.log('we are readable here :), time data', parsedData1)
    console.log('we are readable here :), clustered data', parsedData2)
    
         // Populate the year dropdown
const years = Array.from(new Set(parsedData1.map(d => d.Year)));  // Extract unique years
const months = Array.from(new Set(parsedData1.map(d => d.Month)))
    .map(month => ({ value: month, text: month }));  // Convert to text for display
    console.log('years',years)
const yearSelect = d3.select("#year");
yearSelect.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

// Populate the month dropdown
const monthSelect = d3.select("#month");
monthSelect.selectAll("option")
    .data(months)
    .enter()
    .append("option")
    .text(d => d.text)
    .attr("value", d => d.value);

    const defaultYear = years[0];
    const defaultMonth = months[0].value;
    populateYearDropdown(parsedData1);
    populateMonthDropdown(parsedData1, d3.select("#year").property("value"));
    
    //  SVG container
    chart1 = d3.select("#chart1").append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

    // SVG container for the counter
    counter = d3.select("#counter").append("svg")
        .attr("width", 300)
        .attr("height", 150)
        .append("g");

    // SVG container for chart 2
    chart2 = d3.select("#chart2").append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

    // SVG container for chart 3
    chart3 = d3.select("#chart3").append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

    // SVG container for chart 4
    chart4 = d3.select("#chart4").append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

        
    createMinMaxStats(parsedData2);

    //createcounter(counter, parsedData2); 
    createChart3(chart3, parsedData2);
    createChart4(chart4, parsedData2);
    // Function to update the chart based on selected month and year
    function updateChart() {
        const selectedMonth = d3.select("#month").property("value");
        const selectedYear = d3.select("#year").property("value");
        //console.log(`Year: ${year}, Month: ${month}`);

        createChart1(chart1, parsedData1, selectedYear, selectedMonth);
        createChart2(chart2, parsedData1, selectedYear, selectedMonth);

    }

    // Add event listeners to update the chart1 based on the selected month or year
    d3.select("#month").on("change", updateChart);
    d3.select("#year").on("change", function() {
        populateMonthDropdown(parsedData1, d3.select("#year").property("value"));
        updateChart();
    });
    // Populate the Label dropdown
    let labelSelect = d3.select("#label");
    let uniqueLabels = Array.from(new Set(parsedData2.map(d => d.label)));
    uniqueLabels.unshift("All"); 
    labelSelect.selectAll("option")
        .data(uniqueLabels)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    labelSelect.on("change", updateAllCharts);
    // Call updateAllCharts initially to render the charts with the first label
    updateAllCharts();
}
//function to update all charts when the label selected changes
    function updateAllCharts() {
        const selectedLabel = d3.select("#label").property("value");
        //console.log('Selected Label:', selectedLabel, 'Type:', typeof selectedLabel);  
    
        // Create a dictionary to hold the filtered data for each label
        let filteredDataByLabel = {};
    
        // Group parsedData2 by the 'label' column
        let groupedParsedData2 = d3.group(parsedData2, d => d.label);
    
        // Filter parsedData1 using the LCLid values for each group in groupedParsedData2
        groupedParsedData2.forEach((values, label) => {
            let lclids = values.map(d => d.LCLid);
            filteredDataByLabel[label] = parsedData1.filter(d => lclids.includes(d.LCLid));
        });
        
         // Display the first few rows of the filtered data for the selected label
    let filteredData1, filteredData2;
    if (selectedLabel === "All") {
        filteredData1 = parsedData1; 
        filteredData2 = parsedData2;
    } else {
        filteredData1 = filteredDataByLabel[selectedLabel] || [];
        let filteredLclids = filteredData1.map(d => d.LCLid);
        filteredData2 = parsedData2.filter(d => filteredLclids.includes(d.LCLid));
        selectedFilteredData1 = filteredData1.map(d => ({ ...d, label: selectedLabel }));

    }

    //console.log('Filtered Data1 for label', selectedLabel, ':', filteredData1);
    //console.log('Filtered Data2 for label', selectedLabel, ':', filteredData2);
    if (selectedLabel !== "All") {
        filteredData1 = selectedFilteredData1;
    }
    updateDashboardCharts(filteredData1, filteredData2);
    }



//function to update all the dashboard

function updateDashboardCharts(filteredData1, filteredData2) {
    // Update each chart in the dashboard with the filtered data
    clearDashboard()
   // createcounter(counter, filteredData2);
    createChart1(chart1, filteredData1, d3.select("#year").property("value"), d3.select("#month").property("value"));
    createChart2(chart2, filteredData1, d3.select("#year").property("value"), d3.select("#month").property("value"));
    createChart3(chart3, filteredData2);
    createChart4(chart4, filteredData2);
}


function createMinMaxStats(parsedData) {
    const period1Stats = getStatsByLabel(parsedData, 'average_consumption_period1');
    const summerStats = getStatsByLabel(parsedData, 'average_consumption_summer');

    const statsContainer = d3.select("#stats-container");
    statsContainer.selectAll("*").remove(); // Clear previous content

    period1Stats.forEach((stats, label) => {
        const card = statsContainer.append("div")
            .attr("class", "card");

        card.append("h2").text(`Label ${label}`);
        
        card.append("p").html(`
            <strong>Average Consumption Period 1:</strong><br>
            Max: ${stats.max.toFixed(2)}<br>
            Min: ${stats.min.toFixed(2)}<br>
            Avg: ${stats.average.toFixed(2)}
        `);

        card.append("p").html(`
            <strong>Average Consumption Summer:</strong><br>
            Max: ${summerStats.get(label).max.toFixed(2)}<br>
            Min: ${summerStats.get(label).min.toFixed(2)}<br>
            Avg: ${summerStats.get(label).average.toFixed(2)}
        `);
    });
}

function getStatsByLabel(data, column) {
    const groupedData = d3.group(data, d => d.label);
    const statsByLabel = new Map();

    groupedData.forEach((values, label) => {
        const columnValues = values.map(d => +d[column]);
        const stats = {
            min: d3.min(columnValues),
            max: d3.max(columnValues),
            average: d3.mean(columnValues)
        };
        statsByLabel.set(label, stats);
    });

    return statsByLabel;
}

// function to calculate the number of LCLid in the dataset and to show it in the dashboard
function createcounter(svg, parsedData) {
    const width = 300;
    const height = 150;
    const numberOfCounters = d3.group(parsedData, d => d.LCLid).size;
    const fontSizeScale = d3.scaleLinear()
        .domain([0, d3.max([numberOfCounters, 100])])
        .range([24, 48]);

    svg.selectAll("*").remove();

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f0f0f0")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2)
        .attr("rx", 10)
        .attr("ry", 10);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", fontSizeScale(numberOfCounters))
        .attr("fill", "#333")
        .text(numberOfCounters);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 + 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("fill", "#666")
        .text("Number of Counters");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 - 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("fill", "#555")
        .text("Total Counters");
}
function populateYearDropdown(data) {
    const years = Array.from(new Set(data.map(d => d.Year)));
    const yearSelect = d3.select("#year");
    yearSelect.selectAll("option").remove();
    yearSelect.selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);
}

function populateMonthDropdown(data, selectedYear) {
    const months = Array.from(new Set(data.filter(d => d.Year == selectedYear).map(d => d.Month)));
    const monthSelect = d3.select("#month");
    monthSelect.selectAll("option").remove();
    monthSelect.selectAll("option")
        .data(months)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);
}
// function to create the density graph
function createChart1(svg, parsedData, selectedYear, selectedMonth) {
    const margin = { top: 70, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const filteredData = parsedData.filter(d => d.Year == selectedYear && d.Month == selectedMonth);

    const dataByLCLid = d3.rollup(filteredData, 
        v => d3.mean(v, d => +d['KWH/hh (per half hour) ']),
        d => d.LCLid
    );

    const data = Array.from(dataByLCLid.values());
    const n = data.length;
    const maxMeanKWH = d3.max(data);

    const x = d3.scaleLinear()
        .domain([0, maxMeanKWH])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, 4])
        .range([height, 0]);

    svg.selectAll('*').remove();

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height + margin.top})`)
        .call(d3.axisBottom(x).tickFormat(d3.format(".2f")))
        .attr("class", "x-axis");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(y))
        .attr("class", "y-axis");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 1.5 + margin.left)
        .attr("y", height + margin.top + 40)
        .text("Energy Consumption (KWH)");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 40)
        .attr("x", -height / 1.5 + margin.top)
        .text("Density");
    //adding legends
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(50,30)");

    legend.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 320)
        .attr("height", 40)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", "white")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("opacity", 0.8);

    legend.append("circle")
        .attr("cx", 10)
        .attr("cy", 0)
        .attr("r", 6)
        .style("fill", "#007bff");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .text("Energy Consumption Density (KWH)");

    legend.append("circle")
        .attr("cx", 10)
        .attr("cy", 20)
        .attr("r", 6)
        .style("fill", "red");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 20)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .text("Peak Usage Points");
    // adding the gradient blue coloring of the graph
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#007bff")
        .attr("stop-opacity", 0.4);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#cce5ff")
        .attr("stop-opacity", 0.2);

    const path = svg.append("path")
        .attr("class", "mypath")
        .datum([])
        .attr("fill", "url(#gradient)")
        .attr("stroke", "#007bff")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round");

    const peaks = svg.append("g");

    function updateChart(bandwidth) {
        const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), x.ticks(40));
        const density = kde(data);

        const minDensity = d3.min(density, d => d[1]);
        const maxDensity = d3.max(density, d => d[1]);

        y.domain([0, maxDensity + 1]);

        svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y));

        path.datum(density)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .curve(d3.curveBasis)
                .x(d => x(d[0]) + margin.left)
                .y(d => y(d[1]) + margin.top)
            );

        peaks.selectAll("circle").remove();

        peaks.selectAll("circle")
            .data(density.filter(d => d[1] > 1))
            .enter()
            .append("circle")
            .attr("cx", d => x(d[0]) + margin.left)
            .attr("cy", d => y(d[1]) + margin.top)
            .attr("r", 3)
            .attr("fill", "red");

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        path.on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
        })
        .on("mousemove", function(event, d) {
            const mouseX = d3.pointer(event, this)[0] - margin.left;
            const kwh = x.invert(mouseX);
            const densityValue = density.find(point => point[0] >= kwh)[1];
            tooltip.html(`KWH: ${kwh.toFixed(2)}<br>Density: ${densityValue.toFixed(2)}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    }

    // Initial chart rendering
    updateChart(0.1);

    // Slider listener
    d3.select("#bandwidthSlider").on("input", function() {
        const bandwidth = +this.value;
        d3.select("#bandwidthValue").text(bandwidth);
        updateChart(bandwidth);
    });

    function kernelDensityEstimator(kernel, X) {
        return function(V) {
            return X.map(function(x) {
                return [x, d3.mean(V, function(v) { return kernel(x - v); })];
            });
        };
    }

    function kernelEpanechnikov(k) {
        return function(v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }
}
//caluculated std, density
//tooltip    
//added peaks
//when a year is selected, the months dynamically changes
    
//function to create the timeseries plot    
function createChart2(svg, parsedData, selectedYear) {
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Filter data for the selected year
    const filteredData = parsedData.filter(d => d.Year == selectedYear);
    //console.log("Filtered data:", filteredData); // Log filtered data

    const dataByLCLid = d3.group(filteredData, d => d.LCLid);
    const meanConsumptionByLCLid = Array.from(dataByLCLid, ([key, values]) => ({
        LCLid: key,
        meanConsumption: d3.mean(values, d => +d['KWH/hh (per half hour) '])
    }));
    //console.log("Mean consumption by LCLid:", meanConsumptionByLCLid); // Log mean consumption by LCLid

    // Sort consumers by mean consumption
    meanConsumptionByLCLid.sort((a, b) => b.meanConsumption - a.meanConsumption);

    // Select top 2 and least 2 consumers
    const top2Consumers = meanConsumptionByLCLid.slice(0, 2);
    const least2Consumers = meanConsumptionByLCLid.slice(-2);
    const selectedConsumers = top2Consumers.concat(least2Consumers);
    const selectedLCLids = new Set(selectedConsumers.map(d => d.LCLid));
    //console.log("Selected consumers:", selectedConsumers); // Log selected consumers

    // Group data by Month and LCLid for the selected consumers
    const monthlyData = Array.from(d3.group(filteredData.filter(d => selectedLCLids.has(d.LCLid)), d => d.Month))
        .map(([month, values]) => ({
            month: +month, // Ensure month is a number
            ...Object.fromEntries(values.map(d => [d.LCLid, +d['KWH/hh (per half hour) '] || 0])),
        }));
   // console.log("Monthly data:", monthlyData); // Log monthly data

    // Setup X and Y scales
    const x = d3.scaleBand()
        .domain([...Array(12).keys()].map(i => i + 1)) // Adjusted to include all 12 months
        .range([margin.left, width + margin.left])
        .padding(0.1);

    const maxValue = d3.max(monthlyData, d => d3.max(Object.values(d).filter(v => typeof v === 'number')));

    const y = d3.scaleLinear()
        .domain([0, maxValue])
        .nice()
        .range([height, margin.top]);

    //console.log("X scale domain:", x.domain());
    //console.log("Y scale domain:", y.domain());

    // Clear any previous content
    svg.selectAll('*').remove();

    // Append X axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `Month ${d}`))
        .append("text")
        .attr("fill", "#000")
        .attr("x", width / 2 + margin.left)
        .attr("y", margin.bottom)
        .attr("text-anchor", "middle")
        .text("Month");
        
    // Append Y axis
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Mean KWH");

    // Color scale
    const color = d3.scaleOrdinal()
        .domain(Array.from(selectedLCLids))
        .range(d3.schemeCategory10);
    //console.log("Color scale domain:", color.domain());
    //console.log("Color scale range:", color.range());

    // Line generator
    const line = d3.line()
        .x(d => x(d.month) + x.bandwidth() / 2)
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    // Append lines for each selected consumer
    selectedConsumers.forEach(consumer => {
        const consumerData = monthlyData.map(d => ({
            month: d.month,
            value: d[consumer.LCLid] || 0,
        }));
        //console.log("Consumer data for", consumer.LCLid, ":", consumerData); // Log consumer data

        // Ensure the data is sorted by month
        consumerData.sort((a, b) => a.month - b.month);

        // Check if consumerData has valid points
        if (consumerData.length > 0) {
            svg.append("path")
                .datum(consumerData)
                .attr("fill", "none")
                .attr("stroke", color(consumer.LCLid))
                .attr("stroke-width", 1.5)
                .attr("d", line);

            // Adding tooltip for each line path
            svg.selectAll(`.tooltip-${consumer.LCLid}`)
                .data(consumerData)
                .enter().append("circle")
                .attr("class", `tooltip-${consumer.LCLid}`)
                .attr("cx", d => x(d.month) + x.bandwidth() / 2)
                .attr("cy", d => y(d.value))
                .attr("r", 4)
                .attr("fill", color(consumer.LCLid))
                .on("mouseover", (event, d) => {
                    //console.log("Tooltip data:", d);
                    // Implement tooltip functionality as per your requirement
                });
        } else {
           // console.log(`No valid data for LCLid: ${consumer.LCLid}`);
        }
    });

    // Append legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + margin.right / 2}, ${margin.top})`);
      

    selectedConsumers.forEach((consumer, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", color(consumer.LCLid));

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 10)
            .text(consumer.LCLid)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle");
    });
}



/* The FileReader API reads the selected CSV file and triggers the onloadend event.
The d3.csvParse function parses the CSV data, converting it into a format suitable for D3.js processing.
*/
//function to create the scatter plot   

function createChart3(svg, parsedData) {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 },  // Increased left margin for more space
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create scales for x and y axes
    const x = d3.scaleLinear()
        .domain(d3.extent(parsedData, d => d['component_1']))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain(d3.extent(parsedData, d => d['component_2']))
        .range([height, 0]);

    // Initialize SVG element
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (margin.left + 20) + "," + margin.top + ")");  // Translated the graph to the right

    // Add initial X axis with opacity 0
    const xAxis = svg.append("g")
        .attr("class", "myXaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .attr("opacity", "0");

    // Add Y axis
    const yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    // Add X axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 8)
        .style("text-anchor", "middle")
        .text("Principal Component 1");

    // Add Y axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2 - 20)
        .attr("y", -margin.left + 20)
        .style("text-anchor", "middle")
        .text("Principal Component 2");

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("color", "black");  

    // Add initial dots with small radius and no opacity
    const dots = svg.append('g')
        .selectAll("circle")
        .data(parsedData)
        .enter()
        .append("circle")
        .attr("cx", 0)  // Start at the y-axis (x=0)
        .attr("cy", d => y(d['component_2']))
        .attr("r", 3)  // Increased dot size
        .style("fill", "#007bff");

    // Transition the X axis
    x.domain([d3.min(parsedData, d => d['component_1']), d3.max(parsedData, d => d['component_1'])]);
    svg.select(".myXaxis")
        .transition()
        .duration(2000)
        .attr("opacity", "1")
        .call(d3.axisBottom(x));

    // Animate the dots to their final position
    svg.selectAll("circle")
        .transition()
        .delay((d, i) => i * 3)
        .duration(2000)
        .attr("cx", d => x(d['component_1']));

    // Add tooltip interaction
    svg.selectAll("circle")
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`LCLID: ${d.LCLid}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}



function createChart4(svg, data) {
        console.log('we are in chart4', data);
      
    
       
        // Example implementation of the chart drawing logic
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const screenWidth = window.innerWidth; 
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);


    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // Aggregate data by label to calculate the statistics for average_consumption_period2
        const labelData = d3.rollup(data,
            v => ({
                consumptionData: v.map(d => +d.average_consumption_period2) // Convert to numeric
            }),
            d => d.label
        );
        
        // Convert map to array
        const processedData = Array.from(labelData, ([label, data]) => ({ label, ...data }));
        console.log('processed data', processedData);
        
        // Extract unique labels for x-axis
        const uniqueLabels = processedData.map(d => d.label);
        console.log('unique labels', uniqueLabels);
    
        // Define scales
        const xScale = d3.scaleBand()
                         .domain(uniqueLabels)
                         .range([0, width])
                         .paddingInner(0.1)
                         .paddingOuter(0.2);
    
        const yScale = d3.scaleLinear()
                         .domain([0, d3.max(processedData, d => d3.max(d.consumptionData))])
                         .nice()
                         .range([height, 0]);
    
        console.log('xScale domain:', xScale.domain());
        console.log('yScale domain:', yScale.domain());
    
        // Draw boxes
        svg.selectAll(".box")
           .data(processedData)
           .enter()
           .append("g")
           .attr("transform", d => `translate(${xScale(d.label)},0)`)
           .each(function(d) {
               const consumptionData = d.consumptionData.sort(d3.ascending);
               const q1 = d3.quantile(consumptionData, 0.25);
               const median = d3.quantile(consumptionData, 0.5);
               const q3 = d3.quantile(consumptionData, 0.75);
               const min = d3.min(consumptionData);
               const max = d3.max(consumptionData);
    
               console.log('label:', d.label, 'q1:', q1, 'median:', median, 'q3:', q3, 'min:', min, 'max:', max);
    
               // Draw the box
               d3.select(this).append("rect")
                   .attr("class", "box")
                   .attr("x", 0)
                   .attr("y", yScale(q3))
                   .attr("width", xScale.bandwidth())
                   .attr("height", yScale(q1) - yScale(q3))
                   .attr("stroke", "black")
                   .attr("stroke-width", 1)
                   .style("fill", "#69b3a2");
    
               // Draw median line
               d3.select(this).append("line")
                   .attr("class", "median-line")
                   .attr("x1", 0)
                   .attr("x2", xScale.bandwidth())
                   .attr("y1", yScale(median))
                   .attr("y2", yScale(median))
                   .attr("stroke", "black")
                   .attr("stroke-width", 2);
    
               // Draw whiskers
               d3.select(this).append("line")
                   .attr("class", "whisker")
                   .attr("x1", xScale.bandwidth() / 2)
                   .attr("x2", xScale.bandwidth() / 2)
                   .attr("y1", yScale(min))
                   .attr("y2", yScale(q1))
                   .attr("stroke", "black")
                   .attr("stroke-width", 1);
    
               d3.select(this).append("line")
                   .attr("class", "whisker")
                   .attr("x1", xScale.bandwidth() / 2)
                   .attr("x2", xScale.bandwidth() / 2)
                   .attr("y1", yScale(max))
                   .attr("y2", yScale(q3))
                   .attr("stroke", "black")
                   .attr("stroke-width", 1);
    
               // Draw outliers
               const outliers = consumptionData.filter(d => d < min || d > max);
               d3.select(this).selectAll(".outlier")
                   .data(outliers)
                   .enter().append("circle")
                   .attr("class", "outlier")
                   .attr("cx", xScale.bandwidth() / 2)
                   .attr("cy", d => yScale(d))
                   .attr("r", 3)
                   .attr("fill", "black");
    
               // Add label below the box
               d3.select(this).append("text")
                   .attr("x", xScale.bandwidth() / 2)
                   .attr("y", height + 20)
                   .attr("text-anchor", "middle");
                   //.text(d.label);
           });
    
        // Draw y-axis
        svg.append("g")
           .attr("class", "y-axis")
           .call(d3.axisLeft(yScale));
    
        // Draw x-axis
        svg.append("g")
           .attr("class", "x-axis")
           .attr("transform", `translate(0,${height})`)
           .call(d3.axisBottom(xScale))
    }
    
// clear files if changes (dataset) occur
function clearDashboard() {

    chart1.selectAll("*").remove();
    chart2.selectAll("*").remove();
    chart3.selectAll("*").remove();
    chart4.selectAll("*").remove();
}
