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
    if (!parsedData1 || !parsedData2) {
        console.error('Data is undefined');
        return;
    }

    console.log('we are readable here :), time data', parsedData1);
    console.log('we are readable here :), clustered data', parsedData2);

    // Ensure year and month data is properly defined
    const years = Array.from(new Set(parsedData1.map(d => d.Year)));
    const months = Array.from(new Set(parsedData1.map(d => d.Month)))
        .map(month => ({ value: month, text: month }));

    if (years.length === 0 || months.length === 0) {
        console.error('No valid year or month data found');
        return;
    }
    console.log('years', years);

    const yearSelect = d3.select("#yearSelect");
    yearSelect.selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Populate the month dropdown
    const monthSelect = d3.select("#monthSelect");
    monthSelect.selectAll("option")
        .data(months)
        .enter()
        .append("option")
        .text(d => d.text)
        .attr("value", d => d.value);

    const defaultYear = years[0];
    const defaultMonth = months[0].value;

    // SVG container for chart 1
    chart1 = d3.select("#chart1").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    // SVG container for the counter
    counter = d3.select("#counter").append("svg")
        .attr("width", 300)
        .attr("height", 150)
        .append("g");

    // SVG container for chart 2
    chart2 = d3.select("#chart2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    // SVG container for chart 3
    chart3 = d3.select("#chart3").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    // SVG container for chart 4
    chart4 = d3.select("#chart4").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    createcounter(counter, parsedData2);
    createChart2(chart2, parsedData1, defaultYear, defaultMonth);
    createChart3(chart3, parsedData2);
    createChart4();

    // Function to update the chart based on selected month and year
    function updateChart() {
        const selectedMonth = d3.select("#monthSelect").property("value");
        const selectedYear = d3.select("#yearSelect").property("value");
        createChart1(chart1, parsedData1, selectedYear, selectedMonth);
        createChart2(chart2, parsedData1, selectedYear, selectedMonth);
    }

    // Add event listeners to update the chart1 based on the selected month or year
    d3.select("#monthSelect").on("change", updateChart);
    d3.select("#yearSelect").on("change", updateChart);

    // Call the updateChart function initially to render the chart with default values
    updateChart();
}

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

function createChart1(svg, parsedData, selectedYear, selectedMonth) {
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const filteredData = parsedData.filter(d => d.Year == selectedYear && d.Month == selectedMonth);
    console.log("Filtered data:", filteredData);

    const dataByLCLid = d3.rollup(filteredData,
        v => d3.mean(v, d => +d['KWH/hh (per half hour) ']),
        d => d.LCLid
    );
    console.log("Data by LCLid:", dataByLCLid);

    const data = Array.from(dataByLCLid.values());
    console.log("Average KWH values:", data);

    const n = data.length;

    const maxMeanKWH = d3.max(data);
    const x = d3.scaleLinear()
        .domain([0, maxMeanKWH])
        .range([0, width]);
    console.log("x scale domain:", x.domain());
    console.log("x scale range:", x.range());

    function kernelDensityEstimator(kernel, X) {
        return function (V) {
            return X.map(function (x) {
                return [x, d3.mean(V, function (v) { return kernel(x - v); })];
            });
        };
    }

    const stdDev = d3.deviation(data);
    const bandwidth = 1.06 * stdDev * Math.pow(n, -1 / 5);
    console.log("Bandwidth:", bandwidth);

    function kernelEpanechnikov(k) {
        return function (v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }

    const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), x.ticks(40));
    const density = kde(data);
    console.log("Density:", density);

    const minDensity = d3.min(density, d => d[1]);
    const maxDensity = d3.max(density, d => d[1]);
    console.log("Density range:", [minDensity, maxDensity]);

    const y = d3.scaleLinear()
        .domain([minDensity, maxDensity])
        .range([height, 0]);
    console.log("y scale domain:", y.domain());
    console.log("y scale range:", y.range());

    svg.selectAll('*').remove();

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height + margin.top})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("KWH");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 10)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Density");

    svg.append("path")
        .datum(density)
        .attr("fill", "#69b3a2")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(d => x(d[0]))
            .y(d => y(d[1]))
        );
}

