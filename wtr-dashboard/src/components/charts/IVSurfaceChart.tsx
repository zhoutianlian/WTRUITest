import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './IVSurfaceChart.css'; // To be created

export interface IVSurfaceDataPoint {
  strike: number;
  timeToExpiryDays: number;
  iv: number; // Implied Volatility value
}

interface IVSurfaceChartProps {
  data: IVSurfaceDataPoint[];
  // title?: string; // Title handled by parent card
  width?: number;
  height?: number;
}

const IVSurfaceChart: React.FC<IVSurfaceChartProps> = ({
  data,
  width: propWidth = 700,
  height: propHeight = 450,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const legendRef = useRef<SVGSVGElement | null>(null);


  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const legendContainer = d3.select(legendRef.current);
    legendContainer.selectAll("*").remove();


    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom - 30; // Extra space for legend

    // --- Axes Domains ---
    // Ensure unique, sorted categories for axes
    const strikes = Array.from(new Set(data.map(d => d.strike))).sort((a, b) => a - b);
    const expiries = Array.from(new Set(data.map(d => d.timeToExpiryDays))).sort((a, b) => a - b);

    // --- Scales ---
    const xScale = d3.scaleBand<number>()
      .domain(strikes)
      .range([0, chartWidth])
      .padding(0.05);

    const yScale = d3.scaleBand<number>()
      .domain(expiries)
      .range([chartHeight, 0]) // Invert for typical heatmap (smaller TTE at bottom)
      .padding(0.05);

    // --- Color Scale for IV ---
    const ivValues = data.map(d => d.iv);
    const minIv = d3.min(ivValues) || 0;
    const maxIv = d3.max(ivValues) || 1; // Default max to 1 (100% IV)

    const colorScale = d3.scaleSequential(d3.interpolateInferno) // Or d3.interpolateViridis, d3.interpolatePlasma
      .domain([minIv, maxIv]);
    // Alternative: Gold-themed sequential scale
    // const colorScale = d3.scaleSequential((t) => d3.interpolateRgb("var(--color-background-tertiary)", "var(--color-accent-gold-luminous)")(t))
    //  .domain([minIv, maxIv]);


    // --- Main G container ---
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Axes ---
    const xAxis = d3.axisBottom(xScale).tickFormat(d => `${d/1000}k`); // Format strikes as '65k'
    g.append("g")
      .attr("class", "x-axis iv-surface-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    const yAxis = d3.axisLeft(yScale).tickFormat(d => `${d}d`); // Format expiries as '30d'
    g.append("g")
      .attr("class", "y-axis iv-surface-axis")
      .call(yAxis);

    // Axis Labels
    g.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + margin.bottom - 10)
      .text("Strike Price");

    g.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -margin.left + 20)
      .text("Time to Expiry (Days)");


    // --- Tooltip ---
    const tooltip = d3.select(tooltipRef.current);

    // --- Heatmap Cells (representing the "surface") ---
    g.selectAll(".iv-cell")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "iv-cell")
      .attr("x", d => xScale(d.strike) || 0)
      .attr("y", d => yScale(d.timeToExpiryDays) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.iv))
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1);
        d3.select(event.currentTarget).style("stroke", "var(--color-accent-gold-highlight)").style("stroke-width", 1.5);
      })
      .on("mouseout", (event) => {
        tooltip.style("opacity", 0);
        d3.select(event.currentTarget).style("stroke", "none").style("stroke-width", 0);
      })
      .on("mousemove", (event, d) => {
        tooltip
          .html(`
            <div><strong>Strike:</strong> ${d.strike.toLocaleString()}</div>
            <div><strong>Expiry:</strong> ${d.timeToExpiryDays} days</div>
            <div><strong>IV:</strong> ${(d.iv * 100).toFixed(2)}%</div>
          `)
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 28}px`);
      });

    // --- Legend ---
    const legendWidth = Math.min(chartWidth, 300);
    const legendHeight = 10;
    const legendSvg = legendContainer
        .attr("width", legendWidth + margin.left + margin.right)
        .attr("height", legendHeight + 15) // 15 for text below
        .append("g")
        .attr("transform", `translate(${margin.left + (chartWidth - legendWidth)/2}, 0)`);

    const legendScale = d3.scaleLinear()
        .domain([minIv, maxIv])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d => `${(d as number * 100).toFixed(0)}%`);

    legendSvg.append("g")
        .attr("class", "legend-axis iv-surface-axis")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);

    const gradient = legendSvg.append("defs")
        .append("linearGradient")
        .attr("id", "ivLegendGradient")
        .attr("x1", "0%")
        .attr("x2", "100%");

    // Create gradient stops from the color scale
    // Using more stops for a smoother gradient in the legend
    const numStops = 10;
    const stopPoints = d3.range(0, 1 + 1/numStops, 1/numStops); // 0, 0.1, 0.2 ... 1.0

    stopPoints.forEach(t => {
        gradient.append("stop")
            .attr("offset", `${t * 100}%`)
            .attr("stop-color", colorScale(minIv + t * (maxIv-minIv) ));
    });

    legendSvg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#ivLegendGradient)");


  }, [data, propWidth, propHeight]);

  return (
    <div className="iv-surface-chart-container">
      <svg ref={svgRef} width={propWidth} height={propHeight - 30}></svg> {/* Adjusted height for legend */}
      <svg ref={legendRef} className="iv-surface-legend-svg"></svg>
      <div ref={tooltipRef} className="simple-chart-tooltip"></div> {/* Reusing tooltip style */}
    </div>
  );
};

export default IVSurfaceChart;
