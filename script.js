// --- DOM Element Selection ---
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

// --- State Variables ---
let currentInput = '0';
let operatorPressed = false;
let calculationDone = false; // Flag to check if the last action was '='

// --- Core Functions ---

/**
 * Appends a value to the calculator's input string.
 * @param {string} value The character or number to append.
 */
function appendToDisplay(value) {
    // If the last action was calculation, start a new calculation
    if (calculationDone) {
        currentInput = '0';
        calculationDone = false;
    }
    
    // If current input is '0' or an error, replace it
    if (currentInput === '0' || currentInput === 'Error') {
        // Allow starting with a decimal point
        if (value === '.') {
            currentInput = '0';
        } else {
            currentInput = '';
        }
    }

    const isOperator = ['+', '-', '×', '÷', '%'].includes(value);
    
    // Logic to handle operators
    if (isOperator) {
        if (operatorPressed) {
            // Replace the last operator if a new one is pressed
            currentInput = currentInput.slice(0, -1);
        }
        operatorPressed = true;
    } else {
        operatorPressed = false;
    }
    
    // Logic to handle decimal points
    if (value === '.') {
        // Split input by operators to check the last number segment
        const parts = currentInput.replace(/[+\-×÷%]/g, ' ').split(' ');
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('.')) return; // Prevent multiple decimals in one number
    }

    currentInput += value;
    updateDisplay();
}

/**
 * Updates the display element with the current input.
 */
function updateDisplay() {
    display.textContent = currentInput;
}

/**
 * Resets the calculator to its initial state.
 */
function clearDisplay() {
    currentInput = '0';
    operatorPressed = false;
    calculationDone = false;
    updateDisplay();
}

/**
 * Deletes the last character from the input.
 */
function deleteLast() {
    if (currentInput === 'Error' || calculationDone) {
        clearDisplay();
        return;
    }
    
    if (currentInput.length === 1) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    
    const lastChar = currentInput.slice(-1);
    operatorPressed = ['+', '-', '×', '÷', '%'].includes(lastChar);
    updateDisplay();
}

/**
 * Evaluates the expression in the input string and displays the result.
 */
function calculateResult() {
    if (operatorPressed) return; // Don't calculate if the expression ends with an operator

    try {
        // Replace display operators with JS-friendly ones
        let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
        
        // A more robust way to handle percentages
        expression = expression.replace(/(\d+(\.\d+)?)%/g, (match, p1) => `(${p1}/100)`);
        
        // Security Note: Using Function constructor is safer than eval() but still carries risks
        // in a real-world, public-facing application. For this project, it's acceptable.
        const result = new Function('return ' + expression)();

        if (isNaN(result) || !isFinite(result)) {
            throw new Error("Invalid calculation");
        }
        
        // Round to a reasonable number of decimal places to avoid floating point issues
        currentInput = String(Math.round(result * 1e10) / 1e10);
        calculationDone = true;

    } catch (error) {
        console.error("Calculation Error:", error);
        currentInput = 'Error';
    }
    
    operatorPressed = false;
    updateDisplay();
}


// --- Event Handling ---

// Add event listeners to all buttons
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;

        if (button.classList.contains('btn-num') || value === '.') {
            appendToDisplay(value);
        } else if (button.classList.contains('btn-op')) {
            if (value === '=') {
                calculateResult();
            } else {
                appendToDisplay(value);
            }
        } else if (button.classList.contains('btn-func')) {
            if (value === 'AC') {
                clearDisplay();
            } else if (value === 'DEL') {
                deleteLast();
            }
        }
    });
});


// Add keyboard support for a better user experience
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('-');
    } else if (key === '*') {
        appendToDisplay('×');
    } else if (key === '/') {
        appendToDisplay('÷');
    } else if (key === '%') {
        appendToDisplay('%');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault(); // Prevent default browser action
        calculateResult();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    }
});
