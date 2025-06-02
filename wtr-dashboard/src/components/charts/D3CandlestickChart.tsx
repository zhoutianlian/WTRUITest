// src/components/charts/D3CandlestickChart.tsx
import React, { useEffect, useRef } from 'react';
import * as _d3 from 'd3';
import './D3CandlestickChart.css';

// Attempt to use d3, falling back to window.d3 if it's globally available (less common in module setups)
const d3 = (window as any).d3 || _d3;

interface OHLCData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface D3CandlestickChartProps {
  data: OHLCData[];
  width?: number;
  height?: number;
}

const D3CandlestickChart: React.FC<D3CandlestickChartProps> = ({
  data,
  width: propWidth = 700,
  height: propHeight = 500, // Increased default height to accommodate volume
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null); // For future tooltip implementation

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !d3 || !d3.select) {
        console.error("D3 or data not available, or svgRef not set.");
        return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const margin = { top: 20, right: 40, bottom: 70, left: 60 }; // Adjusted margins
    const chartWidth = propWidth - margin.left - margin.right;
    const priceChartHeight = propHeight * 0.65 - margin.top - margin.bottom; // 65% for price
    const volumeChartHeight = propHeight * 0.20 - margin.top; // 20% for volume (reduce one margin.top)


    // --- Scales ---
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date.getTime().toString()))
      .range([0, chartWidth])
      .padding(0.25); // Adjusted padding

    const yPriceScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.low) || 0, d3.max(data, d => d.high) || 0])
      .range([priceChartHeight, 0])
      .nice(); // Make the axis end on nice round values

    const yVolumeScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.volume) || 0])
      .range([volumeChartHeight, 0])
      .nice();

    // --- Main G container ---
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Price Chart ---
    const priceG = g.append("g").attr("class", "price-chart");

    // X Axis (Price)
    const numTicks = Math.min(10, Math.floor(data.length / 2)); // Max 10 ticks or fewer for small datasets
    const tickIndices = data.length <= numTicks ? d3.range(data.length) : d3.range(0, data.length, Math.ceil(data.length / numTicks));
    const tickValues = tickIndices.map(i => data[i].date.getTime().toString());

    const xAxis = d3.axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat(d => d3.timeFormat('%b %d')(new Date(parseInt(d))));

    priceG.append("g")
      .attr("class", "x-axis price-axis")
      .attr("transform", `translate(0,${priceChartHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Y Axis (Price)
    const yAxis = d3.axisLeft(yPriceScale).ticks(Math.max(3, Math.floor(priceChartHeight / 50))); // Responsive ticks
    priceG.append("g").attr("class", "y-axis price-axis").call(yAxis);

    // Gridlines (Price)
    priceG.append("g").attr("class", "grid price-grid-y")
      .call(d3.axisLeft(yPriceScale).ticks(Math.max(3, Math.floor(priceChartHeight / 50))).tickSize(-chartWidth).tickFormat(() => ""));
    priceG.append("g").attr("class", "grid price-grid-x")
      .attr("transform", `translate(0,${priceChartHeight})`)
      .call(d3.axisBottom(xScale).tickValues(tickValues).tickSize(-priceChartHeight).tickFormat(() => ""));

    // Candlesticks
    const candles = priceG.selectAll(".candle")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "candle-group") // Changed class for clarity
      .attr("transform", d => `translate(${xScale(d.date.getTime().toString()) || 0},0)`);

    candles.append("line")
      .attr("class", "wick")
      .attr("x1", xScale.bandwidth() / 2)
      .attr("x2", xScale.bandwidth() / 2)
      .attr("y1", d => yPriceScale(d.high))
      .attr("y2", d => yPriceScale(d.low))
      .attr("stroke", d => d.open > d.close ? 'var(--color-candle-red, #E54D42)' : 'var(--color-candle-green, #2AA092)');

    candles.append("rect")
      .attr("class", d => `candle-body ${d.open > d.close ? 'bearish' : 'bullish'}`)
      .attr("x", 0)
      .attr("y", d => yPriceScale(Math.max(d.open, d.close)))
      .attr("width", xScale.bandwidth())
      .attr("height", d => Math.max(1, Math.abs(yPriceScale(d.open) - yPriceScale(d.close)))) // Min height 1px
      .attr("fill", d => d.open > d.close ? 'var(--color-candle-red, #E54D42)' : 'var(--color-candle-green, #2AA092)');

    // --- Volume Chart ---
    const volumeG = g.append("g")
      .attr("class", "volume-chart")
      .attr("transform", `translate(0, ${priceChartHeight + margin.bottom - 20})`); // Adjusted positioning

    // X Axis (Volume) - Hidden ticks/labels to avoid clutter
    volumeG.append("g")
      .attr("class", "x-axis volume-axis")
      .attr("transform", `translate(0,${volumeChartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(() => ""));

    // Y Axis (Volume)
    volumeG.append("g")
      .attr("class", "y-axis volume-axis")
      .call(d3.axisLeft(yVolumeScale).ticks(3).tickFormat(d3.format("~s"))); // Format e.g., 1K, 1M

    volumeG.selectAll(".volume-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", d => `volume-bar ${d.open > d.close ? 'bearish' : 'bullish'}`)
      .attr("x", d => xScale(d.date.getTime().toString()) || 0)
      .attr("y", d => yVolumeScale(d.volume))
      .attr("width", xScale.bandwidth())
      .attr("height", d => volumeChartHeight - yVolumeScale(d.volume))
      .attr("fill", d => d.open > d.close ? 'rgba(var(--rgb-candle-red, 229,77,66), 0.4)' : 'rgba(var(--rgb-candle-green, 42,160,146), 0.4)');

    // Tooltip setup (basic, actual display logic would be more involved)
    if (tooltipRef.current) {
        // Tooltip logic would go here, listening to mouse events on an overlay rect.
        // For now, just ensuring the ref is present.
    }

    // Zoom behavior (placeholder, full implementation is complex)
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 10])
        .translateExtent([[0, 0], [chartWidth, priceChartHeight + volumeChartHeight + margin.bottom]])
        .on("zoom", (event) => {
            // console.log("Zoom event:", event.transform);
            // This would involve updating xScale and re-rendering elements.
            // For now, a simple transform on the main 'g' element to show zoom is captured.
            // This is NOT a proper financial chart zoom/pan.
            // g.attr("transform", `translate(${event.transform.x + margin.left}, ${event.transform.y + margin.top}) scale(${event.transform.k})`);
        });
    // svg.call(zoom); // Disabling zoom for now to keep it simple. Full zoom needs careful scale updates.

  }, [data, propWidth, propHeight]);

  return (
    <div className="d3-candlestick-chart-container" style={{ width: propWidth, height: propHeight }}>
      <svg ref={svgRef} width={propWidth} height={propHeight}></svg>
      <div ref={tooltipRef} className="chart-tooltip" style={{ position: 'absolute', display: 'none', opacity: 0 }}></div>
    </div>
  );
};

export default D3CandlestickChart;
