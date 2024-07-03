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
let counter, chart1, chart2, chart3, chart4, Mean_KHW_January;

function initDashboard(_data) {

    // TODO: Initialize the environment (SVG, etc.) and call the nedded methods
    console.log('we are readable here :)', parsedData)
    //  SVG container
    chart1 = d3.select("#chart1").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

      //  SVG container
      counter = d3.select("#counter").append("svg")
      .attr("width", 300)  // Increased width
      .attr("height", 150)  // Increased height
      .append("g");
  
    //  SVG container
    chart2 = d3.select("#chart2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");


    //  SVG container
    chart3 = d3.select("#chart3").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");


    //  SVG container
    chart4 = d3.select("#chart4").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

        
    createcounter(counter, parsedData);
    createChart1(chart1,parsedData);

    createChart2(chart2,parsedData);
    createChart3();
    createChart4();
}

    function createcounter(svg, parsedData) {
        // Define the dimensions for the counter display
        const width = 300;  // Increased width for better visibility
        const height = 150;  // Increased height for better visibility
        
        // Calculate the number of unique LCLid values
        const numberOfCounters = d3.group(parsedData, d => d.LCLid).size;
    
        // Define a scale for the text size
        const fontSizeScale = d3.scaleLinear()
            .domain([0, d3.max([numberOfCounters, 100])])
            .range([24, 48]); // Minimum and maximum font sizes
    
        // Clear any existing content in the SVG
        svg.selectAll("*").remove();
    
        // Append a background rectangle
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#f0f0f0")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 2)  // Slightly thicker border for better visibility
            .attr("rx", 10)  // Rounded corners
            .attr("ry", 10);
    
        // Append a text element for the counter
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", fontSizeScale(numberOfCounters))
            .attr("fill", "#333")
            .text(numberOfCounters);
    
        // Append a label under the number
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2 + 30)  // Moved down for better spacing
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")  // Slightly larger font size for better visibility
            .attr("fill", "#666")
            .text("Number of Counters");
    
        // Optional: Add a title or additional text
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2 - 40)  // Moved up for better spacing
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")  // Slightly larger font size for better visibility
            .attr("fill", "#555")
            .text("Total Counters");
    
        // Optional: Add some styling for the container
        svg.append("rect")
            .attr("x", 0)
            
    
}

function createChart1(svg, parsedData) {
    // Assume the parsedData has the column 'Mean_KWH_January' for the consumption values

    // Define the dimensions for the chart
    const margin = {top: 10, right: 30, bottom: 30, left: 40};
    const width = 600 - margin.left - margin.right;  // Width of the chart
    const height = 400 - margin.top - margin.bottom;  // Height of the chart
    
    // Define the scales for the x and y axes
    const maxMeanKWHJanuary = d3.max(parsedData, d => d.Mean_KWH_January);
    const x = d3.scaleLinear()
        .domain([0, maxMeanKWHJanuary])  // Domain based on data
        .range([0, width]);  // Map the range to the width of the chart

    const y = d3.scaleLinear()
        .range([height, 0]);  // Map the range to the height of the chart

    // Define the histogram function
    const histogram = d3.histogram()
        .value(d => d.Mean_KWH_January)  // Access the correct data value
        .domain(x.domain())  // Use the x scale domain
        .thresholds(x.ticks(20));  // Define the number of bins (20 for better readability)

    // Apply the histogram function to the data to get the bins
    const bins = histogram(parsedData);
    
    // Update the y scale domain based on the histogram's bins
    y.domain([0, d3.max(bins, d => d.length)]);

    // Append the x and y axes to the chart
    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height + margin.top})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("Mean KWH January");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of Counters");

    // Append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x0) + margin.left)
        .attr("y", d => y(d.length) + margin.top)
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - y(d.length))
        .style("fill", "#69b3a2");
}
//using the density distribution :
  // Compute kernel density estimation
 /* var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))
  var density =  kde( data.map(function(d){  return d.price; }) )

  // Plot the area
  svg.append("path")
      .attr("class", "mypath")
      .datum(density)
      .attr("fill", "#69b3a2")
      .attr("opacity", ".8")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d",  d3.line()
        .curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      );*/

