let startTime = 0;
let activeDirection = "";
let movementHistory = [];
const speedCmPerSec = 30; // Estimated baseline speed constant

// Periodically fetch battery voltage every 3 seconds
setInterval(fetchBattery, 3000);
fetchBattery();

function fetchBattery() {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            document.getElementById("vText").innerText = res.voltage + " V";
            document.getElementById("pText").innerText = res.percent + "%";
            
            let fill = document.getElementById("batFill");
            fill.style.width = res.percent + "%";
            
            if (res.percent < 25) fill.style.backgroundColor = "#dc3545";      // Red
            else if (res.percent < 55) fill.style.backgroundColor = "#ffc107"; // Yellow
            else fill.style.backgroundColor = "#28a745";                        // Green
        }
    };
    xhr.open("GET", "/battery", true);
    xhr.send();
}

function updateSpeedText(val) {
    let percent = Math.round((val / 1023) * 100);
    document.getElementById("speedText").innerText = percent;
}

function getCurrentSpeed() {
    return document.getElementById("speedRange").value;
}

function startMove(cmd, dirName) {
    activeDirection = dirName;
    startTime = Date.now();
    let pwmSpeed = getCurrentSpeed();
    
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/" + cmd + "?speed=" + pwmSpeed, true);
    xhr.send();
}

function stopMove() {
    if (startTime !== 0) {
        let elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 0.1) {
            let distanceCm = (elapsed * speedCmPerSec).toFixed(1);
            movementHistory.push({
                dir: activeDirection,
                time: elapsed.toFixed(1),
                cm: distanceCm
            });
        }
        startTime = 0;
    }

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/stop", true);
    xhr.send();
}

function resetAndStop() {
    movementHistory = [];
    document.getElementById("log-content").innerHTML = "No movements recorded yet.";
    startTime = 0;
    
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/stop", true);
    xhr.send();
}

function toggleLog() {
    let logContent = document.getElementById("log-content");
    if (movementHistory.length === 0) {
        logContent.innerHTML = "No movements recorded yet.";
        return;
    }

    let html = "<ul>";
    movementHistory.forEach((item, index) => {
        html += `<li><b>${index + 1}. ${item.dir}</b>: ${item.time}s (~${item.cm} cm)</li>`;
    });
    html += "</ul>";
    logContent.innerHTML = html;
}