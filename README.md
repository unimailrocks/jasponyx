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
![Minified html markup as rendered by ReactDOM](http://imgur.com/Cdf92rS.png)

Gross, right?

```jsx
console.log(pp(tree))
```

![Pretty output from jasponyx with nothing turned off](http://i.imgur.com/9ivEg1F.png)

```jsx
console.log(pp(tree, { props: false }))
```

![Pretty output from jasponyx with props turned off](http://i.imgur.com/29sWviw.png)

```jsx
console.log(pp(tree, { native: false }))
```

![Pretty output from jasponyx with only composite nodes and text (no native)](http://i.imgur.com/w9akKPw.png)

```jsx
console.log(pp(tree, { native: false, text: false })
```

![Pretty output from jasponyx with only compiste nodes (no native or text)](http://i.imgur.com/g1k8bkP.png)

```jsx
console.log(pp(tree, { nativeProps: false }))
```

![Pretty output from jasponyx without props on the native nodes](http://i.imgur.com/8yYngNb.png)

```jsx
console.log(pp(tree, { composite: false }))
```

![Pretty output from jasponyx without composite nodes (only native and text)](http://i.imgur.com/vxVNnSH.png)

Note the similarities to the output of `ReactDOM.renderToStaticMarkup`

```jsx
console.log(pp(tree, { compositeProps: false }))
```

![Pretty output from jasponyx without props on the composite nodes](http://i.imgur.com/imp9K7G.png)

## FAQ that no one has never asked

### Q. Why "jasponyx"?

*A*: `curl -L https://github.com/dwyl/english-words/blob/master/words.txt?raw=true | rg j.*s.*x`

### Q: But what if I want some other kind of styling or opinion?

*A*: First of all, wow! Thanks for using our library! Second of all, make an issue. Or better yet, make a PR. =) We built this for internal debugging use, and were pretty surprised it didn't already exist in some form or another. There's jsx-to-string and a couple others, but those only go one layer deep. We basically wanted the React Devtools output in the console.

### Q: What about lifecycle hooks?

*A*: Not necessary for our usecase, and we don't even know how you'd render that kind of thing. So this only does the initial load. with the `composite` option set to `false`, the output should basically be a colorized version of `react-dom/server`'s `.renderToStaticMarkup`'s output.
