import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

export default function GrowthChart({ childId }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        fetchGrowthData();
    }, [childId]);

    const fetchGrowthData = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = childId ? { child_id: childId } : {};
            const response = await api.get('/parent/growth-chart', { params });
            const rawData = response.data.data.chartData || [];
            
            // Filter out invalid data points (missing weight or NaN values)
            const validData = rawData.filter(point => 
                point.averageWeight != null && 
                !isNaN(point.averageWeight) && 
                point.averageWeight > 0
            );
            
            setChartData(validData);
        } catch (error) {
            console.error('Error fetching growth chart data:', error);
            setError('Gagal memuat data grafik. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Catmull-Rom spline for smooth curves
    const catmullRom2bezier = (points) => {
        if (points.length < 2) return '';

        let path = `M ${points[0].x},${points[0].y}`;

        if (points.length === 2) {
            path += ` L ${points[1].x},${points[1].y}`;
            return path;
        }

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(i - 1, 0)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(i + 2, points.length - 1)];

            // Calculate control points for smooth bezier curve
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }

        return path;
    };

    // Calculate data points with proper scaling
    const getDataPoints = () => {
        if (!chartData || chartData.length === 0) return [];

        // Use a standard coordinate system for calculation, but render responsively
        const width = 1000;
        const height = 256;
        const padding = { top: 30, bottom: 40, left: 50, right: 60 };
        const chartHeight = height - padding.top - padding.bottom;
        const chartWidth = width - padding.left - padding.right;

        // Guard against invalid weights with fallback
        const weights = chartData.map(d => d.averageWeight).filter(w => !isNaN(w) && w > 0);
        if (weights.length === 0) return [];
        
        const maxWeight = Math.max(...weights, 15);
        const minWeight = Math.max(0, Math.min(...weights) - 1); // Ensure minWeight is not negative
        const range = maxWeight - minWeight || 1;

        return chartData.map((point, index) => {
            const weight = point.averageWeight || 0;
            const x = padding.left + (index / Math.max(chartData.length - 1, 1)) * chartWidth;
            const y = padding.top + chartHeight - ((weight - minWeight) / range) * chartHeight;
            return {
                x,
                y,
                data: point,
                index
            };
        });
    };

    const dataPoints = getDataPoints();

    // Generate smooth path
    const generatePath = () => {
        if (dataPoints.length === 0) return '';
        return catmullRom2bezier(dataPoints);
    };

    const generateAreaPath = () => {
        const linePath = generatePath();
        if (!linePath || dataPoints.length === 0) return '';
        const lastPoint = dataPoints[dataPoints.length - 1];
        return `${linePath} L ${lastPoint.x},256 L ${dataPoints[0].x},256 Z`;
    };

    // Handle mouse move for dynamic tooltip
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate relative position in the 1000x256 coordinate system
        const scaleX = 1000 / rect.width;
        const scaleY = 256 / rect.height;

        setMousePosition({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
    };

    // Get Y-axis labels
    const getYAxisLabels = () => {
        if (chartData.length === 0) return ['15', '12', '9', '6', '3'];
        
        const weights = chartData.map(d => d.averageWeight).filter(w => !isNaN(w) && w > 0);
        if (weights.length === 0) return ['15', '12', '9', '6', '3'];
        
        const maxWeight = Math.ceil(Math.max(...weights, 15));
        const minWeight = Math.floor(Math.max(0, Math.min(...weights)));
        const steps = 5;
        const stepSize = (maxWeight - minWeight) / (steps - 1);

        return Array.from({ length: steps }, (_, i) =>
            (minWeight + stepSize * (steps - 1 - i)).toFixed(1)
        );
    };

    const yAxisLabels = getYAxisLabels();

    return (
        <div className="bg-white rounded-2xl md:rounded-[24px] p-4 md:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
            <div className="flex flex-row justify-between items-center gap-2 mb-4 md:mb-8">
                <div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg text-blue-600">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-gray-800">Grafik Pertumbuhan</h3>
                            <p className="text-gray-500 text-[10px] md:text-sm">Rata-rata berat badan (kg)</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        className={`px-3 py-1 rounded-md text-xs md:text-sm font-medium transition-all ${selectedPeriod === 'month' ? 'bg-white shadow-sm text-gray-800 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setSelectedPeriod('month')}
                    >
                        12 Bulan
                    </button>
                </div>
            </div>

            {/* Chart Visualization */}
            <div
                className="relative h-56 md:h-80 w-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPoint(null)}
            >
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-600 mb-2">{error}</p>
                            <button
                                onClick={fetchGrowthData}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p>Belum ada data pengukuran</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Y-Axis Labels */}
                        <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-gray-500 pr-2">
                            {yAxisLabels.map((label, i) => (
                                <span key={i} className="text-right">{label}</span>
                            ))}
                        </div>

                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between ml-10">
                            {yAxisLabels.map((_, i) => (
                                <div key={i} className="border-b border-gray-100 w-full h-0"></div>
                            ))}
                        </div>

                        {/* SVG Chart */}
                        <svg
                            className="absolute inset-0 w-full h-full ml-10"
                            preserveAspectRatio="none"
                            viewBox="0 0 1000 256"
                        >
                            <defs>
                                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4481EB" stopOpacity="0.3" />
                                    <stop offset="50%" stopColor="#4481EB" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#4481EB" stopOpacity="0" />
                                </linearGradient>

                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Area under curve */}
                            <motion.path
                                d={generateAreaPath()}
                                fill="url(#gradientArea)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                            />

                            {/* The Line */}
                            <motion.path
                                d={generatePath()}
                                fill="none"
                                stroke="#4481EB"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#glow)"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />

                            {/* Data points */}
                            {dataPoints.map((point, index) => (
                                <g key={index}>
                                    <motion.circle
                                        cx={point.x}
                                        cy={point.y}
                                        r={hoveredPoint === index ? 8 : 5}
                                        fill="white"
                                        stroke="#4481EB"
                                        strokeWidth="3"
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoveredPoint(index)}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                                        whileHover={{ scale: 1.5 }}
                                    />
                                    {hoveredPoint === index && (
                                        <motion.circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="12"
                                            fill="none"
                                            stroke="#4481EB"
                                            strokeWidth="2"
                                            opacity="0.3"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                    )}
                                </g>
                            ))}
                        </svg>

                        {/* Dynamic Tooltip */}
                        <AnimatePresence>
                            {hoveredPoint !== null && (
                                <motion.div
                                    initial={{ opacity: 0, x: "-50%", y: "calc(-100% + 5px)" }}
                                    animate={{ opacity: 1, x: "-50%", y: "calc(-100% - 10px)" }}
                                    exit={{ opacity: 0, x: "-50%", y: "calc(-100% + 5px)" }}
                                    className="absolute pointer-events-none z-10 ml-10"
                                    style={{
                                        left: `${(dataPoints[hoveredPoint].x / 1000) * 100}%`,
                                        top: `${(dataPoints[hoveredPoint].y / 256) * 100}%`,
                                    }}
                                >
                                    <div className="bg-[#4481EB] text-white px-4 py-2 rounded-xl shadow-lg">
                                        <div className="text-xs opacity-80">{dataPoints[hoveredPoint].data.month} {dataPoints[hoveredPoint].data.year}</div>
                                        <div className="text-lg font-bold">{dataPoints[hoveredPoint].data.averageWeight} kg</div>
                                        <div className="text-xs opacity-80">{dataPoints[hoveredPoint].data.measurementCount} pengukuran</div>
                                    </div>
                                    <div className="w-3 h-3 bg-[#4481EB] transform rotate-45 mx-auto -mt-1.5"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* X-Axis Labels */}
                        <div className="absolute bottom-0 left-10 right-0 h-6">
                            {dataPoints.map((point, index) => (
                                <span
                                    key={index}
                                    className={`absolute bottom-0 transform -translate-x-1/2 text-[10px] md:text-xs text-gray-500 transition-all ${hoveredPoint === index ? 'font-bold text-blue-600' : ''}`}
                                    style={{ left: `${point.x / 10}%` }}
                                >
                                    {point.data.month}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
