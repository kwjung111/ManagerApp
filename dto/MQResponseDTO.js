class MQResponseDTO{
    constructor(connections,queues){
        this.connections = connections;
        this.queues = queues;
    }

    getConnections(){
        return this.connections;
    }

    getQueues(){
        return this.queues;
    }
}

module.exports = MQResponseDTO;