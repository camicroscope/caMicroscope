function getParameterByName(name, url) {
    console.log(name);
    console.log(url);
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const dziPath = getParameterByName("dziPath");
console.log(dziPath);
const channelOrder = getParameterByName("channel_order");
console.log(channelOrder);

const viewer = OpenSeadragon({
    id: "openseadragon-viewer",
    prefixUrl: "../../core/openseadragon/images/",
    tileSources: dziPath,
    preserveViewport: true,
    visibilityRatio: 1,
    defaultZoomLevel: 0,
    maxZoomPixelRatio: 1
});
function updateChannelOrder() {
    const currentImage = viewer.world.getItemAt(0).getItems()[0];
    currentImage.setChannelOrder(channelOrder);
    currentImage.draw();
}
updateChannelOrder();
