---
sidebarDepth: 3
---

# Models

## cocoSsd

```tsx
cocoSsd({ base?: string }): CocoSsd;
```

Object detection model based on tensorflow's [COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) implementation. The model localizes and identifies multiple objects in a single image.

### Parameters

| Option | Type   | Description                                                                                                                                                                                                             | Required | Default             |
| ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ------------------- |
| base   | string | Controls the base cnn model, can be 'mobilenet_v1', 'mobilenet_v2' or 'lite_mobilenet_v2'. lite_mobilenet_v2 is smallest in size, and fastest in inference speed. mobilenet_v2 has the highest classification accuracy. |          | 'lite_mobilenet_v2' |

### Streams

| Name      | Type              | Description                     | Hold |
| --------- | ----------------- | ------------------------------- | :--: |
| \$loading | Stream\<boolean\> | Defines if the model is loading |  ✓   |

### Methods

#### .predict()

```tsx
async predict(img: ImageData): Promise<ObjectDetectorResults>
```

Make a prediction from an input image in `ImageData` format. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface ObjectDetectorResults {
  outputs: {
    bbox: [number, number, number, number];
    class: string;
    confidence: number;
  }[];
}
```

### Example

```js
const source = marcelle.imageUpload();
const cocoClassifier = marcelle.cocoSsd();

const cocoPredictionStream = source.$images
  .map(async (img) => cocoClassifier.predict(img))
  .awaitPromises();
```

## knnClassifier

```tsx
marcelle.knnClassifier({ k?: number, dataStore: DataStore }): KNNClassifier;
```

A K-Nearest Neighbors classifier based on [Tensorflow.js's implementation](https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier).

### Parameters

| Option    | Type      | Description                                                                                                                                                                                                                                                                      | Required | default |
| --------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ------- |
| k         | number    | The K value to use in K-nearest neighbors. The algorithm will first find the K nearest examples from those it was previously shown, and then choose the class that appears the most as the final prediction for the input example. Defaults to 3. If examples < k, k = examples. |          | 3       |
| dataStore | DataStore | The [dataStore](/api/data-stores) used to store the model. This parameter is optional.                                                                                                                                                                                           |          |

The set of reactive parameters has the following signature:

```ts
parameters: {
  k: Stream<number>;
}
```

### Streams

| Name       | Type                     | Description                                                           | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events (see above), with no additional data |      |

### Methods

#### .clear()

```tsx
clear(): void
```

Clear the model, removing all instances

#### .predict()

```tsx
async predict(x: number[][]): Promise<ClassifierResults>
```

Make a prediction from an input feature array `x`. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

#### .train()

```tsx
train(dataset: Dataset): void
```

Train the model from a given dataset.

### Example

```js
const classifier = marcelle.knnClassifier({ k: 5 });
classifier.train(trainingSet);

const predictionStream = $featureStream // A stream of input features
  .map(async (features) => classifier.predict(features))
  .awaitPromises();
```

## mlpClassifier

```tsx
marcelle.mlpClassifier({
  layers?: number[],
  epochs?: number,
  batchSize?: number,
  dataStore: DataStore
  }): MLPClassifier;
```

A Multi-Layer Perceptron using Tensorflow.js. The configuration of the model (number of layers and number of hidden nodes per layer) can be configured.

### Parameters

| Option    | Type      | Description                                                                                                                                | Required | Default  |
| --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ | :------: | -------- |
| layers    | number[]  | The model configuration as an array of numbers, where each element defines a layer with the given number of hidden nodes                   |          | [64, 32] |
| epochs    | number    | Number of epochs used for training                                                                                                         |          | 20       |
| batchSize | number    | Training data batch size                                                                                                                   |          | 8        |
| dataStore | DataStore | The [dataStore](/api/data-stores) used to store the model. This parameter is optional. By default, a data store in memory will be created. |          |

The set of reactive parameters has the following signature:

```ts
parameters {
  layers: Stream<number[]>;
  epochs: Stream<number>;
  batchSize: Stream<number>;
}
```

### Streams

| Name       | Type                     | Description                                                                                                                                                                                               | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events, containing the current status ('idle' / 'start' / 'epoch' / 'success' / 'error'), the current epoch and associated data (such as loss and accuracy) during the training |      |

### Methods

#### .clear()

```tsx
clear(): void
```

Clear the model, removing all instances

#### .predict()

```tsx
async predict(x: number[][]): Promise<MLPResults>
```

Make a prediction from an input feature array `x`. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface MLPResults {
  label: string;
  confidences: { [key: string]: number };
}
```

#### .train()

```tsx
train(dataset: Dataset): void
```

Train the model from a given dataset.

### Example

```js
const classifier = marcelle.mlpClassifier({ layers: [64, 32], epochs: 50 });
classifier.train(trainingSet);

const predictionStream = $featureStream // A stream of input features
  .map(async (features) => classifier.predict(features));
  .awaitPromises();
```

## mobileNet

```tsx
marcelle.mobileNet({
  version?: 1 | 2,
  alpha?: 0.25 | 0.50 | 0.75 | 1.0,
}): MobileNet;
```

