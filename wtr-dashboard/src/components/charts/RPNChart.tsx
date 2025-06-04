// src/components/charts/RPNChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RPNDataPoint {
  date: Date;
  rpnValue: number;
}

const mockRPNData: RPNDataPoint[] = Array.from({ length: 50 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (50 - i));
  return { date, rpnValue: (Math.random() - 0.5) * 0.2 }; // RPN typically small values
});

const RPNChart: React.FC<{ width?: number; height?: number }> = ({
  width: propWidth = 600,
  height: propHeight = 300,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !d3) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;
    const data = mockRPNData;

    const xScale = d3.scaleTime().domain(d3.extent(data, d => d.date) as [Date, Date]).range([0, chartWidth]);
    const yScale = d3.scaleLinear().domain(d3.extent(data, d => d.rpnValue) as [number, number]).range([chartHeight, 0]).nice();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g").attr("class", "x-axis chart-axis").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%b %d')));
    g.append("g").attr("class", "y-axis chart-axis").call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".2f")));

    // Zero line
    if (yScale.domain()[0] < 0 && yScale.domain()[1] > 0) {
        g.append("line")
            .attr("class", "zero-line") // Can be styled via CSS if needed
            .attr("x1", 0).attr("x2", chartWidth)
            .attr("y1", yScale(0)).attr("y2", yScale(0))
            .style("stroke", "var(--color-text-secondary)")
            .style("stroke-width", "1px").style("stroke-dasharray", "2,2");
    }

    const line = d3.line<RPNDataPoint>().x(d => xScale(d.date)!).y(d => yScale(d.rpnValue)!);
    g.append("path").datum(data).attr("fill", "none").attr("stroke", "var(--color-accent-gold-highlight)").attr("stroke-width", 2).attr("d", line);

    // Tooltip
    const focus = g.append("g").attr("class", "tooltip-focus").style("display", "none");
    focus.append("circle").attr("r", 4).style("fill", "var(--color-accent-gold-highlight)");
    const tooltipDiv = d3.select(tooltipRef.current);

    svg.append("rect") // Overlay for mouse events
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .attr("class", "chart-overlay") // Use shared class if applicable
        .attr("width", chartWidth).attr("height", chartHeight)
        .style("fill", "none").style("pointer-events", "all")
        .on("mouseover", () => { if(focus) focus.style("display", null); if(tooltipDiv) tooltipDiv.style("opacity", 1); })
        .on("mouseout", () => { if(focus) focus.style("display", "none"); if(tooltipDiv) tooltipDiv.style("opacity", 0); })
        .on("mousemove", (event) => {
            if (!g.node()) return;
            const [mouseX] = d3.pointer(event, g.node()!);
            const dateAtMouse = xScale.invert(mouseX);
            const bisector = d3.bisector((d: RPNDataPoint) => d.date).left;
            const index = bisector(data, dateAtMouse, 1);
            const d0 = data[index - 1];
            const d1 = data[index];
            // Ensure d0 and d1 are valid before comparison
            const selectedData = (!d0 || !d1) ? (d0 || d1) : (dateAtMouse.getTime() - d0.date.getTime() > d1.date.getTime() - dateAtMouse.getTime()) ? d1 : d0;

            if (!selectedData || !selectedData.date || selectedData.rpnValue === undefined) return;

            if(focus) focus.attr("transform", `translate(${xScale(selectedData.date)!},${yScale(selectedData.rpnValue)!})`);
            if(tooltipDiv) {
              tooltipDiv.html(`Date: ${d3.timeFormat('%Y-%m-%d')(selectedData.date)}<br/>RPN: ${selectedData.rpnValue.toFixed(4)}`)
                  .style("left", `${event.pageX + 15}px`).style("top", `${event.pageY - 28}px`);
            }
        });
    svg.append("text").attr("x", propWidth/2).attr("y", margin.top).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "var(--color-text-secondary)").text("RPN (Mock Data)");

  }, [propWidth, propHeight]);
  return (
    <div className="chart-container"><svg ref={svgRef} width={propWidth} height={propHeight}></svg><div ref={tooltipRef} className="chart-tooltip"></div></div>
  );
};
export default RPNChart;
