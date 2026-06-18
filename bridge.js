const http = require('http');

const args = process.argv.slice(2); 

if (args.length < 4) {
    console.error("please enter as follows: node bridge.js <PHONE_IP_PORT> <API_KEY> <DEVICE_ID> <LOCATION_NAME>");
    process.exit(1);
}

const PHONE_IP      = args[0]; // position 1
const API_KEY       = args[1]; // position 2
const DEVICE_ID     = args[2]; // position 3
const LOCATION_NAME = args[3]; // position 4

const PHYPHOX_URL = `http://${PHONE_IP}/get?calibration&dB=full&time=full`;
const SERVER_TARGET_HOST = "localhost";
const SERVER_TARGET_PORT = 7070;
const SERVER_TARGET_PATH = "/measurements";

let prevNumberMeasurements = 0;

function devicePolling() { // inspired from JSON fetching example at https://nodejs.org/api/http.html
    http.get(PHYPHOX_URL, (res) => {
        let rawData = '';
		
        res.on('data', (chunk) => {
			rawData += chunk; 
		});
        
        res.on('end', () => {
            try {
                const parsedJSON = JSON.parse(rawData);
                
                if (parsedJSON.buffer && parsedJSON.buffer.dB && Array.isArray(parsedJSON.buffer.dB.buffer)) {
                    const measurementArray = parsedJSON.buffer.dB.buffer;
					const currNumberMeasurements = measurementArray.length;
                    
                    if (currNumberMeasurements === 0) { // if no measurements
                        console.warn("measurement array buffer empty.");
                        return;
                    }
					
					if (currNumberMeasurements === prevNumberMeasurements) { // if number of measurements hasn't changed (Phyphox paused)
						console.log("phyphox paused (skipping duplicate transmission)");
                        return;
					}
					
					prevNumberMeasurements = currNumberMeasurements;

                    const lastMeasurement = measurementArray[measurementArray.length - 1];

                    if (lastMeasurement !== undefined && !isNaN(lastMeasurement)) {
                        console.log(`sound pressure level captured: ${Number(lastMeasurement).toFixed(2)} dB`);

                        const payload = JSON.stringify({
                            type: "soundPressureLevel",
                            value: Number(lastMeasurement),
                            unit: "dB",                 
                            location: LOCATION_NAME,
                            deviceId: DEVICE_ID,         
                            timestamp: new Date().toISOString() 
                        });

                        const postOptions = {
                            hostname: SERVER_TARGET_HOST,
                            port: SERVER_TARGET_PORT,
                            path: SERVER_TARGET_PATH,
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': Buffer.byteLength(payload),
                                'x-api-key': API_KEY 
                            }
                        };

                        const req = http.request(postOptions, (serverRes) => {
                            let responseString = '';
							
                            serverRes.on('data', (chunk) => { 
								responseString += chunk; 
							});
                            
							serverRes.on('end', () => {
                                try {
                                    const parsedResponse = JSON.parse(responseString);
									
                                    if (parsedResponse.success) {
                                        console.log(`data sent to DB with _id: ${parsedResponse.data._id}`);
                                    } 
									else {
                                        console.error(`transmission failed: ${parsedResponse.error}`);
                                    }
                                } 
								catch (e) {
                                    console.error(`parsing server response failed: ${e.message}`);
                                }
                            });
                        });

                        req.on('error', (err) => {
                            console.error(`post request failed: ${err.message}`);
                        });

                        req.write(payload);
                        req.end();
                    }
                } 
				else {
                    console.error("data mismatch make sure Phyphox Audio Amplitude experiment active.");
                }
            } 
			catch (jsonError) {
                console.error(`parsing device data failed: ${jsonError.message}`);
            }
        });

    }).on('error', (networkError) => {
        console.error(`link to device failed: ${networkError.message}`);
    });
}

setInterval(devicePolling, 3000); // poll every 3 seconds