<?php

namespace App\Livewire;

use Livewire\Component;

class TetrisGame extends Component
{
    public array $board = [];
    public int $pieceX = 4;
    public int $pieceY = 0;
    public array $currentPiece = [];
    public int $score = 0;
    public int $lines = 0;
    public bool $gameOver = false;

    protected $listeners = ['tick'];

    const PIECES = [
        // I
        [[1,1,1,1]],
        // O
        [[1,1],[1,1]],
        // T
        [[0,1,0],[1,1,1]],
        // S
        [[0,1,1],[1,1,0]],
        // Z
        [[1,1,0],[0,1,1]],
        // J
        [[1,0,0],[1,1,1]],
        // L
        [[0,0,1],[1,1,1]],
    ];

    public function mount(): void
    {
        $this->board = array_fill(0, 20, array_fill(0, 10, 0));
        $this->spawnPiece();
    }

    public function collision(array $piece = null, int $dx = 0, int $dy = 0): bool
    {
        $piece = $piece ?? $this->currentPiece;
        foreach ($piece as $y => $row) {
            foreach ($row as $x => $cell) {
                if ($cell) {
                    $boardX = $this->pieceX + $x + $dx;
                    $boardY = $this->pieceY + $y + $dy;

                    if ($boardY >= 20 || $boardX < 0 || $boardX >= 10) {
                        return true;
                    }
                    if ($boardY >= 0 && $this->board[$boardY][$boardX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public function lockPiece(): void
    {
        foreach ($this->currentPiece as $y => $row) {
            foreach ($row as $x => $cell) {
                if ($cell) {
                    $boardY = $this->pieceY + $y;
                    $boardX = $this->pieceX + $x;
                    if ($boardY >= 0) {
                        $this->board[$boardY][$boardX] = 1;
                    }
                }
            }
        }
        $this->clearLines();
    }

    public function clearLines(): void
    {
        $cleared = 0;
        $newBoard = [];

        foreach ($this->board as $row) {
            if (!in_array(0, $row)) {
                $cleared++;
            } else {
                $newBoard[] = $row;
            }
        }

        // Prepend empty rows at the top
        for ($i = 0; $i < $cleared; $i++) {
            array_unshift($newBoard, array_fill(0, 10, 0));
        }

        $this->board = $newBoard;
        $this->lines += $cleared;

        // Classic Tetris scoring
        $points = [0, 100, 300, 500, 800];
        $this->score += $points[min($cleared, 4)];
    }

    public function spawnPiece(): void
    {
         mt_srand((int)(microtime(true) * 1000));
        $this->currentPiece = self::PIECES[array_rand(self::PIECES)];
        $this->pieceX = (int) floor((10 - count($this->currentPiece[0])) / 2);
        $this->pieceY = 0;

        if ($this->collision()) {
            $this->gameOver = true;
        }
    }

    public function tick(): void
    {
        if ($this->gameOver) return;

        if (!$this->collision(null, 0, 1)) {
            $this->pieceY++;
        } else {
            $this->lockPiece();
            $this->spawnPiece();
        }
    }

    public function moveLeft(): void
    {
        if ($this->gameOver) return;
        if (!$this->collision(null, -1, 0)) {
            $this->pieceX--;
        }
    }

    public function moveRight(): void
    {
        if ($this->gameOver) return;
        if (!$this->collision(null, 1, 0)) {
            $this->pieceX++;
        }
    }

    public function rotate(): void
    {
        if ($this->gameOver) return;

        $piece = $this->currentPiece;
        $rows = count($piece);
        $cols = count($piece[0]);
        $rotated = [];

        for ($x = 0; $x < $cols; $x++) {
            $newRow = [];
            for ($y = $rows - 1; $y >= 0; $y--) {
                $newRow[] = $piece[$y][$x];
            }
            $rotated[] = $newRow;
        }

        if (!$this->collision($rotated, 0, 0)) {
            $this->currentPiece = $rotated;
        }
    }

    public function drop(): void
    {
        if ($this->gameOver) return;

        while (!$this->collision(null, 0, 1)) {
            $this->pieceY++;
        }
        $this->lockPiece();
        $this->spawnPiece();
    }

    public function restart(): void
    {
        $this->board = array_fill(0, 20, array_fill(0, 10, 0));
        $this->score = 0;
        $this->lines = 0;
        $this->gameOver = false;
        $this->spawnPiece();
    }

    public function render()
    {
        return view('livewire.tetris-game');
    }
}
