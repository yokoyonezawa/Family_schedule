<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * 予定の一覧(?from=2026-12-01&to=2026-12-31 で期間を絞り込める)
     */
    public function index(Request $request)
    {
        $query = Event::with('members')->orderBy('starts_at');

        if ($request->filled('from')) {
            $query->where('starts_at', '>=', $request->date('from')->startOfDay());
        }
        if ($request->filled('to')) {
            $query->where('starts_at', '<=', $request->date('to')->endOfDay());
        }

        return $query->get();
    }

    /**
     * 予定を登録(member_ids で誰の予定かを指定)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'memo' => 'nullable|string',
            'member_ids' => 'array',
            'member_ids.*' => 'integer|exists:members,id',
        ]);

        $event = Event::create($data);
        $event->members()->sync($data['member_ids'] ?? []);

        return response()->json($event->load('members'), 201);
    }

    /**
     * 予定を1件取得
     */
    public function show(Event $event)
    {
        return $event->load('members');
    }

    /**
     * 予定を更新
     */
    public function update(Request $request, Event $event)
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'starts_at' => 'sometimes|required|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'memo' => 'nullable|string',
            'member_ids' => 'sometimes|array',
            'member_ids.*' => 'integer|exists:members,id',
        ]);

        $event->update($data);
        if (array_key_exists('member_ids', $data)) {
            $event->members()->sync($data['member_ids']);
        }

        return $event->load('members');
    }

    /**
     * 予定を削除
     */
    public function destroy(Event $event)
    {
        $event->delete();

        return response()->noContent();
    }
}
