// src/components/charts/ExchangeWhaleTransfersChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WhaleTransferData {
  id: string;
  date: Date;
  amount: number; // e.g., in USD or BTC
  direction: 'inflow' | 'outflow'; // to exchange or from exchange
}

const mockWhaleTransferData: WhaleTransferData[] = Array.from({ length: 20 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random day in last 30 days
  return {
    id: `tx-${i}`,
    date,
    amount: Math.random() * 1000 + 100, // Amount between 100 and 1100
    direction: Math.random() > 0.5 ? 'inflow' : 'outflow',
  };
}).sort((a,b) => a.date.getTime() - b.date.getTime());


const ExchangeWhaleTransfersChart: React.FC<{ width?: number; height?: number }> = ({
  width: propWidth = 600,
  height: propHeight = 350,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !d3) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;
    const data = mockWhaleTransferData;

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, chartWidth])
      .nice();

    const sizeScale = d3.scaleSqrt() // Sqrt scale for bubble area perception
      .domain([0, d3.max(data, d => d.amount) || 0])
      .range([3, 20]); // Bubble radius range

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // X-Axis (Timeline)
    g.append("g")
      .attr("class", "x-axis chart-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%b %d')));

    // Y-Axis placeholder (bubbles jittered vertically for visual separation)
    // No meaningful Y-axis, but we need a scale for positioning
    const yJitterScale = d3.scaleLinear().domain([0,1]).range([chartHeight * 0.8, chartHeight * 0.2]);


    // Bubbles
    g.selectAll(".whale-transfer-bubble")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "whale-transfer-bubble")
      .attr("cx", d => xScale(d.date)!)
      .attr("cy", d => yJitterScale(Math.random())) // Random jitter for y-position
      .attr("r", d => sizeScale(d.amount))
      .attr("fill", d => d.direction === 'inflow' ? "var(--color-accent-gold-highlight)" : "var(--color-accent-secondary-blue-muted)")
      .attr("opacity", 0.7)
      .style("stroke", "var(--color-background-primary)")
      .style("stroke-width", "1px")
      .on("mouseover", (event, d) => {
          if (!tooltipRef.current) return;
          d3.select(event.currentTarget).attr("opacity", 1).style("stroke-width", "2px");
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style("opacity", 1)
                 .html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br/>Amount: ${d.amount.toFixed(2)}<br/>Direction: ${d.direction}`);
          const [svgX, svgY] = d3.pointer(event, svgRef.current!);
          tooltip.style("left", `${svgX + 15}px`).style("top", `${svgY}px`);
      })
      .on("mouseout", (event) => {
          if (tooltipRef.current) d3.select(tooltipRef.current).style("opacity", 0);
          d3.select(event.currentTarget).attr("opacity", 0.7).style("stroke-width", "1px");
      });

    // Title (optional)
    svg.append("text")
        .attr("x", propWidth / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "var(--color-text-secondary)")
        .text("Exchange Whale Transfers (Mock Data)");

  }, [propWidth, propHeight]);

  return (
    <div className="chart-container" style={{ width: propWidth, height: propHeight }}>
      <svg ref={svgRef} width={propWidth} height={propHeight}></svg>
      <div ref={tooltipRef} className="chart-tooltip"></div>
    </div>
  );
};
export default ExchangeWhaleTransfersChart;
