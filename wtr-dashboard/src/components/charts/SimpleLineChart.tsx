import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './SimpleLineChart.css';

interface TimeSeriesData { // Standard time series
  date: Date;
  value: number;
}

interface CategoricalTermStructureData { // For Futures Term Structure
    expiryDate: Date; // Actual date for sorting/reference
    price: number;    // Y-value, renamed to 'value' for chart component
    contract: string; // For tooltip
    dateString: string; // X-axis category, e.g., "Mar '24"
}

// Allow data to be one of these types
type ChartableData = TimeSeriesData | CategoricalTermStructureData;


interface SimpleLineChartProps {
  data: ChartableData[];
  title?: string; // Usually handled by parent card
  width?: number;
  height?: number;
  lineColor?: string;
  yAxisLabel?: string;
  xAxisType?: 'date' | 'category'; // Hint for X-axis scale type
  customTooltipFormatter?: (d: any) => string; // For complex tooltips like term structure
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  // title, // Handled by card
  width: propWidth = 600,
  height: propHeight = 300,
  lineColor = 'var(--color-accent-gold-luminous, #FFD700)',
  yAxisLabel = 'Value',
  xAxisType = 'date', // Default to date axis
  customTooltipFormatter,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const margin = { top: 20, right: 50, bottom: 60, left: 70 }; // Adjusted margins for labels
    const chartWidth = propWidth - margin.left - margin.right;
    const chartHeight = propHeight - margin.top - margin.bottom;

    // --- Scales ---
    let xScale: d3.ScaleTime<number, number> | d3.ScaleBand<string>;
    if (xAxisType === 'date') {
      xScale = d3.scaleTime()
        .domain(d3.extent(data as TimeSeriesData[], d => d.date) as [Date, Date])
        .range([0, chartWidth]);
    } else { // 'category'
      xScale = d3.scaleBand<string>()
        .domain(data.map(d => (d as CategoricalTermStructureData).dateString))
        .range([0, chartWidth])
        .padding(0.1);
    }

    const yDomainValueKey = xAxisType === 'date' ? 'value' : 'price'; // 'price' for term structure
    const yMinValue = d3.min(data, d => (d as any)[yDomainValueKey]) || 0;
    const yMaxValue = d3.max(data, d => (d as any)[yDomainValueKey]) || 0;

    const yScale = d3.scaleLinear()
      .domain([yMinValue > 0 ? yMinValue * 0.95 : yMinValue * 1.05, yMaxValue * 1.05]) // Adjust padding based on min value
      .range([chartHeight, 0])
      .nice();

    // --- Main G container ---
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Axes ---
    let xAxisCall: d3.Axis<any>;
    if (xAxisType === 'date') {
      xAxisCall = d3.axisBottom(xScale as d3.ScaleTime<number, number>).ticks(5).tickFormat(d3.timeFormat("%b %d"));
    } else { // 'category'
      xAxisCall = d3.axisBottom(xScale as d3.ScaleBand<string>);
    }

    g.append("g")
      .attr("class", "x-axis chart-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxisCall)
      .selectAll("text")
      .style("text-anchor", xAxisType === 'category' ? "middle" : "end") // Adjust anchor for categorical
      .attr("dx", xAxisType === 'category' ? "0" : "-.8em")
      .attr("dy", xAxisType === 'category' ? ".8em" : ".15em") // Push category labels down a bit
      .attr("transform", xAxisType === 'category' ? "rotate(0)" : "rotate(-45)");


    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("~s"));
    g.append("g")
      .attr("class", "y-axis chart-axis")
      .call(yAxis);

