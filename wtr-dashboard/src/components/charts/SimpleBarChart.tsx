import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './SimpleBarChart.css';

interface BarChartData {
  category: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  title?: string; // Title is usually handled by the parent card
  width?: number;
  height?: number;
  barColor?: string; // Base color for bars, gradients will be derived
  yAxisLabel?: string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  // title, // Title is typically part of the card, not the chart SVG itself
  width: propWidth = 600,
  height: propHeight = 300,
  barColor = 'var(--color-accent-gold-luminous, #FFD700)',
  yAxisLabel = 'Value',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const margin = { top: 20, right: 30, bottom: 70, left: 70 }; // Increased bottom margin for rotated labels
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;

    // --- Define Gradients for 3D effect ---
    const defs = svg.append("defs");
    const mainBarGradient = defs.append("linearGradient")
      .attr("id", "mainBarGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    mainBarGradient.append("stop").attr("offset", "0%").style("stop-color", d3.color(barColor)?.brighter(0.5).toString() || barColor).style("stop-opacity", 1);
    mainBarGradient.append("stop").attr("offset", "100%").style("stop-color", barColor).style("stop-opacity", 1);

    // Darker gradient for "side" or if value is negative
     const negativeBarGradient = defs.append("linearGradient")
      .attr("id", "negativeBarGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    const negativeBaseColor = 'var(--color-accent-red, #E57373)'; // Use a theme red or fallback
    negativeBarGradient.append("stop").attr("offset", "0%").style("stop-color", d3.color(negativeBaseColor)?.brighter(0.5).toString() || negativeBaseColor).style("stop-opacity", 1);
    negativeBarGradient.append("stop").attr("offset", "100%").style("stop-color", negativeBaseColor).style("stop-opacity", 1);


    // --- Scales ---
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, chartWidth])
      .padding(0.3); // Padding between bars

    const yMin = d3.min(data, d => d.value) || 0;
    const yMax = d3.max(data, d => d.value) || 0;

    const yScale = d3.scaleLinear()
      .domain([Math.min(0, yMin), Math.max(0, yMax)]) // Handle positive and negative values
      .range([chartHeight, 0])
      .nice();

    // --- Main G container ---
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Axes ---
    const xAxis = d3.axisBottom(xScale);
    g.append("g")
      .attr("class", "x-axis chart-axis")
      .attr("transform", `translate(0,${yScale(0)})`) // Position X-axis at y=0
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("~s"));
    g.append("g")
      .attr("class", "y-axis chart-axis")
      .call(yAxis);

    // Y-axis Label
    g.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 15)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yAxisLabel);

    // --- Gridlines ---
    g.append("g").attr("class", "grid y-grid")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-chartWidth).tickFormat(() => ""));

    // --- Bars ---
    const barWidth = xScale.bandwidth();
    // const topPieceHeight = Math.max(1, barWidth * 0.15); // For 3D top piece

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.category) || 0)
      .attr("y", d => yScale(Math.max(0, d.value)))
      .attr("width", barWidth)
      .attr("height", d => Math.abs(yScale(d.value) - yScale(0)))
      .attr("fill", d => d.value >= 0 ? "url(#mainBarGradient)" : "url(#negativeBarGradient)")
      // Add a subtle border for definition
      .attr("stroke", d => d.value >=0 ? d3.color(barColor)?.darker(0.5).toString() || '#000' : d3.color(negativeBaseColor)?.darker(0.5).toString() || '#000' )
      .attr("stroke-width", 0.5);

    // --- Tooltip ---
    const tooltip = d3.select(tooltipRef.current);

    g.selectAll(".bar") // Re-select for events
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1);
        d3.select(event.currentTarget)
          .attr("stroke-width", 1.5)
          .style("filter", "brightness(1.2)");
      })
      .on("mouseout", (event) => {
        tooltip.style("opacity", 0);
        d3.select(event.currentTarget)
          .attr("stroke-width", 0.5)
          .style("filter", "brightness(1)");
      })
      .on("mousemove", (event, d) => {
        tooltip
          .html(`
            <div><strong>${d.category}</strong></div>
            <div>Value: ${d3.format(",.2f")(d.value)}</div>
          `)
          .style("left", `${event.pageX + 15}px`) // Position relative to page
          .style("top", `${event.pageY - 28}px`);
      });

  }, [data, propWidth, propHeight, barColor, yAxisLabel]);

  return (
    <div className="simple-bar-chart-container">
      <svg ref={svgRef} width={propWidth} height={propHeight}></svg>
      <div ref={tooltipRef} className="simple-chart-tooltip"></div> {/* Using same tooltip class as line chart for consistency */}
    </div>
  );
};

export default SimpleBarChart;
