<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index()
    {
        return Member::orderBy('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:50',
            'color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        return response()->json(Member::create($data), 201);
    }

    public function update(Request $request, Member $member)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:50',
            'color' => ['sometimes', 'required', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $member->update($data);

        return $member;
    }

    public function destroy(Member $member)
    {
        $member->delete();

        return response()->noContent();
    }
}
