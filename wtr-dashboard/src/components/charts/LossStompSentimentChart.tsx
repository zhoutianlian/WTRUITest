// src/components/charts/LossStompSentimentChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SentimentDataPoint { date: Date; riskScore: number; } // 0-100

const mockSentimentData: SentimentDataPoint[] = Array.from({ length: 50 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (50 - i));
  return { date, riskScore: Math.random() * 100 };
});

const LossStompSentimentChart: React.FC<{ width?: number; height?: number }> = ({
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
    const data = mockSentimentData;

    const xScale = d3.scaleTime().domain(d3.extent(data, d => d.date) as [Date, Date]).range([0, chartWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]); // Risk Score 0-100

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Background Risk Zones
    const riskZones = [
      { level: 'Low', y0: 0, y1: 30, color: "rgba(var(--rgb-accent-secondary-teal), 0.15)" }, // Using teal for low risk
      { level: 'Medium', y0: 30, y1: 70, color: "rgba(var(--rgb-accent-gold), 0.15)" }, // Gold for medium
      { level: 'High', y0: 70, y1: 100, color: "rgba(var(--rgb-accent-secondary-red), 0.15)" } // Red for high
    ];
    riskZones.forEach(zone => {
      g.append("rect")
        .attr("x", 0).attr("y", yScale(zone.y1))
        .attr("width", chartWidth).attr("height", yScale(zone.y0) - yScale(zone.y1))
        .style("fill", zone.color);
    });

    g.append("g").attr("class", "x-axis chart-axis").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%b %d')));
    g.append("g").attr("class", "y-axis chart-axis").call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`));

    const line = d3.line<SentimentDataPoint>().x(d => xScale(d.date)!).y(d => yScale(d.riskScore)!);
    g.append("path").datum(data).attr("fill", "none").attr("stroke", "var(--color-text-primary)").attr("stroke-width", 1.5).attr("d", line);

    // Tooltip
    const focus = g.append("g").attr("class", "tooltip-focus").style("display", "none");
    focus.append("circle").attr("r", 4).style("fill", "var(--color-text-primary)");
    const tooltipDiv = d3.select(tooltipRef.current);
    svg.append("rect").attr("transform", `translate(${margin.left},${margin.top})`).attr("class", "chart-overlay").attr("width", chartWidth).attr("height", chartHeight).style("fill", "none").style("pointer-events", "all")
        .on("mouseover", () => { if(focus) focus.style("display", null); if(tooltipDiv) tooltipDiv.style("opacity", 1); })
        .on("mouseout", () => { if(focus) focus.style("display", "none"); if(tooltipDiv) tooltipDiv.style("opacity", 0); })
        .on("mousemove", (event) => {
            if (!g.node()) return;
            const [mouseX] = d3.pointer(event, g.node()!);
            const dateAtMouse = xScale.invert(mouseX);
            const bisector = d3.bisector((d: SentimentDataPoint) => d.date).left;
            const index = bisector(data, dateAtMouse, 1);
            const d0 = data[index - 1];
            const d1 = data[index];
            const selectedData = (!d0 || !d1) ? (d0 || d1) : (dateAtMouse.getTime() - d0.date.getTime() > d1.date.getTime() - dateAtMouse.getTime()) ? d1 : d0;

            if (!selectedData || !selectedData.date || selectedData.riskScore === undefined) return;

            if(focus) focus.attr("transform", `translate(${xScale(selectedData.date)!},${yScale(selectedData.riskScore)!})`);
            if(tooltipDiv) {
              tooltipDiv.html(`Date: ${d3.timeFormat('%Y-%m-%d')(selectedData.date)}<br/>Risk: ${selectedData.riskScore.toFixed(2)}%`)
                  .style("left", `${event.pageX + 15}px`).style("top", `${event.pageY - 28}px`);
            }
        });
    svg.append("text").attr("x", propWidth/2).attr("y", margin.top).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "var(--color-text-secondary)").text("Loss Stomp Sentiment (Mock Data)");

  }, [propWidth, propHeight]);
  return (
    <div className="chart-container"><svg ref={svgRef} width={propWidth} height={propHeight}></svg><div ref={tooltipRef} className="chart-tooltip"></div></div>
  );
};
export default LossStompSentimentChart;
