# Jasponyx

It's an opinionated JSX pretty printer for the command line.

## Usage:

Context:

```jsx
import React, { Component } from 'react'
import ReactDOM from 'react-dom/server'
import pp from 'jasponyx'

class CompOne extends Component {
  moreStuff() {
    return React.Children.map(this.props.children, (_, i) =>
      <div>Count me off, Juliet {i}</div>)
  }

  render() {
    return (
      <div>
        {this.moreStuff()}
        And they've got spices!
        <CompTwo
          props="aren't"
          very="convenient"
          to="think about"
          andANumber={5}
        />
        {this.props.children}
      </div>
    )
  }
}

function CompTwo({ props, very, andANumber }) {
  return (
    <div>
      {props}: {very}, {andANumber}
    </div>
  )
}

const tree = (
  <div className="quarks probably">
    <CompOne
      crazy={{
        long: 'props',
        are: 'in',
        abundance: [
          'these days you silly goose'
        ]
      }}
    >
      Naked words should work too
      <span>Hymns and mantras and stuff</span>
    </CompOne>
    <div/>
  </div>
)
```

For some orientation, this is how React renders it.

```jsx
console.log(ReactDOM.renderToStaticMarkup(tree))
```

Gross, right?

```jsx
console.log(pp(tree))
```

```jsx
console.log(pp(tree, { props: false }))
```

```jsx
console.log(pp(tree, { native: false }))
```

```jsx
console.log(pp(tree, { nativeProps: false }))
```

```jsx
console.log(pp(tree, { composite: false }))
```

```jsx
console.log(pp(tree, { compositeProps: false }))
```

## FAQ that no one has never asked

### Q. Why "jasponyx"?

*A*: `curl -L https://github.com/dwyl/english-words/blob/master/words.txt?raw=true | rg j.*s.*x`

### Q: But what if I want some other kind of styling or opinion?

*A*: First of all, wow! Thanks for using our library! Second of all, make an issue. Or better yet, make a PR. =) We built this for internal debugging use, and were pretty surprised it didn't already exist in some form or another. There's jsx-to-string and a couple others, but those only go one layer deep. We basically wanted the React Devtools output in the console.

### Q: What about lifecycle hooks?

*A*: Not necessary for our usecase, and we don't even know how you'd render that kind of thing. So this only does the initial load. with the `composite` option set to `false`, the output should basically be a colorized version of `react-dom/server`'s `.renderToStaticMarkup`'s output.
