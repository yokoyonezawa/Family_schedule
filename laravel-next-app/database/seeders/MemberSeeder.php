<?php

namespace Database\Seeders;

use App\Models\Member;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    // 家族メンバーの初期データ(名前や色はあとで自由に変えてOK)
    public function run(): void
    {
        $members = [
            ['name' => 'パパ', 'color' => '#0ea5e9'],
            ['name' => 'ママ', 'color' => '#f43f5e'],
            ['name' => '長女', 'color' => '#f59e0b'],
            ['name' => '次女', 'color' => '#10b981'],
            ['name' => '長男', 'color' => '#8b5cf6'],
        ];

        foreach ($members as $member) {
            Member::firstOrCreate(['name' => $member['name']], $member);
        }
    }
}
