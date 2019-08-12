# Lite Segmentation
> Segments nuclear material and allows testing segmentation models

<!-- ![](../header.png) -->

## Example usage

Select the Segmentation button on the toolbar.  Hint: It's the one on the far right.

![toolbar button](img/toolbar.png)

### Nuclei Segmentation
Helps to quickly identify possible nuclear material.  (User-adjustable slider to follow.)

Next, zoom in to an area that you would like to segment.

Clicking the Segmentation button again will provide you with the ability to draw a rectangular region of interest.

![toolbar button](img/roi.png)

Scrolling to the bottom will show the region you selected, segmented.

![toolbar button](img/segmented.png)

### Testing Segmentation models

![Segment Toolbar](img/toolbar_seg.png)

Clicking the plus icon will allow adding a Keras/tensorflowjs trained model.

Select the desired model from the dropdown and select the required area.

![toolbar button](img/segmented_model.png)

Toggle the mask or change the opacity as required.
Save the mask using the save button.


