
function getPrediction(playerName, statType) {
    const { spawn } = require('child_process');

    const pythonProcess = spawn('python', ["../predict_prop.py", playerName, statType]);

    let data = '';

    pythonProcess.stdout.on('data', (chunk) => {
        data += chunk.toString();
        console.log(`stdout: ${chunk}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error executing Python script: ${data}`);
    })

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });

    const output = data.trim();
    console.log(output);