    // Y-axis Label
    g.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 15) // Adjust position
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yAxisLabel);

    // --- Gridlines ---
    g.append("g").attr("class", "grid y-grid")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-chartWidth).tickFormat(() => ""));
    g.append("g").attr("class", "grid x-grid")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale as any).ticks(5).tickSize(-chartHeight).tickFormat(() => ""));

    // --- Line ---
    const lineGenerator = d3.line<ChartableData>()
      .x(d => {
        if (xAxisType === 'date') {
          return (xScale as d3.ScaleTime<number, number>)((d as TimeSeriesData).date);
        } else {
          // Center points in band for categorical scale
          return (xScale as d3.ScaleBand<string>)((d as CategoricalTermStructureData).dateString)! + (xScale as d3.ScaleBand<string>).bandwidth() / 2;
        }
      })
      .y(d => yScale((d as any)[yDomainValueKey])) // Use yDomainValueKey
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data as ChartableData[]) // Ensure datum is correctly typed
      .attr("class", "chart-line")
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr("d", line);

    // --- Tooltip ---
    const tooltip = d3.select(tooltipRef.current);
    const focusCircle = g.append("circle")
      .attr("class", "focus-circle")
      .attr("r", 5)
      .style("opacity", 0);

    const focusLine = g.append("line")
        .attr("class", "focus-line")
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .style("opacity", 0);

    svg.append("rect") // Overlay for mouse events
      .attr("class", "overlay-rect")
      .attr("width", propWidth)
      .attr("height", propHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {
        tooltip.style("opacity", 1);
        focusCircle.style("opacity", 1);
        focusLine.style("opacity", 1);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
        focusCircle.style("opacity", 0);
        focusLine.style("opacity", 0);
      })
      .on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event, g.node());
        let selectedData: ChartableData | undefined;

        if (xAxisType === 'date') {
            const x0 = (xScale as d3.ScaleTime<number, number>).invert(mouseX);
            const bisector = d3.bisector((d: TimeSeriesData) => d.date).left;
            const index = bisector(data as TimeSeriesData[], x0, 1);
            const d0 = data[index - 1] as TimeSeriesData;
            const d1 = data[index] as TimeSeriesData;
            selectedData = (d1 && (x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime())) ? d1 : d0;
        } else { // 'category'
            // Find closest band center
            let minDistance = Infinity;
            data.forEach(d_cat => {
                const d = d_cat as CategoricalTermStructureData;
                const bandCenter = (xScale as d3.ScaleBand<string>)(d.dateString)! + (xScale as d3.ScaleBand<string>).bandwidth() / 2;
                const distance = Math.abs(mouseX - bandCenter);
                if (distance < minDistance && distance < (xScale as d3.ScaleBand<string>).bandwidth() / 1.5) { // Ensure it's close enough to a band
                    minDistance = distance;
                    selectedData = d;
                }
            });
        }

        if (selectedData) {
          const focusX = xAxisType === 'date'
            ? (xScale as d3.ScaleTime<number, number>)((selectedData as TimeSeriesData).date)
            : (xScale as d3.ScaleBand<string>)((selectedData as CategoricalTermStructureData).dateString)! + (xScale as d3.ScaleBand<string>).bandwidth() / 2;
          const focusY = yScale((selectedData as any)[yDomainValueKey]);

          focusCircle.attr("cx", focusX).attr("cy", focusY);
          focusLine.attr("x1", focusX).attr("x2", focusX);

          if (customTooltipFormatter) {
            tooltip.html(customTooltipFormatter(selectedData));
          } else if (xAxisType === 'date') {
            const sd = selectedData as TimeSeriesData;
            tooltip.html(`
              <div><strong>Date:</strong> ${d3.timeFormat('%Y-%m-%d')(sd.date)}</div>
              <div><strong>Value:</strong> ${d3.format(",.2f")(sd.value)}</div>
            `);
          } else { // Default for category if no custom formatter
             const sd = selectedData as CategoricalTermStructureData;
             tooltip.html(`
              <div><strong>${sd.dateString}</strong></div>
              <div><strong>Value:</strong> ${d3.format(",.2f")(sd.price)}</div>
            `);
          }
          tooltip
            .style("left", `${d3.pointer(event, svg.node())[0] + 15}px`)
            .style("top", `${d3.pointer(event, svg.node())[1] - 10}px`);
        }
      });

  }, [data, propWidth, propHeight, lineColor, yAxisLabel, xAxisType, customTooltipFormatter]);

  return (
    <div className="simple-line-chart-container">
      <svg ref={svgRef} width={propWidth} height={propHeight}></svg>
      <div ref={tooltipRef} className="simple-chart-tooltip"></div>
    </div>
  );
};

export default SimpleLineChart;
