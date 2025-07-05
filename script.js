    let delay = 800;
    document.getElementById("speedRange").addEventListener("input", function () {
    delay = parseInt(this.value);
    document.getElementById("speedDisplay").textContent = delay + "ms";
    });

    function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

    let totalSteps = 0;

    async function startVisualSolver() {
    const algo = document.getElementById("algo").value;
    const n = parseInt(document.getElementById("nValue").value);
    const board = Array.from({ length: n }, () => Array(n).fill(0));
    document.getElementById("result").innerHTML = '';
    document.getElementById("liveBoard").innerHTML = '';
    document.getElementById("metrics").innerHTML = '';
    document.getElementById("status").textContent = 'Solving...';
    totalSteps = 0;
    let startTime = performance.now();
    let count = 0;

    if (algo === "backtracking") {
        count = await visualSolve(board, 0, n);
    } else if (algo === "branch") {
        count = await branchAndBound(board, 0, n, new Array(n).fill(false), new Array(2 * n).fill(false), new Array(2 * n).fill(false));
    } else if (algo === "constraint") {
        count = await constraintSolve(board, 0, n);
    }

    let endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);
    document.getElementById("status").textContent = count === 0
        ? 'Status: No solution exists'
        : `Status: Done! Total Steps: ${totalSteps}, Solutions: ${count}`;
    document.getElementById("metrics").innerHTML = `<p><strong>Performance:</strong><br>Total recursive calls: ${totalSteps}<br>Time taken: ${timeTaken} ms</p>`;
    }

    async function visualSolve(board, row, n) {
    if (row === n) {
        await displaySolution(board);
        return 1;
    }
    let count = 0;
    for (let col = 0; col < n; col++) {
        totalSteps++;
        document.getElementById("status").textContent = `Trying position (${row}, ${col})... Steps: ${totalSteps}`;
        if (isSafe(board, row, col, n)) {
        board[row][col] = 1;
        drawLiveBoard(board);
        await sleep(delay);

        count += await visualSolve(board, row + 1, n);

        board[row][col] = 0;
        drawLiveBoard(board);
        await sleep(delay);
        }
    }
    return count;
    }

    async function branchAndBound(board, row, n, cols, diag1, diag2) {
    if (row === n) {
        await displaySolution(board);
        return 1;
    }
    let count = 0;
    for (let col = 0; col < n; col++) {
        totalSteps++;
        if (!cols[col] && !diag1[row - col + n] && !diag2[row + col]) {
        board[row][col] = 1;
        cols[col] = diag1[row - col + n] = diag2[row + col] = true;
        drawLiveBoard(board);
        await sleep(delay);

        count += await branchAndBound(board, row + 1, n, cols, diag1, diag2);

        board[row][col] = 0;
        cols[col] = diag1[row - col + n] = diag2[row + col] = false;
        drawLiveBoard(board);
        await sleep(delay);
        }
    }
    return count;
    }

    async function constraintSolve(board, row, n) {
    return await visualSolve(board, row, n); // Placeholder
    }

    function isSafe(board, row, col, n) {
    for (let i = 0; i < row; i++) if (board[i][col]) return false;
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) if (board[i][j]) return false;
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) if (board[i][j]) return false;
    return true;
    }

    function drawLiveBoard(board) {
    const liveBoard = document.getElementById("liveBoard");
    liveBoard.innerHTML = '';
    const n = board.length;
    liveBoard.className = "board";
    liveBoard.style.gridTemplateColumns = `repeat(${n}, 40px)`;
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
        const div = document.createElement("div");
        div.className = "cell";
        div.style.backgroundColor = (rowIndex + colIndex) % 2 === 0 ? "#f0d9b5" : "#b58863";
        if (cell === 1) {
            div.classList.add("queen");
            div.textContent = "♛";
        }
        liveBoard.appendChild(div);
        });
    });
    }

    async function displaySolution(board) {
    const resultDiv = document.getElementById("result");
    const clone = board.map(row => [...row]);

    const solDiv = document.createElement("div");
    solDiv.className = "solution board";
    solDiv.style.gridTemplateColumns = `repeat(${clone.length}, 40px)`;
    clone.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
        const div = document.createElement("div");
        div.className = "cell";
        div.style.backgroundColor = (rowIndex + colIndex) % 2 === 0 ? "#f0d9b5" : "#b58863";
        if (cell === 1) {
            div.classList.add("queen");
            div.textContent = "♛";
        }
        solDiv.appendChild(div);
        });
    });
    resultDiv.appendChild(solDiv);
    await sleep(delay);
    }
