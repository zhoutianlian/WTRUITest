// src/components/charts/D3LineChart.tsx
import React, { useEffect, useRef } from 'react';
import *_d3 from 'd3';
// import './D3LineChart.css'; // No separate CSS for this one, will use common chart styles or inline

const d3 = (window as any).d3 || _d3;

interface TimePoint {
  date: Date;
  value: number;
}

interface D3LineChartProps {
  data: TimePoint[];
  width?: number;
  height?: number;
  lineColor?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (d: TimePoint) => string; // For potential tooltip
}

const D3LineChart: React.FC<D3LineChartProps> = ({
  data,
  width: propWidth = 700,
  height: propHeight = 300,
  lineColor = "var(--color-accent-gold, #B08D57)",
  yAxisLabel = "Value",
  tooltipFormatter = (d) => `Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}\nValue: ${d.value.toFixed(2)}`
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !d3 || !d3.select) {
        console.error("D3LineChart: D3 or data not available, or svgRef not set.");
        return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const margin = { top: 20, right: 40, bottom: 50, left: 70 }; // Adjusted margins
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, chartWidth]);

    const yDomain = d3.extent(data, d => d.value) as [number, number];
    const yPadding = (yDomain[1] - yDomain[0]) * 0.1; // 10% padding

    const yScale = d3.scaleLinear()
      .domain([yDomain[0] - yPadding, yDomain[1] + yPadding]) // Add padding to y-domain
      .range([chartHeight, 0])
      .nice();

    const lineGenerator = d3.line<TimePoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(Math.max(2, Math.floor(chartWidth / 100))).tickFormat(d3.timeFormat("%b '%y"));
    g.append("g").attr("transform", `translate(0,${chartHeight})`).call(xAxis)
     .attr("class", "x-axis chart-axis")
     .selectAll("text")
       .style("fill", "var(--color-text-secondary)")
       .attr("transform", "rotate(-45)")
       .style("text-anchor", "end");

    const yAxis = d3.axisLeft(yScale).ticks(Math.max(3, Math.floor(chartHeight / 40)));
    g.append("g").call(yAxis)
     .attr("class", "y-axis chart-axis")
     .selectAll("text").style("fill", "var(--color-text-secondary)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20) // Adjusted position
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "0.71em") // Keep using dy for fine-tuning
        .style("text-anchor", "middle")
        .style("fill", "var(--color-text-secondary)")
        .style("font-size", "0.85rem") // Standardized size
        .style("font-family", "var(--font-family-sans)")
        .text(yAxisLabel);

    // Gridlines
    g.append("g").attr("class", "grid y-grid")
      .call(d3.axisLeft(yScale).ticks(Math.max(3, Math.floor(chartHeight / 40))).tickSize(-chartWidth).tickFormat(() => ""));
    g.append("g").attr("class", "grid x-grid")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(Math.max(2, Math.floor(chartWidth / 100))).tickSize(-chartHeight).tickFormat(() => ""));

    // Common styling for all grid lines and axis paths
    svg.selectAll(".grid line, .grid path, .chart-axis path, .chart-axis line")
        .style("stroke", "var(--color-border-secondary)")
        .style("stroke-opacity", "0.3");
    svg.selectAll(".chart-axis text")
        .style("font-family", "var(--font-family-sans)");


    // Line path
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", lineGenerator);

    // Area under the line (optional)
    const areaGenerator = d3.area<TimePoint>()
        .x(d => xScale(d.date))
        .y0(chartHeight)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

    g.append("path")
        .datum(data)
        .attr("fill", lineColor)
        .attr("fill-opacity", 0.1)
        .attr("d", areaGenerator);


  }, [data, propWidth, propHeight, lineColor, yAxisLabel, tooltipFormatter]); // Added tooltipFormatter to dependencies

  return <svg ref={svgRef} width={propWidth} height={propHeight}></svg>;
};
export default D3LineChart;
