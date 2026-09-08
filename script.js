const STORAGE_KEY = "primeToolHistoryV2";

const state = {
    method: "sqrt",
    history: loadHistory()
};

const numberInput = document.getElementById("numberInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearInputBtn = document.getElementById("clearInputBtn");
const methodSelect = document.getElementById("methodSelect");

const toggleListBtn = document.getElementById("toggleListBtn");
const listPanel = document.getElementById("listPanel");
const listInput = document.getElementById("listInput");
const analyzeListBtn = document.getElementById("analyzeListBtn");

const emptyState = document.getElementById("emptyState");
const resultState = document.getElementById("resultState");

const resultLetter = document.getElementById("resultLetter");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");

const detailSqrt = document.getElementById("detailSqrt");
const detailChecks = document.getElementById("detailChecks");
const detailFactor = document.getElementById("detailFactor");

const historyList = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const batchState = document.getElementById("batchState");
const batchGrid = document.getElementById("batchGrid");
const closeBatchBtn = document.getElementById("closeBatchBtn");

function analyzeNumber(n, method = "sqrt") {
    if (!Number.isInteger(n) || n <= 1) {
        return null;
    }

    if (n === 2 || n === 3) {
        return {
            number: n,
            isPrime: true,
            factor1: null,
            factor2: null,
            checkedDivisors: [],
            limit: Math.sqrt(n),
            method: method
        };
    }

    if (method === "sixk") {
        return analyzeWithSixK(n);
    } else {
        return analyzeWithSquareRoot(n);
    }
}

function analyzeWithSquareRoot(n) {
    const limit = Math.sqrt(n);
    const checkedDivisors = [];

    for (let d = 2; d <= limit; d++) {
        checkedDivisors.push(d);

        if (n % d === 0) {
            return {
                number: n,
                isPrime: false,
                factor1: d,
                factor2: n / d,
                checkedDivisors: checkedDivisors,
                limit: limit,
                method: "sqrt"
            };
        }
    }

    return {
        number: n,
        isPrime: true,
        factor1: null,
        factor2: null,
        checkedDivisors: checkedDivisors,
        limit: limit,
        method: "sqrt"
    };
}

function analyzeWithSixK(n) {
    const limit = Math.sqrt(n);
    const checkedDivisors = [];

    checkedDivisors.push(2);

    if (n % 2 === 0) {
        return {
            number: n,
            isPrime: false,
            factor1: 2,
            factor2: n / 2,
            checkedDivisors: checkedDivisors,
            limit: limit,
            method: "sixk"
        };
    }

    checkedDivisors.push(3);

    if (n % 3 === 0) {
        return {
            number: n,
            isPrime: false,
            factor1: 3,
            factor2: n / 3,
            checkedDivisors: checkedDivisors,
            limit: limit,
            method: "sixk"
        };
    }

    for (let d = 5; d <= limit; d = d + 6) {
        checkedDivisors.push(d);

        if (n % d === 0) {
            return {
                number: n,
                isPrime: false,
                factor1: d,
                factor2: n / d,
                checkedDivisors: checkedDivisors,
                limit: limit,
                method: "sixk"
            };
        }

        const secondCandidate = d + 2;

        if (secondCandidate <= limit) {
            checkedDivisors.push(secondCandidate);

            if (n % secondCandidate === 0) {
                return {
                    number: n,
                    isPrime: false,
                    factor1: secondCandidate,
                    factor2: n / secondCandidate,
                    checkedDivisors: checkedDivisors,
                    limit: limit,
                    method: "sixk"
                };
            }
        }
    }

    return {
        number: n,
        isPrime: true,
        factor1: null,
        factor2: null,
        checkedDivisors: checkedDivisors,
        limit: limit,
        method: "sixk"
    };
}

function showResult(result) {
    emptyState.hidden = true;
    resultState.hidden = false;

    if (result.isPrime === true) {
        resultLetter.textContent = "P";
        resultTitle.textContent = "PRIMO";
        resultLetter.style.color = "var(--accent2)";
        resultTitle.style.color = "var(--accent2)";
        resultMessage.textContent =
            result.number + " es un número primo.";
    } else {
        resultLetter.textContent = "C";
        resultTitle.textContent = "COMPUESTO";
        resultLetter.style.color = "var(--danger)";
        resultTitle.style.color = "var(--danger)";
        resultMessage.textContent =
            result.number + " es un número compuesto.";
    }

    detailSqrt.textContent =
        "√" +
        result.number +
        " ≈ " +
        result.limit.toFixed(2);

    detailChecks.textContent =
        "Comprobaciones realizadas: " +
        result.checkedDivisors.length;

    if (result.isPrime === false) {
        detailFactor.textContent =
            "Factor encontrado: " +
            result.number +
            " = " +
            result.factor1 +
            " × " +
            result.factor2;
    } else {
        detailFactor.textContent =
            "Ningún divisor encontrado.";
    }
}

function analyzeSingleNumber() {
    const number = Number(numberInput.value);

    if (!Number.isInteger(number) || number <= 1) {
        showInputError();
        return;
    }

    const result = analyzeNumber(
        number,
        state.method
    );

    showResult(result);
    addToHistory(result);
}

function addToHistory(result) {
    const historyItem = {
        id: Date.now() + Math.random(),
        number: result.number,
        isPrime: result.isPrime,
        factor1: result.factor1,
        factor2: result.factor2,
        time: new Date().toLocaleTimeString(
            "es-CO",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        )
    };

    state.history.unshift(historyItem);
    state.history = state.history.slice(0, 12);

    saveHistory();
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";

    if (state.history.length > 0) {
        emptyHistory.hidden = true;
    } else {
        emptyHistory.hidden = false;
    }

    state.history.forEach(function (item) {
        const row = document.createElement("div");

        row.className = "history-item";

        let resultText;
        let resultClass;
        let factorText;

        if (item.isPrime === true) {
            resultText = "PRIMO";
            resultClass = "prime";
            factorText = "Sin factor";
        } else {
            resultText = "COMPUESTO";
            resultClass = "composite";
            factorText =
                item.factor1 +
                " × " +
                item.factor2;
        }

        row.innerHTML = `
            <div class="history-number">
                ${item.number}
            </div>

            <div class="history-result ${resultClass}">
                <strong>${resultText}</strong>
                <small>${factorText}</small>
            </div>

            <div class="history-time">
                ${item.time}
            </div>
        `;

        historyList.appendChild(row);
    });
}

function parseNumberList(text) {
    const pieces = text.split(/[\s,;]+/);
    const numbers = [];

    for (let i = 0; i < pieces.length; i++) {
        const value = pieces[i].trim();

        if (value !== "") {
            const number = Number(value);

            if (
                Number.isInteger(number) &&
                number > 1
            ) {
                numbers.push(number);
            }
        }
    }

    return numbers;
}

function analyzeNumberList() {
    const numbers =
        parseNumberList(listInput.value);

    if (numbers.length === 0) {
        listPanel.classList.add("error");

        setTimeout(function () {
            listPanel.classList.remove("error");
        }, 900);

        return;
    }

    batchGrid.innerHTML = "";
    batchState.hidden = false;

    for (let i = 0; i < numbers.length; i++) {
        const number = numbers[i];

        const result =
            analyzeNumber(
                number,
                state.method
            );

        const card =
            document.createElement("div");

        if (result.isPrime === true) {
            card.className =
                "batch-item prime";

            card.innerHTML = `
                <strong>${result.number}</strong>
                <span>PRIMO</span>
                <small>Sin divisor</small>
            `;
        } else {
            card.className =
                "batch-item composite";

            card.innerHTML = `
                <strong>${result.number}</strong>
                <span>COMPUESTO</span>
                <small>
                    ${result.factor1}
                    ×
                    ${result.factor2}
                </small>
            `;
        }

        batchGrid.appendChild(card);
        addToHistory(result);
    }
}

function showInputError() {
    const inputBox =
        numberInput.closest(".input-box");

    inputBox.classList.add("error");

    setTimeout(function () {
        inputBox.classList.remove("error");
    }, 900);
}

function loadHistory() {
    try {
        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved !== null) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.log(
            "No se pudo cargar el historial."
        );
    }

    return [];
}

function saveHistory() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.history)
    );
}

analyzeBtn.addEventListener(
    "click",
    analyzeSingleNumber
);

numberInput.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Enter") {
            analyzeSingleNumber();
        }
    }
);

clearInputBtn.addEventListener(
    "click",
    function () {
        numberInput.value = "";
        resultState.hidden = true;
        emptyState.hidden = false;
        numberInput.focus();
    }
);

methodSelect.addEventListener(
    "change",
    function () {
        state.method =
            methodSelect.value;
    }
);

toggleListBtn.addEventListener(
    "click",
    function () {
        listPanel.hidden =
            !listPanel.hidden;
    }
);

analyzeListBtn.addEventListener(
    "click",
    analyzeNumberList
);

closeBatchBtn.addEventListener(
    "click",
    function () {
        batchState.hidden = true;
    }
);

clearHistoryBtn.addEventListener(
    "click",
    function () {
        state.history = [];
        saveHistory();
        renderHistory();
    }
);

renderHistory();