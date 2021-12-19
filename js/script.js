document.addEventListener("DOMContentLoaded", function () {
  const req = new XMLHttpRequest();
  req.open(
    "GET",
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
    true
  );
  req.send();
  req.onload = () => {
    const json = JSON.parse(req.responseText);
    const monthlyVariance = json.monthlyVariance;
    const baseTemperature = json.baseTemperature;
    var dataset = monthlyVariance.map((x) => ({
      ...x,
      temperature:
        Math.round((x.variance + baseTemperature + Number.EPSILON) * 1000) /
        1000
    }));
    createChart(dataset, baseTemperature);
  };

  function createChart(dataset, baseTemperature) {
    console.log(dataset);
    var years = d3.map(dataset, (d) => d.year);
    var months = d3.map(dataset, (d) => d.month);
    var variance = d3.map(dataset, (d) => d.variance);
    const namedMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    const w = 1400;
    const h = 600;
    const padding = 60;

    d3.select("#title").text("Monthly Global Land-Surface Temperature");
    d3.select("#description").html(
      years[0] +
        " - " +
        years[years.length - 1] +
        ": Base temperature " +
        baseTemperature +
        " &#8451;"
    );

    const svg = d3
      .select(".chartContainer")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    var tooltip = d3
      .select(".chartContainer")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    // Create X-scale and X-axis
    const xScale = d3
      .scaleBand()
      .domain(years)
      .range([padding, w - padding])
      .padding(0.05);

    const tickFormatX = d3.format(".0f");
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat(tickFormatX)
      .tickValues(xScale.domain().filter((d, i) => !(i % 10)));

    let xAxisHandle = svg
      .append("g")
      .attr("transform", "translate(0," + (h - padding) + ")")
      .attr("id", "x-axis")
      .call(xAxis)
      .attr("class", "tick");

    svg
      .append("text")
      .attr("x", w / 2 + padding / 2 + "px")
      .attr("y", h - padding / 2 + "px")
      .text("Year");

    // Create Y-scale and Y-axis
    const yScale = d3
      .scaleBand()
      .domain(months)
      .range([h - padding, padding]);

    const yAxis = d3
      .axisLeft(yScale)
      .tickSizeOuter(0)
      .tickFormat((d, i) => namedMonths[i]);

    let yAxisHandle = svg
      .append("g")
      .attr("transform", "translate(" + padding + ", 0)")
      .attr("id", "y-axis")
      .call(yAxis)
      .attr("class", "tick");

    svg
      .append("text")
      .attr("transform", "translate(-290, 290)rotate(-90)")
      .attr("x", padding / 2 - 15)
      .attr("y", h / 2)
      .text("Month");

    // Create color scale
    var colorScale = d3
      .scaleQuantize()
      .domain([d3.min(variance), d3.max(variance)])
      .range(colorbrewer.RdYlBu[11].reverse());

    svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.variance))
      .attr("data-temp", (d) => d.variance)
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("class", "cell")
      .on("mouseover", (i, d) => {
        tooltip
          .transition()
          .duration(0)
          .style("left", i.pageX + 10 + "px")
          .style("top", i.pageY - 25 + "px")
          .style("opacity", 0.9)
          .attr("data-year", d.year);
        tooltip.html(
          "Year: " +
            d.year +
            "<br>Month: " +
            namedMonths[d.month - 1] +
            "<br>Temperature: " +
            d.temperature +
            " &#8451; <br>Variance: " +
            d.variance +
            " &#8451;"
        );
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    //Legend
    var colorRange = [];
    for (var i = 0; i < colorScale.range().length; i++) {
      colorRange.push(colorScale.invertExtent(colorScale.range()[i])[0]);
    }

    var legend = svg.append("g").attr("id", "legend");
    var legendcolors = legend
      .selectAll("rect")
      .data(colorRange)
      .enter()
      .append("rect")
      .attr("fill", (d) => colorScale(d))
      .attr("x", (d, i) => i * 40 + "")
      .attr("y", (d, i) => h - 30 + "")
      .attr("width", "40")
      .attr("height", "10");
    var legendtext = legend
      .selectAll("text")
      .data(colorRange)
      .enter()
      .append("text")
      .attr("x", (d, i) => i * 40 + "")
      .attr("y", (d, i) => h - 10 + "")
      .attr("dy", "0.35em")
      .text((d) => Math.round((d + Number.EPSILON) * 100) / 100)
      .style("font-size", ".8em");
  }
});