function createChart2(svg, parsedData, selectedYear) {
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Filter data for the selected year
    const filteredData = parsedData.filter(d => d.Year == selectedYear);
    console.log("Filtered data:", filteredData); // Log filtered data

    // Group data by LCLid
    const dataByLCLid = d3.group(filteredData, d => d.LCLid);

    // Calculate mean consumption by LCLid
    const meanConsumptionByLCLid = Array.from(dataByLCLid, ([key, values]) => ({
        LCLid: key,
        meanConsumption: d3.mean(values, d => +d['KWH/hh (per half hour)'])
    }));
    console.log("Mean consumption by LCLid:", meanConsumptionByLCLid); // Log mean consumption by LCLid

    // Sort consumers by mean consumption
    meanConsumptionByLCLid.sort((a, b) => b.meanConsumption - a.meanConsumption);

    // Select top 2 and least 2 consumers
    const top2Consumers = meanConsumptionByLCLid.slice(0, 2);
    const least2Consumers = meanConsumptionByLCLid.slice(-2);
    const selectedConsumers = top2Consumers.concat(least2Consumers);
    const selectedLCLids = new Set(selectedConsumers.map(d => d.LCLid));
    console.log("Selected consumers:", selectedConsumers); // Log selected consumers

    // Group data by Month and LCLid for the selected consumers
    const monthlyData = Array.from(d3.group(filteredData.filter(d => selectedLCLids.has(d.LCLid)), d => d.Month))
        .map(([month, values]) => ({
            month: +month, // Ensure month is a number
            ...Object.fromEntries(values.map(d => [d.LCLid, +d['KWH/hh (per half hour)'] || 0])),
        }));
    console.log("Monthly data:", monthlyData); // Log monthly data

    // Setup X and Y scales
    const x = d3.scaleBand()
        .domain([...Array(12).keys()].map(i => i + 1)) // Adjusted to include all 12 months
        .range([margin.left, width + margin.left])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(monthlyData, d => Math.max(...Object.values(d).filter(v => typeof v === 'number')))])
        .nice()
        .range([height, margin.top]);

    console.log("X scale domain:", x.domain());
    console.log("Y scale domain:", y.domain());

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
    console.log("Color scale domain:", color.domain());
    console.log("Color scale range:", color.range());

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
        console.log("Consumer data for", consumer.LCLid, ":", consumerData); // Log consumer data

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
                    console.log("Tooltip data:", d);
                    // Implement tooltip functionality as per your requirement
                });
        } else {
            console.log(`No valid data for LCLid: ${consumer.LCLid}`);
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

// Example usage
// const svg = d3.select("svg");
// const parsedData = []; // Your parsed data here
// const selectedYear = 2024; // Your selected year here
// createChart2(svg, parsedData, selectedYear);




function createChart3(svg, parsedData) {
    // Implementation for Chart 3
}

function createChart4(svg, parsedData) {
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Ensure parsedData is not undefined and is an array
    if (!Array.isArray(parsedData)) {
        console.error('Parsed data is not an array:', parsedData);
        return;
    }

    // Filter data for the top 5 consumers based on average_annual_consumption
    const top5Consumers = parsedData
        .filter(d => d.average_annual_consumption !== undefined)
        .sort((a, b) => b.average_annual_consumption - a.average_annual_consumption)
        .slice(0, 5);
    
    if (top5Consumers.length === 0) {
        console.error('No valid top consumers found:', parsedData);
        return;
    }

    const selectedLCLids = new Set(top5Consumers.map(d => d.LCLid));
    console.log("Top 5 consumers:", top5Consumers);

    // Prepare data for the box plot
    const boxPlotData = top5Consumers.map(d => {
        const values = [
            +d.average_consumption_2011, +d.average_consumption_2012,
            +d.average_consumption_2013, +d.average_consumption_2014
        ];
        const sortedValues = values.sort(d3.ascending);
        const q1 = d3.quantile(sortedValues, 0.25);
        const median = d3.median(sortedValues);
        const q3 = d3.quantile(sortedValues, 0.75);
        const iqr = q3 - q1;
        const min = sortedValues[0];
        const max = sortedValues[sortedValues.length - 1];
        const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
        const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
        const outliers = sortedValues.filter(v => v < lowerWhisker || v > upperWhisker);
        return {
            LCLid: d.LCLid,
            q1, median, q3, iqr, min, max, lowerWhisker, upperWhisker, outliers
        };
    });
    console.log("Box plot data:", boxPlotData);

    // Setup X and Y scales
    const x = d3.scaleBand()
        .domain(top5Consumers.map(d => d.LCLid))
        .range([margin.left, width + margin.left])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(boxPlotData, d => Math.max(d.upperWhisker, ...d.outliers))])
        .nice()
        .range([height, margin.top]);

    console.log("X scale domain:", x.domain());
    console.log("Y scale domain:", y.domain());

    // Clear any previous content
    svg.selectAll('*').remove();

    // Append X axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .attr("x", width / 2 + margin.left)
        .attr("y", margin.bottom)
        .attr("text-anchor", "middle")
        .text("LCLid");

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
        .text("Consumption (KWH)");

    // Append box plot elements for each consumer
    boxPlotData.forEach(d => {
        const boxWidth = x.bandwidth() * 0.8;

        // Draw the box
        svg.append("rect")
            .attr("x", x(d.LCLid) + (x.bandwidth() - boxWidth) / 2)
            .attr("y", y(d.q3))
            .attr("width", boxWidth)
            .attr("height", y(d.q1) - y(d.q3))
            .attr("fill", "#69b3a2");

        // Draw the median line
        svg.append("line")
            .attr("x1", x(d.LCLid) + (x.bandwidth() - boxWidth) / 2)
            .attr("x2", x(d.LCLid) + (x.bandwidth() + boxWidth) / 2)
            .attr("y1", y(d.median))
            .attr("y2", y(d.median))
            .attr("stroke", "black");

        // Draw the whiskers
        svg.append("line")
            .attr("x1", x(d.LCLid) + x.bandwidth() / 2)
            .attr("x2", x(d.LCLid) + x.bandwidth() / 2)
            .attr("y1", y(d.lowerWhisker))
            .attr("y2", y(d.q1))
            .attr("stroke", "black");

        svg.append("line")
            .attr("x1", x(d.LCLid) + x.bandwidth() / 2)
            .attr("x2", x(d.LCLid) + x.bandwidth() / 2)
            .attr("y1", y(d.upperWhisker))
            .attr("y2", y(d.q3))
            .attr("stroke", "black");

        // Draw whisker caps
        svg.append("line")
            .attr("x1", x(d.LCLid) + (x.bandwidth() - boxWidth) / 2)
            .attr("x2", x(d.LCLid) + (x.bandwidth() + boxWidth) / 2)
            .attr("y1", y(d.lowerWhisker))
            .attr("y2", y(d.lowerWhisker))
            .attr("stroke", "black");

        svg.append("line")
            .attr("x1", x(d.LCLid) + (x.bandwidth() - boxWidth) / 2)
            .attr("x2", x(d.LCLid) + (x.bandwidth() + boxWidth) / 2)
            .attr("y1", y(d.upperWhisker))
            .attr("y2", y(d.upperWhisker))
            .attr("stroke", "black");

        // Draw outliers
        d.outliers.forEach(outlier => {
            svg.append("circle")
                .attr("cx", x(d.LCLid) + x.bandwidth() / 2)
                .attr("cy", y(outlier))
                .attr("r", 3)
                .attr("fill", "red");
        });
    });
}




// clear files if changes (dataset) occur
function clearDashboard() {

    chart1.selectAll("*").remove();
    chart2.selectAll("*").remove();
    chart3.selectAll("*").remove();
    chart4.selectAll("*").remove();
}
