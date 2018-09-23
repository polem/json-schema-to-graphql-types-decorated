const {resolve} = require('./boolean')

const booleans = {
  invalid: {
    "type": "booling"
  },
  withDefault: {
    "name": 'married',
    "type": "boolean",
    default: true,
    required: true
  },
  basic: {
    "type": "boolean"
  }
}

const config = {}

const createParams = (key, value, config = {}) => {
  return {key, value, type: value.type, config}
}

const $create = (key, value, config) => {
  return resolve(createParams(key, value, config))
}

const create = (key, config) => {
  return $create(key, booleans[key], config)
}

describe('Boolean', () => {

  test('invalid type', () => {
    const bool = create('invalid')
    expect(bool).toBeFalsy()
  })

  describe('basic type', () => {
    const bool = create('basic')
    const {shape} = bool

    test('is valid type', () => {
      expect(shape.valid).toBe(true)
    })

    test('creates basic type shape', () => {
      expect(shape.name).toEqual('basic')
      expect(shape.is).toEqual('primitive')
      expect(shape.type.basic).toEqual('Boolean')
    })
  })

  describe('with targeted default decorator', () => {
    const config = {
      targets: {
        prisma: true
      }
    }
    const bool = create('withDefault', config)
    const {shape} = bool

    test('is valid type', () => {
      expect(shape.valid).toBe(true)
    })

    test('creates shape with @defaultValue decorator when targeted for prisma', () => {
      expect(shape.name).toEqual('withDefault')
      expect(shape.is).toEqual('primitive')
      expect(shape.decorators.default).toBe(true)
      expect(shape.type.basic).toEqual('Boolean')
      expect(shape.type.full).toEqual('Boolean!')
      expect(shape.type.fullDecorated).toEqual('Boolean! @defaultValue(value: true)')
    })

    describe('with untargeted default decorator', () => {
      const config = {
        targets: {
          prisma: false
        }
      }
      const bool = create('withDefault', config)
      const {shape} = bool

      test('creates basic shape when not configured to target prisma', () => {
        expect(shape.decorators.default).toBeFalsy()
        expect(shape.type.fullDecorated).toEqual('Boolean!')
      })
    })
  })
})