import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";

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

  useEffect(() => {
    fetchChildren();
    fetchHistory(1);
  }, []);

  const fetchChildren = async () => {
    try {
      // Reuse children cache
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

      if (filters.child_id) {
        params.child_id = filters.child_id;
      }
      if (filters.type && filters.type !== "all") {
        params.type = filters.type;
      }
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }

      // Create cache key based on params
      const cacheKey = `history_${JSON.stringify(params)}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setHistoryData(cachedData.data);
        setPagination(cachedData.meta);
        setLoading(false);
        return;
      }

      // Fetch from API if no cache
      const response = await api.get("/parent/history", { params });
      setHistoryData(response.data.data);
      setPagination(response.data.meta);

      // Cache the result
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
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    fetchHistory(1);
  };

  const handlePageChange = (page) => {
    fetchHistory(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${formatDate(dateTimeString)} ${hours}:${minutes}`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "weighing":
        return "⚖️";
      case "meal":
        return "🍽️";
      case "immunization":
        return "💉";
      default:
        return "📋";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "weighing":
        return "Penimbangan";
      case "meal":
        return "Log Makanan";
      case "immunization":
        return "Imunisasi";
      default:
        return type;
    }
  };

  const renderHistoryItem = (item) => {
    const { type, date, datetime, child_name, data } = item;

    return (
      <div
        key={`${type}-${item.id}`}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-4">
          <div className="text-2xl">{getTypeIcon(type)}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {getTypeLabel(type)}
                </span>
                <span className="ml-2 text-sm text-gray-600">{child_name}</span>
              </div>
              <div className="text-sm text-gray-500">{formatDateTime(datetime)}</div>
            </div>

            {type === "weighing" && (
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex gap-4">
                  <span className="text-gray-600">
                    Berat: <span className="font-medium text-gray-900">{data.weight_kg} kg</span>
                  </span>
                  {data.height_cm && (
                    <span className="text-gray-600">
                      Tinggi: <span className="font-medium text-gray-900">{data.height_cm} cm</span>
                    </span>
                  )}
                </div>
                {data.nutritional_status && (
                  <div>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                        data.nutritional_status
                      )}`}
                    >
                      {getStatusLabel(data.nutritional_status)}
                    </span>
                  </div>
                )}
                {data.notes && (
                  <div className="text-gray-600 mt-1">
                    <span className="font-medium">Catatan:</span> {data.notes}
                  </div>
                )}
              </div>
            )}

            {type === "meal" && (
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  <span className="text-gray-600">
                    Waktu: <span className="font-medium text-gray-900">{data.time_of_day}</span>
                  </span>
                </div>
                {data.description && (
                  <div className="text-gray-600">
                    <span className="font-medium">Deskripsi:</span> {data.description}
                  </div>
                )}
                {data.ingredients && (
                  <div className="text-gray-600">
                    <span className="font-medium">Bahan:</span> {data.ingredients}
                  </div>
                )}
                {data.source && (
                  <div className="text-gray-500 text-xs mt-1">
                    Sumber: {data.source}
                  </div>
                )}
              </div>
            )}

            {type === "immunization" && (
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  <span className="font-medium text-gray-900">{data.title}</span>
                </div>
                {data.type && (
                  <div className="text-gray-600">
                    Tipe: <span className="font-medium">{data.type}</span>
                  </div>
                )}
                {data.scheduled_for && (
                  <div className="text-gray-600">
                    Dijadwalkan: <span className="font-medium">{formatDate(data.scheduled_for)}</span>
                  </div>
                )}
                {data.notes && (
                  <div className="text-gray-600 mt-1">
                    <span className="font-medium">Catatan:</span> {data.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && historyData.length === 0) {
    return <GenericListSkeleton itemCount={8} />;
  }

  // Error state
  if (error && historyData.length === 0) {
    return (
      <div className="flex flex-1 w-full h-full overflow-auto">
        <div className="p-4 md:p-10 w-full h-full bg-gray-50">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => fetchHistory(pagination.current_page)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 w-full h-full overflow-auto">
      <div className="p-4 md:p-10 w-full h-full bg-gray-50">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Riwayat</h1>
          <p className="text-gray-600 mt-2">
            Lihat riwayat penimbangan, log makanan, dan imunisasi anak Anda
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Anak
              </label>
              <select
                value={filters.child_id}
                onChange={(e) => handleFilterChange("child_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Anak</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Riwayat
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua</option>
                <option value="weighing">Penimbangan</option>
                <option value="meal">Log Makanan</option>
                <option value="immunization">Imunisasi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange("start_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Terapkan Filter
            </button>
          </div>
        </div>

        {/* History Timeline */}
        <div className="space-y-4">
          {historyData.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-600">Tidak ada riwayat ditemukan</p>
            </div>
          ) : (
            historyData.map((item) => renderHistoryItem(item))
          )}
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sebelumnya
            </button>

            <div className="flex gap-1">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.last_page ||
                    (page >= pagination.current_page - 1 &&
                      page <= pagination.current_page + 1)
                )
                .map((page, index, array) => {
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="px-2 py-2">...</span>
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-md ${pagination.current_page === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-md ${pagination.current_page === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
            </button>
          </div>
        )}

        {pagination.total > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} -{" "}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari{" "}
            {pagination.total} riwayat
          </div>
        )}
      </div>
    </div>
  );
}

