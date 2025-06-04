// src/components/charts/USCryptoETFsDataChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
// Assumes 'wtr-dashboard/src/styles/charts.css' is imported globally or component-wise

interface ETFDataPoint {
  date: Date;
  flows: { etfName: string; flow: number }[]; // Multiple ETFs
  btcPrice?: number; // Optional price overlay
}

const mockETFData: ETFDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (30 - i));
  return {
    date,
    flows: [
      { etfName: 'ETF Alpha', flow: (Math.random() - 0.3) * 100 }, // Can be negative
      { etfName: 'ETF Beta', flow: (Math.random() - 0.4) * 80 },
      { etfName: 'ETF Gamma', flow: (Math.random() - 0.5) * 60 },
    ],
    btcPrice: 40000 + (Math.random() - 0.5) * 10000 * (i / 15),
  };
});

const USCryptoETFsDataChart: React.FC<{ width?: number; height?: number }> = ({
  width: propWidth = 700, // Wider for potentially grouped bars + line
  height: propHeight = 400,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !d3) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 50, bottom: 50, left: 60 };
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;
    const data = mockETFData;
    const etfNames = data.length > 0 ? data[0].flows.map(f => f.etfName) : [];

    // X Scale (Time)
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date.getTime().toString()))
      .range([0, chartWidth])
      .padding(0.2);

    // Y Scale (Flows) - accommodating negative flows
    let minFlow = 0, maxFlow = 0;
    data.forEach(d => {
        d.flows.forEach(f => {
            if (f.flow < minFlow) minFlow = f.flow;
            if (f.flow > maxFlow) maxFlow = f.flow;
        });
    });
    const yFlowScale = d3.scaleLinear()
      .domain([minFlow, maxFlow])
      .range([chartHeight, 0])
      .nice();

    // Y Scale (BTC Price - Secondary Axis)
    const yPriceScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.btcPrice) as [number, number] || [0,1])
        .range([chartHeight, 0])
        .nice();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Axes
    g.append("g").attr("class", "x-axis chart-axis")
      .attr("transform", `translate(0,${yFlowScale(0) < chartHeight && yFlowScale(0) > 0 ? yFlowScale(0) : chartHeight})`) // X-axis at y=0 if visible, else bottom
      .call(d3.axisBottom(xScale).tickFormat(d => d3.timeFormat('%b %d')(new Date(parseInt(d)))).ticks(Math.min(5, data.length)));

    g.append("g").attr("class", "y-axis chart-axis flow-axis")
      .call(d3.axisLeft(yFlowScale).ticks(5).tickFormat(d3.format("~s")));

    g.append("g").attr("class", "y-axis chart-axis price-axis")
        .attr("transform", `translate(${chartWidth},0)`)
        .call(d3.axisRight(yPriceScale).ticks(5).tickFormat(d3.format("~s")));

    // Grouped Bars for ETF Flows
    const xSubgroupScale = d3.scaleBand()
        .domain(etfNames)
        .range([0, xScale.bandwidth()])
        .padding(0.05);

    const colorScale = d3.scaleOrdinal<string>()
        .domain(etfNames)
        .range(["var(--color-accent-gold)", "var(--color-accent-secondary-teal-muted)", "var(--color-accent-secondary-blue-muted)"]);

    g.append("g")
      .selectAll("g")
      .data(data)
      .join("g")
        .attr("transform", d => `translate(${xScale(d.date.getTime().toString())!},0)`)
      .selectAll("rect")
      .data(d => d.flows)
      .join("rect")
        .attr("x", d => xSubgroupScale(d.etfName)!)
        .attr("y", d => d.flow >= 0 ? yFlowScale(d.flow) : yFlowScale(0))
        .attr("width", xSubgroupScale.bandwidth())
        .attr("height", d => Math.abs(yFlowScale(d.flow) - yFlowScale(0)))
        .attr("fill", d => colorScale(d.etfName))
        .on("mouseover", (event, d_flow) => { // d_flow is {etfName, flow}
            if (!tooltipRef.current) return;
            // Find parent date for full tooltip
            const parentDataNode = (event.currentTarget as Element).parentNode;
            if (!parentDataNode) return;
            const parentData = d3.select(parentDataNode).datum() as ETFDataPoint;

            d3.select(tooltipRef.current).style("opacity", 1)
               .html(`Date: ${d3.timeFormat('%Y-%m-%d')(parentData.date)}<br/>
                      ETF: ${d_flow.etfName}<br/>
                      Flow: ${d_flow.flow.toFixed(2)}`);
            const [svgX, svgY] = d3.pointer(event, svgRef.current!);
            d3.select(tooltipRef.current).style("left", `${svgX + 10}px`).style("top", `${svgY - 10}px`);
        })
        .on("mouseout", () => {
            if (tooltipRef.current) d3.select(tooltipRef.current).style("opacity", 0);
        });

    // BTC Price Line
    const line = d3.line<ETFDataPoint>()
        .x(d => xScale(d.date.getTime().toString())! + xScale.bandwidth() / 2) // Center line in band
        .y(d => yPriceScale(d.btcPrice!));

    g.append("path")
        .datum(data.filter(d => d.btcPrice !== undefined && d.btcPrice !== null)) // Filter out undefined/null price points
        .attr("fill", "none")
        .attr("stroke", "var(--color-accent-gold-highlight)")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Title
    svg.append("text").attr("x", propWidth/2).attr("y", margin.top/1.5).attr("text-anchor", "middle").style("font-size", "12px").style("fill", "var(--color-text-secondary)").text("US Crypto ETF Flows & BTC Price (Mock)");

  }, [propWidth, propHeight]);

  return (
    <div className="chart-container"> {/* Uses shared styles */}
      <svg ref={svgRef} width={propWidth} height={propHeight}></svg>
      <div ref={tooltipRef} className="chart-tooltip"></div>
    </div>
  );
};
export default USCryptoETFsDataChart;
