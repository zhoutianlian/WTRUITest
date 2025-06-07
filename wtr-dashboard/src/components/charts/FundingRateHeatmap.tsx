import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './FundingRateHeatmap.css';

export interface FundingRateDataPoint {
  asset: string;       // e.g., 'BTC', 'ETH' (Y-axis)
  exchange: string;    // e.g., 'Exchange A', 'Exchange B' (X-axis)
  rate: number;        // The funding rate value
  timestamp?: Date;    // Optional: if heatmap cells represent different time points for same asset/exchange
}

interface FundingRateHeatmapProps {
  data: FundingRateDataPoint[];
  // title?: string; // Title usually handled by parent card
  width?: number;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const FundingRateHeatmap: React.FC<FundingRateHeatmapProps> = ({
  data,
  width: propWidth = 700,
  height: propHeight = 400,
  xAxisLabel = "Exchange / Time",
  yAxisLabel = "Asset",
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 80, left: 100 }; // Adjusted for labels
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;

    // --- Axes Domains ---
    const xCategories = Array.from(new Set(data.map(d => d.exchange))).sort(); // Or d.timestamp if time-based
    const yCategories = Array.from(new Set(data.map(d => d.asset))).sort();

    // --- Scales ---
    const xScale = d3.scaleBand()
      .domain(xCategories)
      .range([0, chartWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(yCategories)
      .range([0, chartHeight])
      .padding(0.05);

    // --- Color Scale ---
    const rates = data.map(d => d.rate);
    const minRate = d3.min(rates) || -0.05;
    const maxRate = d3.max(rates) || 0.05;

    // Centered color scale: red for negative, gold/neutral for near zero, green for positive
    const colorScale = d3.scaleLinear<string>()
      .domain([minRate, 0, maxRate])
      .range([
        "var(--color-accent-red, #E57373)",         // Negative
        "var(--color-background-tertiary, #333A4C)", // Neutral (near zero)
        "var(--color-accent-secondary-green, #66BB6A)" // Positive
      ]);
      // For a Dark Gold theme, more gold/amber might be used for positive
      // const colorScale = d3.scaleLinear<string>()
      // .domain([minRate, 0, maxRate])
      // .range(["#FF6B6B", "#4A3B27", "#FFD700"]); // Red - Dark Gold Muted - Gold


    // --- Main G container ---
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Axes ---
    const xAxis = d3.axisBottom(xScale).tickSize(0);
    g.append("g")
      .attr("class", "x-axis heatmap-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
    g.select(".x-axis path").style("display", "none"); // Hide domain line for cleaner look

    const yAxis = d3.axisLeft(yScale).tickSize(0);
    g.append("g")
      .attr("class", "y-axis heatmap-axis")
      .call(yAxis);
    g.select(".y-axis path").style("display", "none");

    // --- Tooltip ---
    const tooltip = d3.select(tooltipRef.current);

    // --- Heatmap Cells ---
    g.selectAll(".heatmap-cell")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "heatmap-cell")
      .attr("x", d => xScale(d.exchange) || 0)
      .attr("y", d => yScale(d.asset) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.rate))
      .attr("stroke", "var(--color-background-primary)") // Cell border
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1);
        d3.select(event.currentTarget).style("stroke", "var(--color-accent-gold-highlight)").style("stroke-width", 2);
      })
      .on("mouseout", (event) => {
        tooltip.style("opacity", 0);
        d3.select(event.currentTarget).style("stroke", "var(--color-background-primary)").style("stroke-width", 1);
      })
      .on("mousemove", (event, d) => {
        const rateFormatted = `${(d.rate * 100).toFixed(4)}%`;
        tooltip
          .html(`
            <div><strong>Asset:</strong> ${d.asset}</div>
            <div><strong>${d.timestamp ? 'Time' : 'Exchange'}:</strong> ${d.timestamp ? format(d.timestamp, 'HH:mm') : d.exchange}</div>
            <div><strong>Rate:</strong> ${rateFormatted}</div>
          `)
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 28}px`);
      });

    // Optional: Add a legend for the color scale if needed

  }, [data, propWidth, propHeight, xAxisLabel, yAxisLabel]); // Dependencies

  return (
    <div className="funding-rate-heatmap-container">
      <svg ref={svgRef} width={propWidth} height={propHeight}></svg>
      <div ref={tooltipRef} className="simple-chart-tooltip"></div> {/* Reusing tooltip style from other D3 charts */}
    </div>
  );
};

export default FundingRateHeatmap;
