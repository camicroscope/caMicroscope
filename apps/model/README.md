# Prediction
> Allows testing classification models


## Example usage

![toolbar button](assets/toolbar.png)


Clicking the plus icon will allow adding a Keras/tensorflowjs trained model.

Select the desired model from the dropdow.

Next, zoom in to an area that you would like to predict and select the required area.

![Predictions](assets/prediction.png)

The result box shows the class with maximum average probability taken across all the patches. Clicking the Save as CSV button will save the probabilities of all the classes along with the patch coordinate from the top left corner as a .csv [file](assets/eg.csv).







