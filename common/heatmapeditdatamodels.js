class EditDataCollection {

    constructor(index, name, value, color, array = []){
        this.name = name;
        this.index = index;
        this.value = value;
        this.color = color;
        this.editDataArray = array; // array of EditData
    }

    removeEditDataByIndex(index){
        this.editDataArray.splice(index,1);
    }
    
    addEditData(editData){
        this.editDataArray.push(editData);
    }

    toJSON(){
        return {
            name:this.name,
            index:+this.index,
            value:+this.value,
            color:this.color,
            data:this.editDataArray
        }
    }   
}

class EditDataCluster{
    
    constructor(clusters=[]){
        this.clusters = clusters;
    }
    
    isEmpty(){
        return !(this.clusters&&this.clusters.length > 0);
    }
    
    getCluster(index,name,value,color){
        return this.clusters.find(cluster => cluster.index==index&&cluster.name==name&&cluster.value==value&&cluster.color==color);
    }
    
    getClusterIndex(index,name,value,color){
        return this.clusters.findIndex(cluster => cluster.index==index&&cluster.name==name&&cluster.value==value&&cluster.color==color);
    }
    addCluster(cluster){
            this.clusters.push(cluster);
    }
    addEditDateForCluster(index, name, value, color, editData){
        if(!Array.isArray(editData)) return;
        let cluster = this.getCluster(index, name, value, color);
        if(!cluster){
            cluster = new EditDataCollection(index, name, value, color);
            this.clusters.push(cluster);
        }
        cluster.addEditData(editData)
    }

    removeEditDataForCluster(index,name,value,color, idx = null){
        const clusterIdx  = this.getClusterIndex(index,name,value,color);
        
        if(clusterIdx ==-1) return;
        const cluster = this.clusters[clusterIdx];
        if(idx==null){ // remove all
            this.clusters.splice(clusterIdx,1);
        } else {
            cluster.removeEditDataByIndex(idx);
            if(cluster.editDataArray.length==0) this.clusters.splice(clusterIdx,1);
        }
    }
    
    toJSON(){
        const list = [];
        this.clusters.forEach(cluster=>{list.push(cluster.toJSON())});
        return list;
    }
}

