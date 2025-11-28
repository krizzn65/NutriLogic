import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, Search } from "lucide-react";
import GenericListSkeleton from "../loading/GenericListSkeleton";

export default function ContentManagement() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [articles, setArticles] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        is_published: '',
        search: '',
    });
    const [showModal, setShowModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.is_published) params.is_published = filters.is_published;
            if (filters.search) params.search = filters.search;

            const response = await api.get('/admin/articles', { params });
            setArticles(response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data artikel.';
            setError(errorMessage);
            console.error('Articles fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingArticle(null);
        setShowModal(true);
    };

    const handleEdit = (article) => {
        setEditingArticle(article);
        setShowModal(true);
    };

    const handleDelete = async (article) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus artikel "${article.title}"?`)) {
            return;
        }

        try {
            await api.delete(`/admin/articles/${article.id}`);
            fetchArticles();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus artikel.');
        }
    };

    const handleTogglePublish = async (article) => {
        try {
            await api.patch(`/admin/articles/${article.id}/toggle-publish`);
            fetchArticles();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengubah status publikasi.');
        }
    };

    const getCategoryLabel = (category) => {
        const labels = {
            tips: 'Tips',
            article: 'Artikel',
            announcement: 'Pengumuman',
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category) => {
        const colors = {
            tips: 'bg-blue-100 text-blue-800',
            article: 'bg-green-100 text-green-800',
            announcement: 'bg-orange-100 text-orange-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    if (loading && articles.length === 0) {
        return (
            <div className="p-4 md:p-10 w-full h-full bg-gray-50">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Manajemen Konten</h1>
                        <p className="text-gray-600 mt-2">Kelola artikel, tips, dan pengumuman</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Konten
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kategori
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Kategori</option>
                                <option value="tips">Tips</option>
                                <option value="article">Artikel</option>
                                <option value="announcement">Pengumuman</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.is_published}
                                onChange={(e) => setFilters({ ...filters, is_published: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="true">Published</option>
                                <option value="false">Draft</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cari Judul
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Cari..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={fetchArticles}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                Cari
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchArticles}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Judul</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Kategori</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Penulis</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500">
                                            Tidak ada data artikel
                                        </td>
                                    </tr>
                                ) : (
                                    articles.map((article) => (
                                        <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-start gap-2">
                                                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div className="font-medium text-gray-800">{article.title}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {new Date(article.created_at).toLocaleDateString('id-ID')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                                    {getCategoryLabel(article.category)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {article.author?.name || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${article.is_published
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {article.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(article)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleTogglePublish(article)}
                                                        className={`p-1.5 rounded transition-colors ${article.is_published
                                                                ? 'text-orange-600 hover:bg-orange-50'
                                                                : 'text-green-600 hover:bg-green-50'
                                                            }`}
                                                        title={article.is_published ? 'Unpublish' : 'Publish'}
                                                    >
                                                        {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(article)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <ArticleModal
                    article={editingArticle}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchArticles();
                    }}
                />
            )}
        </div>
    );
}

// Article Add/Edit Modal
function ArticleModal({ article, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: article?.title || '',
        content: article?.content || '',
        category: article?.category || 'tips',
        image_url: article?.image_url || '',
        is_published: article?.is_published || false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (article) {
                await api.put(`/admin/articles/${article.id}`, formData);
            } else {
                await api.post('/admin/articles', formData);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan artikel.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {article ? 'Edit Konten' : 'Tambah Konten Baru'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Judul <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Judul konten"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="tips">Tips</option>
                            <option value="article">Artikel</option>
                            <option value="announcement">Pengumuman</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL Gambar
                        </label>
                        <input
                            type="text"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Konten <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="10"
                            placeholder="Isi konten..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_published" className="text-sm text-gray-700">
                            Publikasikan sekarang
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={submitting}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={submitting}
                        >
                            {submitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
