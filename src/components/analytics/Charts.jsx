import React, { useEffect, useRef } from 'react';

/**
 * Simple Area Chart using SVG + CSS
 * Data: [{ date: '2026-01-01', pageviews: 10, uniqueVisitors: 5 }, ...]
 */
export const AreaChart = ({ data, height = 200, color = '#F46C38' }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = svgRef.current;
    const width = svg.clientWidth;
    const pad = 40;
    const plotWidth = width - pad;
    const plotHeight = height - 60;

    const values = data.map((d) => d.pageviews);
    const maxVal = Math.max(...values, 1);

    const points = data.map((d, i) => {
      const x = pad + (i / (data.length - 1 || 1)) * plotWidth;
      const y = height - 40 - (d.pageviews / maxVal) * plotHeight;
      return `${x},${y}`;
    }).join(' ');

    // Area path
    const areaPoints = `M ${pad} ${height - 40} L ${points} L ${pad + plotWidth} ${height - 40} Z`;

    const pathEl = svg.querySelector('.area-path');
    if (pathEl) pathEl.setAttribute('d', areaPoints);

    // Grid lines + labels
    const gridContainer = svg.querySelector('.grid-lines');
    if (gridContainer) {
      gridContainer.innerHTML = '';
      const steps = 4;
      for (let i = 0; i <= steps; i++) {
        const val = Math.round((maxVal / steps) * i);
        const y = height - 40 - (i / steps) * plotHeight;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', pad);
        line.setAttribute('x2', width - 10);
        line.setAttribute('y1', y);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#ffffff08');
        line.setAttribute('stroke-width', '1');
        gridContainer.appendChild(line);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', pad - 8);
        label.setAttribute('y', y + 4);
        label.setAttribute('fill', '#ffffff40');
        label.setAttribute('font-size', '10');
        label.setAttribute('text-anchor', 'end');
        label.textContent = val;
        gridContainer.appendChild(label);
      }
    }

    // Date labels
    const dateContainer = svg.querySelector('.date-labels');
    if (dateContainer) {
      dateContainer.innerHTML = '';
      const step = Math.max(1, Math.floor(data.length / 6));
      for (let i = 0; i < data.length; i += step) {
        const d = new Date(data[i].date);
        const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const x = pad + (i / (data.length - 1 || 1)) * plotWidth;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height - 15);
        text.setAttribute('fill', '#ffffff60');
        text.setAttribute('font-size', '10');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = label;
        dateContainer.appendChild(text);
      }
    }
  }, [data, height, color]);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/30">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-[240px] sm:h-[300px]">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`0 0 ${400} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="grad-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="grid-lines" />
        <path
          className="area-path"
          fill="url(#grad-area)"
          d=""
        />
        <g className="date-labels" />
      </svg>
    </div>
  );
};

/**
 * Simple Horizontal Bar Chart
 * Data: [{ label: 'Skills', value: 45, color: '#C5FF41' }, ...]
 */
export const BarChart = ({ data, color = '#F46C38' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/30">
        No data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-20 text-xs font-bold text-white/60">
            {item.label}
          </span>
          <div className="flex-1 bg-white/5 rounded-full h-8 sm:h-10 overflow-hidden relative group">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${item.color || color}`}
              style={{ width: '0%' }}
            >
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ width: `${(item.value / maxVal) * 100}%` }}
              />
            </div>
          </div>
          <span className="w-10 text-xs font-mono text-right text-white/40">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Simple Donut Chart using SVG
 * Data: [{ label: 'Mobile', value: 45, color: '#C5FF41' }, ...]
 */
export const DonutChart = ({ data, size = 160, title, subtitle }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[{size}px] text-white/30">
        {title && <h3 className="text-sm font-bold">{title}</h3>}
        <span className="text-xs">{subtitle}</span>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;

  const slices = data.reduce((acc, d, i) => {
    const startAngle = i === 0 ? 0 : acc[acc.length - 1].endAngle;
    const sliceAngle = (d.value / total) * 360;
    const endAngle = startAngle + sliceAngle;
    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
    const largeArc = sliceAngle > 180 ? 1 : 0;
    const dPath = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${cx} ${cy} Z`;
    return [
      ...acc,
      { key: d.label, dPath, color: d.color, endAngle }
    ];
  }, []).map((slice) => <path key={slice.key} d={slice.dPath} fill={slice.color} />);

  const avgVal = total / data.length;

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        className="block"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#ffffff10"
          strokeWidth="8"
        />
        {slices}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg sm:text-xl font-black tabular-nums">{Math.round(avgVal)}</span>
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{subtitle || 'Avg'}</span>
      </div>
    </div>
  );
};
