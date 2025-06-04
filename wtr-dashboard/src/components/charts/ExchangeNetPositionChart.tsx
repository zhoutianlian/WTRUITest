// src/components/charts/ExchangeNetPositionChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
// Ensure D3CandlestickChart.css or a new shared chart CSS file has common styles for axes, tooltips etc.
// For now, assume some styles might be in D3CandlestickChart.css or we'll add them to a global chart style sheet later.

interface NetPositionData {
  date: Date;
  netPosition: number;
}

const mockNetPositionData: NetPositionData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (30 - i));
  return {
    date,
    netPosition: (Math.random() - 0.5) * 2000, // Random value between -1000 and 1000
  };
});

const ExchangeNetPositionChart: React.FC<{ width?: number; height?: number }> = ({
  width: propWidth = 600,
  height: propHeight = 350,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null); // Create a tooltip div like in K-line

  useEffect(() => {
    if (!svgRef.current || !d3) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;

    const data = mockNetPositionData;

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date.getTime().toString()))
      .range([0, chartWidth])
      .padding(0.2);

    const yMin = d3.min(data, d => d.netPosition) || 0;
    const yMax = d3.max(data, d => d.netPosition) || 0;

    const yBuffer = Math.max(Math.abs(yMin), Math.abs(yMax)) * 0.1; // 10% buffer
    const yDomain = [Math.min(0, yMin) - yBuffer, Math.max(0, yMax) + yBuffer];


    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([chartHeight, 0])
      .nice();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Axes
    g.append("g")
      .attr("class", "x-axis chart-axis") // Add shared 'chart-axis' class
      .attr("transform", `translate(0,${yScale(0)})`) // X-axis at y=0
      .call(d3.axisBottom(xScale).tickFormat(d => d3.timeFormat('%b %d')(new Date(parseInt(d)))).ticks(5));

    g.append("g")
      .attr("class", "y-axis chart-axis")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("~s")));

    // Bars
    g.selectAll(".net-position-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "net-position-bar")
      .attr("x", d => xScale(d.date.getTime().toString())!)
      .attr("y", d => d.netPosition >= 0 ? yScale(d.netPosition) : yScale(0))
      .attr("width", xScale.bandwidth())
      .attr("height", d => Math.abs(yScale(d.netPosition) - yScale(0)))
      .attr("fill", d => d.netPosition >= 0 ? "var(--color-volume-uptrend)" : "var(--color-volume-downtrend)") // Using volume colors for now
      .on("mouseover", (event, d) => {
          if (!tooltipRef.current) return;
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style("opacity", 1)
                 .html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br/>Net Position: ${d.netPosition.toFixed(2)}`);
          // Position tooltip (simplified)
          const [svgX, svgY] = d3.pointer(event, svgRef.current!); // Ensure svgRef.current is not null
          tooltip.style("left", `${svgX + 10}px`).style("top", `${svgY - 10}px`);
      })
      .on("mouseout", () => {
          if (tooltipRef.current) d3.select(tooltipRef.current).style("opacity", 0);
      });

    // Title (optional)
    svg.append("text")
        .attr("x", propWidth / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "var(--color-text-secondary)")
        .text("Exchange Net Position (Mock Data)");


  }, [propWidth, propHeight]);

  return (
    <div className="chart-container" style={{ width: propWidth, height: propHeight }}>
      <svg ref={svgRef} width={propWidth} height={propHeight}></svg>
      <div ref={tooltipRef} className="chart-tooltip"></div>
    </div>
  );
};
export default ExchangeNetPositionChart;
