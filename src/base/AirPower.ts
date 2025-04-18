import type { IFieldConfig, IModelConfig } from '../decorator'
import type { ClassConstructor, IJson } from '../transformer'
import { getFieldConfig, getModelConfig, getToJson, getToModel } from '../decorator'

/**
 * # 模型超类
 *
 * @author Hamm.cn
 */
export class AirPower {
  /**
   * ### 从 `JSON` 转换到当前类的对象
   * 会自动进行数据别名转换
   * @param json `JSON`
   */
  static fromJson<T extends AirPower>(this: ClassConstructor<T>, json: IJson = {}): T {
    const instance: T = Object.assign(new this()) as T
    return AirPower.parse<T>(instance, json)
  }

  /**
   * ### 从 `JSON` 数组转换到当前类的对象数组
   * 会自动进行数据别名转换
   * @param jsonArray `JSON`数组
   */
  static fromJsonArray<T extends AirPower>(this: ClassConstructor<T>, jsonArray: IJson | IJson[] = []): T[] {
    const instanceList: T[] = []
    if (Array.isArray(jsonArray)) {
      for (let i = 0; i < jsonArray.length; i += 1) {
        const instance: T = Object.assign(new this()) as T
        instanceList.push(AirPower.parse(instance, jsonArray[i]))
      }
    }
    else {
      const instance: T = Object.assign(new this()) as T
      instanceList.push(AirPower.parse(instance, jsonArray))
    }
    return instanceList
  }

  /**
   * ### 转换 `JSON` 为实体
   * 会自动进行数据别名转换
   * @param instance 实体
   * @param json `JSON`
   */
  static parse<T extends AirPower>(instance: T, json: IJson = {}): T {
    const fieldKeyList = Object.keys(instance)
    const modelConfig = getModelConfig(instance)
    for (const fieldKey of fieldKeyList) {
      const props = getFieldConfig(instance, fieldKey)
      let realKey = ''
      if (!props.ignorePrefix && modelConfig.fieldPrefix) {
        realKey += modelConfig.fieldPrefix
      }
      realKey += props.alias || fieldKey
      const fieldData = json[realKey]
      ;(instance as IJson)[fieldKey] = fieldData

      const toModelFunction = getToModel(instance, fieldKey)
      if (toModelFunction !== undefined) {
        // 标记了手动转换到模型的自定义方法
        try {
          ;(instance as IJson)[fieldKey] = toModelFunction(json as IJson)
        }
        catch (e) {
          console.warn('ToModel Function Error', e)
          continue
        }
      }
      const FieldTypeClass = props.type
      if (props.array) {
        // 是数组 循环转换
        const fieldValueList: IJson[] = []
        if (typeof fieldData === 'object' && Array.isArray(fieldData)) {
          for (let i = 0; i < fieldData.length; i += 1) {
            // 如果标记了类 需要递归处理
            if (FieldTypeClass) {
              fieldValueList[i] = this.parse(new FieldTypeClass() as AirPower, fieldData[i])
            }
          }
        }
        ;(instance as IJson)[fieldKey] = fieldValueList
        continue
      }

      if (fieldData === undefined || fieldData === null) {
        // 属性值为非 undefined 和 null 时不转换
        continue
      }

      if (!FieldTypeClass) {
        // 无需强制转换
        continue
      }
      switch (FieldTypeClass.name) {
        case 'String':
          ;(instance as IJson)[fieldKey] = fieldData.toString()
          break
        case 'Number':
          // 强制转换为Number, 但如果不是标准的Number, 则忽略掉值
          ;(instance as IJson)[fieldKey] = Number.isNaN(Number.parseFloat(fieldData)) ? undefined : Number.parseFloat(fieldData)
          break
        case 'Boolean':
          // 强制转换为布尔型
          ;(instance as IJson)[fieldKey] = !!fieldData
          break
        default:
          // 是对象 需要递归转换
          ;(instance as IJson)[fieldKey] = this.parse(new FieldTypeClass() as AirPower, fieldData)
      }
    }

    // 最后删除无用的数据
    for (const fieldKey of fieldKeyList) {
      const props = getFieldConfig(instance, fieldKey)
      const fieldAliasName = props.alias || fieldKey
      if (fieldAliasName === fieldKey) {
        continue
      }
      delete (instance as IJson)[fieldAliasName]
    }
    return instance
  }

  /**
   * ### 获取模型类配置项
   */
  static getModelConfig<M extends IModelConfig = IModelConfig>(): M {
    return this.newInstance().getModelConfig<M>()
  }

  /**
   * ### 获取模型类的可阅读名字
   */
  static getModelName(): string {
    return this.newInstance().getModelName()
  }

