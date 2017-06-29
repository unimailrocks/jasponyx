module.exports = function jasponyx(e, {
  props = true,
  composite = true,
  compositeProps = true,
  native = true,
  nativeProps = true,
  indentation = '\t',
} = {}) {
  function indent(str, options) {
    if (!indentation) {
      return str
    }

    return str
      .replace(/(\n)/g, `$1${indentation}`)
  }

  function propsToString(props) {
    const parts = []
    for (let attribute in props) {
      if (attribute === 'children') {
        continue
      }
      let part = `${attribute}=`
      const value = props[attribute]
      if (typeof value === 'string') {
        part += JSON.stringify(value)
      } else {
        part += `{${JSON.stringify(value)}}`
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
    let str = `<${e.type.name}`

    if (props && compositeProps) {
      str += propsToString(e.props)
    }

    if (contents) {
      str += indent(`>\n${contents}`) + `\n</${e.type.name}>`
    } else {
      str += ' />'
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
    let str = `<${e.type}`

    if (props && nativeProps) {
      str += propsToString(e.props)
    }

    if (e.props.children) {
      str += '>'
      str += indent('\n' + renderChildren(e.props.children))
      str += `\n</${e.type}>`
    } else {
      str += ' />'
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
      return e
    } else { // implicit native element
      return renderNative(e)
    }
  }

  return pp(e)
}
