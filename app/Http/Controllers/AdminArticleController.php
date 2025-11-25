<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminArticleController extends Controller
{
    /**
     * Get list of articles with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Article::with('author');

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Filter by published status
        if ($request->has('is_published')) {
            $isPublished = $request->is_published === 'true' || $request->is_published === '1';
            $query->where('is_published', $isPublished);
        }

        // Search by title
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $articles = $query->orderBy('created_at', 'desc')->get()->map(function ($article) {
            return [
                'id' => $article->id,
                'title' => $article->title,
                'content' => $article->content,
                'category' => $article->category,
                'image_url' => $article->image_url,
                'is_published' => $article->is_published,
                'author' => $article->author ? [
                    'id' => $article->author->id,
                    'name' => $article->author->name,
                ] : null,
                'created_at' => $article->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'data' => $articles,
        ], 200);
    }

    /**
     * Create new article
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'category' => ['required', 'in:tips,article,announcement'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
        ]);

        $validated['author_id'] = $request->user()->id;

        $article = Article::create($validated);

        return response()->json([
            'data' => $article,
            'message' => 'Artikel berhasil ditambahkan.',
        ], 201);
    }

    /**
     * Get single article
     */
    public function show($id): JsonResponse
    {
        $article = Article::with('author')->find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'id' => $article->id,
                'title' => $article->title,
                'content' => $article->content,
                'category' => $article->category,
                'image_url' => $article->image_url,
                'is_published' => $article->is_published,
                'author' => $article->author ? [
                    'id' => $article->author->id,
                    'name' => $article->author->name,
                ] : null,
                'created_at' => $article->created_at->format('Y-m-d H:i:s'),
            ],
        ], 200);
    }

    /**
     * Update article
     */
    public function update(Request $request, $id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'category' => ['required', 'in:tips,article,announcement'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
        ]);

        $article->update($validated);

        return response()->json([
            'data' => $article,
            'message' => 'Artikel berhasil diperbarui.',
        ], 200);
    }

    /**
     * Delete article
     */
    public function destroy($id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        $article->delete();

        return response()->json([
            'message' => 'Artikel berhasil dihapus.',
        ], 200);
    }

    /**
     * Toggle publish status
     */
    public function togglePublish($id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        $article->is_published = !$article->is_published;
        $article->save();

        return response()->json([
            'data' => $article,
            'message' => $article->is_published 
                ? 'Artikel berhasil dipublikasikan.' 
                : 'Artikel berhasil di-unpublish.',
        ], 200);
    }
}
