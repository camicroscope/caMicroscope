class EditDataCollection {

	constructor(index, name, value, color){
		this.name = name;
		this.index = index;
		this.value = value;
		this.color = color;
		this.editDataArray = []; // array of EditData
	}

	removeEditDataByIndex(index){
		this.editDataArray.splice(index,1);
	}
	
	addEditData(editData){
		this.editDataArray.push(editData);
	}	
}

class EditDataCluster{
	constructor(clusters=[]){
		this.clusters = clusters;
	}
	getCluster(index,name,value,color){
		return this.clusters.find(cluster => cluster.index==index&&cluster.name==name&&cluster.value==value&&cluster.color==color);
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
}

