---
sidebarDepth: 3
---

# Models

Models are standard Marcelle components with two additional characteristics. First, they have a property called `parameters`, which is a record of parameter values as streams. This structure is useful to provide interfaces that dynamically change the values of the model parameters. Second, they carry a set of methods for training and prediction. Some methods are standardized, such as `.train(dataset)` and `.predict(features)`, however models can expose additional specific methods.

## Interface

Models implement the following interface:

```ts
interface Model<InputType, OutputType> {
  parameters: {
    [name: string]: Stream<any>;
  };

  $training: Stream<TrainingStatus>;

  train(dataset: Dataset): void;
  predict(x: InputType): Promise<OutputType>;

  save(update: boolean, metadata?: Record<string, unknown>): Promise<ObjectId | null>;
  load(id?: ObjectId): Promise<StoredModel>;
  download(metadata?: Record<string, unknown>): Promise<void>;
  upload(...files: File[]): Promise<StoredModel>;
  sync(name: string): void;
}
```

Models expose a `$training` stream that monitors the training process. Each `TrainingStatus` event has the following interface:

```ts
interface TrainingStatus {
  status: 'idle' | 'start' | 'epoch' | 'success' | 'error' | 'loaded' | 'loading';
  epoch?: number;
  epochs?: number;
  data?: Record<string, unknown>;
}
```

Where the `data` field varies across models to include additional information, such as the training and validation loss/accuracy in the case of neural networks.

## Common Methods

### .train()

```tsx
train(dataset: Dataset): void;
```

Train the model from a given dataset.

### .predict()

```tsx
async predict(x: InputType): Promise<OutputType>;
```

Make a prediction from a single input frame. Input and output formats vary across models, refer to each model's specific documentation below.

### .save()

```tsx
save(update?: boolean, metadata?: Record<string, unknown>): Promise<ObjectId | null>;
```

Save the model to its associated datastore. The datastore can either be passed in the constructor's options (`dataStore` field), or by modifying the `dataStore` property of the model.

#### Parameters

| Option   | Type    | Description                                                                                                                      | Required | Default |
| -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- | :------: | ------- |
| update   | boolean | If true, the model will try to update the dataStore's object to which it is associated, otherwise it will create a new document. |          | false'  |
| metadata | object  | A JSON-serializable object containing arbitrary model metadata                                                                   |          | {}      |

#### Returns

A promise that resolves with the ObjectId of the document in the data store, or null is the saving failed.

### .load()

```tsx
load(id?: ObjectId): Promise<StoredModel>;
```

Load a model from its associated datastore. The datastore can either be passed in the constructor's options (`dataStore` field), or by modifying the `dataStore` property of the model.

#### Parameters

| Option | Type     | Description                                       | Required | Default |
| ------ | -------- | ------------------------------------------------- | :------: | ------- |
| id     | ObjectId | The ID of the model's document in the data store. |          |         |

#### Returns

A promise that resolves with the the `StoredModel` document from the data store, which has the following interface:

```ts
interface StoredModel {
  id?: ObjectId;
  name: string;
  url: string;
  metadata?: Record<string, unknown>;
}
```

### .download()

```tsx
download(metadata?: Record<string, unknown>): Promise<void>;
```

Download a model as files, with optional custom metadata.

#### Parameters

| Option   | Type   | Description                                                    | Required | Default |
| -------- | ------ | -------------------------------------------------------------- | :------: | ------- |
| metadata | object | A JSON-serializable object containing arbitrary model metadata |          | {}      |

### .upload()

```tsx
upload(...files: File[]): Promise<StoredModel>;
```

Upload a model from a set of files. Files should be exported from Marcelle by the same model class.

#### Parameters

| Option | Type   | Description                                                                                                             | Required | Default |
| ------ | ------ | ----------------------------------------------------------------------------------------------------------------------- | :------: | ------- |
| files  | File[] | A list of files constituting the model (for instance, a `model.json` and a set of `.bin` weight files for a TFJS model) |          | {}      |

### .sync()

```tsx
sync(name: string): void;
```

Synchronize a model with a data store, given a model name. The model will be automatically updated in the store whenever its training ends, or it is loaded from files. The model will be automatically restored on startup, from the latest version available in the store.

#### Parameters

| Option | Type   | Description                                                              | Required | Default |
| ------ | ------ | ------------------------------------------------------------------------ | :------: | ------- |
| name   | string | A unique name for the model so that it can be retrieved in the datastore |   yes    |         |

## BatchPrediction

```tsx
marcelle.batchPrediction({ name: string, dataStore?: DataStore }): BatchPrediction;
```

This component allows to compute and store batch predictions with a given model over an entire dataset. Similarly to [Datasets](/api/data-storage.html#dataset), the prediction results are stored in a data store passed in argument.

### Parameters

| Option    | Type      | Description                                                                                                                                                        | Required |
| --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| name      | string    | The name of the predictions (for data storage)                                                                                                                     |    ✓     |
| dataStore | DataStore | The [dataStore](/api/data-stores.html) used to store the instances of the dataset. This parameter is optional. By default, a data store in memory will be created. |          |

### Streams

| Name          | Type                 | Description                                                       | Hold |
| ------------- | -------------------- | ----------------------------------------------------------------- | :--: |
| \$predictions | Stream\<ObjectId[]\> | Stream of all the ids of the predictions stored in the data store |  ✓   |
| \$count       | Stream\<number\>     | Total number of predictions                                       |  ✓   |

### Methods

#### .predict()

```tsx
async predict(model: Model, dataset: Dataset, inputField = 'features'): Promise<void>
```

Compute predictions for all instances of a given [Datasets](/api/components/data.html#dataset) `dataset`, using a trained `model`. The instance field used for predictions can be specified with the `inputField` parameters, that defaults to `features`.

#### .clear()

```tsx
async clear(): Promise<void>
```

Clear all predictions from the data store, resetting the resulting streams.

### Example

```js
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });

const batchMLP = marcelle.batchPrediction({ name: 'mlp', dataStore: store });

const predictButton = marcelle.button('Update predictions');
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});
```
