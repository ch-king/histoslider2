# histoslider

A d3-based histogram sliding component, for React. Useful for exploring distributions of things within data visualisations.

## Usage

`npm install --save histoslider`

Yay, glad we got that out of the way.

### Component
```
  <Histoslider
    // An array of data to show on the slider
    data={[0, 1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 7]}
    // The start of the histogram, defaults to the minimum value in the array
    start={0}
    // The end of the histogram, defaults to the maximum value in the array
    end={10}
    // The size of the histogram buckets, defaults 1
    bucketSize={1}
    // A function to handle a change in the array
    onChange={}
    // Set true for constantly visible histogram, false to enable slide up behavior
    histogramVisible={true}
  />
```

### Styling

*to come*


## Development

`npm run dev`

I'm using [Standard]() for this project, although if that gets in the way I'm more than happy to consider other options.
