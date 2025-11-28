"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RadialOrbitalTimeline({
  timelineData
}) {
  const [expandedItems, setExpandedItems] = useState({});
  const [viewMode, setViewMode] = useState("orbital");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState({});
  const [centerOffset, setCenterOffset] = useState({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState(null);
  const containerRef = useRef(null);
  const orbitRef = useRef(null);
  const nodeRefs = useRef({});

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  const [radius, setRadius] = useState(300);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setRadius(140); // Mobile
      } else if (window.innerWidth < 1024) {
        setRadius(220); // Tablet
      } else {
        setRadius(300); // Desktop
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    if (autoRotate && viewMode === "orbital") {
      const animate = (currentTime) => {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Rotate at ~18 degrees per second (0.3 degrees per 16.67ms at 60fps)
        const rotationSpeed = 18; // degrees per second
        const increment = (rotationSpeed * deltaTime) / 1000;

        setRotationAngle((prev) => {
          const newAngle = (prev + increment) % 360;
          return Number(newAngle.toFixed(3));
        });

        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [autoRotate, viewMode]);

  const centerViewOnNode = (nodeId) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = itemId => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = itemId => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = status => {
    switch (status) {
      case "completed":
        return "text-white bg-black border-white";
      case "in-progress":
        return "text-black bg-white border-black";
      case "pending":
        return "text-white bg-black/40 border-white/50";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden"
      ref={containerRef}
      onClick={handleContainerClick}>
      <div
        className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}>
          <div
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-[#00BFEF] via-[#0088c2] to-[#006b9e] animate-pulse flex items-center justify-center z-10">
            <div
              className="absolute w-24 h-24 rounded-full border border-[#00BFEF]/30 animate-ping opacity-70"></div>
            <div
              className="absolute w-28 h-28 rounded-full border border-[#00BFEF]/20 animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}></div>
            <div className="w-10 h-10 rounded-full bg-white backdrop-blur-md"></div>
          </div>

          <div
            className="absolute rounded-full border-2 border-gray-300 transition-all duration-500 ease-in-out"
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              willChange: 'transform'
            }}></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className="absolute cursor-pointer"
                style={{
                  ...nodeStyle,
                  transition: 'transform 0.05s linear, opacity 0.3s ease-out, z-index 0s',
                  willChange: 'transform, opacity'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}>
                <div
                  className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse duration-1000" : ""
                    }`}
                  style={{
                    background: `radial-gradient(circle, rgba(0,191,239,0.2) 0%, rgba(0,191,239,0) 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}></div>
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isExpanded
                      ? "bg-[#00BFEF] text-white"
                      : isRelated
                        ? "bg-[#00BFEF]/50 text-white"
                        : "bg-gray-700 text-white"
                    }
                  border-2 
                  ${isExpanded
                      ? "border-[#00BFEF] shadow-lg shadow-[#00BFEF]/30"
                      : isRelated
                        ? "border-[#00BFEF] animate-pulse"
                        : "border-gray-400"
                    }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-150" : ""}
                `}>
                  <Icon size={16} />
                </div>
                <div
                  className={`
                  absolute top-12  whitespace-nowrap
                  text-xs font-semibold tracking-wider
                  transition-all duration-300
                  ${isExpanded ? "text-gray-900 scale-125" : "text-gray-700"}
                `}>
                  {item.title}
                </div>
                {isExpanded && (
                  <Card
                    className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-white backdrop-blur-lg border-gray-200 shadow-xl overflow-visible">
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-gray-300"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge className="px-2 text-xs bg-green-600 text-white border-green-600">
                          INTEGRATED
                        </Badge>
                        <span className="text-xs font-mono text-gray-500">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="text-sm mt-2">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-gray-700">
                      <p>{item.content}</p>



                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center mb-2">
                            <Link size={10} className="text-gray-500 mr-1" />
                            <h4 className="text-xs uppercase tracking-wider font-medium text-gray-500">
                              Connected Nodes
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center h-6 px-2 py-0 text-xs rounded-none border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}>
                                  {relatedItem?.title}
                                  <ArrowRight size={8} className="ml-1 text-gray-400" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div >
  );
}
