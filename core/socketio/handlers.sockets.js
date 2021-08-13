function handleSocketDrawEvent () {
    document.querySelector('[data-id="other"]').nextElementSibling.style.display = 'none';
    document.querySelector('[data-id="other"]').remove();
    loadingHumanOverlayers();
}

function handleSocketHeatmapEdit(arg) {
    if (arg && arg.socketData) {
        $CAMIC.viewer.heatmap._editedData.clusters[0].editDataArray = arg.socketData[0].data;
        $CAMIC.viewer.heatmap.updateView(0);
        $UI.heatmapEditedDataPanel.__refresh();
        $CAMIC.viewer.canvasDrawInstance.clear();
      
        heatMapEditedListOn();
    }
}