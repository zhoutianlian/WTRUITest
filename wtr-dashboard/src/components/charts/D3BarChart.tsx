// src/components/charts/D3BarChart.tsx
import React, { useEffect, useRef } from 'react';
import *_d3 from 'd3';
// import './D3BarChart.css'; // No separate CSS for this one

const d3 = (window as any).d3 || _d3;

interface BarData {
  date: Date; // Or string/number if not time-based
  value: number;
}

interface D3BarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
  yAxisLabel?: string;
  positiveColor?: string;
  negativeColor?: string;
  tooltipFormatter?: (d: BarData) => string;
}

const D3BarChart: React.FC<D3BarChartProps> = ({
  data,
  width: propWidth = 700,
  height: propHeight = 300,
  yAxisLabel = "Net Flow",
  positiveColor = "var(--color-candle-green, #2AA092)", // Using candle colors as they are defined
  negativeColor = "var(--color-candle-red, #E54D42)",
  tooltipFormatter = (d) => `Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}\nValue: ${d.value.toFixed(2)}`
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !d3 || !d3.select) {
        console.error("D3BarChart: D3 or data not available, or svgRef not set.");
        return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 40, bottom: 50, left: 70 };
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date.getTime().toString())) // Assuming date objects
      .range([0, chartWidth])
      .padding(0.3); // Increased padding for thicker bars

    const yMin = d3.min(data, d => d.value) as number;
    const yMax = d3.max(data, d => d.value) as number;
    const yPadding = Math.max(Math.abs(yMin), Math.abs(yMax)) * 0.1; // 10% padding based on max absolute value

    const yScale = d3.scaleLinear()
      .domain([Math.min(0, yMin) - yPadding, Math.max(0, yMax) + yPadding])
      .range([chartHeight, 0])
      .nice();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Axes
    const numTicks = Math.min(7, Math.floor(data.length / 2));
    const tickIndices = data.length <= numTicks ? d3.range(data.length) : d3.range(0, data.length, Math.ceil(data.length / numTicks));
    const tickValues = tickIndices.map(i => data[i].date.getTime().toString());

    const xAxis = d3.axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat(d => d3.timeFormat('%b %d')(new Date(parseInt(d))));
    g.append("g").attr("transform", `translate(0,${chartHeight})`).call(xAxis)
     .attr("class", "x-axis chart-axis")
     .selectAll("text")
        .style("fill", "var(--color-text-secondary)")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");


    const yAxis = d3.axisLeft(yScale).ticks(Math.max(3, Math.floor(chartHeight / 40))).tickFormat(d3.format("~s"));
    g.append("g").call(yAxis)
     .attr("class", "y-axis chart-axis")
     .selectAll("text").style("fill", "var(--color-text-secondary)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "0.71em")
        .style("text-anchor", "middle")
        .style("fill", "var(--color-text-secondary)")
        .style("font-size", "0.85rem")
        .style("font-family", "var(--font-family-sans)")
        .text(yAxisLabel);

    // Gridlines
    g.append("g").attr("class", "grid y-grid")
      .call(d3.axisLeft(yScale).ticks(Math.max(3, Math.floor(chartHeight / 40))).tickSize(-chartWidth).tickFormat(() => ""));
    svg.selectAll(".grid line, .grid path, .chart-axis path, .chart-axis line")
        .style("stroke", "var(--color-border-secondary)")
        .style("stroke-opacity", "0.3");
    svg.selectAll(".chart-axis text")
        .style("font-family", "var(--font-family-sans)");

    // Zero line emphasis
    g.append("line")
        .attr("class", "zero-line-emphasis")
        .attr("x1", 0)
        .attr("x2", chartWidth)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "var(--color-text-secondary)")
        .attr("stroke-width", 0.7) // Slightly more emphasis
        .attr("stroke-opacity", 0.8);

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.date.getTime().toString()) || 0)
      .attr("y", d => yScale(Math.max(0, d.value))) // Start bar from 0 for positive values
      .attr("width", xScale.bandwidth())
      .attr("height", d => Math.abs(yScale(d.value) - yScale(0))) // Height relative to 0 line
      .attr("fill", d => d.value >= 0 ? positiveColor : negativeColor)
      .attr("fill-opacity", 0.7); // Add some opacity to bars


  }, [data, propWidth, propHeight, yAxisLabel, positiveColor, negativeColor, tooltipFormatter]);

  return <svg ref={svgRef} width={propWidth} height={propHeight}></svg>;
};
export default D3BarChart;
