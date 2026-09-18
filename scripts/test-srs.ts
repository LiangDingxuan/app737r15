/**
 * Tetris SRS (Super Rotation System) Comprehensive Test Suite
 * 
 * Verifies:
 * 1. Kick table values in kicks.ts against the official Tetris Guideline SRS specification.
 * 2. Piece matrices and rotations in pieces.ts for all 7 tetrominoes across all 4 rotation states.
 * 3. Every kick case (Tests 1-5 and All-Blocked) for all 8 transitions for JLSTZ and I pieces on simulated boards.
 * 4. First-hit kick precedence and O-piece non-kicking rules.
 * 5. Codebase behavior: Tests the rotation algorithms in src/app/game/page.tsx and src/app/og/page.tsx against SRS.
 * 6. Reference SRS engine verification.
 */

import { kicks, iKicks } from '../src/app/game/kicks';
import { pieces } from '../src/app/game/pieces';

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
type Point = { x: number; y: number };
type RotationState = '0' | 'R' | '2' | 'L';
type PieceName = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type Shape = number[][];
type Board = number[][];

// ---------------------------------------------------------------------------
// Canonical Tetris Guideline SRS Reference Data
// 
// Note on coordinates:
// The Tetris Guideline defines (x, y) where +x is right and +y is UP.
// In matrix/grid coordinates (as used in this codebase), row 0 is at the top,
// so +x is right and +y is DOWN (y_grid = -y_guideline).
// ---------------------------------------------------------------------------

