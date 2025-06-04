// src/components/charts/ProfitTransferVolumeChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ProfitTransferDataPoint {
  date: Date;
  groups: { [groupName: string]: number }; // e.g., {"Retail": 100, "Whales": -50, ...}
}
const participantGroups = ["Retail", "Whales", "Market Makers"];
const mockProfitTransferData: ProfitTransferDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (30 - i));
  return {
    date,
    groups: {
      "Retail": (Math.random() - 0.6) * 500, // More likely to lose
      "Whales": (Math.random() - 0.4) * 1000,
      "Market Makers": (Math.random() - 0.5) * 200,
    }
  };
});

const ProfitTransferVolumeChart: React.FC<{ width?: number; height?: number }> = ({
  width: propWidth = 700,
  height: propHeight = 400,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !d3) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;
    const data = mockProfitTransferData;

    const stackGen = d3.stack<ProfitTransferDataPoint>()
        .keys(participantGroups)
        .value((d, key) => d.groups[key])
        .offset(d3.stackOffsetDiverging); // Handles positive and negative values from baseline
    const stackedData = stackGen(data);

    const xScale = d3.scaleTime().domain(d3.extent(data, d => d.date) as [Date, Date]).range([0, chartWidth]);
    const yScale = d3.scaleLinear()
        .domain([
            d3.min(stackedData, series => d3.min(series, d_series => d_series[0])) as number,
            d3.max(stackedData, series => d3.max(series, d_series => d_series[1])) as number
        ])
        .range([chartHeight, 0]).nice();

    const colorScale = d3.scaleOrdinal<string>().domain(participantGroups)
        .range(["var(--color-accent-gold)", "var(--color-accent-secondary-teal)", "var(--color-accent-secondary-blue)"]);

    const areaGen = d3.area<d3.SeriesPoint<ProfitTransferDataPoint>>()
      .x(d => xScale(d.data.date)!)
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    g.selectAll(".profit-transfer-area").data(stackedData).join("path")
        .attr("class", "profit-transfer-area")
        .attr("d", areaGen)
        .style("fill", d => colorScale(d.key)).attr("opacity", 0.75);

    g.append("g").attr("class", "x-axis chart-axis").attr("transform", `translate(0,${yScale(0)})`).call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%b %d'))); // X-axis at y=0
    g.append("g").attr("class", "y-axis chart-axis").call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("~s")));

    // Tooltip
    const hoverOverlay = g.append("rect").attr("class", "chart-overlay").attr("width", chartWidth).attr("height", chartHeight).style("fill", "none").style("pointer-events", "all");
    const tooltipDiv = d3.select(tooltipRef.current);

    hoverOverlay
        .on("mouseout", () => { if(tooltipDiv) tooltipDiv.style("opacity", 0); g.selectAll(".hover-line").remove(); })
        .on("mousemove", (event) => {
            if (!g.node() || !svgRef.current) return;
            const [mouseX] = d3.pointer(event, g.node()!);
            const dateAtMouse = xScale.invert(mouseX);
            const bisector = d3.bisector((d: ProfitTransferDataPoint) => d.date).left;
            const index = bisector(data, dateAtMouse, 1);
            const d0 = data[index - 1];
            const d1 = data[index];
            const selectedData = (!d0 || !d1) ? (d0 || d1) : (dateAtMouse.getTime() - d0.date.getTime() > d1.date.getTime() - dateAtMouse.getTime()) ? d1 : d0;

            if (!selectedData || !selectedData.date || !selectedData.groups) return;

            let tooltipHtml = `Date: ${d3.timeFormat('%Y-%m-%d')(selectedData.date)}<br/>`;
            participantGroups.forEach(group => {
                tooltipHtml += `<span style="color:${colorScale(group)};">■</span> ${group}: ${selectedData.groups[group].toFixed(2)}<br/>`;
            });

            if(tooltipDiv) tooltipDiv.style("opacity", 1).html(tooltipHtml);
            const [svgX, svgY] = d3.pointer(event, svgRef.current!);
            if(tooltipDiv) tooltipDiv.style("left", `${svgX + 15}px`).style("top", `${svgY - 10}px`);

            g.selectAll(".hover-line").remove();
            g.append("line").attr("class", "hover-line").attr("x1", xScale(selectedData.date)!).attr("x2", xScale(selectedData.date)!).attr("y1", 0).attr("y2", chartHeight).style("stroke", "var(--color-accent-gold-highlight)").style("stroke-width", "1px").style("pointer-events", "none");
        });
    svg.append("text").attr("x", propWidth/2).attr("y", margin.top).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "var(--color-text-secondary)").text("Profit Transfer Volume (Mock Data)");

  }, [propWidth, propHeight]);
  return (
    <div className="chart-container"><svg ref={svgRef} width={propWidth} height={propHeight}></svg><div ref={tooltipRef} className="chart-tooltip" style={{textAlign: 'left'}}></div></div>
  );
};
export default ProfitTransferVolumeChart;
