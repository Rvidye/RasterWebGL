class timer{

    constructor(events){
        this.currentTime = 0.0;
        this.eventList = new Map();
        this.callbacks = new Map();
        for(let [index,[start, duration]] of events){
            this.eventList.set(index,{start,duration, deltaT: 0.0});
        }
    }

    recalculateAllT(){
        for(let event of this.eventList.values()){
            event.deltaT = Math.max(0.0, Math.min(1.0, (this.currentTime - event.start) / event.duration));
        }
    }

    resetT(){
        this.currentTime = 0.0;
    }

    getEventDeltaT(index){
        if(!this.eventList.has(index)){
            console.log("Invalid event");
            return null;
        }
        return this.eventList.get(index).deltaT;
    }

    increment(){
        if(isAnimating){
            this.currentTime += GLOBAL.deltaTime;
            this.recalculateAllT();
            this.checkCallbacks();
        }
    }

    getT(){
        return this.currentTime;
    }

    getEventTime(index){
        if(!this.eventList.has(index)){
            console.error("Invalid event");
            return null;
        }
        return this.eventList.get(index).deltaT;
    }

    isEventStarted(index){
        return this.eventList.get(index).deltaT > 0.0;
    }

    isEventComplete(index){
        return this.eventList.get(index).deltaT >= 1.0;
    }

    addTime(t){
        this.currentTime += t;
        this.recalculateAllT();
        this.checkCallbacks();
    }

    subtractTime(t){
        this.currentTime -= t;
        this.recalculateAllT();
        this.checkCallbacks();
    }

    registerCallback(time, callback) {
        if (!this.callbacks.has(time)) {
            this.callbacks.set(time, []);
        }
        this.callbacks.get(time).push(callback);
    }

    checkCallbacks() {
        for (const [time, callbacks] of this.callbacks.entries()) {
            if (this.currentTime >= time && !callbacks.triggered) {
                callbacks.forEach(callback => callback());
                callbacks.triggered = true;
            }
        }
    }
}
