import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import HistoryPageSkeleton from "../loading/HistoryPageSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";
import PageHeader from "../dashboard/PageHeader";
import { DatePicker } from "../ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Icon } from "@iconify/react";

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
  });
  const [filters, setFilters] = useState({
    child_id: "",
    type: "all",
    start_date: "",
    end_date: "",
  });
  const [children, setChildren] = useState([]);
  const { getCachedData, setCachedData } = useDataCache();
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    fetchChildren();
    fetchHistory(1);
  }, []);

  // Real-time filtering - automatically fetch when filters change
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    fetchHistory(1);
  }, [filters]);

  const fetchChildren = async () => {
    try {
      const cachedData = getCachedData('children');
      if (cachedData) {
        setChildren(cachedData);
        return;
      }
      const response = await api.get("/parent/children");
      const data = response.data.data;
      setChildren(data);
      setCachedData('children', data);
    } catch (err) {
      console.error("Error fetching children:", err);
    }
  };

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        per_page: pagination.per_page,
      };

      if (filters.child_id) params.child_id = filters.child_id;
      if (filters.type && filters.type !== "all") params.type = filters.type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const cacheKey = `history_${JSON.stringify(params)}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setHistoryData(cachedData.data);
        setPagination(cachedData.meta);
        setLoading(false);
        return;
      }

      const response = await api.get("/parent/history", { params });
      setHistoryData(response.data.data);
      setPagination(response.data.meta);

      setCachedData(cacheKey, {
        data: response.data.data,
        meta: response.data.meta,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Gagal memuat riwayat. Silakan coba lagi.";
      setError(errorMessage);
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [field]: value,
      };

      // Validate date range: if end_date is before start_date, clear end_date
      if (field === "start_date" && newFilters.end_date) {
        const startDate = new Date(value);
        const endDate = new Date(newFilters.end_date);
        if (startDate > endDate) {
          newFilters.end_date = ""; // Clear end_date if it's before start_date
        }
      }

      // Validate date range: if start_date is after end_date, clear start_date
      if (field === "end_date" && newFilters.start_date) {
        const startDate = new Date(newFilters.start_date);
        const endDate = new Date(value);
        if (endDate < startDate) {
          newFilters.start_date = ""; // Clear start_date if end_date is before it
        }
      }

      return newFilters;
    });
  };

  const handlePageChange = (page) => {
    fetchHistory(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${formatDate(dateTimeString)}, ${hours}:${minutes}`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "weighing": return "⚖️";
      case "meal": return "🍽️";
      case "immunization": return "💉";
      default: return "📋";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "weighing": return "bg-blue-50 text-blue-600";
      case "meal": return "bg-green-50 text-green-600";
      case "immunization": return "bg-purple-50 text-purple-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "weighing": return "Penimbangan";
      case "meal": return "Log Makanan";
      case "immunization": return "Imunisasi";
      default: return type;
    }
  };

  const renderHistoryItem = (item) => {
    const { type, datetime, child_name, data } = item;

    return (
      <div
        key={`${type}-${item.id}`}
        className="group bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center gap-4">
          {/* Icon & Basic Info */}
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getTypeColor(type)}`}>
              {getTypeIcon(type)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{getTypeLabel(type)}</p>
              <p className="text-xs text-gray-500">{child_name}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-sm text-gray-600">
            {type === "weighing" && (
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span>Berat: <span className="font-medium text-gray-900">{data.weight_kg} kg</span></span>
                {data.height_cm && <span>Tinggi: <span className="font-medium text-gray-900">{data.height_cm} cm</span></span>}
                {data.nutritional_status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(data.nutritional_status)}`}>
                    {getStatusLabel(data.nutritional_status)}
                  </span>
                )}
              </div>
            )}

            {type === "meal" && (
              <div className="space-y-1">
                <p><span className="font-medium text-gray-900">{data.time_of_day}</span> - {data.description || "Tidak ada deskripsi"}</p>
                {data.ingredients && <p className="text-xs text-gray-500 truncate max-w-md">{data.ingredients}</p>}
              </div>
            )}

            {type === "immunization" && (
              <div>
                <p className="font-medium text-gray-900">{data.title}</p>
                {data.scheduled_for && <p className="text-xs text-gray-500">Jadwal: {formatDate(data.scheduled_for)}</p>}
              </div>
            )}

            {data.notes && <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">{data.notes}</p>}
          </div>

          {/* Date & Time */}
          <div className="text-right min-w-[120px]">
            <p className="text-sm font-medium text-gray-900">{formatDate(datetime).split(' ').slice(0, 2).join(' ')}</p>
            <p className="text-xs text-gray-400">{new Date(datetime).getFullYear()} • {new Date(datetime).getHours().toString().padStart(2, '0')}:{new Date(datetime).getMinutes().toString().padStart(2, '0')}</p>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && historyData.length === 0) {
    return (
      <div className="w-full h-full bg-white">
        <HistoryPageSkeleton />
      </div>
    );
  }

  // Error state
  if (error && historyData.length === 0) {
    return (
      <div className="flex flex-col w-full h-full bg-white">
        <div className="px-4 pt-5 md:px-10 md:pt-10 pb-4">
          <PageHeader title="Riwayat" subtitle="Portal Orang Tua" />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={() => fetchHistory(pagination.current_page)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-x-hidden">
      {/* Header - Preserved Padding */}
      <div className="px-4 pt-5 md:px-10 md:pt-10 pb-2 bg-white z-10">
        <PageHeader title="Riwayat" subtitle="Portal Orang Tua" />

        {/* Modern Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {/* Child Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <Icon icon="lucide:users" className="text-gray-500 w-4 h-4" />
                  <span>
                    {filters.child_id
                      ? children.find(c => c.id == filters.child_id)?.full_name || "Semua Anak"
                      : "Semua Anak"}
                  </span>
                  <Icon icon="lucide:chevron-down" className="text-gray-400 w-4 h-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1">
                <DropdownMenuItem
                  onClick={() => handleFilterChange("child_id", "")}
                  className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                >
                  <span className="font-medium">Semua Anak</span>
                </DropdownMenuItem>
                {children.map((child) => (
                  <DropdownMenuItem
                    key={child.id}
                    onClick={() => handleFilterChange("child_id", child.id)}
                    className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">
                      {child.full_name.charAt(0)}
                    </div>
                    <span>{child.full_name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <span>
                    {filters.type === "all" && "Semua Tipe"}
                    {filters.type === "weighing" && "⚖️ Penimbangan"}
                    {filters.type === "meal" && "🍽️ Makanan"}
                    {filters.type === "immunization" && "💉 Imunisasi"}
                  </span>
                  <Icon icon="lucide:chevron-down" className="text-gray-400 w-4 h-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1">
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "all")}
                  className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 font-medium"
                >
                  Semua Tipe
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "weighing")}
                  className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 gap-2"
                >
                  <span>⚖️</span> Penimbangan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "meal")}
                  className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 gap-2"
                >
                  <span>🍽️</span> Makanan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "immunization")}
                  className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 gap-2"
                >
                  <span>💉</span> Imunisasi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <DatePicker
                value={filters.start_date}
                onChange={(date) => handleFilterChange("start_date", date)}
                placeholder="Mulai"
                className="w-full md:w-auto"
              />
              <span className="text-gray-300">-</span>
              <DatePicker
                value={filters.end_date}
                onChange={(date) => handleFilterChange("end_date", date)}
                placeholder="Selesai"
                className="w-full md:w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Content */}
      <div className="flex-1 overflow-auto bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {historyData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>Tidak ada riwayat ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {historyData.map((item) => renderHistoryItem(item))}
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="py-6 flex justify-center">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                ←
              </button>

              <span className="px-3 text-sm font-medium text-gray-600">
                Halaman {pagination.current_page} dari {pagination.last_page}
              </span>

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