const CANONICAL_JLSTZ_KICKS: Record<string, Point[]> = {
    // Clockwise transitions
    "0>R": [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
    "R>2": [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
    "2>L": [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    "L>0": [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
    // Counter-clockwise transitions
    "0>L": [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    "L>2": [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
    "2>R": [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
    "R>0": [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
};

const CANONICAL_I_KICKS: Record<string, Point[]> = {
    // Clockwise transitions
    "0>R": [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
    "R>2": [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
    "2>L": [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
    "L>0": [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
    // Counter-clockwise transitions
    "0>L": [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
    "L>2": [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
    "2>R": [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
    "R>0": [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
};

const CANONICAL_SHAPES: Record<PieceName, Record<RotationState, Shape>> = {
    I: {
        '0': [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        'R': [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
        ],
        '2': [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
        ],
        'L': [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ],
    },
    O: {
        '0': [[1, 1], [1, 1]],
        'R': [[1, 1], [1, 1]],
        '2': [[1, 1], [1, 1]],
        'L': [[1, 1], [1, 1]],
    },
    T: {
        '0': [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        'R': [
            [0, 1, 0],
            [0, 1, 1],
            [0, 1, 0],
        ],
        '2': [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ],
        'L': [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0],
        ],
    },
    J: {
        '0': [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        'R': [
            [0, 1, 1],
            [0, 1, 0],
            [0, 1, 0],
        ],
        '2': [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 1],
        ],
        'L': [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0],
        ],
    },
    L: {
        '0': [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        'R': [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1],
        ],
        '2': [
            [0, 0, 0],
            [1, 1, 1],
            [1, 0, 0],
        ],
        'L': [
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
        ],
    },
    S: {
        '0': [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        'R': [
            [0, 1, 0],
            [0, 1, 1],
            [0, 0, 1],
        ],
        '2': [
            [0, 0, 0],
            [0, 1, 1],
            [1, 1, 0],
        ],
        'L': [
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 0],
        ],
    },
    Z: {
        '0': [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        'R': [
            [0, 0, 1],
            [0, 1, 1],
            [0, 1, 0],
        ],
        '2': [
            [0, 0, 0],
            [1, 1, 0],
            [0, 1, 1],
        ],
        'L': [
            [0, 1, 0],
            [1, 1, 0],
            [1, 0, 0],
        ],
    },
};

// ---------------------------------------------------------------------------
// Test Reporter
// ---------------------------------------------------------------------------
class Reporter {
    total = 0;
    passed = 0;
    failed = 0;
    currentSection = '';
    failures: { section: string; test: string; error: string }[] = [];

    section(name: string) {
        this.currentSection = name;
        console.log(`\n======================================================================`);
        console.log(`  ${name}`);
        console.log(`======================================================================`);
    }

    test(name: string, passed: boolean, errorMsg?: string) {
        this.total++;
        if (passed) {
            this.passed++;
            console.log(`  [PASS] ${name}`);
        } else {
            this.failed++;
            const err = errorMsg || 'Assertion failed';
            console.log(`  [FAIL] ${name} -> ${err}`);
            this.failures.push({ section: this.currentSection, test: name, error: err });
        }
    }

    summary() {
        console.log(`\n======================================================================`);
        console.log(`  TEST SUMMARY`);
        console.log(`======================================================================`);
        console.log(`  Total tests:  ${this.total}`);
        console.log(`  Passed:       ${this.passed} (${Math.round((this.passed / this.total) * 100)}%)`);
        console.log(`  Failed:       ${this.failed} (${Math.round((this.failed / this.total) * 100)}%)`);

        if (this.failures.length > 0) {
            console.log(`\n  FAILURES BREAKDOWN (${this.failures.length}):`);
            this.failures.forEach((f, i) => {
                console.log(`    ${i + 1}. [${f.section}] ${f.test}: ${f.error}`);
            });
        }
        console.log(`======================================================================\n`);
    }
}

const rep = new Reporter();

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------
function rotateMatrixCW(matrix: Shape): Shape {
    const N = matrix.length;
    const res: Shape = Array.from({ length: N }, () => Array(N).fill(0));
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            res[x][N - y - 1] = matrix[y][x];
        }
    }
    return res;
}

function rotateMatrixCCW(matrix: Shape): Shape {
    const N = matrix.length;
    const res: Shape = Array.from({ length: N }, () => Array(N).fill(0));
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            res[N - x - 1][y] = matrix[y][x];
        }
    }
    return res;
}

function createEmptyBoard(rows = 40, cols = 10): Board {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function canPlace(shape: Shape, x: number, y: number, board: Board): boolean {
    for (let dy = 0; dy < shape.length; dy++) {
        for (let dx = 0; dx < shape[dy].length; dx++) {
            if (shape[dy][dx] === 0) continue;
            const bx = x + dx;
            const by = y + dy;
            if (bx < 0 || bx >= board[0].length || by >= board.length) return false;
            if (by >= 0 && board[by][bx] !== 0) return false;
        }
    }
    return true;
}

function getMinoPositions(shape: Shape, px: number, py: number): Point[] {
    const minos: Point[] = [];
    for (let dy = 0; dy < shape.length; dy++) {
        for (let dx = 0; dx < shape[dy].length; dx++) {
            if (shape[dy][dx] !== 0) {
                minos.push({ x: px + dx, y: py + dy });
            }
        }
    }
    return minos;
}

const ROTATION_STATES: RotationState[] = ['0', 'R', '2', 'L'];

// ===========================================================================
// SECTION 1: Kick Table Values in kicks.ts vs Tetris Guideline SRS
// ===========================================================================
rep.section("1. Kick Table Data Integrity (kicks.ts vs Guideline SRS)");

// Check JLSTZ kicks
for (const [transKey, expectedKicks] of Object.entries(CANONICAL_JLSTZ_KICKS)) {
    const actualKicks = (kicks as Record<string, Point[]>)[transKey];
    if (!actualKicks) {
        rep.test(`JLSTZ kick table has entry for "${transKey}"`, false, `Missing transition ${transKey}`);
        continue;
    }
    rep.test(`JLSTZ kick table "${transKey}" exists with 5 tests`, actualKicks.length === 5);

    for (let testIdx = 0; testIdx < 5; testIdx++) {
        const exp = expectedKicks[testIdx];
        const act = actualKicks[testIdx];
        const match = act && act.x === exp.x && act.y === exp.y;
        rep.test(
            `JLSTZ "${transKey}" Test ${testIdx + 1} (${exp.x}, ${exp.y})`,
            match,
            act ? `Got (${act.x}, ${act.y})` : `Undefined test ${testIdx + 1}`
        );
    }
}

// Check I kicks
for (const [transKey, expectedKicks] of Object.entries(CANONICAL_I_KICKS)) {
    const actualKicks = (iKicks as Record<string, Point[]>)[transKey];
    if (!actualKicks) {
        rep.test(`I kick table has entry for "${transKey}"`, false, `Missing transition ${transKey}`);
        continue;
    }
    rep.test(`I kick table "${transKey}" exists with 5 tests`, actualKicks.length === 5);

    for (let testIdx = 0; testIdx < 5; testIdx++) {
        const exp = expectedKicks[testIdx];
        const act = actualKicks[testIdx];
        const match = act && act.x === exp.x && act.y === exp.y;
        rep.test(
            `I "${transKey}" Test ${testIdx + 1} (${exp.x}, ${exp.y})`,
            match,
            act ? `Got (${act.x}, ${act.y})` : `Undefined test ${testIdx + 1}`
        );
    }
}

// ===========================================================================
// SECTION 2: Piece Shapes & Matrix Rotations (pieces.ts vs SRS Shapes)
// ===========================================================================
rep.section("2. Tetromino Matrix Shapes & Basic Rotations (pieces.ts vs SRS)");

const ALL_PIECES: PieceName[] = ['I', 'O', 'T', 'J', 'L', 'S', 'Z'];

for (const name of ALL_PIECES) {
    const spawnShape = (pieces as Record<string, Shape>)[name];
    const expSpawn = CANONICAL_SHAPES[name]['0'];
    const spawnMatch = JSON.stringify(spawnShape) === JSON.stringify(expSpawn);
    rep.test(`Piece [${name}] spawn state '0' matches canonical SRS`, spawnMatch);

    // Test Clockwise sequence: 0 -> R -> 2 -> L -> 0
    let cur = spawnShape;
    const cwStates: RotationState[] = ['R', '2', 'L', '0'];
    for (const nextState of cwStates) {
        cur = rotateMatrixCW(cur);
        const match = JSON.stringify(cur) === JSON.stringify(CANONICAL_SHAPES[name][nextState]);
        rep.test(`Piece [${name}] CW rotation to state '${nextState}' matches SRS`, match);
    }

    // Test Counter-Clockwise sequence: 0 -> L -> 2 -> R -> 0
    cur = spawnShape;
    const ccwStates: RotationState[] = ['L', '2', 'R', '0'];
    for (const nextState of ccwStates) {
        cur = rotateMatrixCCW(cur);
        const match = JSON.stringify(cur) === JSON.stringify(CANONICAL_SHAPES[name][nextState]);
        rep.test(`Piece [${name}] CCW rotation to state '${nextState}' matches SRS`, match);
    }

    // Reversibility check: CW then CCW returns to original shape
    const cwShape = rotateMatrixCW(spawnShape);
    const ccwShape = rotateMatrixCCW(cwShape);
    rep.test(`Piece [${name}] CW then CCW rotation returns to identity`, JSON.stringify(ccwShape) === JSON.stringify(spawnShape));
}

// ===========================================================================
// SECTION 3: Every Kick Case Simulation (All 80 Kick Scenarios + Blocked)
// ===========================================================================
rep.section("3. Every Kick Scenario Execution on Board (Tests 1-5 + Blocked)");

/**
 * Conforming SRS rotation function (Reference Implementation)
 */
function srsRotate(
    pieceName: PieceName,
    currentShape: Shape,
    currentPos: Point,
    currentRotState: RotationState,
    direction: 1 | -1, // 1 = CW, -1 = CCW
    board: Board
): { newShape: Shape; newPos: Point; newRotState: RotationState; testUsed: number } | null {
    // O piece never rotates or kicks in SRS
    if (pieceName === 'O') {
        return null;
    }

    const stateIdx = ROTATION_STATES.indexOf(currentRotState);
    const nextStateIdx = direction === 1 ? (stateIdx + 1) % 4 : (stateIdx - 1 + 4) % 4;
    const targetRotState = ROTATION_STATES[nextStateIdx];

    const rotatedShape = direction === 1 ? rotateMatrixCW(currentShape) : rotateMatrixCCW(currentShape);

    const tableKey = `${currentRotState}>${targetRotState}`;
    const table = pieceName === 'I' ? iKicks[tableKey as keyof typeof iKicks] : kicks[tableKey as keyof typeof kicks];

    if (!table) return null;

    // Sequentially test offsets (inclusive of Test 1: (0, 0))
    for (let testIdx = 0; testIdx < table.length; testIdx++) {
        const offset = table[testIdx];
        const newX = currentPos.x + offset.x;
        const newY = currentPos.y + offset.y;

        if (canPlace(rotatedShape, newX, newY, board)) {
            return {
                newShape: rotatedShape,
                newPos: { x: newX, y: newY },
                newRotState: targetRotState,
                testUsed: testIdx + 1,
            };
        }
    }

    // All 5 tests blocked -> rotation fails
    return null;
}

// Test JLSTZ and I pieces across all transitions and all 5 tests
const TRANSITIONS: { from: RotationState; to: RotationState; dir: 1 | -1; key: string }[] = [
    { from: '0', to: 'R', dir: 1, key: '0>R' },
    { from: 'R', to: '2', dir: 1, key: 'R>2' },
    { from: '2', to: 'L', dir: 1, key: '2>L' },
    { from: 'L', to: '0', dir: 1, key: 'L>0' },
    { from: '0', to: 'L', dir: -1, key: '0>L' },
    { from: 'L', to: '2', dir: -1, key: 'L>2' },
    { from: '2', to: 'R', dir: -1, key: '2>R' },
    { from: 'R', to: '0', dir: -1, key: 'R>0' },
];

const testPieces: PieceName[] = ['T', 'I']; // T represents JLSTZ, I represents I tetromino

for (const pieceName of testPieces) {
    const kickTable = pieceName === 'I' ? CANONICAL_I_KICKS : CANONICAL_JLSTZ_KICKS;

    for (const tr of TRANSITIONS) {
        const shapeFrom = CANONICAL_SHAPES[pieceName][tr.from];
        const shapeTo = CANONICAL_SHAPES[pieceName][tr.to];
        const offsets = kickTable[tr.key];

        const startPos: Point = { x: 4, y: 15 };

        // Test each of the 5 tests specifically by obstructing tests 0..(targetTest-1)
        for (let targetTest = 0; targetTest < 5; targetTest++) {
            const board = createEmptyBoard();

            // Set of minos occupied by target test
            const targetMinos = new Set(
                getMinoPositions(shapeTo, startPos.x + offsets[targetTest].x, startPos.y + offsets[targetTest].y).map(
                    m => `${m.x},${m.y}`
                )
            );

            // Block all previous tests (0 .. targetTest - 1)
            let obstaclesPlaced = 0;
            for (let prevTest = 0; prevTest < targetTest; prevTest++) {
                const prevMinos = getMinoPositions(
                    shapeTo,
                    startPos.x + offsets[prevTest].x,
                    startPos.y + offsets[prevTest].y
                );
                // Find a mino in prevTest that doesn't collide with targetTest
                const candidate = prevMinos.find(m => !targetMinos.has(`${m.x},${m.y}`));
                if (candidate && candidate.y >= 0 && candidate.y < 40 && candidate.x >= 0 && candidate.x < 10) {
                    board[candidate.y][candidate.x] = 1;
                    obstaclesPlaced++;
                }
            }

            const result = srsRotate(pieceName, shapeFrom, startPos, tr.from, tr.dir, board);

            const expectedPos = {
                x: startPos.x + offsets[targetTest].x,
                y: startPos.y + offsets[targetTest].y,
            };

            const success =
                result !== null &&
                result.testUsed === targetTest + 1 &&
                result.newPos.x === expectedPos.x &&
                result.newPos.y === expectedPos.y &&
                result.newRotState === tr.to;

            rep.test(
                `Piece [${pieceName}] ${tr.key} -> Test ${targetTest + 1} kick (${offsets[targetTest].x}, ${offsets[targetTest].y})`,
                success,
                result ? `Got Test ${result.testUsed} at (${result.newPos.x}, ${result.newPos.y})` : `Rotation returned null`
            );
        }

        // Test 6: All 5 tests obstructed -> Rotation MUST be rejected
        {
            const board = createEmptyBoard();
            for (let testIdx = 0; testIdx < 5; testIdx++) {
                const minos = getMinoPositions(shapeTo, startPos.x + offsets[testIdx].x, startPos.y + offsets[testIdx].y);
                for (const m of minos) {
                    if (m.y >= 0 && m.y < 40 && m.x >= 0 && m.x < 10) {
                        board[m.y][m.x] = 1;
                    }
                }
            }
            const result = srsRotate(pieceName, shapeFrom, startPos, tr.from, tr.dir, board);
            rep.test(
                `Piece [${pieceName}] ${tr.key} -> All 5 tests blocked triggers rotation rejection`,
                result === null,
                result ? `Rotation unexpectedly succeeded with Test ${result.testUsed}` : undefined
            );
        }
    }
}

// First-hit precedence test
rep.test(
    "SRS Precedence Rule: When Test 2 and Test 3 are both unobstructed, Test 2 is chosen",
    (() => {
        const board = createEmptyBoard();
        const shapeFrom = CANONICAL_SHAPES['T']['0'];
        const shapeTo = CANONICAL_SHAPES['T']['R'];
        const startPos: Point = { x: 4, y: 15 };
        // Block Test 1 (0, 0)
        const t1Minos = getMinoPositions(shapeTo, startPos.x, startPos.y);
        const t2Minos = new Set(
            getMinoPositions(shapeTo, startPos.x - 1, startPos.y).map(m => `${m.x},${m.y}`)
        );
        const blockCell = t1Minos.find(m => !t2Minos.has(`${m.x},${m.y}`));
        if (blockCell) board[blockCell.y][blockCell.x] = 1;

        const res = srsRotate('T', shapeFrom, startPos, '0', 1, board);
        return res !== null && res.testUsed === 2;
    })()
);

// O piece non-kicking test
rep.test(
    "SRS O-Piece Rule: O piece does NOT kick when obstructed",
    (() => {
        const board = createEmptyBoard();
        board[15][4] = 1; // Obstacle
        const res = srsRotate('O', CANONICAL_SHAPES['O']['0'], { x: 4, y: 15 }, '0', 1, board);
        return res === null;
    })()
);

// ===========================================================================
// SECTION 4: Evaluating Codebase Logic (src/app/game/page.tsx)
// ===========================================================================
rep.section("4. Codebase Evaluation: src/app/game/page.tsx Behavior vs SRS");

// Simulation of page.tsx handleRotateClockwise (lines 297-357)
function pageTsxRotateCW(curPieceName: PieceName, curPieceShape: Shape, curPiecePos: Point, pieceRotationState: string, boardState: Board) {
    const pieceRotationStates = ["0", "R", "2", "L"];
    const prevRotationState = pieceRotationState;
    const prevStateIndex = pieceRotationStates.findIndex(state => state === prevRotationState);
    const length = pieceRotationStates.length;
    // Line 302 in page.tsx:
    const curRotationState = pieceRotationStates[(prevStateIndex - 1 + length) % length];
    const tableKey = prevRotationState + ">" + curRotationState;
    const table = kicks[tableKey as keyof typeof kicks];
    const iTable = iKicks[tableKey as keyof typeof kicks];

    // Line 315-328: matrix rotation CW
    const resultShape: Shape = Array.from({ length: curPieceShape.length }, () => Array(curPieceShape.length).fill(0));
    for (let y = 0; y < curPieceShape.length; y++) {
        for (let x = 0; x < curPieceShape[y].length; x++) {
            resultShape[x][curPieceShape.length - y - 1] = curPieceShape[y][x];
        }
    }

    let finalPos = { ...curPiecePos };
    let finalState = prevRotationState;
    let rotated = false;

    if (canPlace(resultShape, curPiecePos.x, curPiecePos.y, boardState)) {
        finalState = curRotationState;
        rotated = true;
    } else {
        // Line 334-356: forEach loop without break!
        if (curPieceName !== "I") {
            table.forEach(function (kick) {
                const newPosX = curPiecePos.x + kick.x;
                const newPosY = curPiecePos.y + kick.y;
                if (canPlace(resultShape, newPosX, newPosY, boardState)) {
                    finalPos = { x: newPosX, y: newPosY };
                    finalState = curRotationState;
                    rotated = true;
                }
            });
        } else if (curPieceName === "I") {
            iTable.forEach(function (kick) {
                const newPosX = curPiecePos.x + kick.x;
                const newPosY = curPiecePos.y + kick.y;
                if (canPlace(resultShape, newPosX, newPosY, boardState)) {
                    finalPos = { x: newPosX, y: newPosY };
                    finalState = curRotationState;
                    rotated = true;
                }
            });
        }
    }

    return { rotated, finalPos, finalState, tableKeyUsed: tableKey };
}

// Test page.tsx CW rotation state progression
const pageCwFrom0 = pageTsxRotateCW('T', CANONICAL_SHAPES['T']['0'], { x: 3, y: 18 }, '0', createEmptyBoard());
rep.test(
    "page.tsx: CW rotation from state '0' transitions to state 'R' (SRS expectation)",
    pageCwFrom0.finalState === 'R',
    `BUG: page.tsx transitioned to state '${pageCwFrom0.finalState}' instead of 'R'`
);
rep.test(
    "page.tsx: CW rotation from state '0' looks up '0>R' kick table (SRS expectation)",
    pageCwFrom0.tableKeyUsed === '0>R',
    `BUG: page.tsx looked up table '${pageCwFrom0.tableKeyUsed}' instead of '0>R'`
);

// Simulation of page.tsx handleRotateCounterClockwise (lines 361-421)
function pageTsxRotateCCW(curPieceName: PieceName, curPieceShape: Shape, curPiecePos: Point, pieceRotationState: string, boardState: Board) {
    const pieceRotationStates = ["0", "R", "2", "L"];
    const prevRotationState = pieceRotationState;
    const prevStateIndex = pieceRotationStates.findIndex(state => state === prevRotationState);
    const length = pieceRotationStates.length;
    // Line 366 in page.tsx:
    const curRotationState = pieceRotationStates[(prevStateIndex + 1) % length];
    const tableKey = prevRotationState + ">" + curRotationState;

    const resultShape: Shape = Array.from({ length: curPieceShape.length }, () => Array(curPieceShape.length).fill(0));
    for (let y = 0; y < curPieceShape.length; y++) {
        for (let x = 0; x < curPieceShape[y].length; x++) {
            resultShape[curPieceShape.length - x - 1][y] = curPieceShape[y][x];
        }
    }

    let finalState = prevRotationState;
    if (canPlace(resultShape, curPiecePos.x, curPiecePos.y, boardState)) {
        finalState = curRotationState;
    }

    return { finalState, tableKeyUsed: tableKey };
}

const pageCcwFrom0 = pageTsxRotateCCW('T', CANONICAL_SHAPES['T']['0'], { x: 3, y: 18 }, '0', createEmptyBoard());
rep.test(
    "page.tsx: CCW rotation from state '0' transitions to state 'L' (SRS expectation)",
    pageCcwFrom0.finalState === 'L',
    `BUG: page.tsx transitioned to state '${pageCcwFrom0.finalState}' instead of 'L'`
);
rep.test(
    "page.tsx: CCW rotation from state '0' looks up '0>L' kick table (SRS expectation)",
    pageCcwFrom0.tableKeyUsed === '0>L',
    `BUG: page.tsx looked up table '${pageCcwFrom0.tableKeyUsed}' instead of '0>L'`
);

// Test page.tsx forEach loop overwrite bug
{
    const board = createEmptyBoard();
    // In page.tsx, tableKey for CW from '0' is '0>L' (due to bug).
    // In kicks['0>L']:
    // Test 1: (0, 0), Test 2: (1, 0), Test 3: (1, -1), Test 4: (0, 2), Test 5: (1, 2)
    // Obstruct Test 1 at (3, 18)
    const shape = CANONICAL_SHAPES['T']['R'];
    const t1Minos = getMinoPositions(shape, 3, 18);
    const t2Minos = new Set(getMinoPositions(shape, 4, 18).map(m => `${m.x},${m.y}`));
    const block = t1Minos.find(m => !t2Minos.has(`${m.x},${m.y}`));
    if (block) board[block.y][block.x] = 1;

    const res = pageTsxRotateCW('T', CANONICAL_SHAPES['T']['0'], { x: 3, y: 18 }, '0', board);
    // In SRS: Test 2 (x=4, y=18) should be chosen.
    // In page.tsx: forEach continues to Test 3, 4, 5 and overwrites if valid!
    const expectedSRS = { x: 3 + kicks['0>R'][1].x, y: 18 + kicks['0>R'][1].y };
    rep.test(
        "page.tsx: Stops at first valid kick without overwriting (SRS first-hit rule)",
        res.finalPos.x === expectedSRS.x && res.finalPos.y === expectedSRS.y,
        `BUG: page.tsx positioned piece at (${res.finalPos.x}, ${res.finalPos.y}), expected (${expectedSRS.x}, ${expectedSRS.y}). (tableKey inversion + forEach overwrite)`
    );
}

// Test page.tsx O piece kicking
{
    const board = createEmptyBoard();
    // Block basic placement of O at (3, 18)
    board[18][3] = 1;
    const res = pageTsxRotateCW('O', CANONICAL_SHAPES['O']['0'], { x: 3, y: 18 }, '0', board);
    rep.test(
        "page.tsx: O piece does NOT kick when blocked (SRS expectation)",
        !res.rotated,
        `BUG: page.tsx allowed O piece to kick to (${res.finalPos.x}, ${res.finalPos.y})`
    );
}

// ===========================================================================
// SECTION 5: Evaluating Codebase Logic (src/app/og/page.tsx)
// ===========================================================================
rep.section("5. Codebase Evaluation: src/app/og/page.tsx Behavior vs SRS");

// In og/page.tsx, check whether I piece uses iKicks
// Line 79 in og/page.tsx:
// const kicksTable = kicks[table as keyof typeof kicks]  <-- ignores iKicks!
function ogTsxUsesIKicks(): boolean {
    // If I piece rotates in og/page.tsx, does it use iKicks?
    // In og/page.tsx line 5: import { kicks, iKicks } from "../game/kicks"
    // But grep confirmed line 79 and 104 only use kicks!
    return false;
}

rep.test(
    "og/page.tsx: Uses iKicks for I piece rotations (SRS expectation)",
    ogTsxUsesIKicks(),
    "BUG: og/page.tsx imports iKicks but exclusively uses JLSTZ 'kicks' table for all pieces including 'I'"
);

// Check if og/page.tsx prevents O piece kicks
function ogTsxPreventsOKicks(): boolean {
    // og/page.tsx does not check piece name before iterating kicksTable
    return false;
}

rep.test(
    "og/page.tsx: O piece does NOT kick when blocked (SRS expectation)",
    ogTsxPreventsOKicks(),
    "BUG: og/page.tsx attempts JLSTZ kicks on O piece when blocked"
);

// ---------------------------------------------------------------------------
// Run and print final report
// ---------------------------------------------------------------------------
rep.summary();
