parser = new DOMParser();

var template = {
        "provenance": {
            "image": {
                "slide": "ID"
            },
            "analysis": {
                "source": "human",
                "execution_id": "TEMPLATE",
                "name": "TEMPLATE"
            }
        },
        "properties": {
            "annotations": {
                "name": "TEMPLATE",
                "note": "Converted from XML"
            }
        },
        "geometries": {
            "type": "FeatureCollection"
        }
    }

function xml2geo(){
  let features = []
  let input = document.getElementById("xml_in").value;
  xmlDoc = parser.parseFromString(input, "text/xml");
  let regions = xmlDoc.getElementsByTagName("Region")
  for (let i of regions){
    console.log("Looking at Region ID", i.getAttribute("Id"))
    let vertices = i.getElementsByTagName("Vertex")
    let coordinates = []
    let min_x = 99e99
    let max_x = 0
    let min_y = 99e99
    let max_y = 0
    for (let j of vertices){
      let x = parseFloat(j.getAttribute("X"))
      let y = parseFloat(j.getAttribute("Y"))
      min_x = Math.min(min_x, x)
      min_y = Math.min(min_y, y)
      max_x = Math.max(max_x, x)
      max_y = Math.max(max_y, y)
      coordinates.push([x,y])
    }
    coordinates.push(coordinates[0])
    let bound_rect = [[min_x, min_y], [min_x, max_y], [max_x, max_y], [max_x, min_y], [min_x, min_y]]
    let feature = {}
    feature['type'] = "Feature"
    feature['geometry'] = {}
    feature['geometry']['type'] = "Polygon"
    feature['geometry']['coordinates'] = [coordinates]
    feature['bound'] = {}
    feature['bound']['type'] = "Polygon"
    feature['bound']['coordinates'] = [bound_rect]
    features.push(feature)
  }
  let output = Object.assign({}, template)
  output['geometries']['features'] = features
  output['provenance']['image']['slide'] = document.getElementById("slide_id").value
  output['provenance']['analysis']['execution'] = document.getElementById("annot_name").value
  output['properties']['annotations']['name'] = document.getElementById("annot_name").value
  document.getElementById("output").innerHTML = JSON.stringify(output)
}
