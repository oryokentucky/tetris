function tetris() {
    const COLS = 10, ROWS = 20, BLOCK = 30;

    const PIECES = [
        { shape: [[1,1,1,1]],             color: '#00f0f0' }, // I - cyan
        { shape: [[1,1],[1,1]],           color: '#f0f000' }, // O - yellow
        { shape: [[0,1,0],[1,1,1]],       color: '#a000f0' }, // T - purple
        { shape: [[0,1,1],[1,1,0]],       color: '#00f000' }, // S - green
        { shape: [[1,1,0],[0,1,1]],       color: '#f00000' }, // Z - red
        { shape: [[1,0,0],[1,1,1]],       color: '#0000f0' }, // J - blue
        { shape: [[0,0,1],[1,1,1]],       color: '#f0a000' }, // L - orange
    ];

    return {
        board: [],
        boardColors: [],
        currentPiece: null,
        nextPiece: null,
        pieceX: 0,
        pieceY: 0,
        score: 0,
        lines: 0,
        level: 1,
        gameOver: false,
        paused: false,
        dropInterval: 500,
        lastDrop: 0,
        animFrame: null,
        heldpiece:null,
        canhold:true,
        temp:null,

        init() {
            this.restart();
        },

        restart() {
            this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
            this.boardColors = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
            this.score = 0;
            this.lines = 0;
            this.level = 1;
            this.gameOver = false;
            this.paused = false;
            this.dropInterval = 500;
            this.nextPiece = this.randomPiece();
            this.spawnPiece();
            if (this.animFrame) cancelAnimationFrame(this.animFrame);
            this.lastDrop = performance.now();
            this.loop(performance.now());
        },

        randomPiece() {
            return PIECES[Math.floor(Math.random() * PIECES.length)];
        },

        spawnPiece() {
            const p = this.nextPiece || this.randomPiece();
            this.nextPiece = this.randomPiece();
            this.currentPiece = p;
            this.pieceX = Math.floor((COLS - p.shape[0].length) / 2);
            this.pieceY = 0;

            if (this.collision(p.shape, this.pieceX, this.pieceY)) {
                this.gameOver = true;
            }

            this.drawNext();
        },
        OnHoldButtonPress(){
            if(!this.canhold)return;

            if(this.heldpiece==null){
                this.heldpiece=this.currentPiece;
                this.spawnPiece();
            }else{
                let temp =this.currentPiece;
                this.currentPiece=this.heldpiece;
                this.heldpiece=temp;
            }
            //Set Piece Back to spawn position
            this.pieceX = Math.floor((COLS - this.currentPiece.shape[0].length) / 2);
            this.pieceY = 0;
            this.canhold=false;
            this.lastDrop = performance.now();
            this.drawHeld();

        },
        OnPieceLock(){
            this.canhold=true;
        },

        collision(shape, ox, oy) {
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        const nx = ox + x, ny = oy + y;
                        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                        if (ny >= 0 && this.board[ny][nx]) return true;
                    }
                }
            }
            return false;
        },

        rotate(shape) {
            const rows = shape.length, cols = shape[0].length;
            return Array.from({ length: cols }, (_, x) =>
                Array.from({ length: rows }, (_, y) => shape[rows - 1 - y][x])
            );
        },

        lockPiece() {
            const { shape, color } = this.currentPiece;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.board[this.pieceY + y][this.pieceX + x] = 1;
                        this.boardColors[this.pieceY + y][this.pieceX + x] = color;
                    }
                }
            }
            this.OnPieceLock();
            this.clearLines();
            this.spawnPiece();
        },

        clearLines() {
            let cleared = 0;
            for (let y = ROWS - 1; y >= 0; y--) {
                if (this.board[y].every(c => c)) {
                    this.board.splice(y, 1);
                    this.boardColors.splice(y, 1);
                    this.board.unshift(Array(COLS).fill(0));
                    this.boardColors.unshift(Array(COLS).fill(null));
                    cleared++;
                    y++;
                }
            }
            if (cleared) {
                const pts = [0, 100, 300, 500, 800];
                this.score += (pts[Math.min(cleared, 4)] || 800) * this.level;
                this.lines += cleared;
                this.level = Math.floor(this.lines / 10) + 1;
                this.dropInterval = Math.max(80, 500 - (this.level - 1) * 40);
            }
        },

        moveLeft()  { if (!this.collision(this.currentPiece.shape, this.pieceX - 1, this.pieceY)) this.pieceX--; },
        moveRight() { if (!this.collision(this.currentPiece.shape, this.pieceX + 1, this.pieceY)) this.pieceX++; },

        softDrop() {
            if (!this.collision(this.currentPiece.shape, this.pieceX, this.pieceY + 1)) {
                this.pieceY++;
                this.score += 1;
                this.lastDrop = performance.now();
            } else {
                this.lockPiece();
            }
        },

        hardDrop() {
            while (!this.collision(this.currentPiece.shape, this.pieceX, this.pieceY + 1)) {
                this.pieceY++;
                this.score += 2;
            }
            this.lockPiece();
            this.lastDrop = performance.now();
        },

        rotatePiece() {
            const rotated = this.rotate(this.currentPiece.shape);
            for (const kick of [0, -1, 1, -2, 2]) {
                if (!this.collision(rotated, this.pieceX + kick, this.pieceY)) {
                    this.currentPiece = { ...this.currentPiece, shape: rotated };
                    this.pieceX += kick;
                    return;
                }
            }
        },

        ghostY() {
            let gy = this.pieceY;
            while (!this.collision(this.currentPiece.shape, this.pieceX, gy + 1)) gy++;
            return gy;
        },

        handleKey(e) {
            if (this.gameOver) return;
            const actions = {
                'ArrowLeft':  () => this.moveLeft(),
                'ArrowRight': () => this.moveRight(),
                'ArrowUp':    () => this.rotatePiece(),
                'ArrowDown':  () => this.softDrop(),
                ' ':          () => this.hardDrop(),
                'p':          () => { this.paused = !this.paused; this.lastDrop = performance.now(); },
                'P':          () => { this.paused = !this.paused; this.lastDrop = performance.now(); },
                'c':          () => this.OnHoldButtonPress(),
                'C':          () => this.OnHoldButtonPress(),
            };
            if (actions[e.key]) {
                e.preventDefault();
                actions[e.key]();
            }
        },

        loop(timestamp) {
            if (!this.gameOver) {
                if (!this.paused && timestamp - this.lastDrop >= this.dropInterval) {
                    if (!this.collision(this.currentPiece.shape, this.pieceX, this.pieceY + 1)) {
                        this.pieceY++;
                    } else {
                        this.lockPiece();
                    }
                    this.lastDrop = timestamp;
                }
                this.draw();
                this.animFrame = requestAnimationFrame(ts => this.loop(ts));
            }
        },

        draw() {
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Grid lines
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 0.5;
            for (let x = 0; x <= COLS; x++) {
                ctx.beginPath(); ctx.moveTo(x * BLOCK, 0); ctx.lineTo(x * BLOCK, ROWS * BLOCK); ctx.stroke();
            }
            for (let y = 0; y <= ROWS; y++) {
                ctx.beginPath(); ctx.moveTo(0, y * BLOCK); ctx.lineTo(COLS * BLOCK, y * BLOCK); ctx.stroke();
            }

            // Locked board
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    if (this.board[y][x]) this.drawBlock(ctx, x, y, this.boardColors[y][x]);
                }
            }

            // Ghost piece
            const gy = this.ghostY();
            if (gy !== this.pieceY) {
                const { shape, color } = this.currentPiece;
                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[y].length; x++) {
                        if (shape[y][x]) {
                            ctx.fillStyle = color + '33';
                            ctx.strokeStyle = color + '88';
                            ctx.lineWidth = 1;
                            ctx.fillRect((this.pieceX + x) * BLOCK + 1, (gy + y) * BLOCK + 1, BLOCK - 2, BLOCK - 2);
                            ctx.strokeRect((this.pieceX + x) * BLOCK + 1, (gy + y) * BLOCK + 1, BLOCK - 2, BLOCK - 2);
                        }
                    }
                }
            }

            // Current piece
            const { shape, color } = this.currentPiece;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) this.drawBlock(ctx, this.pieceX + x, this.pieceY + y, color);
                }
            }

            // Pause overlay
            if (this.paused) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 32px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
            }
        },

        drawBlock(ctx, x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, 4);
            ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, 4, BLOCK - 2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(x * BLOCK + 1, y * BLOCK + BLOCK - 5, BLOCK - 2, 4);
            ctx.fillRect(x * BLOCK + BLOCK - 5, y * BLOCK + 1, 4, BLOCK - 2);
        },

        drawNext() {
            const canvas = this.$refs.nextCanvas;
            if (!canvas || !this.nextPiece) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const { shape, color } = this.nextPiece;
            const offX = Math.floor((4 - shape[0].length) / 2);
            const offY = Math.floor((4 - shape.length) / 2);
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) this.drawBlock(ctx, offX + x, offY + y, color);
                }
            }
        },
        drawHeld() {
            const canvas = this.$refs.heldCanvas;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if(!this.heldpiece)return;
            const { shape, color } = this.heldpiece;
            const offX = Math.floor((4 - shape[0].length) / 2);
            const offY = Math.floor((4 - shape.length) / 2);
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) this.drawBlock(ctx, offX + x, offY + y, color);
                }
            }
    }
}
}
