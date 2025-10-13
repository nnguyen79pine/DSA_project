import * as d3 from "https://esm.sh/d3";

// Load dataset
d3.json("https://raw.githubusercontent.com/nnguyen79pine/DSA_project/main/data/Statefarm_complaints.json")
  .then(data => {
    console.log("Loaded data:", data);

    // --- Step 1: Group by company and count complaints ---
    const grouped = d3.rollup(
      data,
      v => v.length,
      d => d["Complaint filed against"]
    );
    const groupedData = Array.from(grouped, ([company, count]) => ({ company, count }));

    // --- Step 2: Sort descending and keep top 5 ---
    const topData = groupedData
      .sort((a, b) => d3.descending(a.count, b.count))
      .slice(0, 5);

    // --- Step 3: Set up SVG ---
    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 60, right: 60, bottom: 60, left: 380 };

    // --- Step 4: Scales ---
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(topData, d => d.count)])
      .nice()
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
      .domain(topData.map(d => d.company))
      .range([margin.top, height - margin.bottom])
      .padding(0.3);

    // Use Tableau10 palette for distinct colors
    const color = d3.scaleOrdinal(d3.schemeTableau10)
      .domain(topData.map(d => d.company));

    // --- Step 5: Axes ---
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .style("font-family", "Segoe UI")
      .style("font-size", "12px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .style("font-family", "Segoe UI")
      .style("font-size", "12px");

    // --- Step 6: Bars (horizontal) ---
    svg.selectAll("rect.bar")
      .data(topData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => yScale(d.company))
      .attr("x", margin.left)
      .attr("height", yScale.bandwidth())
      .attr("width", 0)
      .attr("fill", d => color(d.count))
      .attr("opacity", 0.9)
      .transition()
      .duration(1000)
      .attr("width", d => xScale(d.count) - margin.left);

    // --- Step 7: Labels on bars ---
    svg.selectAll("text.value")
      .data(topData)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr("x", d => xScale(d.count) + 5)
      .attr("y", d => yScale(d.company) + yScale.bandwidth() / 1.6)
      .text(d => d.count)
      .style("font-family", "Segoe UI")
      .style("font-size", "12px")
      .style("fill", "#333")
      .attr("opacity", 0)
      .transition()
      .delay(900)
      .attr("opacity", 1);

    // --- Step 8: Chart Title ---
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 1.5)
      .attr("text-anchor", "middle")
      .style("font-family", "Segoe UI")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .text("Top 5 Companies with the Most Complaints");

    // --- Step 9: Axis Labels ---
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Number of Complaints");

    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Company");
  })
  .catch(err => console.error("Error loading JSON:", err));
