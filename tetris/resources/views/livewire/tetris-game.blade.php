<div x-data="tetris()" x-init="init()" @keydown.window="handleKey($event)" class="outline-none">

    <div class="flex gap-8 items-start justify-center mt-8">
         {{-- Held Piece Preview --}}
            <div class="bg-gray-800 rounded-lg p-4">
                <p class="text-gray-400 text-xs uppercase tracking-widest mb-2">Held</p>
                <canvas x-ref="heldCanvas" width="120" height="120" class="bg-gray-900"></canvas>
            </div>
        {{-- Board Canvas --}}
        <div class="relative">
            <canvas x-ref="canvas" width="300" height="600"
                    class="border-2 border-gray-600 bg-gray-900 block"></canvas>

            {{-- Game Over Overlay --}}
            <div x-show="gameOver"
                 class="absolute inset-0 bg-black/75 flex flex-col items-center justify-center">
                <p class="text-white text-3xl font-bold mb-4">Game Over</p>
                <button @click="restart()"
                        class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-lg">
                    Restart
                </button>
            </div>
        </div>

        {{-- Side Panel --}}
        <div class="flex flex-col gap-4 text-white min-w-25">
            <div class="bg-gray-800 rounded-lg p-4">
                <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Score</p>
                <p class="text-3xl font-bold" x-text="score"></p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4">
                <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Lines</p>
                <p class="text-3xl font-bold" x-text="lines"></p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4">
                <p class="text-gray-400 text-xs uppercase tracking-widest mb-1">Level</p>
                <p class="text-3xl font-bold" x-text="level"></p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 text-xs text-gray-400 space-y-1">
                <p class="font-semibold text-gray-300 mb-2">Controls</p>
                <p>← → &nbsp; Move</p>
                <p>↑ &nbsp;&nbsp;&nbsp;&nbsp; Rotate</p>
                <p>↓ &nbsp;&nbsp;&nbsp;&nbsp; Soft drop</p>
                <p>Space Hard drop</p>
                <p>P &nbsp;&nbsp;&nbsp;&nbsp; Pause</p>
                <p>C &nbsp;&nbsp;&nbsp;&nbsp; Hold</p>
            </div>

            {{-- Next Piece Preview --}}
            <div class="bg-gray-800 rounded-lg p-4">
                <p class="text-gray-400 text-xs uppercase tracking-widest mb-2">Next</p>
                <canvas x-ref="nextCanvas" width="120" height="120" class="bg-gray-900"></canvas>
            </div>
        </div>

    </div>
</div>


