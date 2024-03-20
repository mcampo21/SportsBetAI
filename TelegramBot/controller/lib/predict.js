
function getPrediction(playerName, statType, callback) {
    const { spawn } = require('child_process');
    const pythonProcess = spawn('python', ["../predict_prop.py", playerName, statType]);

    let data = '';

    pythonProcess.stdout.on('data', (chunk) => {
        data += chunk.toString();
        //console.log(`stdout: ${chunk.toString()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error executing Python script: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);

        const output = data.trim();
        callback(output);
    });

    
}

/*
getPrediction("Kyrie Irving", "points", (result) => {
    console.log(result);
}); 
*/

module.exports = { getPrediction }