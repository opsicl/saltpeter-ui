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
        this.hasConnected = false;  // Track if we've connected at least once
        this.handlers = {
            status: [],
            output_chunk: [],
            config: [],
            timeline: [],
            details: []
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
            // Clear sessionStorage to prevent stale data after backend restart
            sessionStorage.removeItem('savedState');
            if (this.onclose) this.onclose(...args);
        };
        
        this.ws.onopen = (...args) => {
            console.log('WebSocket connected/reconnected');
            
            // Reload page after backend restart to get fresh state
            // Only reload if this is a reconnect (not initial connection)
            if (this.hasConnected) {
                console.log('Backend reconnected - clearing stale state and reloading');
                // Clear sessionStorage to remove stale job state
                sessionStorage.removeItem('savedState');
                window.location.reload();
                return;
            }
            
            this.hasConnected = true;
            
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
        const newJobs = jobArray.filter(job => !this.subscriptions.has(job));
        if (newJobs.length === 0) {
            return; // Already subscribed
        }
        newJobs.forEach(job => this.subscriptions.add(job));
        this.send(JSON.stringify({ subscribe: newJobs }));
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
        if (!data.type) {
            console.warn('Message missing type field:', data);
            return;
        }
        
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
            case 'details':
                this.handleDetails(data);
                break;
            default:
                console.warn('Unknown message type:', data.type);
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
            // Don't reset buffer - this loses output
            // If position < expected, it's a duplicate chunk we already have
            if (position < expected) {
                console.log(`Ignoring duplicate chunk at position ${position}`);
                // Still send ACK for current position
                this.sendAck(cron, machine, expected);
                return;
            }
            // If position > expected, we're missing chunks
            // Continue anyway and hope backend resends missing parts
            console.warn(`Gap detected: missing bytes ${expected} to ${position}`);
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
    
    handleDetails(data) {
        this.handlers.details.forEach(handler => handler(data));
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
    
    clearOutput(cron, machine) {
        if (!this.outputBuffers[cron]) {
            this.outputBuffers[cron] = {};
        }
        this.outputBuffers[cron][machine] = '';
        
        if (!this.outputPositions[cron]) {
            this.outputPositions[cron] = {};
        }
        this.outputPositions[cron][machine] = 0;
    }
}

export const socket = new SaltpeterWebSocket(SALTPETER_WS);

