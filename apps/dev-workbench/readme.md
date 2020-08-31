# Development Workbench - User guide

The **Development Workbench** can be used to create and train ML model from scratch using an interactive UI within the browser.

There are 3 steps involved in creating a model:
- Creating/selecting dataset
- Customising and training the model 
- Saving the training model

## 1. Creating/selecting dataset
Since we're working with tensorflow.js, a preferred type of datasets are `spritesheets` (like MNIST [sprite](https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png) in [this](https://codelabs.developers.google.com/codelabs/tfjs-training-classfication/index.html#2) example). 

![Step-1](https://i.ibb.co/C5VJY8t/Deepin-Screenshot-select-area-20200810034956.png)

The workbench accepts only a *zip file* as dataset input which **must contain** three files: ***spritesheet*** (data.jpg), a ***binary labels*** (labels.bin) and the ***classes*** (labelnames.csv) with the filenames as specified. 
If user has the above specified format of dataset than it can be browsed directly and they can skip to Step 2 - Customising/training the model.

The compatible zip file can be created using the dataset generator tool. The tool accepts data from:
- caMicrocope Labeling tool exports
-  Custom data

**Labeling tool files** are exported from caMicroscope labeling tool. The labels are extracted from the zip file(s) and used as classes for the model with respective images. <br>
**Custom Data** has to be a zip file which must contain folders where every folder-name must be the label name of images it contains inside.

Custom Label filtering and image resolution can be adjusted accordingly in both types of data.

The compatible spritesheet and binary labels are created on server-side at SlideLoader [here](https://github.com/camicroscope/SlideLoader/blob/develop/spritemaker.py).

## 2. Creating/Training Model
After the selection/creation of usable dataset, the user can proceed to creating and editing own CNN model.

The user can change basic settings (like classes, resolution of images, input/output layer features) for the model before starting the training.

After the user has set the basic things, the whole CNN model can be personalized like adding/removing layers with custom functions and function parameters. The parameters for model.fit() and model.compile() can be customized (like `batchSize` , `epochs`, `shuffle` etc.).

Some features are:
- Complete layer customisation
- Basic/Advanced Mode
- Server-Side Training
- Import/Export work
- Training visualisation (browser training mode)

### Complete Layer Customisation
User can add/remove/modify the CNN layers accordingly to get the desired output. 

![layer customisation](https://i.ibb.co/XYZBG1B/out-1.gif)

[model.compile()](https://js.tensorflow.org/api/latest/#tf.LayersModel.compile) and [model.fit()](https://js.tensorflow.org/api/latest/#tf.LayersModel.fit) functions and their parameters can also be modified accordingly by the user.

### Import/Export ongoing work
- Users can export their ongoing work so as to continue work later on.
- Export can be done just after step-1 (dataset selection) or anytime during layers customisation.
- A zip file will be exported which can be imported anytime by using the import option.

![options](https://i.ibb.co/5F7x8CY/Deepin-Screenshot-select-area-20200810043400.png)

### Basic/advanced Mode
The user can toggle the **_advanced mode_** from the options. This mode is targeted towards more advanced users who might want to customize their models in more detailed fashion.
More layers function and parameters can be customised when advanced mode is enabled.

### Server-Side Training
User can also train their model on server-side ([Caracal](https://github.com/camicroscope/Caracal)) using nodejs with the same layers customization and other features as before. A toggle for the same is provided in the options. Some advantages are:
-   Server-side training can be faster in many cases since it is performed directly by Tensorflow C binary.
-   GPU training utilizing CUDA can also be achieved by this.

Though server-side training does not work with visualization using  [tfjs-vis](https://github.com/tensorflow/tfjs/tree/master/tfjs-vis)  but the model training summary is shown in the console during the process.

### Training visualisation
After the user clicks on ‘train’ the training process will start and visualization will be shown using [TFjs-vis](https://github.com/tensorflow/tfjs/tree/master/tfjs-vis). (Only in browser-training mode)

![training visualisation](https://i.ibb.co/NLZrGKX/1-X4y-Q8xws-KRS1f-GFc-J3-C3-A.png)

### Parameters and valid values
| Name | Value |
|--|--|
|  activation | (*string*)  Name of activation function <br> 'elu' \| 'hardSigmoid' \| 'linear' \| 'relu' \| 'relu6' \| 'selu' \| 'sigmoid' \| 'softmax' \| 'softplus' \| 'softsign' \| 'tanh' 
|axis|(*number*) The integer axis that should be normalized (typically the features axis). Defaults to -1|
|batchSize|(*number*) Number of samples per gradient update. If unspecified, will default to 32|
|dataFormat|(*string*) Image data format<br> 'channelsFirst' \| 'channelsLast'|
|epochs|(*number*) Integer number of times to iterate over the training data arrays|
|filters|(*number*) The dimensionality of the output space (i.e. the number of filters in the convolution)|
|kernelInitializer|(*string*) Initializer for the convolutional kernel weights matrix <br> 'constant'\|'glorotNormal'\|'glorotUniform'\|'heNormal'\|'heUniform'\|'identity'\| 'leCunNormal'\|'leCunUniform'\|'ones'\|'orthogonal'\|'randomNormal'\| 'randomUniform'\|'truncatedNormal'\|'varianceScaling'\|'zeros'|
|kernelSize|(*number*) The dimensions of the convolution window. If kernelSize is a number, the convolutional window will be square. |
|loss|(*string*\|*string[]*) Object function(s) or name(s) of object function(s). If the model has multiple outputs, you can use a different loss on each output by passing a dictionary or an Array of losses. The loss value that will be minimized by the model will then be the sum of all individual losses. <br> [keras losses](https://www.tensorflow.org/api_docs/python/tf/keras/losses)|
|metrics| (*string[]*) List of metrics to be evaluated by the model during training and testing. Typically you will use `metrics=['accuracy']`. To specify different metrics for different outputs of a multi-output model, you could also pass a dictionary.|
|momentum|(*number*) Momentum of the moving average. Defaults to 0.99.|
|optimizer|(*string* \| [*tf.train.Optimizer*](https://js.tensorflow.org/api/latest/#class:train.Optimizer)) An instance of  tf.train.Optimizer  or a string name for an Optimizer.|
|padding|(*string*) Padding Mode <br> 'valid'\|'same'\|'causal'|
|poolSize|(*number*) Size of the window to pool over|
|rate|(*number*) Float between 0 and 1. Fraction of the input units to drop.|
|strides|(*number*) The strides of the convolution in each dimension.|
|units|(*number*) Positive integer, dimensionality of the output space|

<br>Tensorflow.js [documentation](https://js.tensorflow.org/api/latest/) can be referred for more detailed use.

## 3. Saving the trained model
After the training is complete, the user is prompted to download the trained model. Doing so will save two files: *model JSON* and *weight binaries*.
These two files can then be used in caMircoscope's prediction tool.<br>

### A demo video is available [here](https://www.youtube.com/watch?v=jPGWBvuS1tM)

