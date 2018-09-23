class ConvertMappingSchemaError extends Error {}
const {PropType} = require('./prop-type')
const {Decorators} = require('./decorators')

class MappingBaseType {
  constructor(configuration) {
    let {
      name,
      key,
      type,
      value,
      config,
      built
    } = configuration
    config = config || {}
    this.configuration = configuration
    this.key = key
    this.clazz = name
    this._type = type
    this.value = value
    this.format = value.format
    this.required = value.required
    this.config = config
    this.built = built
    const $graphql = this.value.graphql || {}
    const ownDecorators = $graphql.decorators || $graphql
    const decorators = config.decorators || {}
    this.classDecorators = (decorators[type] || {})[key]
    this.propDecorators = decorators[key]
    this._decorators = ownDecorators || this.classDecorators || this.propDecorators
    this._meta = this.config._meta_ || {}
    this._types = this._meta.types || {}

    if (value.generated) {
      this._specialType = 'ID!'
    }
  }

  get type() {
    return this
      .createPropType()
      .shape
  }

  get valid() {
    return true
  }

  get shape() {
    const shape = {
      clazz: this.clazz,
      name: this.name,
      is: this.is,
      decorators: this.decorators,
      type: this.type,
      pretty: this.pretty,
      valid: Boolean(this.valid),
      required: Boolean(this.required),
      multiple: Boolean(this.multiple)
    }

    if (this.ref) {
      shape.ref = this.ref
    }
    if (this.refType) {
      shape.refType = this.refType
    }

    return shape
  }

  get ref() {
    return undefined
  }

  get multiple() {
    return false
  }

  get name() {
    return this.value.name || this.key
  }

  get baseType() {
    this.error('default mapping type must be specified by subclass')
  }

  get configType() {
    return this._types[this.name]
  }

  get overrideType() {
    return this.configType || this._specialType
  }

  createPropType() {
    return new PropType({overrideType: this.overrideType, baseType: this.baseType, isArray: true, decorators: this.decorators, required: this.required})
  }

  get $decorators() {
    this.decs = this.decs || new Decorators(this._decorators)
    return this.decs
  }

  get decorators() {
    const $decorators = this.$decorators
    return {keys: $decorators.keys, validKeys: this.$decorators.goodKeys, pretty: $decorators.pretty}
  }

  toString() {
    return `${this.name}: ${this.type.fullDecorated}`
  }

  get pretty() {
    return this.toString()
  }

  traverseNested() {
    return this
  }

  message() {
    return config.messages[this.key] || config.messages[this.type] || {}
  }

  errMessage(errKey = 'default') {
    return this.message[errKey] || 'error'
  }

  error(name, msg) {
    const errMSg = `[${name}] ${msg}`
    console.log(errMSg)
    throw new ConvertMappingSchemaError(errMSg)
  }

  // TODO: lookup reference and determine name there!
  get resolveRefName() {
    const paths = this
      .reference
      .split('/')
    return paths[paths.length - 1]
  }

  // TODO: how to determine this?
  get ref() {
    return this.reference
      ? 'reference'
      : 'embedded'
  }
}

module.exports = {
  MappingBaseType,
  ConvertMappingSchemaError
}