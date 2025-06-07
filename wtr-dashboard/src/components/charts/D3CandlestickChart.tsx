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
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const originalXScaleRef = useRef<d3.ScaleBand<string> | null>(null);

  // Only 'volume' indicator is kept. MACD and RSI are removed.
  const [visibleIndicators, setVisibleIndicators] = React.useState({
    volume: true,
  });

  // Refs for scales and dimensions needed in zoom handler
  const yVolumeScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const volumeChartHeightRef = useRef(0);
  const indicatorTopMarginRef = useRef(0);


  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !d3 || !d3.select) {
        console.error("D3 or data not available, or svgRef not set.");
        return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    // --- Define Gradients ---
    const defs = svg.append("defs");

    // It's important that svgRef.current is available here.
    // If this useEffect runs, svgRef.current should be set.
    const computedStyle = getComputedStyle(svgRef.current!);

    const bullishCandleGradient = defs.append("linearGradient")
        .attr("id", "bullishCandleGradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    bullishCandleGradient.append("stop").attr("offset", "0%").style("stop-color", "var(--color-candle-uptrend-body)").style("stop-opacity", 1);
    bullishCandleGradient.append("stop").attr("offset", "100%").style("stop-color", d3.color(computedStyle.getPropertyValue('--color-candle-uptrend-body').trim() || '#F0F0F0').darker(0.3).toString()).style("stop-opacity", 1);

    const bearishCandleGradient = defs.append("linearGradient")
        .attr("id", "bearishCandleGradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    bearishCandleGradient.append("stop").attr("offset", "0%").style("stop-color", d3.color(computedStyle.getPropertyValue('--color-candle-downtrend-body').trim() || '#3A506B').brighter(0.3).toString()).style("stop-opacity", 1);
    bearishCandleGradient.append("stop").attr("offset", "100%").style("stop-color", "var(--color-candle-downtrend-body)").style("stop-opacity", 1);

    const volumeUpGradient = defs.append("linearGradient")
        .attr("id", "volumeUpGradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    volumeUpGradient.append("stop").attr("offset", "0%").style("stop-color", "var(--color-volume-uptrend)").style("stop-opacity", 0.7); // Top
    volumeUpGradient.append("stop").attr("offset", "100%").style("stop-color", d3.color(computedStyle.getPropertyValue('--color-volume-uptrend').trim().replace(/rgba\((\d+,\s*\d+,\s*\d+),.*?\)/, 'rgb($1)') || 'rgba(255,215,0,0.5)').darker(0.5).toString()).style("stop-opacity", 0.9); // Bottom

    const volumeDownGradient = defs.append("linearGradient")
        .attr("id", "volumeDownGradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    volumeDownGradient.append("stop").attr("offset", "0%").style("stop-color", "var(--color-volume-downtrend)").style("stop-opacity", 0.7); // Top
    volumeDownGradient.append("stop").attr("offset", "100%").style("stop-color", d3.color(computedStyle.getPropertyValue('--color-volume-downtrend').trim().replace(/rgba\((\d+,\s*\d+,\s*\d+),.*?\)/, 'rgb($1)') || 'rgba(58,80,107,0.5)').darker(0.5).toString()).style("stop-opacity", 0.9); // Bottom

    const margin = { top: 20, right: 40, bottom: 20, left: 60 }; // Reduced bottom margin for overall chart
    const chartWidth = propWidth - margin.left - margin.right;

    // --- Dynamic Height Allocation ---
    const basePriceChartRatio = 0.75; // Increased ratio for price chart as MACD/RSI are removed
    const volumeChartRatio = 0.25; // Ratio for volume chart

    let priceChartHeight = propHeight * basePriceChartRatio - margin.top - margin.bottom;
    let volumeChartHeight = 0; // Initialize to 0
    let currentYOffset = 0; // Will be set based on price chart height

    if (visibleIndicators.volume) {
      // If volume is visible, adjust price chart height and calculate volume chart height
      priceChartHeight = propHeight * (basePriceChartRatio - (volumeChartRatio * 0.35)) - margin.top - margin.bottom; // Give a bit more to price
      volumeChartHeight = propHeight * volumeChartRatio - margin.top; // Volume chart also needs top margin
      currentYOffset = priceChartHeight + margin.bottom + margin.top; // Y offset for volume chart
    } else {
      // If no volume, price chart takes most of the space
      priceChartHeight = propHeight - margin.top - margin.bottom;
      currentYOffset = priceChartHeight + margin.bottom;
    }
    const indicatorTopMargin = margin.top / 2; // Still useful for volume chart's internal padding


    // --- Scales ---
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date.getTime().toString()))
      .range([0, chartWidth])
      .padding(0.25); // Adjusted padding

    const yPriceScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.low) || 0, d3.max(data, d => d.high) || 0])
      .range([priceChartHeight, 0])
      .nice(); // Make the axis end on nice round values

    // YVolumeScale will be defined conditionally if volume is visible

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
      .tickFormat(d => d3.timeFormat('%Y-%m-%d')(new Date(parseInt(d))));

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

    // Secondary Y Grid (Layered)
    priceG.append("g").attr("class", "grid price-grid-y-secondary")
      .style("opacity", 0.3) // More subtle
      .attr("transform", "translate(2,2)") // Slight offset
      .call(d3.axisLeft(yPriceScale).ticks(Math.max(2, Math.floor(priceChartHeight / 80))).tickSize(-chartWidth).tickFormat(() => ""));

    priceG.append("g").attr("class", "grid price-grid-x")
      .attr("transform", `translate(0,${priceChartHeight})`)
      .call(d3.axisBottom(xScale).tickValues(tickValues).tickSize(-priceChartHeight).tickFormat(() => ""));

    // Candlesticks
    // Ensure candles are defined for potential use in zoom function, even if initially empty
    let candles = priceG.selectAll(".candle-group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "candle-group")
      .attr("transform", d => `translate(${xScale(d.date.getTime().toString()) || 0},0)`);

    candles.append("line")
      .attr("class", "wick")
      .attr("x1", xScale.bandwidth() / 2)
      .attr("x2", xScale.bandwidth() / 2)
      .attr("y1", d => yPriceScale(d.high))
      .attr("y2", d => yPriceScale(d.low))
      .attr("stroke", d => d.open > d.close ? 'var(--color-candle-downtrend-wick)' : 'var(--color-candle-uptrend-wick)');

    candles.append("rect")
      .attr("class", d => `candle-body ${d.open > d.close ? 'bearish' : 'bullish'}`)
      .attr("x", 0)
      .attr("y", d => yPriceScale(Math.max(d.open, d.close)))
      .attr("width", xScale.bandwidth())
      .attr("height", d => Math.max(1, Math.abs(yPriceScale(d.open) - yPriceScale(d.close)))) // Min height 1px
      .attr("fill", d => d.open > d.close ? "url(#bearishCandleGradient)" : "url(#bullishCandleGradient)");

    // --- Volume Chart (Conditional) ---
    let volumeG: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;

    volumeChartHeightRef.current = volumeChartHeight; // Store for zoom
    indicatorTopMarginRef.current = indicatorTopMargin; // Store for zoom

    if (visibleIndicators.volume && volumeChartHeightRef.current > 0) {
      const yVolumeScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.volume) || 0])
        .range([volumeChartHeightRef.current - indicatorTopMarginRef.current, 0])
        .nice();
      yVolumeScaleRef.current = yVolumeScale; // Store for zoom


      volumeG = g.append("g")
        .attr("class", "volume-chart")
        .attr("transform", `translate(0, ${currentYOffset})`);

      volumeG.append("g")
        .attr("class", "x-axis volume-axis")
        .attr("transform", `translate(0,${volumeChartHeightRef.current - indicatorTopMarginRef.current})`)
        .call(d3.axisBottom(xScale).tickValues([]).tickFormat(() => ""));

      volumeG.append("g")
        .attr("class", "y-axis volume-axis")
        .call(d3.axisLeft(yVolumeScale).ticks(3).tickFormat(d3.format("~s")));

      const volumeBarGroups = volumeG.selectAll(".volume-bar-group")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "volume-bar-group")
        .attr("transform", d => `translate(${xScale(d.date.getTime().toString()) || 0},0)`);

      const barWidth = xScale.bandwidth();
      const topPieceHeight = Math.max(1, barWidth * 0.12); // Proportional top piece

      // Main Volume Bar
      volumeBarGroups.append("rect")
        .attr("class", d => `volume-bar-main ${d.open > d.close ? 'bearish' : 'bullish'}`)
        .attr("x", 0)
        .attr("y", d => yVolumeScale(d.volume) + topPieceHeight)
        .attr("width", barWidth)
        .attr("height", d => Math.max(0, (volumeChartHeightRef.current - indicatorTopMarginRef.current) - yVolumeScale(d.volume) - topPieceHeight))
        .attr("fill", d => d.open > d.close ? "url(#volumeDownGradient)" : "url(#volumeUpGradient)");

      // 3D Top Piece
      volumeBarGroups.append("rect")
        .attr("class", d => `volume-bar-top ${d.open > d.close ? 'bearish' : 'bullish'}`)
        .attr("x", 0)
        .attr("y", d => yVolumeScale(d.volume))
        .attr("width", barWidth)
        .attr("height", topPieceHeight)
        .attr("fill", d => {
          const baseColorVar = d.open > d.close ? '--color-volume-downtrend' : '--color-volume-uptrend';
          let baseColor = computedStyle.getPropertyValue(baseColorVar).trim();
          if (baseColor.startsWith('rgba')) { // d3.color might struggle with rgba for brighter/darker
            baseColor = baseColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),.*?\)/, 'rgb($1)');
          }
          return d3.color(baseColor || (d.open > d.close ? '#8E3B3D' : '#4A8E7A') )?.brighter(0.7).toString() || 'gray';
        });

      volumeG.append("text").attr("x", 10).attr("y", 10).text("Volume").style("font-size", "10px").attr("fill", "var(--color-text-secondary)");
    }

    // MACD and RSI sections are completely removed.

    // --- Tooltip Implementation ---
    // Tooltip interaction area should cover only the price chart.
    const priceChartInteractionG = g.append("g")
        .attr("class", "price-chart-interaction-layer")
        .attr("width", chartWidth)
        .attr("height", priceChartHeight); // Set height for clarity, though rect below defines interactive area

    const crosshairY = priceChartInteractionG.append("line")
        .attr("class", "crosshair-y")
        .attr("y1", 0)
        .attr("y2", priceChartHeight);

    const crosshairX = priceChartInteractionG.append("line")
        .attr("class", "crosshair-x")
        .attr("x1", 0)
        .attr("x2", chartWidth);

    const overlay = priceChartInteractionG.append("rect")
        .attr("class", "chart-overlay")
        .attr("width", chartWidth)
        .attr("height", priceChartHeight)
        .style("fill", "none")
        .style("pointer-events", "all");

    overlay
        .on("mouseover", () => {
            if (tooltipRef.current) tooltipRef.current.style.opacity = "1";
            crosshairX.style("display", "block");
            crosshairY.style("display", "block");
        })
        .on("mouseout", () => {
            if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
            crosshairX.style("display", "none");
            crosshairY.style("display", "none");
        })
        .on("mousemove", (event) => {
            if (!tooltipRef.current || data.length === 0 || !xScale.domain().length) return;

            const [mouseX, mouseY] = d3.pointer(event, priceChartInteractionG.node()); // Use priceChartInteractionG for coords

            crosshairY.attr("x1", mouseX).attr("x2", mouseX);
            crosshairX.attr("y1", mouseY).attr("y2", mouseY);
            // mouseX is already relative to priceChartInteractionG thanks to d3.pointer(event, priceChartInteractionG.node())
            let mindist = Infinity;
            let selectedIndex = -1;

            // Use mouseX directly for finding the closest data point
            xScale.domain().forEach((dateStr, i) => {
                const bandCenter = (xScale(dateStr) || 0) + xScale.bandwidth() / 2;
                const dist = Math.abs(mouseX - bandCenter); // Use mouseX from d3.pointer
                if (dist < mindist && dist < xScale.bandwidth() / 1.5) {
                    mindist = dist;
                    selectedIndex = i;
                }
            });

            if (selectedIndex === -1) {
                xScale.domain().forEach((dateStr, i) => {
                    const bandCenter = (xScale(dateStr) || 0) + xScale.bandwidth() / 2;
                    const dist = Math.abs(mouseX - bandCenter); // Use mouseX from d3.pointer
                    if (dist < mindist) {
                        mindist = dist;
                        selectedIndex = i;
                    }
                });
            }

            if (selectedIndex === -1 && data.length > 0) {
                const approxIndex = Math.floor(mouseX / xScale.step()); // Use mouseX from d3.pointer
                selectedIndex = Math.max(0, Math.min(data.length - 1, approxIndex));
            }

            const selectedData = data[selectedIndex];

            if (!selectedData) {
                if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
                return;
            }

            const tooltip = d3.select(tooltipRef.current);
            tooltip.style("opacity", 1);
            // Updated formatting for date and prices
            const formatTime = d3.timeFormat('%d %b %H:%M'); // DD MMM HH:mm
            const formatPrice = (price: number) => `$${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

            tooltip.html(`
                <div class="tooltip-line"><span class="tooltip-label">Time:</span> <span class="tooltip-value">${formatTime(selectedData.date)}</span></div>
                <div class="tooltip-line"><span class="tooltip-label">Open:</span> <span class="tooltip-value">${formatPrice(selectedData.open)}</span></div>
                <div class="tooltip-line"><span class="tooltip-label">High:</span> <span class="tooltip-value">${formatPrice(selectedData.high)}</span></div>
                <div class="tooltip-line"><span class="tooltip-label">Low:</span> <span class="tooltip-value">${formatPrice(selectedData.low)}</span></div>
                <div class="tooltip-line"><span class="tooltip-label">Close:</span> <span class="tooltip-value">${formatPrice(selectedData.close)}</span></div>
                <div class="tooltip-line"><span class="tooltip-label">Volume:</span> <span class="tooltip-value">${d3.format("~s")(selectedData.volume)}</span></div>
            `);

            const eventSvgCoords = d3.pointer(event, svgRef.current!);
            tooltip
                .style("left", `${eventSvgCoords[0] + 15}px`)
                .style("top", `${eventSvgCoords[1] - 15}px`);
        });

    // --- Zoom/Pan Implementation ---
    if (!originalXScaleRef.current || d3.zoomTransform(svg.node() as Element).k === 1) {
        originalXScaleRef.current = xScale.copy();
    }

    const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { transform } = event;
        if (!originalXScaleRef.current) return;

        const newXScale = transform.rescaleX(originalXScaleRef.current);
        xScale.domain(newXScale.domain());

        const newTickValues = xScale.domain().filter((_, i, arr) => {
            if (arr.length <= 10) return true;
            return i % Math.ceil(arr.length / 10) === 0;
        });

        priceG.select<SVGGElement>(".x-axis.price-axis")
            .call(xAxis.scale(xScale).tickValues(newTickValues).tickFormat(d => d3.timeFormat('%Y-%m-%d')(new Date(parseInt(d)))))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // Update X-axis for visible indicators
        if (visibleIndicators.volume && volumeG) {
            volumeG.select<SVGGElement>(".x-axis.volume-axis")
                .call(d3.axisBottom(xScale).tickValues([]).tickFormat(() => ""));
        }
        // MACD and RSI X-axis updates are removed.

        const currentCandles = priceG.selectAll(".candle-group");
        currentCandles.attr("transform", (d: any) => `translate(${xScale(d.date.getTime().toString()) || -10000},0)`) // Use -10000 to effectively hide off-screen
               .style("display", (d: any) => (xScale(d.date.getTime().toString()) === undefined || (xScale(d.date.getTime().toString()) || 0) < 0 || (xScale(d.date.getTime().toString()) || 0) > chartWidth) ? "none" : "initial");
        currentCandles.select("rect.candle-body").attr("width", xScale.bandwidth());
        currentCandles.select("line.wick").attr("x1", xScale.bandwidth() / 2).attr("x2", xScale.bandwidth() / 2);

        if (visibleIndicators.volume && volumeG && yVolumeScaleRef.current && volumeChartHeightRef.current != null && indicatorTopMarginRef.current != null) {
            const currentVolumeBarGroups = volumeG.selectAll(".volume-bar-group");
            currentVolumeBarGroups
                .attr("transform", (d: any) => `translate(${xScale(d.date.getTime().toString()) || -10000},0)`)
                .style("display", (d: any) => (xScale(d.date.getTime().toString()) === undefined || (xScale(d.date.getTime().toString()) || 0) < 0 || (xScale(d.date.getTime().toString()) || 0) > chartWidth) ? "none" : "initial");

            const newBarWidth = xScale.bandwidth();
            const newTopPieceHeight = Math.max(1, newBarWidth * 0.12);

            currentVolumeBarGroups.select(".volume-bar-main")
                .attr("width", newBarWidth)
                .attr("y", (d: any) => yVolumeScaleRef.current!(d.volume) + newTopPieceHeight)
                .attr("height", (d: any) => Math.max(0, (volumeChartHeightRef.current - indicatorTopMarginRef.current) - yVolumeScaleRef.current!(d.volume) - newTopPieceHeight));


            currentVolumeBarGroups.select(".volume-bar-top")
                .attr("width", newBarWidth)
                .attr("height", newTopPieceHeight)
                .attr("y", (d: any) => yVolumeScaleRef.current!(d.volume));
        }

        priceG.select<SVGGElement>(".grid.price-grid-x")
            .call(d3.axisBottom(xScale).tickValues(newTickValues).tickSize(-priceChartHeight).tickFormat(() => ""));
    };

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.8, 10])
        .translateExtent([[0, 0], [chartWidth, priceChartHeight]]) // Limit pan to price chart area
        .extent([[0, 0], [chartWidth, priceChartHeight]])      // Zoom extent also limited to price chart
        .on("zoom", zoomed);

    svg.call(zoomBehavior)
       .on("dblclick.zoom", null);

  }, [data, propWidth, propHeight, visibleIndicators]); // Added visibleIndicators

  const toggleIndicator = (indicatorName: keyof typeof visibleIndicators) => {
    setVisibleIndicators(prev => ({
      ...prev,
      [indicatorName]: !prev[indicatorName],
    }));
  };

  return (
    <>
      <div className="d3-candlestick-chart-container" style={{ width: propWidth, height: propHeight }}>
        <svg ref={svgRef} width={propWidth} height={propHeight}></svg>
        <div ref={tooltipRef} className="chart-tooltip" style={{ position: 'absolute', display: 'none', opacity: 0 }}></div>
      </div>
      <div className="chart-indicator-toggles" style={{ marginTop: '10px', textAlign: 'center' }}>
        {/* Only show Volume toggle if it's intended to be toggleable, otherwise this can be removed */}
        { Object.prototype.hasOwnProperty.call(visibleIndicators, 'volume') && (
            <button
              key="volume"
              onClick={() => toggleIndicator('volume')}
              className={`toggle-button ${visibleIndicators.volume ? 'active' : ''}`}
            >
              VOLUME
            </button>
        )}
      </div>
    </>
  );
};

export default D3CandlestickChart;
