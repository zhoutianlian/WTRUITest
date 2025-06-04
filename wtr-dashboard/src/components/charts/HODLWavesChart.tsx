// src/components/charts/HODLWavesChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HODLDataPoint {
  date: Date;
  bands: { [ageBand: string]: number }; // e.g., {"<1m": 10, "1m-3m": 15, ...}
}

const ageBands = ["<1m", "1m-3m", "3m-6m", "6m-1y", "1y-2y", "2y-3y", ">3y"];
const mockHODLData: HODLDataPoint[] = Array.from({ length: 50 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (50 - i));
  let remaining = 100;
  const bands: { [ageBand: string]: number } = {};
  ageBands.forEach((band, idx) => {
    if (idx === ageBands.length - 1) {
      bands[band] = remaining;
    } else {
      const val = Math.random() * (remaining / (ageBands.length - idx -1) ) + 5 ; // ensure some minimum
      bands[band] = Math.min(val, remaining);
      remaining -= bands[band];
    }
  });
  return { date, bands };
});

const HODLWavesChart: React.FC<{ width?: number; height?: number }> = ({
  width: propWidth = 700,
  height: propHeight = 400,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !d3) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;
    const data = mockHODLData;

    // Prepare data for stacking
    const stackGen = d3.stack<HODLDataPoint>().keys(ageBands).value((d, key) => d.bands[key]);
    const stackedData = stackGen(data);

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100]) // Percentage
      .range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(ageBands)
      .range([
        "var(--color-accent-gold-highlight)",
        "var(--color-accent-gold)",
        "var(--color-accent-secondary-teal)",
        "var(--color-accent-secondary-teal-muted)",
        "var(--color-accent-secondary-blue)",
        "var(--color-accent-secondary-blue-muted)",
        "var(--color-background-tertiary)" // Darkest for oldest coins
      ]);

    const areaGen = d3.area<d3.SeriesPoint<HODLDataPoint>>()
      .x(d => xScale(d.data.date)!)
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll(".hodl-wave-area")
      .data(stackedData)
      .join("path")
        .attr("class", "hodl-wave-area")
        .attr("d", areaGen)
        .style("fill", d => colorScale(d.key))
        .attr("opacity", 0.85);

    // Axes
    g.append("g").attr("class", "x-axis chart-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%b %Y')));
    g.append("g").attr("class", "y-axis chart-axis")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`));

    // Title
    svg.append("text").attr("x", propWidth/2).attr("y", margin.top/1.5).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "var(--color-text-secondary)").text("HODL Waves (Mock Data)");

    // Tooltip (simplified for stacked area)
    const hoverOverlay = g.append("rect")
        .attr("class", "chart-overlay") // Use same class if styles apply
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .style("fill", "none")
        .style("pointer-events", "all");

    hoverOverlay
        .on("mouseout", () => {
            if (tooltipRef.current) d3.select(tooltipRef.current).style("opacity", 0);
            g.selectAll(".hover-line").remove();
        })
        .on("mousemove", (event) => {
            if (!tooltipRef.current || !svgRef.current) return;
            const [mouseX] = d3.pointer(event, g.node()!); // g.node() should be valid
            const dateAtMouse = xScale.invert(mouseX);

            const bisector = d3.bisector((d: HODLDataPoint) => d.date).left;
            const index = bisector(data, dateAtMouse, 1);
            const d0 = data[index - 1];
            const d1 = data[index];
            // Ensure d0 and d1 are valid before comparison
            const selectedData = (!d0 || !d1) ? (d0 || d1) : (dateAtMouse.getTime() - d0.date.getTime() > d1.date.getTime() - dateAtMouse.getTime()) ? d1 : d0;


            if (!selectedData) return;

            let tooltipHtml = `Date: ${d3.timeFormat('%Y-%m-%d')(selectedData.date)}<br/>`;
            ageBands.forEach(band => {
                tooltipHtml += `<span style="color:${colorScale(band)};">■</span> ${band}: ${selectedData.bands[band].toFixed(2)}%<br/>`;
            });

            d3.select(tooltipRef.current).style("opacity", 1).html(tooltipHtml);
            const [svgX, svgY] = d3.pointer(event, svgRef.current); // Use svgRef for page coords
            d3.select(tooltipRef.current).style("left", `${svgX + 15}px`).style("top", `${svgY - 10}px`);

            // Hover line
            g.selectAll(".hover-line").remove();
            g.append("line")
                .attr("class", "hover-line")
                .attr("x1", xScale(selectedData.date)!)
                .attr("x2", xScale(selectedData.date)!)
                .attr("y1", 0)
                .attr("y2", chartHeight)
                .style("stroke", "var(--color-accent-gold-highlight)")
                .style("stroke-width", "1px")
                .style("pointer-events", "none");
        });


  }, [propWidth, propHeight]);

  return (
    <div className="chart-container"> {/* Uses shared styles */}
      <svg ref={svgRef} width={propWidth} height={propHeight}></svg>
      <div ref={tooltipRef} className="chart-tooltip" style={{textAlign: 'left'}}></div>
    </div>
  );
};
export default HODLWavesChart;
