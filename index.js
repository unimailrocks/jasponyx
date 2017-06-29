const c = require('colors/safe')

module.exports = function jasponyx(e, {
  props = true,
  composite = true,
  compositeProps = true,
  native = true,
  nativeProps = true,
  indentation = '  ',
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

      let part = `${c.blue(attribute)}${c.white('=')}`
      const value = props[attribute]
      if (typeof value === 'string') {
        part += c.green(JSON.stringify(value))
      } else {
        part += `${c.grey('{')}${c.white(JSON.stringify(value))}${c.grey('}')}`
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
    const arr = typeof children.length !== 'undefined' ? children : [children]
    let str = ''
    let innerString = ''
    const parts = []
    for (let c of arr) {
      if (typeof c === 'string') {
        innerString += c
      } else {
        if (innerString.length !== 0 && native) {
          parts.push(str)
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

    const contents = pp(rendered)
    if (!composite) {
      return contents
    }

    // open the tag
    let str = c.cyan(`<${c.underline(e.type.name)}`)

    if (props && compositeProps) {
      str += propsToString(e.props)
    }

    if (contents) {
      str += indent(`${c.cyan('>')}\n${contents}`) + `\n${c.red(`</${c.underline(e.type.name)}>`)}`
    } else {
      str += c.cyan(' />')
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
    let str = c.cyan(`<${e.type}`)

    if (props && nativeProps) {
      str += propsToString(e.props)
    }

    if (e.props.children) {
      str += c.cyan('>')
      str += indent('\n' + renderChildren(e.props.children))
      str += c.red(`\n</${e.type}>`)
    } else {
      str += c.cyan(' />')
    }

    return str
  }

  function pp(e) {
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