The mobileNet component can be used both as a classification model and as a feature extractor. It is based on [Tensorflow.js's Mobilenet implementation](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet). For feature extraction, the `.process()` method can be used to get the embeddings from an input image.

### Parameters

| Option  | Type                        | Description                                                                                                                                                                                                                                                        | Required |
| ------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| version | 1 \| 2                      | The MobileNet version number. Use 1 for [MobileNetV1](https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md), and 2 for [MobileNetV2](https://github.com/tensorflow/models/tree/master/research/slim/nets/mobilenet). Defaults to 1. |          |
| alpha   | 0.25 \| 0.50 \| 0.75 \| 1.0 | Controls the width of the network, trading accuracy for performance. A smaller alpha decreases accuracy and increases performance. 0.25 is only available for V1. Defaults to 1.0.                                                                                 |          |

Since parameters are used to load a heavy model, they can only be used on when the component is created, and there are not reactive parameters.

### Methods

#### .predict()

```tsx
async predict(image: ImageData): Promise<MobilenetResults>
```

Make a prediction from an input image `image` in ImageData format. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface MobilenetResults {
  label: string;
  confidences: { [key: string]: number };
}
```

#### .process()

```tsx
async process(image: ImageData): Promise<number[][]>
```

Use mobilenet for feature extraction, for example to perform transfer learning. The method returns the embedding for the input image. The size of the embedding depends on the alpha (width) of the model.

### Example

```js
const input = marcelle.webcam();
const m = marcelle.mobileNet();

// Extract features (embedding) from webcam images
const $embedding = input.$images.map((img) => m.process(img)).awaitPromises();

// Predict labels from webcam images (default mobilenet classification)
const $prediction = input.$images.map((img) => m.predict(img)).awaitPromises();
```

## onnxModel

```tsx
onnxModel({
  inputType: 'image' | 'generic';
  taskType: 'classification' | 'generic';
  segmentationOptions?: {
    output?: 'image' | 'tensor';
    inputShape: number[];
  };
}): OnnxModel;
```

This component allows to make predictions using pre-trained models in the ONNX format, using [`onnxruntime-web`](https://github.com/microsoft/onnxruntime/tree/master/js/web). The default backend for inference is `wasm`, as it provides a wider operator support.

The implementation currently supports tensors as input, formatted as nested number arrays, and two types of task (classification, generic prediction). Pre-trained models can be loaded either by URL, or through file upload, for instance using the [`fileUpload`](/api/components/widgets.html#fileupload) component.

Such generic models cannot be trained.

### Methods

#### .loadFromFile()

```tsx
async loadFromFile(file: File): Promise<void>
```

Load a pre-trained ONNX model from a `*.onnx` file.

#### .loadFromUrl()

```tsx
async loadFromUrl(url: string): Promise<void>
```

Load a pre-trained ONNX model from a URL.

#### .predict()

```tsx
async predict(input: InputType): Promise<OutputType>
```

Make a prediction from an input instance, which type depends on the `inputType` specified in the constructor. The method is asynchronous and returns a promise that resolves with the results of the prediction.

Input types can be:

- `ImageData` if the model was instanciated with `inputType: 'image'`
- `TensorLike` (= array) if the model was instanciated with `inputType: 'generic'`

Output types can be:

- `ClassifierResults` if the model was instanciated with `taskType: 'classification'`
- `TensorLike` if the model was instanciated with `taskType: 'generic'`

Where classifier results have the following interface:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

### Example

```js
const source = imageUpload();
const classifier = tfjsModel({
  inputType: 'image',
  taskType: 'classification',
});
classifier.loadFromUrl();

const predictionStream = source.$images.map(async (img) => classifier.predict(img)).awaitPromises();
```

## tfjsModel

```tsx
tfjsModel({
  inputType: 'image' | 'generic';
  taskType: 'classification' | 'segmentation' | 'generic';
  segmentationOptions?: {
    output?: 'image' | 'tensor';
    applyArgmax?: boolean;
  };
}): TFJSGenericModel;
```

This component allows to make predictions using pre-trained Tensorflow.js models, in either [LayersModel](https://js.tensorflow.org/api/latest/#class:LayersModel) or [GraphModel](https://js.tensorflow.org/api/latest/#class:GraphModel) format. This component supports:

- Models created with the tf.layers.\*, tf.sequential(), and tf.model() APIs of TensorFlow.js and later saved with the tf.LayersModel.save() method.
- Models converted from Keras or TensorFlow using the tensorflowjs_converter.

It supports several types of input (currently, images or arrays), as well as several types of task (classification, segmentation, generic prediction). Pre-trained models can be loaded either by URL, or through file upload, for instance using the [`fileUpload`](/api/components/widgets.html#fileupload) component.

Such generic models cannot be trained.

::: tip
Note that exporting models from Keras to TFJS can lead to loading errors when particular layers are not implemented in TFJS. In this case, it is possible to export the Keras model to a saved_model and convert it to TFJS, where compatibility should be better.
:::

### Methods

#### .loadFromFiles()

```tsx
async loadFromFiles(files: File[]): Promise<void>
```

Load a pre-trained TFJS model from a list files, that should include:

- a `model.json` file defining the model artifacts
- one or several `.bin` weight files

#### .loadFromUrl()

```tsx
async loadFromUrl(url: string): Promise<void>
```

Load a pre-trained TFJS model from a URL.

#### .predict()

```tsx
async predict(input: InputType): Promise<OutputType>
```

Make a prediction from an input instance, which type depends on the `inputType` specified in the constructor. The method is asynchronous and returns a promise that resolves with the results of the prediction.

Input types can be:

- `ImageData` if the model was instanciated with `inputType: 'image'`
- `TensorLike` (= array) if the model was instanciated with `inputType: 'generic'`

Output types can be:

- `ClassifierResults` if the model was instanciated with `taskType: 'classification'`
- `ImageData | TensorLike` if the model was instanciated with `taskType: 'segmentation'`
- `TensorLike` if the model was instanciated with `taskType: 'generic'`

Where classifier results have the following interface:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

### Example

```js
const source = imageUpload();
const classifier = tfjsModel({
  inputType: 'image',
  taskType: 'classification',
});
classifier.loadFromUrl();

const predictionStream = source.$images.map(async (img) => classifier.predict(img)).awaitPromises();
```
