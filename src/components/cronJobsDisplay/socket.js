import ReconnectingWebSocket from 'reconnecting-websocket';

var SALTPETER_WS = ""

if (window.location.href.indexOf("https://") > -1) {
    SALTPETER_WS = "wss://" + new URL(window.location.href).host  + "/ws";
} else {
    SALTPETER_WS = "ws://" + new URL(window.location.href).host  + "/ws";
}

class SaltpeterWebSocket {
    constructor(url) {
        this.ws = new ReconnectingWebSocket(url);
        this.subscriptions = new Set();
        this.outputPositions = {};  // {cron: {machine: position}}
        this.outputBuffers = {};     // {cron: {machine: full_output_string}}
        this.handlers = {
            status: [],
            output_chunk: [],
            config: [],
            timeline: [],
            message: []  // Legacy handler for backward compatibility
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        };
        
        // Forward other events
        this.ws.onerror = (...args) => {
            if (this.onerror) this.onerror(...args);
        };
        
        this.ws.onclose = (...args) => {
            // Clear state on disconnect
            this.outputPositions = {};
            this.outputBuffers = {};
            if (this.onclose) this.onclose(...args);
        };
        
        this.ws.onopen = (...args) => {
            // Resubscribe after reconnect
            if (this.subscriptions.size > 0) {
                this.subscribe([...this.subscriptions]);
            }
            if (this.onopen) this.onopen(...args);
        };
        
        // Expose properties for backward compatibility
        Object.defineProperty(this, 'debug', {
            get: () => this.ws.debug,
            set: (val) => { this.ws.debug = val; }
        });
        
        Object.defineProperty(this, 'timeoutInterval', {
            get: () => this.ws.timeoutInterval,
            set: (val) => { this.ws.timeoutInterval = val; }
        });
    }
    
    subscribe(jobs) {
        const jobArray = Array.isArray(jobs) ? jobs : [jobs];
        jobArray.forEach(job => this.subscriptions.add(job));
        this.send(JSON.stringify({ subscribe: jobArray }));
    }
    
    unsubscribe(jobs) {
        const jobArray = Array.isArray(jobs) ? jobs : [jobs];
        jobArray.forEach(job => this.subscriptions.delete(job));
        this.send(JSON.stringify({ unsubscribe: jobArray }));
    }
    
    send(data) {
        this.ws.send(data);
    }
    
    handleMessage(data) {
        // Call legacy message handler for backward compatibility
        this.handlers.message.forEach(handler => handler(data));
        
        switch(data.type) {
            case 'status':
                this.handleStatus(data);
                break;
            case 'output_chunk':
                this.handleOutputChunk(data);
                break;
            case 'config':
                this.handleConfig(data);
                break;
            case 'timeline':
                this.handleTimeline(data);
                break;
        }
    }
    
    handleStatus(data) {
        const { cron, machine, status } = data;
        
        // Reset position tracking when job starts
        if (status === 'running') {
            if (!this.outputPositions[cron]) {
                this.outputPositions[cron] = {};
            }
            if (!this.outputBuffers[cron]) {
                this.outputBuffers[cron] = {};
            }
            this.outputPositions[cron][machine] = 0;
            this.outputBuffers[cron][machine] = '';
        }
        
        this.handlers.status.forEach(handler => handler(data));
    }
    
    handleOutputChunk(data) {
        const { cron, machine, chunk, position, total_length, is_complete } = data;
        
        // Initialize tracking
        if (!this.outputPositions[cron]) {
            this.outputPositions[cron] = {};
        }
        if (!this.outputBuffers[cron]) {
            this.outputBuffers[cron] = {};
        }
        if (!this.outputPositions[cron][machine]) {
            this.outputPositions[cron][machine] = 0;
        }
        if (!this.outputBuffers[cron][machine]) {
            this.outputBuffers[cron][machine] = '';
        }
        
        // Verify position matches expected
        const expected = this.outputPositions[cron][machine];
        if (position !== expected) {
            console.warn(`Position mismatch for ${cron}/${machine}: expected ${expected}, got ${position}`);
            // Reset buffer and position
            this.outputBuffers[cron][machine] = '';
            this.outputPositions[cron][machine] = 0;
        }
        
        // Append chunk to buffer
        this.outputBuffers[cron][machine] += chunk;
        
        // Update position
        this.outputPositions[cron][machine] = position + chunk.length;
        
        // Optional: Send ACK
        this.sendAck(cron, machine, this.outputPositions[cron][machine]);
        
        // Notify handlers
        this.handlers.output_chunk.forEach(handler => handler({
            ...data,
            full_output: this.outputBuffers[cron][machine]
        }));
    }
    
    handleConfig(data) {
        this.handlers.config.forEach(handler => handler(data));
    }
    
    handleTimeline(data) {
        this.handlers.timeline.forEach(handler => handler(data));
    }
    
    sendAck(cron, machine, position) {
        try {
            this.send(JSON.stringify({
                ack: {
                    cron: cron,
                    machine: machine,
                    position: position
                }
            }));
        } catch (e) {
            // Don't fail if ACK can't be sent
        }
    }
    
    // For backward compatibility with existing code
    set onmessage(handler) {
        if (handler) {
            this.handlers.message = [handler];
        }
    }
    
    on(eventType, handler) {
        if (this.handlers[eventType]) {
            this.handlers[eventType].push(handler);
        }
    }
    
    off(eventType, handler) {
        if (this.handlers[eventType]) {
            this.handlers[eventType] = this.handlers[eventType].filter(h => h !== handler);
        }
    }
    
    getOutput(cron, machine) {
        return this.outputBuffers[cron]?.[machine] || '';
    }
}

export const socket = new SaltpeterWebSocket(SALTPETER_WS);

