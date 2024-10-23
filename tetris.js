// Configuración del juego
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF',
    '#FF8E0D', '#FFE138', '#3877FF'
];

// Piezas de Tetris
const PIECES = [
    [
        [1, 1, 1, 1]
    ],
    [
        [1, 1],
        [1, 1]
    ],
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    [
        [1, 0, 0],
        [1, 1, 1]
    ],
    [
        [0, 0, 1],
        [1, 1, 1]
    ]
];

// Clase principal del juego
class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = COLS * BLOCK_SIZE;
        this.canvas.height = ROWS * BLOCK_SIZE;
        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

        this.dropCounter = 0;
        this.dropInterval = 1000; // Intervalo de caída en milisegundos (1 segundo)
        this.lastTime = 0;

        this.reset();
    }

    // Reiniciar el juego
    reset() {
        this.grid = this.getEmptyGrid();
        this.piece = this.getNewPiece();
        this.score = 0;
        this.gameOver = false;
        this.updateScore();
    }

    // Obtener una nueva pieza aleatoria
    getNewPiece() {
        const pieceType = Math.floor(Math.random() * PIECES.length);
        const piece = PIECES[pieceType];
        const colorIndex = pieceType + 1;
        return {
            piece,
            x: Math.floor(COLS / 2) - Math.ceil(piece[0].length / 2),
            y: 0,
            color: COLORS[colorIndex]
        };
    }

    // Crear una cuadrícula vacía
    getEmptyGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    // Dibujar la cuadrícula
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMatrix(this.grid, { x: 0, y: 0 });
        this.drawMatrix(this.piece.piece, { x: this.piece.x, y: this.piece.y });
    }

    // Dibujar una matriz (pieza o cuadrícula)
    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.ctx.fillStyle = this.piece.color;
                    this.ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    // Mover la pieza
    move(dir) {
        this.piece.x += dir;
        if (this.collide()) {
            this.piece.x -= dir;
        }
    }

    // Rotar la pieza
    rotate() {
        const rotated = this.piece.piece[0].map((_, i) =>
            this.piece.piece.map(row => row[i]).reverse()
        );
        const previousPiece = this.piece.piece;
        this.piece.piece = rotated;
        if (this.collide()) {
            this.piece.piece = previousPiece;
        }
    }

    // Verificar colisiones
    collide() {
        const [m, o] = [this.piece.piece, this.piece];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (this.grid[y + o.y] &&
                    this.grid[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    // Hacer que la pieza caiga
    drop() {
        this.piece.y++;
        if (this.collide()) {
            this.piece.y--;
            this.merge();
            this.piece = this.getNewPiece();
            if (this.collide()) {
                this.gameOver = true;
            }
        }
        this.dropCounter = 0;
    }

    // Fusionar la pieza con la cuadrícula
    merge() {
        this.piece.piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.grid[y + this.piece.y][x + this.piece.x] = value;
                }
            });
        });
        this.removeRows();
    }

    // Eliminar filas completas
    removeRows() {
        let rowsCleared = 0;
        outer: for (let y = this.grid.length - 1; y >= 0; --y) {
            for (let x = 0; x < this.grid[y].length; ++x) {
                if (this.grid[y][x] === 0) {
                    continue outer;
                }
            }
            const row = this.grid.splice(y, 1)[0].fill(0);
            this.grid.unshift(row);
            ++y;
            rowsCleared++;
        }
        this.updateScore(rowsCleared);
    }

    // Actualizar la puntuación
    updateScore(rowsCleared = 0) {
        const points = [0, 40, 100, 300, 1200];
        this.score += points[rowsCleared];
        document.getElementById('scoreValue').textContent = this.score;

        // Aumentar la dificultad cada 1000 puntos
        if (this.score % 1000 === 0) {
            this.dropInterval = Math.max(100, this.dropInterval - 100); // No bajar de 100ms
        }
    }

    // Loop principal del juego
    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }

        this.draw();
        if (!this.gameOver) {
            requestAnimationFrame(this.update.bind(this));
        } else {
            alert('¡Juego terminado! Tu puntuación: ' + this.score);
        }
    }
}


// Iniciar el juego
const game = new Tetris();

// Controles del juego
document.addEventListener('keydown', event => {
    if (game.gameOver) return;

    if (event.keyCode === 37) {
        game.move(-1);
    } else if (event.keyCode === 39) {
        game.move(1);
    } else if (event.keyCode === 40) {
        game.drop();
    } else if (event.keyCode === 38) {
        game.rotate();
    }
});

// Comenzar el juego
game.update();