/*function createChart1(svg, parsedData) {
    // Assume the parsedData has the column 'Mean_KHW_January' for the consumption values

    // Define the dimensions for the chart
    const margin = {top: 10, right: 30, bottom: 30, left: 40};
    const width = 600 - margin.left - margin.right;  // Width of the chart
    const height = 400 - margin.top - margin.bottom;  // Height of the chart
    //Cleaning data
    //const cleanData = parsedData.filter(d => !isNaN(+d.Mean_KHW_January))
    //.map(d => ({ ...d, Mean_KHW_January: +d.Mean_KHW_January }));  // Convert to number

    const maxMeanKHWJanuary = d3.max(parsedData, d =>  d.Mean_KWH_January);
    console.log("clean data :", parsedData);
    console.log("Max Mean KHW January:", maxMeanKHWJanuary);  // Check max value
    // Define scales for the x and y axes
    const x = d3.scaleLinear()
        .domain([0, maxMeanKHWJanuary])  // Domain based on data
        .range([0, width]);  // Map the range to the width of the chart

    const y = d3.scaleLinear()
        .range([height, 0]);  // Map the range to the height of the chart

    // Define the histogram function
    const histogram = d3.histogram()
        .value(d => d.Mean_KHW_January)  // Access the correct data value
        .domain(x.domain())  // Use the x scale domain
        .thresholds(x.ticks(70));  // Define the number of bins

    // Apply the histogram function to the data to get the bins
    const bins = histogram(parsedData);
    console.log('bins',bins);  // Log the bins to see if they are created correctly

    // Update the y scale domain based on the histogram's bins
    y.domain([0, d3.max(bins, d => d.length)]);
    console.log("x scale domain:", x.domain());
console.log("x scale range:", x.range());
console.log("y scale domain:", y.domain());
console.log("y scale range:", y.range());

    // Append the x and y axes to the chart
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("Mean KHW January");

    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Number of Counters");

    // Append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", d => `translate(${x(d.x0)}, ${y(d.length)})`)
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - y(d.length))
        .style("fill", "#69b3a2");
}
/*
function createChart1(svg, parsedData){
    /*const xScale = d3.scaleLinear()
    .domain([0, d3.max(parsedData, d => d.x)])
    .range([0, width]);

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(parsedData, d => d.y)])
    .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

svg.append("g")
    .call(yAxis);*/
// Use the parsed data (assuming ParsedData is already available)
/*var data = parsedData;

// Assume the column you want to use for the X axis is named 'value'
var x = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.Mean_KHW_January; })])
    .range([0, width]);

svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Set the parameters for the histogram
var histogram = d3.histogram()
    .value(function(d) { return d.value; })
    .domain(x.domain())
    .thresholds(x.ticks(70));

// Apply the histogram function to data to get the bins
var bins = histogram(data);

// Y axis: scale and draw
var y = d3.scaleLinear()
    .range([height, 0]);
y.domain([0, d3.max(bins, function(d) { return d.length; })]);
svg.append("g")
    .call(d3.axisLeft(y));

// Append the bar rectangles to the svg element
svg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
      .attr("x", 1)
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
      .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
      .attr("height", function(d) { return height - y(d.length); })
      .style("fill", "#69b3a2");


}*/

function createChart2(svg, parsedData) {
    const margin = { top: 20, right: 50, bottom: 50, left: 50 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Remove any existing chart
    svg.selectAll("*").remove();

    // Set up the SVG element with the proper dimensions and margins
    svg = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    console.log("SVG setup completed");

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Calculate total consumption for each user
    const totalConsumption = parsedData.map(d => ({
        LCLid: d.LCLid,
        total: months.reduce((sum, month) => sum + (+d[`Mean_KWH_${month}`] || 0), 0)
    }));

    console.log("Total consumption calculated", totalConsumption);

    // Sort users by total consumption
    totalConsumption.sort((a, b) => b.total - a.total);

    console.log("Total consumption sorted", totalConsumption);

    // Select top 2 and least 2 consumers
    const selectedUsers = [
        ...totalConsumption.slice(0, 2),
        ...totalConsumption.slice(-2)
    ].map(d => d.LCLid);

    console.log("Selected users", selectedUsers);

    // Filter data for selected users
    const filteredData = parsedData.filter(d => selectedUsers.includes(d.LCLid));

    console.log("Filtered data", filteredData);

    const dataMelted = filteredData.flatMap(d => months.map(month => ({
        LCLid: d.LCLid,
        Month: month,
        Mean_KWH: +d[`Mean_KWH_${month}`]  // Convert to number
    })));

    console.log("Data melted", dataMelted);

    const x = d3.scaleBand()
        .domain(months)
        .range([0, width])
        .padding(0.1);

    console.log("X scale set", x.domain());

    const y = d3.scaleLinear()
        .domain([0, d3.max(dataMelted, d => d.Mean_KWH)])
        .nice()
        .range([height, 0]);

    console.log("Y scale set", y.domain());

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const line = d3.line()
        .x(d => x(d.Month))
        .y(d => y(d.Mean_KWH));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    console.log("X axis added");

    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "axis-label");

    console.log("Y axis added");

    const userData = d3.groups(dataMelted, d => d.LCLid);

    console.log("User data grouped", userData);

    userData.forEach(([user_id, values]) => {
        svg.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", color(user_id))
            .attr("stroke-width", 1.5)
            .attr("d", line)
            .attr("class", "line");

        console.log(`Line added for user ${user_id}`);

        svg.selectAll(`.dot-${user_id}`)
            .data(values)
            .enter()
            .append("circle")
            .attr("class", `dot-${user_id}`)
            .attr("cx", d => x(d.Month))
            .attr("cy", d => y(d.Mean_KWH))
            .attr("r", 3)
            .attr("fill", color(user_id));

        console.log(`Dots added for user ${user_id}`);
    });

    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(userData)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width + 20)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", d => color(d[0]));

    legend.append("text")
        .attr("x", width + 15)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d[0])
        .attr("class", "legend");

    console.log("Legend added");
}


/* The FileReader API reads the selected CSV file and triggers the onloadend event.
The d3.csvParse function parses the CSV data, converting it into a format suitable for D3.js processing.
*/

function createChart3(){

}

function createChart4(){

}

// clear files if changes (dataset) occur
function clearDashboard() {

    chart1.selectAll("*").remove();
    chart2.selectAll("*").remove();
    chart3.selectAll("*").remove();
    chart4.selectAll("*").remove();
}
