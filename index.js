const c = require('colors/safe')
const flatten = require('lodash.flattendeep')

module.exports = function jasponyx(e, {
  props = true,
  composite = true,
  compositeProps = true,
  native = true,
  nativeProps = true,
  indentation = '  ',
  text = true,
} = {}) {
  function indent(str, options) {
    if (!indentation) {
      return str
    }

    return str.replace(/(\n)/g, `$1${indentation}`)
  }

  function propsToString(props) {
    const parts = []
    for (let attribute in props) {
      if (attribute === 'children') {
        continue
      }

      let part = `${c.cyan(attribute)}${c.white('=')}`
      const value = props[attribute]
      if (value == null) {
        continue
      } else if (typeof value === 'string') {
        part += c.green(JSON.stringify(value))
      } else {
        let objStr = JSON.stringify(value)
        if (objStr.length > 60) {
          objStr = indent(JSON.stringify(value, null, 2))
        }
        part += `${c.grey('{')}${c.white(objStr)}${c.grey('}')}`
      }

      parts.push(part)
    }

    const splitUp = parts.join('').length > 80
    const separator = splitUp ? `\n${indentation || ''}` : ' '
    const str = parts.map(p => `${separator}${p}`).join('')
    if (splitUp) {
      return str + '\n'
    }

    return str
  }

  function renderChildren(children) {
    const arr = typeof children.length !== 'undefined' ? flatten(children) : [children]
    let innerString = ''
    const parts = []
    for (let c of arr) {
      if (typeof c === 'string') {
        innerString += c
      } else {
        if (innerString.length !== 0 && native) {
          parts.push(innerString)
          innerString = ''
        }
        const printed = pp(c)
        if (printed) {
          parts.push(printed)
        }
      }
    }

    if (innerString.length !== 0 && native) {
      parts.push(innerString)
    }

    return parts.join('\n')
  }

  function renderComposite(e) {
    const rendered = (() => {
      try {
        return e.type(e.props)
      } catch (err) {
        if (err instanceof TypeError && /class/i.test(err.message)) {
          return (new e.type(e.props)).render()
        }

        throw e
      }
    })()

    if (!rendered) {
      const propString = props && compositeProps ? propsToString(e.props) : ''
      return c.magenta(`<${e.type.name}`) + propString + c.magenta(' />')
    }

    const contents = pp(rendered)
    if (!composite) {
      return contents
    }

    // open the tag
    let str = c.magenta(`<${e.type.name}`)

    if (props && compositeProps) {
      str += propsToString(e.props)
    }

    if (contents) {
      str += indent(`${c.magenta('>')}\n${contents}`) + `\n${c.magenta(`</${e.type.name}>`)}`
    } else {
      str += c.magenta(' />')
    }
    return str
  }

  function renderNative(e) {
    if (!native) {
      // skip this element and just render the children
      if (e.props.children) {
        return renderChildren(e.props.children)
      }
      return ''
    }

    // open the tag
    let str = c.blue(`<${e.type}`)

    if (props && nativeProps) {
      str += propsToString(e.props)
    }

    if (e.props.children) {
      str += c.blue('>')
      str += indent('\n' + renderChildren(e.props.children), true)
      str += c.blue(`\n</${e.type}>`)
    } else {
      str += c.blue(' />')
    }

    return str
  }

  function pp(e) {
    if (!e.$$typeof || !e.$$typeof === Symbol('react.element')) {
      if (!text) {
        return ''
      }

      if (typeof e === 'string' || typeof e === 'number') {
        return c.white(e)
      }

      console.warn('Jasponyx found some kind of non-string, non-element object as a node. This element probably will not render successfully. Problem element rendered in red.')
      let asString = JSON.stringify(e, null, 2)
      if (asString.indexOf('\n') !== -1) { // a wild `.indexOf`! Catch it before it runs away!
        asString += '\n'
      }
      return `${c.grey('{')}${c.red(asString)}${c.grey('}')}`
    }

    if (typeof e.type === 'function') {
      return renderComposite(e)
    } else if (typeof e === 'string') {
      if (!native) {
        return ''
      }
      return c.white(e)
    } else { // implicit native element
      return renderNative(e)
    }
  }

  return pp(e)
}