  /**
   * ### 获取属性的可阅读名字
   * @param fieldKey 属性名
   */
  static getFieldName(fieldKey: string): string {
    return this.newInstance().getFieldName(fieldKey)
  }

  /**
   * ### 获取属性的配置
   * @param fieldKey 属性名
   * @returns 配置对象
   */
  static getFieldConfig(fieldKey: string): IFieldConfig {
    return this.newInstance().getFieldConfig(fieldKey)
  }

  /**
   * ### 创建一个当前类的实例
   * @param recoverBy `可选` 初始化用于覆盖对象实例的 `JSON`
   */

  static newInstance<T extends AirPower>(this: ClassConstructor<T>, recoverBy?: IJson): T {
    const instance = new this()
    if (recoverBy) {
      return instance.recoverBy(recoverBy)
    }
    return instance
  }

  /**
   * ### 将当前实例复制到一个新实例上
   */
  copy(): this {
    const newModel = Object.create(Object.getPrototypeOf(this))
    return Object.assign(newModel, this)
  }

  /**
   * ### 暴露部分类的属性
   * @param fields 属性列表
   */
  expose(...fields: string[]): this {
    const fieldList = Object.keys(this)
    for (const field of fieldList) {
      if (!fields.includes(field)) {
        ;(this as IJson)[field] = undefined
      }
    }
    return this
  }

  /**
   * ### 排除部分类的属性
   * @param fields 属性列表
   */
  exclude(...fields: string[]): this {
    const fieldList = Object.keys(this)
    for (const field of fieldList) {
      if (fields.includes(field)) {
        ;(this as IJson)[field] = undefined
      }
    }
    return this
  }

  /**
   * ### 用指定的数据对当前实例进行覆盖
   * 相同属性才会覆盖上去
   * @param obj 覆盖对象
   */
  recoverBy(obj: IJson | AirPower): this {
    return Object.assign(this, obj)
  }

  /**
   * ### 转换到 `JSON`
   * 会自动进行数据别名转换
   */
  toJson(): IJson {
    const fieldKeyList = Object.keys(this)
    const modelConfig = getModelConfig(this)
    const json: IJson = {}
    for (const fieldKey of fieldKeyList) {
      const fieldData = (this as IJson)[fieldKey]
      if (fieldData === null || fieldData === undefined) {
        // 如果属性值为 null 或 undefined 则不转换到JSON
        continue
      }
      const fieldConfig = getFieldConfig(this, fieldKey)
      let fieldAliasName = fieldConfig.alias || fieldKey
      if (!fieldConfig.ignorePrefix && modelConfig.fieldPrefix) {
        // 按忽略前缀规则获取别名
        fieldAliasName = modelConfig.fieldPrefix + fieldAliasName
      }
      const toJsonFunction = getToJson(this, fieldKey)
      json[fieldAliasName || fieldKey] = fieldData

      if (toJsonFunction !== undefined) {
        // 如果标记了自定义转换JSON的方法
        try {
          json[fieldAliasName || fieldKey] = toJsonFunction(this)
        }
        catch (e) {
          console.warn('ToJson Function Error', e)
        }
        continue
      }
      if (typeof fieldData === 'object') {
        // 是数组 循环转换
        if (Array.isArray(fieldData)) {
          // 数组需要循环转换
          const jsonList: IJson[] = []
          for (let i = 0; i < fieldData.length; i += 1) {
            if (typeof fieldData[i] === 'object') {
              jsonList[i] = (fieldData[i] as AirPower).toJson()
              continue
            }
            jsonList[i] = fieldData[i] as AirPower
          }
          json[fieldAliasName || fieldKey] = jsonList
          continue
        }
        // 是对象 递归转换
        json[fieldAliasName || fieldKey] = (fieldData as AirPower).toJson()
      }
    }

    return json
  }

  /**
   * ### `请直接调用静态方法获取`
   * ! 内部使用的保留方法
   */
  getModelConfig<M extends IModelConfig = IModelConfig>(): M {
    return getModelConfig<M>(this)
  }

  /**
   * ### `请直接调用静态方法获取`
   * ! 内部使用的保留方法
   */
  getModelName(): string {
    return getModelConfig(this).label || this.constructor.name
  }

  /**
   * ### `请直接调用静态方法获取`
   * ! 内部使用的保留方法
   */
  getFieldConfig(fieldKey: string): IFieldConfig {
    return getFieldConfig(this, fieldKey)
  }

  /**
   * ### `请直接调用静态方法获取`
   * ! 内部使用的保留方法
   */
  getFieldName(fieldKey: string): string {
    return getFieldConfig(this, fieldKey).label || fieldKey
  }
}
